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
  FileText,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author_name: string;
  read_time: number;
  image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  "AI & Machine Learning",
  "Web Development",
  "Mobile Apps",
  "Cloud Solutions",
  "Case Study",
  "Tutorial",
  "News",
];

const AdminBlog = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    author_name: "Alsamos Team",
    read_time: 5,
    image_url: "",
    published: false,
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
    fetchPosts();
  }, [user, isAdmin]);

  const fetchPosts = async () => {
    if (!user || !isAdmin) return;

    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Blog postlarni yuklashda xatolik");
      console.error(error);
    } else {
      setPosts(data || []);
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
      slug: editingPost ? prev.slug : generateSlug(title),
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "",
      author_name: "Alsamos Team",
      read_time: 5,
      image_url: "",
      published: false,
    });
    setEditingPost(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      author_name: post.author_name,
      read_time: post.read_time,
      image_url: post.image_url || "",
      published: post.published,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (post: BlogPost) => {
    setDeletingPost(post);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.excerpt || !formData.content || !formData.category) {
      toast.error("Barcha majburiy maydonlarni to'ldiring");
      return;
    }

    setSaving(true);

    try {
      if (editingPost) {
        const { error } = await supabase
          .from("blog_posts")
          .update({
            title: formData.title,
            slug: formData.slug,
            excerpt: formData.excerpt,
            content: formData.content,
            category: formData.category,
            author_name: formData.author_name,
            read_time: formData.read_time,
            image_url: formData.image_url || null,
            published: formData.published,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingPost.id);

        if (error) throw error;
        toast.success("Maqola yangilandi");
      } else {
        const { error } = await supabase.from("blog_posts").insert({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt,
          content: formData.content,
          category: formData.category,
          author_name: formData.author_name,
          read_time: formData.read_time,
          image_url: formData.image_url || null,
          published: formData.published,
        });

        if (error) throw error;
        toast.success("Yangi maqola yaratildi");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPost) return;

    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", deletingPost.id);

      if (error) throw error;

      toast.success("Maqola o'chirildi");
      setIsDeleteDialogOpen(false);
      setDeletingPost(null);
      fetchPosts();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "O'chirishda xatolik");
    }
  };

  const togglePublished = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ published: !post.published, updated_at: new Date().toISOString() })
        .eq("id", post.id);

      if (error) throw error;

      toast.success(post.published ? "Maqola yashirildi" : "Maqola nashr qilindi");
      fetchPosts();
    } catch (error: any) {
      console.error(error);
      toast.error("Xatolik yuz berdi");
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || post.category === categoryFilter;
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
        <title>Blog Management | Admin | Alsamos</title>
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
                    Blog Management
                  </h1>
                  <p className="text-muted-foreground">
                    Maqolalarni yaratish, tahrirlash va boshqarish
                  </p>
                </div>
              </div>
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="w-4 h-4" />
                Yangi maqola
              </Button>
            </div>

            {/* Filters */}
            <div className="glass rounded-xl p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Maqolalarni qidirish..."
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

            {/* Posts Table */}
            <div className="glass rounded-xl overflow-hidden">
              {filteredPosts.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Hech qanday maqola topilmadi</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sarlavha</TableHead>
                      <TableHead>Kategoriya</TableHead>
                      <TableHead>Muallif</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sana</TableHead>
                      <TableHead className="text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium text-foreground truncate">
                              {post.title}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              /{post.slug}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{post.category}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {post.author_name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={post.published ? "default" : "outline"}
                            className={post.published ? "bg-emerald-500/20 text-emerald-500" : ""}
                          >
                            {post.published ? "Nashr qilingan" : "Qoralama"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString("uz-UZ")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => togglePublished(post)}
                              title={post.published ? "Yashirish" : "Nashr qilish"}
                            >
                              <Eye className={`w-4 h-4 ${post.published ? "text-emerald-500" : ""}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(post)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(post)}
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
              {editingPost ? "Maqolani tahrirlash" : "Yangi maqola yaratish"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Sarlavha *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Maqola sarlavhasi"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="maqola-slug"
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
                <Label htmlFor="author">Muallif</Label>
                <Input
                  id="author"
                  value={formData.author_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, author_name: e.target.value }))}
                  placeholder="Muallif ismi"
                />
              </div>

              <div>
                <Label htmlFor="read_time">O'qish vaqti (daqiqa)</Label>
                <Input
                  id="read_time"
                  type="number"
                  min={1}
                  value={formData.read_time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, read_time: parseInt(e.target.value) || 5 }))
                  }
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

              <div className="col-span-2">
                <Label htmlFor="excerpt">Qisqa tavsif *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Maqola haqida qisqa tavsif"
                  rows={2}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="content">Kontent *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Maqola kontenti (Markdown qo'llab-quvvatlanadi)"
                  rows={10}
                />
              </div>

              <div className="col-span-2 flex items-center gap-3">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, published: checked }))
                  }
                />
                <Label htmlFor="published">Darhol nashr qilish</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saqlanmoqda..." : editingPost ? "Saqlash" : "Yaratish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Maqolani o'chirish</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            "{deletingPost?.title}" maqolasini o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
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

export default AdminBlog;
