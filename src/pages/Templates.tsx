import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Star, Download, Eye, ShoppingCart } from "lucide-react";

interface Template {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  image_url: string | null;
  features: string[] | null;
  downloads: number;
  rating: number | null;
}

const categories = ["All", "Web", "Mobile", "AI", "Backend", "Desktop"];

const Templates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data } = await supabase
        .from("templates")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      
      if (data) setTemplates(data);
      setLoading(false);
    };
    fetchTemplates();
  }, []);

  const filteredTemplates = templates.filter(
    (t) => activeCategory === "All" || t.category === activeCategory
  );

  const handlePurchase = async (template: Template) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to purchase templates.",
        variant: "destructive",
      });
      return;
    }

    setPurchasing(template.id);

    try {
      const { data, error } = await supabase.functions.invoke("create-template-checkout", {
        body: {
          templateId: template.id,
          templateTitle: template.title,
          price: template.price,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    }

    setPurchasing(null);
  };

  return (
    <>
      <Helmet>
        <title>Template Marketplace | Alsamos Corporation</title>
        <meta name="description" content="Browse Alsamos Corp's premium template marketplace. Website templates, mobile UI kits, AI chatbot templates, and more." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-primary font-medium text-sm uppercase tracking-wider">
                Marketplace
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mt-3 mb-6">
                Premium <span className="text-gradient">Templates</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Production-ready templates to accelerate your development. 
                Each template is built with best practices and modern technologies.
              </p>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {loading ? (
              <div className="text-center text-muted-foreground py-12">Loading templates...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="group glass rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500"
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <img
                        src={template.image_url || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop"}
                        alt={template.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/90 text-primary-foreground">
                          {template.category}
                        </span>
                      </div>

                      {/* Price Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="text-sm font-bold px-3 py-1 rounded-full bg-background/80 backdrop-blur text-foreground">
                          ${template.price}
                        </span>
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button variant="glass" size="sm" className="gap-2">
                          <Eye className="w-4 h-4" />
                          Preview
                        </Button>
                        <Button 
                          variant="hero" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => handlePurchase(template)}
                          disabled={purchasing === template.id}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {purchasing === template.id ? "..." : "Buy"}
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                        {template.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {template.description}
                      </p>

                      {/* Features */}
                      {template.features && template.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {template.features.slice(0, 3).map((feature) => (
                            <span
                              key={feature}
                              className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-primary">
                          <Star className="w-4 h-4 fill-current" />
                          <span>{template.rating || 4.5}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Download className="w-4 h-4" />
                          <span>{template.downloads}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Coming Soon */}
            <div className="mt-16 text-center glass rounded-2xl p-12">
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                More Templates Coming Soon
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                We're constantly adding new templates. Subscribe to get notified 
                when new premium templates are available.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
                />
                <Button variant="hero" className="whitespace-nowrap">
                  Notify Me
                </Button>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Templates;
