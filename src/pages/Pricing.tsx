import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Check, ArrowRight } from "lucide-react";
import { PricingCalculator } from "@/components/pricing/PricingCalculator";

const pricingTiers = [
  {
    name: "Starter",
    description: "Perfect for small businesses and MVPs",
    price: "$999",
    period: "starting from",
    features: [
      "Landing Page / Simple Website",
      "Responsive Design",
      "Basic SEO Setup",
      "Contact Form Integration",
      "1 Month Support",
      "Source Code Delivery"
    ],
    popular: false,
  },
  {
    name: "Professional",
    description: "For growing businesses needing robust solutions",
    price: "$4,999",
    period: "starting from",
    features: [
      "Full Web Application",
      "Custom Design & UX",
      "Database Integration",
      "User Authentication",
      "Admin Dashboard",
      "API Development",
      "3 Months Support",
      "Deployment & Hosting Setup"
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Custom solutions for large-scale operations",
    price: "Custom",
    period: "contact us",
    features: [
      "Full-Stack Development",
      "Mobile App Included",
      "AI/ML Integration",
      "Microservices Architecture",
      "DevOps & CI/CD",
      "24/7 Priority Support",
      "SLA Guarantee",
      "Dedicated Team"
    ],
    popular: false,
  },
];

const Pricing = () => {
  return (
    <>
      <Helmet>
        <title>Pricing | Alsamos Corporation IT Services</title>
        <meta name="description" content="Transparent pricing for Alsamos Corp IT services. Web development, mobile apps, AI solutions, and more." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-primary font-medium text-sm uppercase tracking-wider">
                Pricing
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mt-3 mb-6">
                Transparent <span className="text-gradient">Pricing</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Choose the package that fits your needs. All prices are 
                customizable based on your specific requirements.
              </p>
            </div>

            {/* Pricing Tiers */}
            <div className="grid md:grid-cols-3 gap-6 mb-24">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`relative glass rounded-2xl p-8 transition-all duration-500 hover:-translate-y-1 ${
                    tier.popular ? "border-primary/50 shadow-lg shadow-primary/10" : ""
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {tier.description}
                  </p>

                  <div className="mb-6">
                    <span className="font-display text-4xl font-bold text-gradient">
                      {tier.price}
                    </span>
                    <span className="text-muted-foreground text-sm ml-2">
                      {tier.period}
                    </span>
                  </div>

                  <div className="space-y-3 mb-8">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link to="/contact">
                    <Button
                      variant={tier.popular ? "hero" : "outline"}
                      className="w-full group"
                    >
                      Get Started
                      <ArrowRight className="transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Calculator */}
          <PricingCalculator />
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Pricing;
