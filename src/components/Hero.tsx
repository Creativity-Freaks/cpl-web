import { Button } from "./ui/button";
import { ArrowRight, Calendar, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import bannerImage from "@/assets/hero-cricket.jpg";
import { useEffect, useState } from "react";
import { fetchUpcomingTournaments } from "@/lib/api";

const Hero = () => {
  const [seasonTitle, setSeasonTitle] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const list = await fetchUpcomingTournaments();
      if (!mounted) return;
      if (Array.isArray(list) && list.length > 0) {
        const first = list[0];
        setSeasonTitle(first.title || null);
        setDateRange(first.date || null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Banner */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/40 to-background/95"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-32 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30">
            <Calendar className="h-4 w-4 text-accent" />
            <span className="text-accent-foreground font-medium">{dateRange ?? 'December 1 - December 12, 2026'}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground leading-tight">
            {seasonTitle ?? 'CSE Premier League'}
            <span className="block text-accent mt-2">{seasonTitle ? seasonTitle.split(' ').slice(-1)[0] : '2026'}</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto">
            Patuakhali Science and Technology University's Most Prestigious Cricket Tournament
          </p>
          <p className="text-lg text-accent font-semibold">
            Organised by Nobarun-19
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { tab: 'register' } })); }}>
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent-glow text-accent-foreground shadow-accent text-lg px-8 py-6 animate-pulse-glow"
              >
                Register Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <Link to="/tournament">
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-primary-foreground/30 text-black hover:bg-primary-foreground/10 backdrop-blur-sm text-lg px-8 py-6"
              >
                <Trophy className="mr-2 h-5 w-5" />
                View Tournaments
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;
