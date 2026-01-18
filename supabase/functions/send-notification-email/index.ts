import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  user_id: string;
  notification_type: "message" | "invoice" | "project";
  title: string;
  message: string;
  link?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, notification_type, title, message, link }: NotificationEmailRequest = await req.json();

    console.log(`Processing email notification for user ${user_id}, type: ${notification_type}`);

    // Get user's notification preferences
    const { data: preferences, error: prefError } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (prefError) {
      console.log("No preferences found or error:", prefError.message);
      // If no preferences, default to not sending
      return new Response(
        JSON.stringify({ success: false, reason: "No preferences found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user wants this type of email notification
    let shouldSend = false;
    switch (notification_type) {
      case "message":
        shouldSend = preferences.email_new_message === true;
        break;
      case "invoice":
        shouldSend = preferences.email_new_invoice === true;
        break;
      case "project":
        shouldSend = preferences.email_project_status === true;
        break;
    }

    if (!shouldSend) {
      console.log(`User ${user_id} has disabled ${notification_type} email notifications`);
      return new Response(
        JSON.stringify({ success: false, reason: "User has disabled this notification type" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user's email from profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", user_id)
      .single();

    if (profileError || !profile?.email) {
      console.error("Could not find user email:", profileError?.message);
      return new Response(
        JSON.stringify({ error: "User email not found" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userName = profile.full_name || "there";
    const appUrl = Deno.env.get("APP_URL") || "https://your-app-url.com";
    const fullLink = link ? `${appUrl}${link}` : appUrl;

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "Alsamos <notifications@resend.dev>",
      to: [profile.email],
      subject: title,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                <h1 style="color: #18181b; font-size: 24px; margin: 0 0 16px 0;">${title}</h1>
                <p style="color: #71717a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Hi ${userName},
                </p>
                <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  ${message}
                </p>
                ${link ? `
                <a href="${fullLink}" style="display: inline-block; background-color: #18181b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                  View Details
                </a>
                ` : ''}
                <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 32px 0;">
                <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                  You received this email because you have email notifications enabled. 
                  <a href="${appUrl}/dashboard/profile" style="color: #71717a;">Manage preferences</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
