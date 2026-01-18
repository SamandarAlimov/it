import { supabase } from "@/integrations/supabase/client";

type NotificationType = "message" | "invoice" | "project";

interface SendNotificationEmailParams {
  userId: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export const sendNotificationEmail = async ({
  userId,
  notificationType,
  title,
  message,
  link,
}: SendNotificationEmailParams) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-notification-email", {
      body: {
        user_id: userId,
        notification_type: notificationType,
        title,
        message,
        link,
      },
    });

    if (error) {
      console.error("Error sending notification email:", error);
      return { success: false, error };
    }

    console.log("Notification email result:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error invoking notification email function:", error);
    return { success: false, error };
  }
};
