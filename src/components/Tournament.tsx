import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Calendar, Clock, MapPin, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import trophyImage from "@/assets/trophy.jpg";
import { useEffect, useState } from "react";
import { fetchTournaments } from "@/lib/api";
import type { UITournament } from "@/lib/api";

const Tournament = () => {
  const [tournaments, setTournaments] = useState<UITournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await fetchTournaments();
        if (mounted) {
          setTournaments(list);
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg text-muted-foreground">Loading tournaments...</p>
        </div>
      </section>
    );
  }

  if (tournaments.length === 0) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg text-muted-foreground">No tournaments available at the moment.</p>
        </div>
      </section>
    );
  }

  // Show only first 4 tournaments on the homepage
  const visibleTournaments = tournaments.slice(0, 4);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">ALL <span className="text-accent">Tournaments</span></h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Latest seasons at a glance. See more for the full list.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {visibleTournaments.map((tournament, index) => (
            <Card 
              key={tournament.id || index} 
              className="border-border hover:shadow-glow transition-all duration-300 hover:-translate-y-1 animate-scale-in overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="h-2 bg-gradient-accent"></div>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-2xl">
                    {tournament.title} {tournament.year ? (<span className="text-accent">({tournament.year})</span>) : ''}
                  </CardTitle>
                  <span className={`${tournament.statusColor || 'bg-accent'} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                    {tournament.status || 'Upcoming'}
                  </span>
                </div>
                <CardDescription className="text-base">{tournament.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span>{tournament.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 text-accent" />
                    <span>{tournament.teams ? `${tournament.teams} Teams` : '—'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground col-span-full">
                    <MapPin className="h-4 w-4 text-accent" />
                    <span>{tournament.venue || 'PSTU Cricket Ground'}</span>
                  </div>
                </div>
                <Link to={`/tournament/${tournament.id}`}>
                  <Button className="w-full bg-gradient-accent shadow-accent">
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* See more link moved to bottom */}
        <div className="mt-2 mb-14 text-center">
          <Link to="/tournament">
            <Button variant="outline" className="border-2">
              See more
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Featured Image */}
        <div className="relative rounded-2xl overflow-hidden shadow-glow max-w-4xl mx-auto animate-fade-in-up">
          <img 
            src={trophyImage} 
            alt="CPL Trophy" 
            className="w-full h-[400px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent flex items-end">
            <div className="p-8 text-primary-foreground">
              <h3 className="text-3xl font-bold mb-2">The CPL Trophy Awaits</h3>
              <p className="text-primary-foreground/90 mb-4">Will your team claim the championship this season?</p>
              <Link to="/auth">
                <Button size="lg" className="bg-accent hover:bg-accent-glow shadow-accent">
                  Register Your Team
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Tournament;
