import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Edit,
  Save,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  User,
  Calendar,
  DollarSign,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

interface Project {
  id: string;
  title: string;
  description: string | null;
  service_type: string;
  status: string;
  budget: number | null;
  created_at: string;
  start_date: string | null;
  estimated_end_date: string | null;
  is_saved: boolean | null;
  user_id: string;
  user_email?: string;
  user_name?: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Kutilmoqda", icon: Clock, color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" },
  { value: "in_progress", label: "Jarayonda", icon: RefreshCw, color: "bg-blue-500/10 text-blue-500 border-blue-500/30" },
  { value: "review", label: "Ko'rib chiqilmoqda", icon: Eye, color: "bg-purple-500/10 text-purple-500 border-purple-500/30" },
  { value: "completed", label: "Yakunlandi", icon: CheckCircle, color: "bg-green-500/10 text-green-500 border-green-500/30" },
  { value: "cancelled", label: "Bekor qilindi", icon: XCircle, color: "bg-red-500/10 text-red-500 border-red-500/30" },
];

const AdminProjects = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        navigate("/dashboard");
      }
    }
  }, [user, isLoading, isAdmin, navigate]);

  const fetchProjects = async () => {
    if (!user || !isAdmin) return;
    setLoading(true);

    const { data: projectsData, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Loyihalarni yuklashda xato");
      setLoading(false);
      return;
    }

    // Fetch user profiles for each project
    const userIds = [...new Set(projectsData?.map(p => p.user_id) || [])];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", userIds);

    const projectsWithUsers = projectsData?.map(project => {
      const profile = profiles?.find(p => p.id === project.user_id);
      return {
        ...project,
        user_email: profile?.email || "Noma'lum",
        user_name: profile?.full_name || "Noma'lum",
      };
    }) || [];

    setProjects(projectsWithUsers);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, [user, isAdmin]);

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    setSaving(projectId);
    const { error } = await supabase
      .from("projects")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", projectId);

    if (error) {
      toast.error("Statusni yangilashda xato");
    } else {
      toast.success("Status yangilandi");
      setProjects(prev => 
        prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p)
      );
    }
    setSaving(null);
  };

  const handleSaveProject = async (projectId: string) => {
    setSaving(projectId);
    const { error } = await supabase
      .from("projects")
      .update({ is_saved: true, updated_at: new Date().toISOString() })
      .eq("id", projectId);

    if (error) {
      toast.error("Loyihani saqlashda xato");
    } else {
      toast.success("Loyiha saqlandi");
      setProjects(prev => 
        prev.map(p => p.id === projectId ? { ...p, is_saved: true } : p)
      );
    }
    setSaving(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    const Icon = statusConfig.icon;
    return (
      <Badge variant="outline" className={`${statusConfig.color} gap-1`}>
        <Icon className="w-3 h-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Yuklanmoqda...</div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <>
      <Helmet>
        <title>Loyihalarni Boshqarish | Admin Panel</title>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link to="/admin">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">Loyihalarni Boshqarish</h1>
                <p className="text-muted-foreground">Barcha loyihalarni ko'ring va boshqaring</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Loyiha, foydalanuvchi qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status bo'yicha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  {STATUS_OPTIONS.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchProjects}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Yangilash
              </Button>
            </div>

            {/* Projects Table */}
            <div className="glass rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loyiha</TableHead>
                    <TableHead>Foydalanuvchi</TableHead>
                    <TableHead>Xizmat turi</TableHead>
                    <TableHead>Byudjet</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sana</TableHead>
                    <TableHead className="text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        Loyihalar topilmadi
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects.map((project) => (
                      <TableRow key={project.id} className="group">
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground flex items-center gap-2">
                              {project.title}
                              {project.is_saved && (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Saqlangan
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {project.description || "Tavsif yo'q"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm text-foreground">{project.user_name}</div>
                              <div className="text-xs text-muted-foreground">{project.user_email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{project.service_type}</Badge>
                        </TableCell>
                        <TableCell>
                          {project.budget ? (
                            <span className="flex items-center gap-1 text-foreground">
                              <DollarSign className="w-3 h-3" />
                              {project.budget.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={project.status} 
                            onValueChange={(value) => handleStatusChange(project.id, value)}
                            disabled={saving === project.id}
                          >
                            <SelectTrigger className="w-40 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                  <span className="flex items-center gap-2">
                                    <status.icon className="w-3 h-3" />
                                    {status.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(project.created_at), "dd.MM.yyyy")}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedProject(project);
                                setDetailsOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {!project.is_saved && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleSaveProject(project.id)}
                                disabled={saving === project.id}
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                            )}
                            {project.is_saved && (
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              {STATUS_OPTIONS.map(status => {
                const count = projects.filter(p => p.status === status.value).length;
                const Icon = status.icon;
                return (
                  <div key={status.value} className="glass rounded-lg p-4 text-center">
                    <Icon className={`w-5 h-5 mx-auto mb-2 ${status.color.split(' ')[1]}`} />
                    <div className="text-2xl font-bold text-foreground">{count}</div>
                    <div className="text-xs text-muted-foreground">{status.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>

      {/* Project Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedProject?.title}
              {selectedProject?.is_saved && (
                <Badge variant="secondary">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Saqlangan
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>Loyiha tafsilotlari</DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Foydalanuvchi</div>
                  <div className="text-foreground">{selectedProject.user_name}</div>
                  <div className="text-sm text-muted-foreground">{selectedProject.user_email}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Xizmat turi</div>
                  <Badge variant="outline">{selectedProject.service_type}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Status</div>
                  {getStatusBadge(selectedProject.status)}
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Byudjet</div>
                  <div className="text-foreground">
                    {selectedProject.budget ? `$${selectedProject.budget.toLocaleString()}` : "Belgilanmagan"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Yaratilgan sana</div>
                  <div className="text-foreground">
                    {format(new Date(selectedProject.created_at), "dd.MM.yyyy HH:mm")}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Taxminiy tugash</div>
                  <div className="text-foreground">
                    {selectedProject.estimated_end_date 
                      ? format(new Date(selectedProject.estimated_end_date), "dd.MM.yyyy")
                      : "Belgilanmagan"}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Tavsif</div>
                <div className="text-foreground bg-secondary/30 p-3 rounded-lg">
                  {selectedProject.description || "Tavsif yo'q"}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Yopish
            </Button>
            {selectedProject && (
              <Link to={`/dashboard/project/${selectedProject.id}/chat`}>
                <Button>
                  Chatga o'tish
                </Button>
              </Link>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminProjects;
