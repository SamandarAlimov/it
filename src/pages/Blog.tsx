import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Clock, User, ArrowRight } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  image_url: string | null;
  author_name: string;
  read_time: number;
  created_at: string;
}

const categories = ["All", "Web Development", "Mobile Development", "AI & Automation", "Cybersecurity", "Cloud & DevOps"];

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, category, image_url, author_name, read_time, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false });
      
      if (data) setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(
    (post) => activeCategory === "All" || post.category === activeCategory
  );

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  return (
    <>
      <Helmet>
        <title>Blog | Alsamos Corporation Tech Insights</title>
        <meta name="description" content="Stay updated with the latest tech insights, tutorials, and case studies from Alsamos Corporation's expert team." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-primary font-medium text-sm uppercase tracking-wider">
                Knowledge Base
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mt-3 mb-6">
                Tech <span className="text-gradient">Insights</span> & Articles
              </h1>
              <p className="text-lg text-muted-foreground">
                Expert articles, tutorials, and case studies from our team of 
                developers and technology leaders.
              </p>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {loading ? (
              <div className="text-center text-muted-foreground py-12">Loading articles...</div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No articles found in this category.</div>
            ) : (
              <>
                {/* Featured Post */}
                {featuredPost && (
                  <div className="mb-12">
                    <div className="glass rounded-2xl overflow-hidden group hover:border-primary/30 transition-all duration-500">
                      <div className="grid md:grid-cols-2 gap-0">
                        <div className="aspect-video md:aspect-auto overflow-hidden">
                          <img
                            src={featuredPost.image_url || `https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=500&fit=crop`}
                            alt={featuredPost.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-8 flex flex-col justify-center">
                          <span className="text-primary text-sm font-medium mb-3">
                            {featuredPost.category}
                          </span>
                          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                            {featuredPost.title}
                          </h2>
                          <p className="text-muted-foreground mb-6">
                            {featuredPost.excerpt}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {featuredPost.author_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {featuredPost.read_time} min read
                            </span>
                          </div>
                          <Button variant="hero" className="w-fit group">
                            Read Article
                            <ArrowRight className="transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Regular Posts Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post) => (
                    <article
                      key={post.id}
                      className="group glass rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500"
                    >
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.image_url || `https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop`}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-6">
                        <span className="text-primary text-xs font-medium">
                          {post.category}
                        </span>
                        <h3 className="font-display text-lg font-semibold text-foreground mt-2 mb-3 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {post.author_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.read_time} min
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Blog;
