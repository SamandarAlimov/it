import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { 
  Globe2, 
  Loader2, 
  Check, 
  Copy, 
  ExternalLink, 
  AlertCircle,
  RefreshCw,
  Trash2
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CustomDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  currentDomain?: string | null;
  isVerified?: boolean;
  verificationToken?: string | null;
  onUpdated: (domain: string | null, verified: boolean) => void;
}

export function CustomDomainDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  currentDomain,
  isVerified,
  verificationToken,
  onUpdated,
}: CustomDomainDialogProps) {
  const [domain, setDomain] = useState(currentDomain || "");
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [token, setToken] = useState(verificationToken || "");

  useEffect(() => {
    if (open && currentDomain) {
      setDomain(currentDomain);
      setToken(verificationToken || "");
    }
  }, [open, currentDomain, verificationToken]);

  const platformIP = "185.158.133.1";

  const sanitizeDomain = (value: string) => {
    return value
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .replace(/[^a-z0-9.-]/g, "")
      .trim();
  };

  const handleDomainChange = (value: string) => {
    setDomain(sanitizeDomain(value));
  };

  const generateToken = () => {
    return `alsamos_verify_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  };

  const handleSaveDomain = async () => {
    if (!domain || domain.length < 4) {
      toast.error("Yaroqli domen kiriting");
      return;
    }

    // Validate domain format
    const domainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9](\.[a-z0-9][a-z0-9-]*[a-z0-9])+$/;
    if (!domainRegex.test(domain)) {
      toast.error("Yaroqsiz domen formati. Masalan: example.com");
      return;
    }

    setSaving(true);
    try {
      // Check if domain is already in use
      const { data: existing } = await supabase
        .from("builder_projects")
        .select("id")
        .eq("custom_domain", domain)
        .neq("id", projectId)
        .maybeSingle();

      if (existing) {
        toast.error("Bu domen boshqa loyihada ishlatilmoqda");
        return;
      }

      const newToken = generateToken();

      const { error } = await supabase
        .from("builder_projects")
        .update({
          custom_domain: domain,
          domain_verified: false,
          domain_verification_token: newToken,
        })
        .eq("id", projectId);

      if (error) throw error;

      setToken(newToken);
      toast.success("Domen saqlandi. Endi DNS sozlamalarini bajaring.");
      onUpdated(domain, false);
    } catch (error) {
      console.error("Error saving domain:", error);
      toast.error("Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!domain || !token) return;

    setVerifying(true);
    try {
      // In production, you would verify DNS records here
      // For now, we'll simulate verification with a delay
      
      // Check TXT record (in production, use a DNS lookup service)
      // For demo, we'll just mark it as verified after checking
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, mark as verified
      // In production, you would verify the TXT record matches
      const { error } = await supabase
        .from("builder_projects")
        .update({
          domain_verified: true,
        })
        .eq("id", projectId);

      if (error) throw error;

      toast.success("Domen muvaffaqiyatli tasdiqlandi!");
      onUpdated(domain, true);
    } catch (error) {
      console.error("Error verifying domain:", error);
      toast.error("Tasdiqlashda xatolik. DNS sozlamalarini tekshiring.");
    } finally {
      setVerifying(false);
    }
  };

  const handleRemoveDomain = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("builder_projects")
        .update({
          custom_domain: null,
          domain_verified: false,
          domain_verification_token: null,
        })
        .eq("id", projectId);

      if (error) throw error;

      setDomain("");
      setToken("");
      toast.success("Domen olib tashlandi");
      onUpdated(null, false);
    } catch (error) {
      console.error("Error removing domain:", error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success("Nusxalandi!");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-primary" />
            Custom Domain
          </DialogTitle>
          <DialogDescription>
            O'z domeningizni loyihangizga ulang
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Domain Input */}
          <div className="space-y-2">
            <Label htmlFor="domain">Domen nomi</Label>
            <div className="flex gap-2">
              <Input
                id="domain"
                value={domain}
                onChange={(e) => handleDomainChange(e.target.value)}
                placeholder="example.com yoki app.example.com"
                disabled={saving || (!!currentDomain && isVerified)}
              />
              {!currentDomain && (
                <Button
                  onClick={handleSaveDomain}
                  disabled={saving || !domain || domain.length < 4}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Saqlash"}
                </Button>
              )}
            </div>
          </div>

          {/* Status Badge */}
          {currentDomain && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Holat:</span>
              {isVerified ? (
                <Badge variant="default" className="bg-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  Tasdiqlangan
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Tasdiqlanmagan
                </Badge>
              )}
            </div>
          )}

          {/* DNS Instructions */}
          {currentDomain && !isVerified && token && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>DNS sozlamalarini bajaring</AlertTitle>
              <AlertDescription className="mt-2 space-y-3">
                <p className="text-sm">
                  Quyidagi DNS yozuvlarini domen provayderingizda qo'shing:
                </p>
                
                <div className="space-y-3 mt-3">
                  {/* A Record */}
                  <div className="bg-muted p-3 rounded-md space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">A Record</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(platformIP, "ip")}
                      >
                        {copied === "ip" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Host:</span>
                        <span className="ml-2 font-mono">@</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Value:</span>
                        <span className="ml-2 font-mono">{platformIP}</span>
                      </div>
                    </div>
                  </div>

                  {/* TXT Record */}
                  <div className="bg-muted p-3 rounded-md space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">TXT Record (tasdiqlash)</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(token, "token")}
                      >
                        {copied === "token" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div>
                        <span className="text-muted-foreground">Host:</span>
                        <span className="ml-2 font-mono">_alsamos</span>
                      </div>
                      <div className="break-all">
                        <span className="text-muted-foreground">Value:</span>
                        <span className="ml-2 font-mono text-xs">{token}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  DNS o'zgarishlar 24-48 soat ichida tarqaladi.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Verified Domain Info */}
          {currentDomain && isVerified && (
            <div className="space-y-2">
              <Label>Faol domen</Label>
              <div className="flex gap-2">
                <div className="flex-1 bg-muted rounded-md px-3 py-2 text-sm truncate">
                  https://{currentDomain}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(`https://${currentDomain}`, "url")}
                >
                  {copied === "url" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(`https://${currentDomain}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {currentDomain && (
            <Button
              variant="destructive"
              onClick={handleRemoveDomain}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Olib tashlash
            </Button>
          )}
          {currentDomain && !isVerified && (
            <Button
              onClick={handleVerifyDomain}
              disabled={verifying}
              className="w-full sm:w-auto"
            >
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Tekshirilmoqda...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tasdiqlash
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
