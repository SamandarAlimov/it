import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Calculator } from "lucide-react";
import { Link } from "react-router-dom";

interface Feature {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
}

const features: Feature[] = [
  // Web Development
  { id: "landing", name: "Landing Page", description: "Single page with CTA", basePrice: 399, category: "Web" },
  { id: "corporate", name: "Corporate Website", description: "5-10 pages with CMS", basePrice: 1499, category: "Web" },
  { id: "ecommerce", name: "E-commerce Store", description: "Full shopping cart & checkout", basePrice: 3999, category: "Web" },
  { id: "marketplace", name: "Marketplace Platform", description: "Multi-vendor platform", basePrice: 7999, category: "Web" },
  { id: "saas", name: "SaaS Platform", description: "Full subscription system", basePrice: 12999, category: "Web" },
  
  // Mobile
  { id: "mobile-simple", name: "Simple Mobile App", description: "Basic functionality", basePrice: 1999, category: "Mobile" },
  { id: "mobile-medium", name: "Medium Mobile App", description: "With backend integration", basePrice: 4999, category: "Mobile" },
  { id: "mobile-advanced", name: "Advanced Mobile App", description: "Full feature super app", basePrice: 14999, category: "Mobile" },
  
  // Add-ons
  { id: "ai-chatbot", name: "AI Chatbot", description: "Intelligent assistant", basePrice: 1499, category: "AI" },
  { id: "ai-analytics", name: "AI Analytics", description: "Data processing & insights", basePrice: 2999, category: "AI" },
  { id: "payment", name: "Payment Integration", description: "Stripe, PayPal, etc.", basePrice: 499, category: "Integration" },
  { id: "auth", name: "User Authentication", description: "Login, register, SSO", basePrice: 399, category: "Integration" },
  { id: "admin", name: "Admin Dashboard", description: "Management panel", basePrice: 999, category: "Integration" },
  { id: "cloud-basic", name: "Basic Cloud Setup", description: "Simple deployment", basePrice: 299, category: "DevOps" },
  { id: "cloud-pro", name: "Pro Cloud Infrastructure", description: "CI/CD, monitoring", basePrice: 999, category: "DevOps" },
];

const categories = ["All", "Web", "Mobile", "AI", "Integration", "DevOps"];

export const PricingCalculator = () => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [timeline, setTimeline] = useState<"standard" | "fast" | "urgent">("standard");

  const toggleFeature = useCallback((featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    );
  }, []);

  const filteredFeatures = features.filter(
    (f) => activeCategory === "All" || f.category === activeCategory
  );

  const baseTotal = selectedFeatures.reduce((sum, id) => {
    const feature = features.find((f) => f.id === id);
    return sum + (feature?.basePrice || 0);
  }, 0);

  const timelineMultiplier = timeline === "fast" ? 1.3 : timeline === "urgent" ? 1.6 : 1;
  const total = Math.round(baseTotal * timelineMultiplier);

  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4">
            <Calculator className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Interactive Calculator</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Estimate Your <span className="text-gradient">Project Cost</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select the features you need and get an instant estimate. 
            Final pricing may vary based on specific requirements.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Feature Selection */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
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

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              {filteredFeatures.map((feature) => {
                const isSelected = selectedFeatures.includes(feature.id);
                return (
                  <button
                    key={feature.id}
                    onClick={() => toggleFeature(feature.id)}
                    className={`p-4 rounded-xl text-left transition-all duration-300 ${
                      isSelected
                        ? "bg-primary/10 border-2 border-primary"
                        : "glass hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-foreground mb-1">
                          {feature.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {feature.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-primary">
                          ${feature.basePrice.toLocaleString()}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-border"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                Project Summary
              </h3>

              {/* Selected Features */}
              <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
                {selectedFeatures.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No features selected</p>
                ) : (
                  selectedFeatures.map((id) => {
                    const feature = features.find((f) => f.id === id);
                    return feature ? (
                      <div key={id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{feature.name}</span>
                        <span className="text-foreground">${feature.basePrice.toLocaleString()}</span>
                      </div>
                    ) : null;
                  })
                )}
              </div>

              {/* Timeline */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Timeline
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "standard", label: "Standard", multiplier: "1x" },
                    { id: "fast", label: "Fast", multiplier: "1.3x" },
                    { id: "urgent", label: "Urgent", multiplier: "1.6x" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setTimeline(option.id as typeof timeline)}
                      className={`py-2 px-3 rounded-lg text-center text-sm transition-all ${
                        timeline === option.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs opacity-70">{option.multiplier}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Estimated Total</span>
                  <span className="font-display text-3xl font-bold text-gradient">
                    ${total.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  *Final price may vary based on requirements
                </p>
              </div>

              <Link to="/contact">
                <Button variant="hero" className="w-full group">
                  Get Detailed Quote
                  <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
