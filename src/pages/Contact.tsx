import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Check, ArrowRight, Mail, Phone, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  company: z.string().max(100, "Company name too long").optional(),
  service: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message too long"),
});

const Contact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    service: "",
    budget: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.from("contact_submissions").insert({
      name: formData.name.trim(),
      email: formData.email.trim(),
      company: formData.company?.trim() || null,
      service: formData.service || null,
      budget: formData.budget || null,
      message: formData.message.trim(),
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", company: "", service: "", budget: "", message: "" });
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Alsamos Corporation</title>
        <meta name="description" content="Get in touch with Alsamos Corp for your IT project. Free consultation, NDA protected, 24/7 support." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Left Column - Info */}
              <div>
                <span className="text-primary font-medium text-sm uppercase tracking-wider">
                  Get In Touch
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3 mb-6">
                  Let's Start Your <span className="text-gradient">Project</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Ready to transform your business? Get a free consultation and 
                  project estimate. Our team will respond within 24 hours.
                </p>

                {/* Benefits */}
                <div className="space-y-4 mb-12">
                  {[
                    "Free project consultation",
                    "NDA protected discussions",
                    "Detailed project estimation",
                    "24/7 dedicated support",
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Contact Info */}
                <div className="glass rounded-2xl p-6 space-y-4">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                    Contact Information
                  </h3>
                  <a href="mailto:info@alsamos.com" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="w-5 h-5" />
                    info@alsamos.com
                  </a>
                  <a href="tel:+998901234567" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                    <Phone className="w-5 h-5" />
                    +998 90 123 45 67
                  </a>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="w-5 h-5" />
                    Tashkent, Uzbekistan
                  </div>
                </div>
              </div>

              {/* Right Column - Form */}
              <div className="glass rounded-2xl p-8">
                <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                  Send Us a Message
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg bg-secondary border ${errors.name ? 'border-destructive' : 'border-border'} focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground`}
                        placeholder="John Doe"
                      />
                      {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg bg-secondary border ${errors.email ? 'border-destructive' : 'border-border'} focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground`}
                        placeholder="john@company.com"
                      />
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
                        placeholder="Your Company"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Service Needed
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
                      >
                        <option value="">Select a service</option>
                        <option value="web">Web Development</option>
                        <option value="mobile">Mobile App</option>
                        <option value="desktop">Desktop Software</option>
                        <option value="ai">AI & Automation</option>
                        <option value="cloud">Cloud & DevOps</option>
                        <option value="security">Cybersecurity</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Budget Range
                    </label>
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
                    >
                      <option value="">Select budget range</option>
                      <option value="<1k">Less than $1,000</option>
                      <option value="1k-5k">$1,000 - $5,000</option>
                      <option value="5k-10k">$5,000 - $10,000</option>
                      <option value="10k-25k">$10,000 - $25,000</option>
                      <option value=">25k">More than $25,000</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Project Details *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg bg-secondary border ${errors.message ? 'border-destructive' : 'border-border'} focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground resize-none`}
                      placeholder="Describe your project, goals, and any specific requirements..."
                    />
                    {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full group" disabled={loading}>
                    {loading ? "Sending..." : "Send Message"}
                    <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Contact;
