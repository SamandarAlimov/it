import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Siz web/app yaratuvchi AI assistansiz. Foydalanuvchi so'roviga ko'ra professional React + Tailwind CSS kodi yaratishingiz kerak.

**Asosiy qoidalar:**
1. Faqat React va Tailwind CSS ishlatiladi
2. TypeScript sintaksisi ishlatiladi
3. Komponentlar funksional bo'lishi kerak
4. Responsive dizayn bo'lishi kerak
5. Semantik HTML ishlatilsin
6. Accessibility (a11y) standartlariga rioya qiling

**Fayl strukturasi:**
- src/App.tsx - Asosiy komponent
- src/components/ - Barcha komponentlar
- src/index.css - Tailwind CSS
- index.html - Asosiy HTML

**Javob formati:**
Agar foydalanuvchi biror narsa yaratishni so'rasa, generate_code funksiyasini chaqiring va barcha kerakli fayllarni yarating.
Agar foydalanuvchi savol bersa yoki tushuntirish so'rasa, oddiy matn bilan javob bering.

O'zbek tilida muloqot qiling.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, projectId, userId, stream = true } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get existing chat history
    const { data: chatHistory } = await supabase
      .from("builder_chat_history")
      .select("role, content")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    const allMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(chatHistory || []),
      ...messages,
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: allMessages,
        stream,
        tools: [
          {
            type: "function",
            function: {
              name: "generate_code",
              description: "Web sahifa yoki ilova uchun kod yaratadi. Barcha kerakli fayllarni birdan yarating.",
              parameters: {
                type: "object",
                properties: {
                  files: {
                    type: "array",
                    description: "Yaratiladigan fayllar ro'yxati",
                    items: {
                      type: "object",
                      properties: {
                        file_path: {
                          type: "string",
                          description: "Fayl manzili, masalan: src/App.tsx"
                        },
                        file_name: {
                          type: "string",
                          description: "Fayl nomi, masalan: App.tsx"
                        },
                        content: {
                          type: "string",
                          description: "Fayl mazmuni - to'liq kod"
                        },
                        file_type: {
                          type: "string",
                          enum: ["tsx", "ts", "css", "html", "json"],
                          description: "Fayl turi"
                        }
                      },
                      required: ["file_path", "file_name", "content", "file_type"]
                    }
                  },
                  summary: {
                    type: "string",
                    description: "Qilingan o'zgarishlar haqida qisqacha xulosa"
                  }
                },
                required: ["files", "summary"]
              }
            }
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (stream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming response
    const data = await response.json();
    const choice = data.choices?.[0];

    // Check for function call
    if (choice?.message?.tool_calls?.[0]) {
      const toolCall = choice.message.tool_calls[0];
      if (toolCall.function.name === "generate_code") {
        const args = JSON.parse(toolCall.function.arguments);
        
        // Save files to database
        for (const file of args.files) {
          await supabase
            .from("builder_files")
            .upsert({
              project_id: projectId,
              file_path: file.file_path,
              file_name: file.file_name,
              content: file.content,
              file_type: file.file_type,
            }, {
              onConflict: "project_id,file_path"
            });
        }

        // Update project status
        await supabase
          .from("builder_projects")
          .update({ status: "ready" })
          .eq("id", projectId);

        return new Response(JSON.stringify({
          type: "code_generated",
          files: args.files,
          summary: args.summary,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Regular text response
    const content = choice?.message?.content || "";
    
    // Save assistant message to chat history
    if (content && projectId) {
      await supabase
        .from("builder_chat_history")
        .insert({
          project_id: projectId,
          role: "assistant",
          content,
        });
    }

    return new Response(JSON.stringify({
      type: "message",
      content,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Builder AI error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
