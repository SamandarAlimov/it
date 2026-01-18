import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Target, Eye, Users, Award } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "We're committed to delivering solutions that create real impact for businesses worldwide."
  },
  {
    icon: Eye,
    title: "Innovation First",
    description: "Constantly exploring cutting-edge technologies to provide the best solutions."
  },
  {
    icon: Users,
    title: "Client-Centric",
    description: "Your success is our priority. We build lasting partnerships, not just projects."
  },
  {
    icon: Award,
    title: "Quality Excellence",
    description: "Every line of code, every design, every solution meets the highest standards."
  },
];

const team = [
  { name: "Azizbek Rahimov", role: "CEO & Founder", image: "AR" },
  { name: "Sardor Aliev", role: "CTO", image: "SA" },
  { name: "Dilnoza Karimova", role: "Lead Designer", image: "DK" },
  { name: "Bobur Umarov", role: "Senior Developer", image: "BU" },
];

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us | Alsamos Corporation</title>
        <meta name="description" content="Learn about Alsamos Corporation - a premium IT company delivering innovative digital solutions to businesses worldwide." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-4">
            {/* Hero */}
            <div className="text-center max-w-4xl mx-auto mb-20">
              <span className="text-primary font-medium text-sm uppercase tracking-wider">
                About Alsamos
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mt-3 mb-6">
                Building the <span className="text-gradient">Digital Future</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Alsamos Corporation is a premium IT company headquartered in Uzbekistan, 
                delivering innovative technology solutions to businesses across the globe. 
                We believe in building software that scales with your ambitions.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
              {[
                { value: "5+", label: "Years Experience" },
                { value: "150+", label: "Projects Completed" },
                { value: "50+", label: "Happy Clients" },
                { value: "15+", label: "Team Members" },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-xl p-6 text-center">
                  <div className="font-display text-4xl font-bold text-gradient mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Mission & Vision */}
            <div className="grid md:grid-cols-2 gap-8 mb-20">
              <div className="glass rounded-2xl p-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Our Mission
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To empower businesses with cutting-edge technology solutions that drive 
                  growth, efficiency, and innovation. We strive to be the trusted partner 
                  for companies looking to transform their digital presence and scale globally.
                </p>
              </div>
              <div className="glass rounded-2xl p-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Our Vision
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To become Central Asia's leading technology company, recognized globally 
                  for delivering premium IT solutions that set industry standards. We envision 
                  a future where every business has access to world-class technology.
                </p>
              </div>
            </div>

            {/* Values */}
            <div className="mb-20">
              <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
                Our Core Values
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((value) => (
                  <div key={value.title} className="glass rounded-xl p-6 text-center hover:border-primary/30 transition-all duration-300">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent p-3 mx-auto mb-4">
                      <value.icon className="w-full h-full text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Team */}
            <div className="mb-20">
              <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
                Meet Our Team
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {team.map((member) => (
                  <div key={member.name} className="glass rounded-xl p-6 text-center group hover:border-primary/30 transition-all duration-300">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 text-primary-foreground font-display text-xl font-bold group-hover:scale-110 transition-transform">
                      {member.image}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {member.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center glass rounded-2xl p-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Ready to Work With Us?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Let's discuss how we can help transform your business with our 
                premium IT solutions.
              </p>
              <Link to="/contact">
                <Button variant="hero" size="xl" className="group">
                  Start Your Project
                  <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default About;
