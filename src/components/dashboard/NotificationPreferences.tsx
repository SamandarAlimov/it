import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, MessageSquare, FileText, FolderKanban, Loader2 } from "lucide-react";

interface NotificationPreferences {
  email_new_message: boolean;
  email_new_invoice: boolean;
  email_project_status: boolean;
}

export const NotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching preferences:", error);
      toast.error("Failed to load notification preferences");
    } else if (data) {
      setPreferences({
        email_new_message: data.email_new_message,
        email_new_invoice: data.email_new_invoice,
        email_project_status: data.email_project_status,
      });
    } else {
      // Create default preferences if none exist
      const { data: newData, error: insertError } = await supabase
        .from("notification_preferences")
        .insert({ user_id: user.id })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating preferences:", insertError);
      } else if (newData) {
        setPreferences({
          email_new_message: newData.email_new_message,
          email_new_invoice: newData.email_new_invoice,
          email_project_status: newData.email_project_status,
        });
      }
    }
    setLoading(false);
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!user || !preferences) return;

    setSaving(true);
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    const { error } = await supabase
      .from("notification_preferences")
      .update({ [key]: value })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating preference:", error);
      toast.error("Failed to update preference");
      setPreferences(preferences); // Revert on error
    } else {
      toast.success("Preference updated");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return null;
  }

  const preferenceItems = [
    {
      key: "email_new_message" as const,
      label: "New Messages",
      description: "Receive email notifications when you get a new message in a project",
      icon: MessageSquare,
    },
    {
      key: "email_new_invoice" as const,
      label: "New Invoices",
      description: "Receive email notifications when a new invoice is created",
      icon: FileText,
    },
    {
      key: "email_project_status" as const,
      label: "Project Status Changes",
      description: "Receive email notifications when your project status is updated",
      icon: FolderKanban,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <CardTitle>Email Notifications</CardTitle>
        </div>
        <CardDescription>
          Choose which notifications you'd like to receive via email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {preferenceItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <item.icon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-0.5">
                <Label htmlFor={item.key} className="text-sm font-medium">
                  {item.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
            <Switch
              id={item.key}
              checked={preferences[item.key]}
              onCheckedChange={(checked) => updatePreference(item.key, checked)}
              disabled={saving}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
