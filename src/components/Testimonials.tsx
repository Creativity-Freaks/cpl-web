import { Card, CardContent } from "./ui/card";
import { Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Rakib Hasan",
      role: "Captain, Champions 2025",
      quote: "CPL gave us the platform to showcase our talent and build lifelong friendships. The competition was fierce but the memories are priceless!",
    },
    {
      name: "Sadia Akter",
      role: "Player of the Tournament 2025",
      quote: "The organization and excitement of CPL is unmatched. Every match felt like a professional tournament. Can't wait for 2026!",
    },
    {
      name: "Fahim Ahmed",
      role: "All-rounder, Runners-up 2025",
      quote: "CPL is more than just cricket - it's about team spirit, competition, and representing your department with pride. Absolutely loved it!",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            What <span className="text-accent">Players Say</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from our amazing players about their CPL experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="border-border hover:shadow-glow transition-all duration-300 hover:-translate-y-2 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="pt-6 space-y-4">
                <Quote className="h-10 w-10 text-accent opacity-50" />
                <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                <div className="pt-4 border-t border-border">
                  <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
