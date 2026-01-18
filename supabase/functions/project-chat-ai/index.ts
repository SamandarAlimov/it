import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Siz Alsamos kompaniyasining loyiha yaratish yordamchisisiz. Foydalanuvchilarga yangi loyiha yaratishda yordam berasiz.

Vazifangiz foydalanuvchidan quyidagi ma'lumotlarni so'rab olish:
1. Loyiha nomi (title) - majburiy
2. Xizmat turi (service_type) - majburiy. Tanlovlar: "Website Development", "Mobile App Development", "Desktop Software", "AI & Automation", "Cloud & DevOps", "Cybersecurity", "Other"
3. Loyiha tavsifi (description) - ixtiyoriy
4. Taxminiy byudjet (budget) - ixtiyoriy, USD da

Qoidalar:
- Foydalanuvchi bilan do'stona va professional tarzda muloqot qiling
- O'zbek tilida gaplashing
- Har bir savolni alohida so'rang, barchasini bir vaqtda emas
- Agar foydalanuvchi ma'lumot bermasa, davom eting
- Barcha ma'lumotlar to'planganda, loyihani yaratish uchun create_project funksiyasini chaqiring

Muhim: Faqat barcha majburiy ma'lumotlar (title va service_type) to'planganda loyiha yarating.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_project",
              description: "Yangi loyiha yaratish. Faqat barcha majburiy ma'lumotlar to'planganda chaqiring.",
              parameters: {
                type: "object",
                properties: {
                  title: { 
                    type: "string",
                    description: "Loyiha nomi"
                  },
                  service_type: { 
                    type: "string",
                    enum: ["Website Development", "Mobile App Development", "Desktop Software", "AI & Automation", "Cloud & DevOps", "Cybersecurity", "Other"],
                    description: "Xizmat turi"
                  },
                  description: { 
                    type: "string",
                    description: "Loyiha tavsifi"
                  },
                  budget: { 
                    type: "number",
                    description: "Taxminiy byudjet USD da"
                  }
                },
                required: ["title", "service_type"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Tizim band, keyinroq urinib ko'ring." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "To'lov talab qilinadi." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI xatosi" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    
    // Check if AI wants to call a function
    if (choice?.message?.tool_calls?.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      
      if (toolCall.function.name === "create_project") {
        const args = JSON.parse(toolCall.function.arguments);
        
        // Create project in database
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { data: project, error: dbError } = await supabase
          .from("projects")
          .insert({
            user_id: userId,
            title: args.title,
            service_type: args.service_type,
            description: args.description || null,
            budget: args.budget || null,
            status: "pending",
            is_saved: false,
          })
          .select()
          .single();

        if (dbError) {
          console.error("Database error:", dbError);
          return new Response(JSON.stringify({ 
            message: "Loyiha yaratishda xato yuz berdi. Iltimos, qaytadan urinib ko'ring.",
            error: true
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Also create contact submission for admin notification
        await supabase.from("contact_submissions").insert({
          name: "AI Chatbot User",
          email: userId,
          message: `Yangi loyiha so'rovi (AI orqali): ${args.title}\n\nXizmat: ${args.service_type}\nByudjet: ${args.budget ? `$${args.budget}` : "Ko'rsatilmagan"}\n\nTavsif: ${args.description || "Ko'rsatilmagan"}`,
          service: args.service_type,
          budget: args.budget ? String(args.budget) : null,
        });

        return new Response(JSON.stringify({ 
          message: `🎉 Ajoyib! "${args.title}" loyihangiz muvaffaqiyatli yaratildi!\n\nXizmat turi: ${args.service_type}\n${args.budget ? `Byudjet: $${args.budget}\n` : ""}${args.description ? `Tavsif: ${args.description}\n` : ""}\n\nJamoamiz tez orada siz bilan bog'lanadi!`,
          projectCreated: true,
          project
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Regular message response
    return new Response(JSON.stringify({ 
      message: choice?.message?.content || "Xato yuz berdi"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Noma'lum xato" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
