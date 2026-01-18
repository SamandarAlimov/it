import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  FileText, 
  FolderOpen, 
  MessageSquare,
  ShoppingBag,
  LayoutDashboard,
  ArrowLeft,
  Plus,
  Eye
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalContacts: number;
  totalPurchases: number;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  service: string;
  message: string;
  created_at: string;
}

const Admin = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalContacts: 0,
    totalPurchases: 0,
  });
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        navigate("/dashboard");
      }
    }
  }, [user, isLoading, isAdmin, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !isAdmin) return;

      const [profilesRes, projectsRes, contactsRes, purchasesRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("template_purchases").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        totalUsers: profilesRes.count || 0,
        totalProjects: projectsRes.count || 0,
        totalContacts: contactsRes.data?.length || 0,
        totalPurchases: purchasesRes.count || 0,
      });

      if (contactsRes.data) setContacts(contactsRes.data);
      setLoading(false);
    };

    fetchData();
  }, [user, isAdmin]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <>
      <Helmet>
        <title>Admin Panel | Alsamos Corporation</title>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-muted-foreground">Manage your Alsamos platform</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Users", value: stats.totalUsers, icon: Users, color: "from-blue-500 to-cyan-500" },
                { label: "Projects", value: stats.totalProjects, icon: FolderOpen, color: "from-primary to-accent" },
                { label: "Contact Requests", value: stats.totalContacts, icon: MessageSquare, color: "from-emerald-500 to-teal-500" },
                { label: "Template Sales", value: stats.totalPurchases, icon: ShoppingBag, color: "from-violet-500 to-purple-500" },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-xl p-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-2.5`}>
                      <stat.icon className="w-full h-full text-primary-foreground" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Link to="/admin/projects" className="glass rounded-xl p-4 hover:border-primary/30 transition-all group">
                <FolderOpen className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-medium text-foreground">Manage Projects</div>
                <div className="text-xs text-muted-foreground">Create & update client projects</div>
              </Link>
              <Link to="/admin/blog" className="glass rounded-xl p-4 hover:border-primary/30 transition-all group">
                <FileText className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-medium text-foreground">Blog Posts</div>
                <div className="text-xs text-muted-foreground">Create & manage articles</div>
              </Link>
              <Link to="/admin/templates" className="glass rounded-xl p-4 hover:border-primary/30 transition-all group">
                <ShoppingBag className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-medium text-foreground">Templates</div>
                <div className="text-xs text-muted-foreground">Manage marketplace</div>
              </Link>
              <Link to="/admin/users" className="glass rounded-xl p-4 hover:border-primary/30 transition-all group">
                <Users className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-medium text-foreground">Users</div>
                <div className="text-xs text-muted-foreground">Manage user accounts</div>
              </Link>
            </div>

            {/* Contact Submissions */}
            <div className="glass rounded-xl p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                Recent Contact Submissions
              </h2>
              {contacts.length === 0 ? (
                <p className="text-muted-foreground">No contact submissions yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Service</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((contact) => (
                        <tr key={contact.id} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="py-3 px-4 text-foreground">{contact.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{contact.email}</td>
                          <td className="py-3 px-4 text-muted-foreground">{contact.service || "-"}</td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(contact.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 mr-1" /> View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

export default Admin;
