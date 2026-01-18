import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, 
  FolderOpen, 
  FileText, 
  ShoppingBag, 
  ChevronRight,
  Video,
  Plus,
  Sparkles
} from "lucide-react";
import { StartProjectDialog } from "@/components/dashboard/StartProjectDialog";
import { ProjectChatbotDialog } from "@/components/dashboard/ProjectChatbotDialog";
import { WelcomeOnboarding } from "@/components/onboarding/WelcomeOnboarding";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

interface Project {
  id: string;
  title: string;
  service_type: string;
  status: string;
  created_at: string;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

interface Purchase {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  template_id: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const fetchData = async () => {
    if (!user) return;

    const [projectsRes, invoicesRes, purchasesRes, profileRes] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("template_purchases").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("profiles").select("onboarding_completed").eq("id", user.id).maybeSingle(),
    ]);

    if (projectsRes.data) setProjects(projectsRes.data);
    if (invoicesRes.data) setInvoices(invoicesRes.data);
    if (purchasesRes.data) setPurchases(purchasesRes.data);
    
    if (profileRes.data && !profileRes.data.onboarding_completed) {
      setShowOnboarding(true);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return "text-emerald-500 bg-emerald-500/10";
      case "in_progress":
      case "pending":
        return "text-primary bg-primary/10";
      case "cancelled":
        return "text-destructive bg-destructive/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <DashboardLayout title="Dashboard">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
          </h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setChatbotOpen(true)}>
            <Sparkles className="w-4 h-4 mr-2" />
            AI bilan yaratish
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Start Project
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Projects", value: projects.filter(p => p.status !== "completed").length, icon: FolderOpen },
          { label: "Pending Invoices", value: invoices.filter(i => i.status === "pending").length, icon: FileText },
          { label: "Templates Purchased", value: purchases.length, icon: ShoppingBag },
          { label: "Total Spent", value: `$${invoices.reduce((sum, i) => sum + Number(i.amount), 0).toFixed(0)}`, icon: LayoutDashboard },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Projects */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Your Projects</h2>
            <Link to="/dashboard/projects" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm mb-3">No projects yet.</p>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Start Project
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <div>
                    <div className="font-medium text-foreground">{project.title}</div>
                    <div className="text-xs text-muted-foreground">{project.service_type}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/dashboard/project/${project.id}/chat`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Video className="w-4 h-4 text-primary" />
                      </Button>
                    </Link>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                      {project.status.replace("_", " ")}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoices */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Recent Invoices</h2>
            <Link to="/dashboard/invoices" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {invoices.length === 0 ? (
            <p className="text-muted-foreground text-sm">No invoices yet.</p>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <div>
                    <div className="font-medium text-foreground">${Number(invoice.amount).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Template Purchases */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Template Purchases</h2>
          <Link to="/dashboard/purchases" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {purchases.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm mb-3">No purchases yet.</p>
            <Link to="/templates">
              <Button size="sm" variant="outline">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Templates
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-3">
            {purchases.slice(0, 3).map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div>
                  <div className="font-medium text-foreground">${Number(purchase.amount).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(purchase.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(purchase.status)}`}>
                  {purchase.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <StartProjectDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onSuccess={fetchData}
      />

      <ProjectChatbotDialog
        open={chatbotOpen}
        onOpenChange={setChatbotOpen}
        onProjectCreated={fetchData}
      />

      {user && (
        <WelcomeOnboarding
          open={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
          userId={user.id}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
