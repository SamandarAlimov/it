import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  ShoppingBag,
  Star,
  Download,
  DollarSign,
} from "lucide-react";

interface Template {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  features: string[] | null;
  image_url: string | null;
  demo_url: string | null;
  download_url: string;
  stripe_price_id: string | null;
  rating: number | null;
  downloads: number;
  active: boolean;
  created_at: string;
}

const CATEGORIES = [
  "Business",
  "E-commerce",
  "Education",
  "Health",
  "Logistics",
  "Restaurant",
  "Personal Brand",
  "Portfolio",
  "CRM",
  "HR",
  "Mobile UI Kit",
  "Backend Starter",
];

const AdminTemplates = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    price: 29,
    features: "",
    image_url: "",
    demo_url: "",
    download_url: "",
    stripe_price_id: "",
    active: true,
  });

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
    fetchTemplates();
  }, [user, isAdmin]);

  const fetchTemplates = async () => {
    if (!user || !isAdmin) return;

    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Shablonlarni yuklashda xatolik");
      console.error(error);
    } else {
      setTemplates(data || []);
    }
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: editingTemplate ? prev.slug : generateSlug(title),
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      category: "",
      price: 29,
      features: "",
      image_url: "",
      demo_url: "",
      download_url: "",
      stripe_price_id: "",
      active: true,
    });
    setEditingTemplate(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      slug: template.slug,
      description: template.description,
      category: template.category,
      price: template.price,
      features: template.features?.join("\n") || "",
      image_url: template.image_url || "",
      demo_url: template.demo_url || "",
      download_url: template.download_url,
      stripe_price_id: template.stripe_price_id || "",
      active: template.active,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (template: Template) => {
    setDeletingTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.description || !formData.category || !formData.download_url) {
      toast.error("Barcha majburiy maydonlarni to'ldiring");
      return;
    }

    setSaving(true);

    const featuresArray = formData.features
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from("templates")
          .update({
            title: formData.title,
            slug: formData.slug,
            description: formData.description,
            category: formData.category,
            price: formData.price,
            features: featuresArray.length > 0 ? featuresArray : null,
            image_url: formData.image_url || null,
            demo_url: formData.demo_url || null,
            download_url: formData.download_url,
            stripe_price_id: formData.stripe_price_id || null,
            active: formData.active,
          })
          .eq("id", editingTemplate.id);

        if (error) throw error;
        toast.success("Shablon yangilandi");
      } else {
        const { error } = await supabase.from("templates").insert({
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          category: formData.category,
          price: formData.price,
          features: featuresArray.length > 0 ? featuresArray : null,
          image_url: formData.image_url || null,
          demo_url: formData.demo_url || null,
          download_url: formData.download_url,
          stripe_price_id: formData.stripe_price_id || null,
          active: formData.active,
        });

        if (error) throw error;
        toast.success("Yangi shablon yaratildi");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTemplates();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTemplate) return;

    try {
      const { error } = await supabase
        .from("templates")
        .delete()
        .eq("id", deletingTemplate.id);

      if (error) throw error;

      toast.success("Shablon o'chirildi");
      setIsDeleteDialogOpen(false);
      setDeletingTemplate(null);
      fetchTemplates();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "O'chirishda xatolik");
    }
  };

  const toggleActive = async (template: Template) => {
    try {
      const { error } = await supabase
        .from("templates")
        .update({ active: !template.active })
        .eq("id", template.id);

      if (error) throw error;

      toast.success(template.active ? "Shablon faolsizlantirildi" : "Shablon faollashtirildi");
      fetchTemplates();
    } catch (error: any) {
      console.error(error);
      toast.error("Xatolik yuz berdi");
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
        <title>Template Management | Admin | Alsamos</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-32 pb-24">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <Link to="/admin">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="font-display text-3xl font-bold text-foreground">
                    Template Management
                  </h1>
                  <p className="text-muted-foreground">
                    Shablonlarni yaratish, tahrirlash va boshqarish
                  </p>
                </div>
              </div>
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="w-4 h-4" />
                Yangi shablon
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">{templates.length}</div>
                    <div className="text-xs text-muted-foreground">Jami shablonlar</div>
                  </div>
                </div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Eye className="w-8 h-8 text-emerald-500" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {templates.filter((t) => t.active).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Faol</div>
                  </div>
                </div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Download className="w-8 h-8 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {templates.reduce((sum, t) => sum + t.downloads, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Yuklab olishlar</div>
                  </div>
                </div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-amber-500" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      ${templates.reduce((sum, t) => sum + t.price, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Jami qiymat</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="glass rounded-xl p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Shablonlarni qidirish..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Kategoriya" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha kategoriyalar</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Templates Table */}
            <div className="glass rounded-xl overflow-hidden">
              {filteredTemplates.length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Hech qanday shablon topilmadi</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shablon</TableHead>
                      <TableHead>Kategoriya</TableHead>
                      <TableHead>Narx</TableHead>
                      <TableHead>Reyting</TableHead>
                      <TableHead>Yuklab olishlar</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {template.image_url ? (
                              <img
                                src={template.image_url}
                                alt={template.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-primary" />
                              </div>
                            )}
                            <div className="max-w-xs">
                              <div className="font-medium text-foreground truncate">
                                {template.title}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                /{template.slug}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{template.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-foreground">${template.price}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-muted-foreground">
                              {template.rating?.toFixed(1) || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {template.downloads}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={template.active ? "default" : "outline"}
                            className={template.active ? "bg-emerald-500/20 text-emerald-500" : ""}
                          >
                            {template.active ? "Faol" : "Faolsiz"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleActive(template)}
                              title={template.active ? "Faolsizlantirish" : "Faollashtirish"}
                            >
                              <Eye className={`w-4 h-4 ${template.active ? "text-emerald-500" : ""}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(template)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(template)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Shablonni tahrirlash" : "Yangi shablon yaratish"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Nomi *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Shablon nomi"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="shablon-slug"
                />
              </div>

              <div>
                <Label htmlFor="category">Kategoriya *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategoriyani tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price">Narx ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
                  }
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Tavsif *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Shablon haqida tavsif"
                  rows={3}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="features">Xususiyatlar (har bir qator - bitta xususiyat)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData((prev) => ({ ...prev, features: e.target.value }))}
                  placeholder="Responsive dizayn&#10;Dark mode&#10;SEO optimizatsiya"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="image_url">Rasm URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="demo_url">Demo URL</Label>
                <Input
                  id="demo_url"
                  value={formData.demo_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, demo_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="download_url">Yuklab olish URL *</Label>
                <Input
                  id="download_url"
                  value={formData.download_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, download_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="stripe_price_id">Stripe Price ID</Label>
                <Input
                  id="stripe_price_id"
                  value={formData.stripe_price_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, stripe_price_id: e.target.value }))}
                  placeholder="price_..."
                />
              </div>

              <div className="col-span-2 flex items-center gap-3">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, active: checked }))
                  }
                />
                <Label htmlFor="active">Faol holat</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saqlanmoqda..." : editingTemplate ? "Saqlash" : "Yaratish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shablonni o'chirish</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            "{deletingTemplate?.title}" shablonini o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminTemplates;
