import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  fetchDepartmentTeam,
  fetchAllTournaments,
  fetchTournamentById,
  fetchTeamsByTournament,
  getPlayersByTeamFromDistribution,
  getTeamPlayersByTournament,
  type UITournament,
} from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Award, Medal, Users } from "lucide-react";

const TeamDepartmentPage = () => {
  const { dept } = useParams<{ dept: string }>();
  const [sp] = useSearchParams();
  const [data, setData] = useState<{ short: string; description?: string } | null>(null);
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [players, setPlayers] = useState<Array<{ id: string | number; name: string; category?: string | null; avatarUrl: string | null }>>([]);
  const [tournament, setTournament] = useState<Pick<UITournament, "id"|"title"|"year"> | null>(null);
  // placeholders for future enrichment
  const [captainName] = useState<string | null>(null);
  const [achievements] = useState<number>(0);

  useEffect(() => {
    if (!dept) return;
    (async () => {
      try {
        // Resolve minimal team info and tournament
        const info = await fetchDepartmentTeam(dept);
        if (info) setData(info);

        // Prefer t from URL (?t=) else pick Live/Upcoming/first
        const fromQuery = sp.get("t") || sp.get("tournamentId");
        let chosen: string | null = fromQuery ? String(fromQuery) : null;
        if (!chosen) {
          const all = await fetchAllTournaments();
          const live = all.find((t) => t.status === "Live");
          const upcoming = all.find((t) => t.status === "Upcoming");
          chosen = (live || upcoming || all[0])?.id ?? null;
        }
        setTournamentId(chosen);

        if (chosen) {
          // Fetch selected tournament meta for header
          const tMeta = await fetchTournamentById(chosen);
          if (tMeta) setTournament({ id: tMeta.id, title: tMeta.title, year: tMeta.year });

          // Try distribution first
          const dist = await getPlayersByTeamFromDistribution(chosen, info?.short || dept);
          let list = dist.players;
          // If API returns a concrete team id, prefer the dedicated endpoint
          if ((!list || list.length === 0) && dist.teamId) {
            const viaSpecific = await getTeamPlayersByTournament(dist.teamId, chosen);
            if (viaSpecific?.length) {
              list = viaSpecific;
            }
          }

          // Fallback: use team players endpoint if distribution empty
          if (!list || list.length === 0) {
            const allTeams = await fetchTeamsByTournament(chosen);
            const keyRaw = String(info?.short || dept);
            const key = keyRaw.toLowerCase();
            const match = allTeams.find(
              (t) =>
                String(t.id) === keyRaw ||
                (t.short || "").toLowerCase() === key ||
                (t.name || "").toLowerCase() === key ||
                (t.name || "").toLowerCase().includes(key)
            );
            if (match) {
              list = await getTeamPlayersByTournament(match.id, chosen);
            }
          }

          setPlayers(list || []);
          setPlayerCount((list || []).length);
        } else {
          setPlayers([]);
          setPlayerCount(0);
        }
      } catch {
        setPlayers([]);
      }
    })();
  }, [dept, sp]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {!data ? (
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-3xl font-bold">Department not found</h1>
              <p className="text-muted-foreground">The team category you’re looking for doesn’t exist.</p>
              <Button asChild variant="outline">
                <Link to="/team"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Teams</Link>
              </Button>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="h-2 bg-gradient-accent rounded-t-md" />
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6 mt-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                    {data.short} <span className="text-accent">Team</span>
                  </h1>
                  <p className="text-muted-foreground mt-2 max-w-2xl">{data.description}</p>
                  <p className="text-sm text-muted-foreground mt-1">Team Code: <span className="font-medium">{data.short}</span></p>
                  {tournament && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Tournament: {tournament.title} {tournament.year ? `(${tournament.year})` : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/team"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Link>
                  </Button>
                </div>
              </div>

              {/* Stats strip like the mock */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <Card className="border-border">
                  <CardContent className="pt-5 pb-5 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Players</div>
                      <div className="text-2xl font-bold">{playerCount}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs"><Users className="h-4 w-4 mr-1" /> Squad</Badge>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="pt-5 pb-5 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Captain</div>
                      <div className="text-2xl font-bold">{captainName || "TBD"}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs"><Medal className="h-4 w-4 mr-1" /> Lead</Badge>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="pt-5 pb-5 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Achievements</div>
                      <div className="text-2xl font-bold">{achievements}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs"><Award className="h-4 w-4 mr-1" /> Cups</Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Player List title */}
              <h2 className="text-xl font-semibold mb-4">Player List</h2>

              {/* Players grid */}
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {players.map((p) => (
                  <Card key={p.id} className="border-border hover:shadow-glow transition-all duration-300">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 ring-2 ring-accent/30">
                          {p.avatarUrl ? <AvatarImage src={p.avatarUrl} alt={p.name} /> : null}
                          <AvatarFallback>{String(p.name).split(" ").map(w=>w[0]).slice(0,2).join("")}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-foreground leading-tight">{p.name}</div>
                          {p.category ? (
                            <div className="text-xs text-muted-foreground capitalize">{String(p.category).replace(/_/g, " ")}</div>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {players.length === 0 && (
                <div className="text-center text-muted-foreground">No players found for this team yet.</div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeamDepartmentPage;
