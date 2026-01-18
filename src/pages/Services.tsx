import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  Globe, 
  Smartphone, 
  Cpu, 
  Cloud, 
  Shield, 
  Monitor,
  ArrowRight,
  Check
} from "lucide-react";

const services = [
  {
    icon: Globe,
    title: "Web Development",
    description: "From corporate websites to complex SaaS platforms, we build scalable web solutions.",
    features: [
      "Corporate & Business Websites",
      "E-commerce & Marketplace",
      "SaaS Platforms",
      "Landing Pages & Microsites",
      "Custom CMS Solutions",
      "Progressive Web Apps"
    ],
    price: "From $799",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Smartphone,
    title: "Mobile Applications",
    description: "Native and cross-platform mobile apps with stunning UI and seamless performance.",
    features: [
      "iOS & Android Native",
      "React Native / Flutter",
      "Super Apps",
      "E-commerce Apps",
      "FinTech & Banking",
      "Health & Fitness Apps"
    ],
    price: "From $1,000",
    color: "from-primary to-accent",
  },
  {
    icon: Monitor,
    title: "Desktop Software",
    description: "Enterprise-grade desktop applications with cloud synchronization.",
    features: [
      "Windows Applications",
      "macOS Applications",
      "Linux Support",
      "Electron-based Apps",
      "Cloud Synchronization",
      "Offline-first Architecture"
    ],
    price: "From $2,000",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Cpu,
    title: "AI & Automation",
    description: "Harness the power of artificial intelligence to transform your business operations.",
    features: [
      "AI Chatbots & Assistants",
      "Data Analytics & ML",
      "Natural Language Processing",
      "Computer Vision",
      "Recommendation Systems",
      "Process Automation"
    ],
    price: "From $500",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Cloud,
    title: "Cloud & DevOps",
    description: "Scalable cloud infrastructure with automated deployment pipelines.",
    features: [
      "AWS / Azure / GCP",
      "Kubernetes & Docker",
      "CI/CD Pipelines",
      "Infrastructure as Code",
      "Monitoring & Logging",
      "Cost Optimization"
    ],
    price: "From $150/mo",
    color: "from-sky-500 to-blue-500",
  },
  {
    icon: Shield,
    title: "Cybersecurity",
    description: "Protect your digital assets with comprehensive security solutions.",
    features: [
      "Penetration Testing",
      "Security Audits",
      "SOC Services",
      "Vulnerability Assessment",
      "Compliance (GDPR, HIPAA)",
      "Incident Response"
    ],
    price: "From $999",
    color: "from-red-500 to-rose-500",
  },
];

const Services = () => {
  return (
    <>
      <Helmet>
        <title>IT Services | Alsamos Corporation</title>
        <meta name="description" content="Explore Alsamos Corp's comprehensive IT services including web development, mobile apps, AI integration, cloud infrastructure, and cybersecurity." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-primary font-medium text-sm uppercase tracking-wider">
                Our Services
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mt-3 mb-6">
                Complete IT Solutions for <span className="text-gradient">Your Business</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                From concept to deployment, we deliver premium technology solutions 
                that help your business scale globally.
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {services.map((service) => (
                <div
                  key={service.title}
                  className="glass rounded-2xl p-8 hover:border-primary/30 transition-all duration-500"
                >
                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.color} p-4 shrink-0`}>
                      <service.icon className="w-full h-full text-primary-foreground" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="font-display text-2xl font-semibold text-foreground">
                          {service.title}
                        </h3>
                        <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">
                          {service.price}
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground mb-6">
                        {service.description}
                      </p>

                      {/* Features */}
                      <div className="grid grid-cols-2 gap-2 mb-6">
                        {service.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-primary shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      <Link to="/contact">
                        <Button variant="outline" className="group">
                          Get Quote
                          <ArrowRight className="transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
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

export default Services;
