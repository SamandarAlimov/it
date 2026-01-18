import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";

const works = [
  {
    title: "E-Commerce Platform",
    category: "Web Development",
    description: "Full-featured marketplace with payment integration and real-time inventory.",
    image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?w=600&h=400&fit=crop",
    tags: ["Next.js", "PostgreSQL", "Stripe"],
  },
  {
    title: "FinTech Super App",
    category: "Mobile App",
    description: "Banking, payments, and investment management in one unified mobile experience.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop",
    tags: ["React Native", "Node.js", "AWS"],
  },
  {
    title: "Healthcare AI Platform",
    category: "AI Solution",
    description: "AI-powered diagnostic assistant reducing diagnosis time by 60%.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
    tags: ["Python", "TensorFlow", "Cloud"],
  },
];

export const WorksSection = () => {
  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Portfolio
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3">
              Our Latest Works
            </h2>
          </div>
          <Link to="/works">
            <Button variant="outline" className="group">
              View All Projects
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Works Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {works.map((work, index) => (
            <div
              key={work.title}
              className="group glass rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500"
            >
              {/* Image */}
              <div className="relative overflow-hidden aspect-[3/2]">
                <img
                  src={work.image}
                  alt={work.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                
                {/* View Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-primary-foreground" />
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/90 text-primary-foreground">
                    {work.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {work.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {work.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {work.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
