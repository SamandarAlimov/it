import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-TEMPLATE-PURCHASE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { sessionId, templateId } = await req.json();
    if (!sessionId) {
      throw new Error("Missing sessionId");
    }
    logStep("Request body parsed", { sessionId, templateId });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Retrieved checkout session", { status: session.payment_status, customerId: session.customer });

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Get template download URL
    const { data: template, error: templateError } = await supabaseClient
      .from("templates")
      .select("download_url, title")
      .eq("id", templateId)
      .single();

    if (templateError || !template) {
      throw new Error("Template not found");
    }
    logStep("Template found", { title: template.title });

    // Update download count
    await supabaseClient.rpc("increment_template_downloads", { template_id: templateId });

    return new Response(JSON.stringify({ 
      success: true,
      downloadUrl: template.download_url,
      templateTitle: template.title,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
