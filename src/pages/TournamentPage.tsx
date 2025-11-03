import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Tournament } from "@/data/tournaments";
import { useEffect, useState } from "react";
import { fetchAllTournaments } from "@/lib/api";


const TournamentPage = () => {
  const [source, setSource] = useState<Tournament[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const list = await fetchAllTournaments();
      if (!mounted) return;
      setSource(list);
    })();
    return () => { mounted = false; };
  }, []);

  const currentTournaments = source.filter((t) => t.status === "Live");
  const upcomingTournaments = source.filter((t) => t.status === "Upcoming");
  const pastTournaments = source.filter((t) => t.status === "Completed");

  const renderTournamentCard = (tournament: Tournament, index: number) => (
    <Card 
      key={index} 
      className="border-border hover:shadow-glow transition-all duration-300 hover:-translate-y-1 animate-scale-in overflow-hidden"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="h-2 bg-gradient-accent"></div>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-2xl">{tournament.title}</CardTitle>
          <span className={`${tournament.statusColor} text-white px-3 py-1 rounded-full text-xs font-medium`}>
            {tournament.status}
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
            <span>{tournament.teams} Teams</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground col-span-full">
            <MapPin className="h-4 w-4 text-accent" />
            <span>{tournament.venue}</span>
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
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        {/* Hero header - no image, animated gradient + blobs */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
            <div className="absolute -top-10 -left-10 h-52 w-52 rounded-full bg-accent/10 blur-3xl animate-pulse" />
            <div className="absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl animate-pulse" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-accent/5 blur-2xl" />
          </div>
          <div className="container mx-auto px-4">
            <div className="pt-12 pb-10 md:pb-20 max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight animate-fade-in-up">
                CPL <span className="text-accent">Tournaments</span>
              </h1>
              <p className="mt-4 text-lg md:text-xl text-muted-foreground animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                Browse live, upcoming, and past seasons. Click details for complete information.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 text-sm font-medium">Live: {currentTournaments.length}</span>
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 text-sm font-medium">Upcoming: {upcomingTournaments.length}</span>
                <span className="px-3 py-1 rounded-full bg-muted text-foreground/80 text-sm font-medium">Past: {pastTournaments.length}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 mt-8">

          {/* Live Tournaments */}
          {currentTournaments.length > 0 && (
            <section className="space-y-6 mb-12">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Live</h2>
                <div className="text-sm text-muted-foreground">{currentTournaments.length} running</div>
              </div>
              <div className="grid lg:grid-cols-2 gap-8">
                {currentTournaments.map((tournament, index) => renderTournamentCard(tournament, index))}
              </div>
            </section>
          )}

          {/* Upcoming */}
          {upcomingTournaments.length > 0 && (
            <section className="mb-14">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold">Upcoming Tournaments</h2>
                <div className="text-sm text-muted-foreground">{upcomingTournaments.length} scheduled</div>
              </div>
              <div className="grid lg:grid-cols-2 gap-8">
                {upcomingTournaments.map((tournament, index) => renderTournamentCard(tournament, index))}
              </div>
            </section>
          )}

          {/* Past */}
          {pastTournaments.length > 0 && (
            <section className="mb-14">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold">Past Seasons</h2>
                <div className="text-sm text-muted-foreground">{pastTournaments.length} archived</div>
              </div>
              <div className="grid lg:grid-cols-2 gap-8">
                {pastTournaments.map((tournament, index) => renderTournamentCard(tournament, index))}
              </div>
            </section>
          )}

          {/* Only tournament sections, as requested */}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TournamentPage;
