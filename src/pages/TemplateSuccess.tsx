import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Download, ArrowRight, Loader2 } from "lucide-react";

const TemplateSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [templateTitle, setTemplateTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get("session_id");
  const templateId = searchParams.get("template_id");

  useEffect(() => {
    const verifyPurchase = async () => {
      if (!sessionId || !templateId) {
        setError("Invalid purchase session");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-template-purchase", {
          body: { sessionId, templateId },
        });

        if (error) throw error;

        if (data?.success) {
          setSuccess(true);
          setDownloadUrl(data.downloadUrl);
          setTemplateTitle(data.templateTitle);
        } else {
          setError("Payment verification failed");
        }
      } catch (err) {
        setError("Failed to verify purchase. Please contact support.");
      }

      setLoading(false);
    };

    verifyPurchase();
  }, [sessionId, templateId]);

  return (
    <>
      <Helmet>
        <title>Purchase Complete | Alsamos Templates</title>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              {loading ? (
                <div className="glass rounded-2xl p-12">
                  <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
                  <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                    Verifying Purchase...
                  </h1>
                  <p className="text-muted-foreground">
                    Please wait while we confirm your payment.
                  </p>
                </div>
              ) : success ? (
                <div className="glass rounded-2xl p-12">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                    Purchase Complete!
                  </h1>
                  <p className="text-muted-foreground mb-8">
                    Thank you for purchasing <strong>{templateTitle}</strong>. 
                    Your download is ready.
                  </p>

                  {downloadUrl && (
                    <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="hero" size="lg" className="w-full mb-4 group">
                        <Download className="w-5 h-5 mr-2" />
                        Download Template
                      </Button>
                    </a>
                  )}

                  <Link to="/dashboard">
                    <Button variant="outline" className="w-full group">
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>

                  <p className="text-xs text-muted-foreground mt-6">
                    A download link has also been sent to your email.
                  </p>
                </div>
              ) : (
                <div className="glass rounded-2xl p-12">
                  <h1 className="font-display text-2xl font-bold text-foreground mb-4">
                    Something went wrong
                  </h1>
                  <p className="text-muted-foreground mb-6">
                    {error || "We couldn't verify your purchase."}
                  </p>
                  <Link to="/templates">
                    <Button variant="outline">
                      Back to Templates
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default TemplateSuccess;
