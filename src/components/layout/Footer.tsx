import { Link } from "react-router-dom";
import alsamosLogo from "@/assets/alsamos-logo.png";
import { Mail, MapPin, Phone, Linkedin, Github, Twitter } from "lucide-react";

const footerLinks = {
  services: [
    { name: "Web Development", path: "/services" },
    { name: "Mobile Apps", path: "/services" },
    { name: "AI Solutions", path: "/services" },
    { name: "Cloud & DevOps", path: "/services" },
    { name: "Cybersecurity", path: "/services" },
  ],
  company: [
    { name: "About Us", path: "/about" },
    { name: "Our Works", path: "/works" },
    { name: "Blog", path: "/blog" },
    { name: "Pricing", path: "/pricing" },
    { name: "Contact", path: "/contact" },
  ],
  resources: [
    { name: "Templates", path: "/templates" },
    { name: "Case Studies", path: "/works" },
    { name: "Documentation", path: "/blog" },
    { name: "Support", path: "/contact" },
  ],
};

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img src={alsamosLogo} alt="Alsamos" className="h-12 w-12" />
              <span className="font-display text-2xl font-bold text-foreground">
                Alsamos<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              We Build. You Scale. Premium IT solutions for businesses ready to 
              transform their digital presence.
            </p>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <a href="mailto:info@alsamos.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail size={16} />
                info@alsamos.com
              </a>
              <a href="tel:+998901234567" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone size={16} />
                +998 90 123 45 67
              </a>
              <span className="flex items-center gap-2">
                <MapPin size={16} />
                Tashkent, Uzbekistan
              </span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Alsamos Corporation. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
