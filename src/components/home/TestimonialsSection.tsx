import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface Testimonial {
  id: string;
  client_name: string;
  client_role: string;
  company: string;
  quote: string;
  rating: number;
  avatar_url: string | null;
}

export const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (data) setTestimonials(data);
    };
    fetchTestimonials();
  }, []);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/30 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our clients have to say 
            about working with Alsamos.
          </p>
        </div>

        {/* Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="glass rounded-2xl p-6 h-full flex flex-col">
                  {/* Quote Icon */}
                  <Quote className="w-8 h-8 text-primary/30 mb-4" />
                  
                  {/* Quote */}
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-6">
                    "{testimonial.quote}"
                  </p>
                  
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating
                            ? "text-primary fill-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Client Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-display font-bold">
                      {testimonial.client_name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {testimonial.client_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.client_role}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12" />
          <CarouselNext className="hidden md:flex -right-12" />
        </Carousel>
      </div>
    </section>
  );
};
