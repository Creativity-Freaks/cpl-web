import { Trophy, Users, Target, Award } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const About = () => {
  const features = [
    {
      icon: Trophy,
      title: "Championship Glory",
      description: "Compete for the prestigious CPL trophy and eternal glory in university cricket history.",
    },
    {
      icon: Users,
      title: "Team Spirit",
      description: "Build lasting friendships and showcase your talent alongside the best CSE players.",
    },
    {
      icon: Target,
      title: "Professional Standards",
      description: "Experience tournament management with official rules, scoring, and live updates.",
    },
    {
      icon: Award,
      title: "Recognition",
      description: "Top performers receive awards, prizes, and recognition across the university.",
    },
  ];

  return (
    <section id="about" className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            About <span className="text-accent">CPL 2026</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            The CSE Premier League is the flagship cricket tournament of the Computer Science & Engineering department at PSTU. 
            Every year, we bring together the finest cricket talent to compete in an electrifying season of matches, 
            sportsmanship, and unforgettable moments.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border hover:shadow-glow transition-all duration-300 hover:-translate-y-2 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="pt-6 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-hero shadow-glow">
                  <feature.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
