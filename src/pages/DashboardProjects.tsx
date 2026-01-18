import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Video,
  ChevronRight,
  Plus,
  Calendar,
  DollarSign,
  Download,
  Save,
  Check
} from "lucide-react";
import { StartProjectDialog } from "@/components/dashboard/StartProjectDialog";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  description: string | null;
  service_type: string;
  status: string;
  budget: number | null;
  start_date: string | null;
  estimated_end_date: string | null;
  created_at: string;
  is_saved: boolean;
}

const DashboardProjects = () => {
  const { user, isAdmin } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [savingProject, setSavingProject] = useState<string | null>(null);

  const fetchProjects = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProjects(data as Project[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const handleSaveProject = async (projectId: string) => {
    if (!isAdmin) {
      toast.error("Faqat adminlar loyihani saqlashi mumkin");
      return;
    }
    
    setSavingProject(projectId);
    const { error } = await supabase
      .from("projects")
      .update({ is_saved: true })
      .eq("id", projectId);
    
    if (error) {
      toast.error("Loyihani saqlashda xatolik yuz berdi");
    } else {
      toast.success("Loyiha muvaffaqiyatli saqlandi!");
      fetchProjects();
    }
    setSavingProject(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-emerald-500 bg-emerald-500/10";
      case "in_progress":
        return "text-primary bg-primary/10";
      case "pending":
        return "text-amber-500 bg-amber-500/10";
      case "cancelled":
        return "text-destructive bg-destructive/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardLayout title="My Projects">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">My Projects</h1>
          <p className="text-muted-foreground">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Start New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">Start your first project with us!</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Start New Project
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="glass rounded-xl p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                    {project.status.replace("_", " ")}
                  </span>
                  {project.is_saved && (
                    <span className="text-xs px-2 py-1 rounded-full text-emerald-500 bg-emerald-500/10 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Saqlangan
                    </span>
                  )}
                </div>
                <Link to={`/dashboard/project/${project.id}/chat`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Video className="w-4 h-4 text-primary" />
                  </Button>
                </Link>
              </div>
              
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                {project.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{project.service_type}</p>
              
              {project.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {project.budget && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {Number(project.budget).toLocaleString()}
                  </div>
                )}
                {project.start_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(project.start_date).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Yaratilgan: {new Date(project.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  {isAdmin && !project.is_saved && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSaveProject(project.id)}
                      disabled={savingProject === project.id}
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Saqlash
                    </Button>
                  )}
                  {isAdmin && project.is_saved && (
                    <Button variant="outline" size="sm">
                      <Download className="w-3 h-3 mr-1" />
                      Yuklab olish
                    </Button>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <StartProjectDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onSuccess={fetchProjects}
      />
    </DashboardLayout>
  );
};

export default DashboardProjects;
