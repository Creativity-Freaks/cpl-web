import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { fetchAllTournaments, fetchTeamsByTournament } from "@/lib/api";
import type { UITeamOverview, UITournament } from "@/lib/api";
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

  const [tournaments, setTournaments] = useState<UITournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [items, setItems] = useState<Array<{ key: string; short: string; description: string; players: number }>>([]);

  // Load tournaments and choose default (Live -> Upcoming -> first)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await fetchAllTournaments();
        if (!mounted) return;
        setTournaments(list);
        const live = list.find((t) => t.status === "Live");
        const upcoming = list.find((t) => t.status === "Upcoming");
        const chosen = live || upcoming || list[0];
        if (chosen) setSelectedTournamentId(chosen.id);
      } catch (_) { /* noop */ }
    })();
    return () => { mounted = false; };
  }, []);

  // Fetch teams whenever tournament changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedTournamentId) return;
      try {
        const rows = await fetchTeamsByTournament(selectedTournamentId);
        if (!mounted) return;
        setItems(
          rows.map((r) => ({
            key: String(r.id),
            short: r.short || "",
            description: r.name || "",
            players: r.players || 0,
          }))
        );
      } catch (_) {
        if (mounted) setItems([]);
      }
    })();
    return () => { mounted = false; };
  }, [selectedTournamentId]);

  const selectedTournament = useMemo(() => tournaments.find((t) => t.id === selectedTournamentId) || null, [tournaments, selectedTournamentId]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-foreground mb-4 text-center animate-fade-in-up">
            Teams by <span className="text-accent">Department</span>
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto animate-fade-in-up">
            Explore squads by tournament. Default shows the Live tournament.
          </p>

          {/* Tournament selector */}
          <div className="mt-6 mb-10 flex items-center justify-center animate-fade-in-up" style={{ animationDelay: "0.08s" }}>
            <div className="w-full max-w-md">
              <Select value={selectedTournamentId ?? undefined} onValueChange={(v) => setSelectedTournamentId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tournament" />
                </SelectTrigger>
                <SelectContent>
                  {tournaments.map((t) => (
                    <SelectItem value={t.id} key={t.id}>
                      {t.title} {t.year ? `(${t.year})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((dept, index) => {
              const iconKey = String(dept.short || "").toLowerCase();
              const Icon = icons[iconKey] ?? Cpu;
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
                        <h3 className="text-xl font-bold text-foreground">{dept.description} {dept.short ? `(${dept.short})` : ''}</h3>
                      </div>
                      <Badge className="bg-primary-glow text-primary-foreground">{selectedTournament ? (selectedTournament.year ? `${selectedTournament.year}` : "CPL") : "CPL"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{dept.description}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">Players: {dept.players}</p>
                       <Button asChild size="sm" className="bg-gradient-accent shadow-accent">
                         <Link to={`/team/${encodeURIComponent(dept.short || dept.key)}?t=${encodeURIComponent(selectedTournamentId || "")}`}>View details</Link>
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {items.length === 0 && (
            <div className="text-center text-muted-foreground mt-10">No teams found for the selected tournament.</div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeamPage;
