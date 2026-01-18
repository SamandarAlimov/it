import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, 
  User, 
  ArrowLeft, 
  Calendar,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  Link as LinkIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string | null;
  author_name: string;
  read_time: number;
  created_at: string;
}

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (data) {
        setPost(data);
        
        // Fetch related posts
        const { data: related } = await supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, category, image_url, author_name, read_time, created_at")
          .eq("published", true)
          .eq("category", data.category)
          .neq("id", data.id)
          .limit(3);
        
        if (related) setRelatedPosts(related as BlogPost[]);
      }
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Article link has been copied to clipboard.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-24 container mx-auto px-4 text-center">
          <div className="text-muted-foreground">Loading article...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-24 container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Article not found</h1>
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | Alsamos Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-32 pb-24">
          <article className="container mx-auto px-4">
            {/* Back Link */}
            <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>

            {/* Header */}
            <header className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-primary text-sm font-medium uppercase tracking-wider">
                {post.category}
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3 mb-6">
                {post.title}
              </h1>
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {post.author_name}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.read_time} min read
                </span>
              </div>
            </header>

            {/* Featured Image */}
            {post.image_url && (
              <div className="max-w-4xl mx-auto mb-12 rounded-2xl overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full aspect-video object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-invert prose-lg max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  {post.excerpt}
                </p>
                <div className="text-foreground whitespace-pre-wrap">
                  {post.content}
                </div>
              </div>

              {/* Share Buttons */}
              <div className="border-t border-border mt-12 pt-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Share2 className="w-4 h-4" />
                    Share this article
                  </span>
                  <div className="flex items-center gap-3">
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                    <button
                      onClick={handleCopyLink}
                      className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <LinkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="max-w-5xl mx-auto mt-16">
                <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
                  Related Articles
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((related) => (
                    <Link
                      key={related.id}
                      to={`/blog/${related.slug}`}
                      className="group glass rounded-xl overflow-hidden hover:border-primary/30 transition-all"
                    >
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={related.image_url || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop"}
                          alt={related.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-4">
                        <span className="text-primary text-xs font-medium">{related.category}</span>
                        <h3 className="font-display font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors">
                          {related.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default BlogArticle;
