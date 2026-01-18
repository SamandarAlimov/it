import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, Download, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

interface Purchase {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  template: {
    title: string;
    slug: string;
    download_url: string;
  } | null;
}

const DashboardPurchases = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("template_purchases")
        .select(`
          id,
          amount,
          status,
          created_at,
          template:templates(title, slug, download_url)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setPurchases(data as Purchase[]);
      }
      setLoading(false);
    };

    fetchPurchases();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardLayout title="My Purchases">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">My Purchases</h1>
        <p className="text-muted-foreground">Your template purchase history</p>
      </div>

      {purchases.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">No purchases yet</h2>
          <p className="text-muted-foreground mb-6">Browse our templates to get started</p>
          <Link to="/templates">
            <Button>Browse Templates</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="glass rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {purchase.template?.title || "Unknown Template"}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{format(new Date(purchase.created_at), "MMM d, yyyy")}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      purchase.status === "completed" 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {purchase.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display text-xl font-bold text-primary">
                    ${purchase.amount}
                  </span>
                  {purchase.status === "completed" && purchase.template && (
                    <div className="flex gap-2">
                      <a href={purchase.template.download_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </a>
                      <Link to={`/templates/${purchase.template.slug}`}>
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardPurchases;
