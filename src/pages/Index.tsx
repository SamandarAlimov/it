import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { WorksSection } from "@/components/home/WorksSection";
import { PartnersSection } from "@/components/home/PartnersSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (user) return null;

  return (
    <>
      <Helmet>
        <title>Alsamos Corporation | Premium IT Solutions & Digital Services</title>
        <meta 
          name="description" 
          content="Alsamos Corp delivers premium IT solutions including web development, mobile apps, AI integration, cloud infrastructure, and cybersecurity. We Build. You Scale." 
        />
        <meta name="keywords" content="IT solutions, web development, mobile apps, AI, cloud, cybersecurity, Uzbekistan, digital transformation" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroSection />
          <PartnersSection />
          <ServicesSection />
          <WorksSection />
          <TestimonialsSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
