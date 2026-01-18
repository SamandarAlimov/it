const partners = [
  { name: "Microsoft", logo: "M" },
  { name: "Google Cloud", logo: "G" },
  { name: "Amazon AWS", logo: "A" },
  { name: "Stripe", logo: "S" },
  { name: "Vercel", logo: "V" },
  { name: "MongoDB", logo: "M" },
];

export const PartnersSection = () => {
  return (
    <section className="py-16 border-y border-border">
      <div className="container mx-auto px-4">
        <p className="text-center text-muted-foreground text-sm mb-8">
          Trusted by industry leaders and innovative startups
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="group flex items-center gap-2 text-muted-foreground/50 hover:text-primary transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center font-display font-bold text-lg">
                {partner.logo}
              </div>
              <span className="font-medium text-lg">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
