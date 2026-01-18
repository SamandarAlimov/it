import { 
  Globe, 
  Smartphone, 
  Cpu, 
  Cloud, 
  Shield, 
  Monitor,
  ArrowUpRight
} from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Globe,
    title: "Web Development",
    description: "Corporate websites, marketplaces, SaaS platforms, and landing pages with cutting-edge technologies.",
    features: ["React/Next.js", "Custom CMS", "E-commerce"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Smartphone,
    title: "Mobile Apps",
    description: "Native and cross-platform mobile applications for iOS and Android with stunning UI/UX.",
    features: ["iOS & Android", "React Native", "Flutter"],
    color: "from-primary to-accent",
  },
  {
    icon: Monitor,
    title: "Desktop Software",
    description: "Enterprise-grade desktop applications for Windows, macOS, and Linux platforms.",
    features: ["Electron", "Cloud Sync", "Cross-platform"],
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Cpu,
    title: "AI & Automation",
    description: "Intelligent chatbots, data analytics, recommendation systems, and AI-powered solutions.",
    features: ["ChatGPT API", "ML Models", "NLP"],
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Cloud,
    title: "Cloud & DevOps",
    description: "Scalable cloud infrastructure, CI/CD pipelines, and enterprise-grade deployment solutions.",
    features: ["AWS/Azure", "Kubernetes", "Docker"],
    color: "from-sky-500 to-blue-500",
  },
  {
    icon: Shield,
    title: "Cybersecurity",
    description: "Penetration testing, security audits, and SOC services to protect your digital assets.",
    features: ["Pen Testing", "Audit", "SOC"],
    color: "from-red-500 to-rose-500",
  },
];

export const ServicesSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Our Services
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            Complete IT Solutions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From concept to deployment, we deliver premium technology solutions 
            that scale with your business.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Link
              key={service.title}
              to="/services"
              className="group relative glass rounded-2xl p-6 transition-all duration-500 hover:bg-card/80 hover:border-primary/30 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} p-3 mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="w-full h-full text-primary-foreground" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                {service.title}
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 text-primary" />
              </h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {service.description}
              </p>

              {/* Features Tags */}
              <div className="flex flex-wrap gap-2">
                {service.features.map((feature) => (
                  <span
                    key={feature}
                    className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
