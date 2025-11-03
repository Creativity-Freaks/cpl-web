import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { departmentList } from "@/data/teams";
import { useEffect, useState } from "react";
import { fetchTeamsOverview, UITeamOverview } from "@/lib/api";
import { Link } from "react-router-dom";
import { Cpu, Radio, Wrench, Zap, Sigma } from "lucide-react";

const TeamPage = () => {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    csit: Cpu,
    cce: Radio,
    pme: Wrench,
    eee: Zap,
    mathematics: Sigma,
  };

  const [items, setItems] = useState(departmentList.map((d) => ({ key: d.key, short: d.short, description: d.description, players: d.players.length })));

  useEffect(() => {
    fetchTeamsOverview().then((rows) => {
      if (rows && rows.length) {
        setItems(rows.map((r) => ({ key: r.key, short: r.short, description: r.description || "", players: r.playersCount })));
      }
    }).catch(() => void 0);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-foreground mb-6 text-center animate-fade-in-up">
            Teams by <span className="text-accent">Department</span>
          </h1>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto animate-fade-in-up">
            Explore department squads. Select a category to view details and player list.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((dept, index) => {
              const Icon = icons[dept.key] ?? Cpu;
              return (
                <Card
                  key={dept.key}
                  className="border-border hover:shadow-glow transition-all duration-300 hover:-translate-y-2 animate-scale-in"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="h-2 bg-gradient-accent" />
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6 text-accent" />
                        <h3 className="text-xl font-bold text-foreground">{dept.short}</h3>
                      </div>
                      <Badge className="bg-primary-glow text-primary-foreground">CPL</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{dept.description}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">Players: {dept.players}</p>
                      <Button asChild size="sm" className="bg-gradient-accent shadow-accent">
                        <Link to={`/team/${dept.key}`}>View details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeamPage;
