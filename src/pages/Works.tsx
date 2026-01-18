import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ExternalLink } from "lucide-react";

const works = [
  {
    title: "E-Commerce Marketplace",
    category: "Web Development",
    description: "A full-featured multi-vendor marketplace with real-time inventory, payment processing, and analytics dashboard.",
    image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&h=500&fit=crop",
    tags: ["Next.js", "PostgreSQL", "Stripe", "Redis"],
    metrics: { users: "50K+", transactions: "$2M+", uptime: "99.9%" },
  },
  {
    title: "FinTech Super App",
    category: "Mobile App",
    description: "All-in-one banking app with payments, investments, cryptocurrency trading, and budget management.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=500&fit=crop",
    tags: ["React Native", "Node.js", "AWS", "Blockchain"],
    metrics: { downloads: "100K+", rating: "4.8★", countries: "5" },
  },
  {
    title: "Healthcare AI Platform",
    category: "AI Solution",
    description: "AI-powered diagnostic assistant that analyzes medical images and patient data to assist healthcare professionals.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop",
    tags: ["Python", "TensorFlow", "HIPAA", "Cloud"],
    metrics: { accuracy: "94%", hospitals: "12", diagnoses: "50K+" },
  },
  {
    title: "Logistics Management System",
    category: "Enterprise Software",
    description: "Real-time fleet tracking, route optimization, and warehouse management for logistics companies.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=500&fit=crop",
    tags: ["React", "Node.js", "MongoDB", "IoT"],
    metrics: { vehicles: "500+", efficiency: "+35%", savings: "$1M" },
  },
  {
    title: "EdTech Learning Platform",
    category: "Web & Mobile",
    description: "Interactive online learning platform with live classes, assessments, and personalized learning paths.",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=500&fit=crop",
    tags: ["Vue.js", "Django", "WebRTC", "AI"],
    metrics: { students: "25K+", courses: "200+", completion: "78%" },
  },
  {
    title: "Smart City Dashboard",
    category: "IoT & Analytics",
    description: "Real-time monitoring and analytics platform for smart city infrastructure and public services.",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&h=500&fit=crop",
    tags: ["React", "Python", "Kafka", "Grafana"],
    metrics: { sensors: "10K+", cities: "3", data: "1TB/day" },
  },
];

const Works = () => {
  return (
    <>
      <Helmet>
        <title>Our Works | Alsamos Corporation Portfolio</title>
        <meta name="description" content="Explore Alsamos Corp's portfolio of successful IT projects including web platforms, mobile apps, AI solutions, and enterprise software." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-primary font-medium text-sm uppercase tracking-wider">
                Portfolio
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mt-3 mb-6">
                Projects That <span className="text-gradient">Deliver Results</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Real solutions for real businesses. Explore our case studies and 
                see how we help companies transform digitally.
              </p>
            </div>

            {/* Works Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {works.map((work) => (
                <div
                  key={work.title}
                  className="group glass rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden aspect-video">
                    <img
                      src={work.image}
                      alt={work.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="text-sm font-medium px-4 py-1.5 rounded-full bg-primary/90 text-primary-foreground">
                        {work.category}
                      </span>
                    </div>

                    {/* View Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button variant="hero" className="gap-2">
                        View Case Study
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
                      {work.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {work.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {work.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                      {Object.entries(work.metrics).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="font-display text-lg font-bold text-gradient">
                            {value}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {key}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Works;
