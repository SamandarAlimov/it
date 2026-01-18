import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Plus, 
  FolderOpen, 
  Rocket, 
  Clock, 
  Trash2,
  Sparkles,
  Code,
  Globe,
  ShoppingCart,
  Layers,
  ExternalLink,
  CheckCircle2,
  Link2,
  Image,
  RefreshCw
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface BuilderProject {
  id: string;
  name: string;
  description: string | null;
  project_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  is_published: boolean | null;
  subdomain: string | null;
  custom_domain: string | null;
  domain_verified: boolean | null;
  preview_image: string | null;
}

const PROJECT_TYPES = [
  { value: "landing", label: "Landing Page", icon: Globe, description: "Bir sahifali tanishtirish sayti" },
  { value: "webapp", label: "Web Ilova", icon: Layers, description: "Dashboard, admin panel" },
  { value: "ecommerce", label: "E-commerce", icon: ShoppingCart, description: "Onlayn do'kon" },
  { value: "other", label: "Boshqa", icon: Code, description: "Maxsus loyiha" },
];

export default function Builder() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<BuilderProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    project_type: "landing"
  });
  const [creating, setCreating] = useState(false);
  const [generatingPreview, setGeneratingPreview] = useState<string | null>(null);

  const generatePreview = async (projectId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setGeneratingPreview(projectId);
    try {
      const { data, error } = await supabase.functions.invoke('generate-preview', {
        body: { projectId }
      });

      if (error) throw error;

      if (data?.preview_image) {
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, preview_image: data.preview_image } : p
        ));
        toast.success("Preview rasm yaratildi!");
      }
    } catch (error) {
      console.error("Error generating preview:", error);
      toast.error("Preview yaratishda xatolik");
    } finally {
      setGeneratingPreview(null);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("builder_projects")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Loyihalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      toast.error("Loyiha nomini kiriting");
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("builder_projects")
        .insert({
          user_id: user!.id,
          name: newProject.name.trim(),
          description: newProject.description.trim() || null,
          project_type: newProject.project_type,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Loyiha yaratildi!");
      setCreateDialogOpen(false);
      setNewProject({ name: "", description: "", project_type: "landing" });
      navigate(`/builder/${data.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Loyiha yaratishda xatolik");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Haqiqatan ham bu loyihani o'chirmoqchimisiz?")) return;

    try {
      const { error } = await supabase
        .from("builder_projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;

      toast.success("Loyiha o'chirildi");
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Loyihani o'chirishda xatolik");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      draft: { label: "Qoralama", variant: "secondary" },
      generating: { label: "Yaratilmoqda", variant: "outline" },
      ready: { label: "Tayyor", variant: "default" },
      published: { label: "Nashr qilingan", variant: "default" },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getProjectTypeIcon = (type: string) => {
    const projectType = PROJECT_TYPES.find(t => t.value === type);
    const Icon = projectType?.icon || Code;
    return <Icon className="h-5 w-5" />;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Alsamos Builder</h1>
              <p className="text-sm text-muted-foreground">AI bilan web/app yarating</p>
            </div>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Yangi Loyiha
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-6 rounded-full bg-muted mb-6">
              <Rocket className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Hali loyihalar yo'q</h2>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              AI yordamida birinchi web saytingiz yoki ilovangizni yarating. 
              So'rov yozing va bir necha soniyada tayyor kod oling!
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} size="lg" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Birinchi loyihani yaratish
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="group hover:border-primary/50 transition-colors cursor-pointer overflow-hidden"
                onClick={() => navigate(`/builder/${project.id}`)}
              >
                {/* Preview Image */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {project.preview_image ? (
                    <img 
                      src={project.preview_image} 
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Image className="h-8 w-8" />
                      <span className="text-xs">Preview yo'q</span>
                    </div>
                  )}
                  {/* Generate/Regenerate Preview Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity gap-1.5"
                    onClick={(e) => generatePreview(project.id, e)}
                    disabled={generatingPreview === project.id}
                  >
                    {generatingPreview === project.id ? (
                      <>
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span className="text-xs">Yaratilmoqda...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3" />
                        <span className="text-xs">{project.preview_image ? 'Yangilash' : 'Yaratish'}</span>
                      </>
                    )}
                  </Button>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {getProjectTypeIcon(project.project_type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">
                          {PROJECT_TYPES.find(t => t.value === project.project_type)?.label}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  {/* Published Links */}
                  {project.is_published && (
                    <div className="space-y-2 mb-4 p-3 rounded-lg bg-muted/50">
                      {project.subdomain && (
                        <a
                          href={`/p/${project.subdomain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          <span className="truncate">/p/{project.subdomain}</span>
                          <ExternalLink className="h-3 w-3 ml-auto flex-shrink-0" />
                        </a>
                      )}
                      {project.custom_domain && (
                        <a
                          href={`https://${project.custom_domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          <span className="truncate">{project.custom_domain}</span>
                          {project.domain_verified ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto flex-shrink-0" />
                          ) : (
                            <span className="text-xs text-amber-500 ml-auto flex-shrink-0">Kutilmoqda</span>
                          )}
                        </a>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {new Date(project.updated_at).toLocaleDateString("uz-UZ")}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Yangi Loyiha Yaratish</DialogTitle>
            <DialogDescription>
              Loyiha ma'lumotlarini kiriting va AI bilan yaratishni boshlang
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Loyiha nomi</Label>
              <Input
                id="name"
                placeholder="Masalan: Mening Portfolio Saytim"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Loyiha turi</Label>
              <Select
                value={newProject.project_type}
                onValueChange={(value) => setNewProject({ ...newProject, project_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        <span>{type.label}</span>
                        <span className="text-muted-foreground text-xs">- {type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Tavsif (ixtiyoriy)</Label>
              <Textarea
                id="description"
                placeholder="Loyiha haqida qisqacha..."
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleCreateProject} disabled={creating} className="gap-2">
              {creating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Yaratilmoqda...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Yaratish
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
