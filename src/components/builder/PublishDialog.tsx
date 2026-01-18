import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Globe, Loader2, Check, Copy, ExternalLink, Globe2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  currentSubdomain?: string | null;
  isPublished?: boolean;
  customDomain?: string | null;
  domainVerified?: boolean;
  onPublished: (subdomain: string) => void;
  onOpenCustomDomain: () => void;
}

export function PublishDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  currentSubdomain,
  isPublished,
  customDomain,
  domainVerified,
  onPublished,
  onOpenCustomDomain,
}: PublishDialogProps) {
  const [subdomain, setSubdomain] = useState(currentSubdomain || "");
  const [publishing, setPublishing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  const baseUrl = "alsamos.app";
  const fullUrl = `https://${subdomain}.${baseUrl}`;

  const sanitizeSubdomain = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32);
  };

  const handleSubdomainChange = (value: string) => {
    const sanitized = sanitizeSubdomain(value);
    setSubdomain(sanitized);
    setAvailable(null);
  };

  const checkAvailability = async () => {
    if (!subdomain || subdomain.length < 3) {
      toast.error("Subdomain kamida 3 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setChecking(true);
    try {
      const { data, error } = await supabase
        .from("builder_projects")
        .select("id")
        .eq("subdomain", subdomain)
        .neq("id", projectId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setAvailable(false);
        toast.error("Bu subdomain band");
      } else {
        setAvailable(true);
        toast.success("Subdomain mavjud!");
      }
    } catch (error) {
      console.error("Error checking subdomain:", error);
      toast.error("Tekshirishda xatolik");
    } finally {
      setChecking(false);
    }
  };

  const handlePublish = async () => {
    if (!subdomain || subdomain.length < 3) {
      toast.error("Subdomain kamida 3 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setPublishing(true);
    try {
      // Check availability one more time
      const { data: existing } = await supabase
        .from("builder_projects")
        .select("id")
        .eq("subdomain", subdomain)
        .neq("id", projectId)
        .maybeSingle();

      if (existing) {
        toast.error("Bu subdomain band");
        setAvailable(false);
        return;
      }

      // Update project with subdomain and publish
      const { error } = await supabase
        .from("builder_projects")
        .update({
          subdomain,
          is_published: true,
          published_at: new Date().toISOString(),
          status: "published",
        })
        .eq("id", projectId);

      if (error) throw error;

      toast.success("Loyiha muvaffaqiyatli nashr qilindi!");
      onPublished(subdomain);
      onOpenChange(false);
    } catch (error) {
      console.error("Error publishing:", error);
      toast.error("Nashr qilishda xatolik");
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    setPublishing(true);
    try {
      const { error } = await supabase
        .from("builder_projects")
        .update({
          is_published: false,
          status: "draft",
        })
        .eq("id", projectId);

      if (error) throw error;

      toast.success("Loyiha yashirildi");
      onOpenChange(false);
    } catch (error) {
      console.error("Error unpublishing:", error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setPublishing(false);
    }
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success("Havola nusxalandi!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Loyihani Nashr Qilish
          </DialogTitle>
          <DialogDescription>
            Loyihangizni platformada nashr qiling va uni dunyoga ko'rsating
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subdomain">Subdomain</Label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center">
                <Input
                  id="subdomain"
                  value={subdomain}
                  onChange={(e) => handleSubdomainChange(e.target.value)}
                  placeholder="loyiha-nomi"
                  className="rounded-r-none"
                  disabled={publishing}
                />
                <div className="bg-muted px-3 py-2 border border-l-0 rounded-r-md text-sm text-muted-foreground">
                  .{baseUrl}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={checkAvailability}
                disabled={checking || !subdomain || subdomain.length < 3}
              >
                {checking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Tekshirish"
                )}
              </Button>
            </div>
            {available !== null && (
              <p className={`text-sm ${available ? "text-green-600" : "text-destructive"}`}>
                {available ? "✓ Subdomain mavjud" : "✗ Subdomain band"}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Faqat kichik harflar, raqamlar va chiziqcha (-) ishlatish mumkin
            </p>
          </div>

          {isPublished && currentSubdomain && (
            <div className="space-y-2">
              <Label>Joriy havola</Label>
              <div className="flex gap-2">
                <div className="flex-1 bg-muted rounded-md px-3 py-2 text-sm truncate">
                  {`https://${currentSubdomain}.${baseUrl}`}
                </div>
                <Button variant="outline" size="icon" onClick={copyUrl}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(`https://${currentSubdomain}.${baseUrl}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Custom Domain Section */}
          {isPublished && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4" />
                    Custom Domain
                  </Label>
                  {customDomain && domainVerified && (
                    <span className="text-xs text-green-600">✓ Tasdiqlangan</span>
                  )}
                </div>
                {customDomain ? (
                  <div className="flex gap-2">
                    <div className="flex-1 bg-muted rounded-md px-3 py-2 text-sm truncate">
                      {customDomain}
                    </div>
                    <Button variant="outline" onClick={onOpenCustomDomain}>
                      Sozlash
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" onClick={onOpenCustomDomain}>
                    <Globe2 className="h-4 w-4 mr-2" />
                    O'z domeningizni ulang
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isPublished && (
            <Button
              variant="outline"
              onClick={handleUnpublish}
              disabled={publishing}
              className="w-full sm:w-auto"
            >
              Yashirish
            </Button>
          )}
          <Button
            onClick={handlePublish}
            disabled={publishing || !subdomain || subdomain.length < 3}
            className="w-full sm:w-auto"
          >
            {publishing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Nashr qilinmoqda...
              </>
            ) : isPublished ? (
              "Yangilash"
            ) : (
              "Nashr qilish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
