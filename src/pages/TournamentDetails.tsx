import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, MapPin, Users, Trophy } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { fetchTournamentById, UITournament, fetchTeamsByTournament, UITeamOverview } from "@/lib/api";
import { Button } from "@/components/ui/button";
import PointsTable from "@/components/PointsTable";
import LeaderboardsWidget from "@/components/LeaderboardsWidget";
import { useEffect, useState } from "react";

const TournamentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<UITournament | null>(null);
  const [teams, setTeams] = useState<UITeamOverview[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const t = await fetchTournamentById(id);
      if (t) setData({ ...t, venue: t.venue || "PSTU Central Playground" });
      try {
        const list = await fetchTeamsByTournament(id);
        setTeams(list);
      } catch { /* ignore */ }
    })();
  }, [id]);

  if (!data) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <Card className="max-w-xl mx-auto">
              <CardContent className="p-8 text-center space-y-4">
                <p className="text-lg font-semibold">Tournament not found</p>
                <Button asChild>
                  <Link to="/tournament">Back to Tournaments</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Mini tabs */}
          <div className="sticky top-16 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="max-w-5xl mx-auto px-1 py-2 flex flex-wrap gap-2 text-sm">
              {[
                { id: '#about', label: 'About' },
                { id: '#participants', label: 'Participants' },
                ...(data.status === 'Completed' ? [{ id: '#champions', label: 'Champions' }] : []),
                { id: '#points', label: 'Points' },
                { id: '#leaderboards', label: 'Leaderboards' },
                { id: '#format', label: 'Format' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => document.querySelector(t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="px-3 py-1 rounded-md hover:bg-secondary"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {/* Header */}
          <div className="max-w-5xl mx-auto mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">{data.title}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium text-white ${data.statusColor}`}>{data.status}</span>
            </div>
            <p className="text-muted-foreground mb-4">{data.description}</p>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent my-6" />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-hero flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{data.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-hero flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Venue</p>
                  <p className="font-semibold">{data.venue}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-hero flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teams</p>
                  <p className="font-semibold">{data.teams}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-hero flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold">{data.status}</p>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <Card id="about" className="border-border max-w-5xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">About this Tournament</CardTitle>
              <CardDescription>{data.title} • Professional T10 cricket within the CSE community.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{data.description}</p>
            </CardContent>
          </Card>

          {/* Participants & Summary */}
          <div id="participants" className="max-w-5xl mx-auto mt-8 grid lg:grid-cols-2 gap-8">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-2xl">Participating Teams</CardTitle>
                <CardDescription>{teams.length} teams</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {teams.length > 0 ? (
                  teams.map((t) => (
                    <span key={t.id} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm">{t.short || t.name}</span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No teams found for this tournament.</span>
                )}
              </CardContent>
            </Card>

            {data.status === 'Completed' && (
              <Card id="champions" className="border-border">
                <CardHeader>
                  <CardTitle className="text-2xl">Champions & Runner-up</CardTitle>
                  <CardDescription>Season {data.title}</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded border border-border">
                    <p className="text-xs text-muted-foreground">Champion</p>
                    <p className="text-lg font-semibold flex items-center gap-2"><Trophy className="h-5 w-5 text-accent" /> {data.champion || '-'}
                    </p>
                  </div>
                  <div className="p-4 rounded border border-border">
                    <p className="text-xs text-muted-foreground">Runner-up</p>
                    <p className="text-lg font-semibold">{data.runnerUp || '-'}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Points & Leaderboards */}
          <div className="max-w-5xl mx-auto mt-8 space-y-8">
            <div id="points"><PointsTable compact /></div>
            <div id="leaderboards"><LeaderboardsWidget /></div>
          </div>

          {/* Notes */}
          <Card id="format" className="border-border max-w-5xl mx-auto mt-8">
            <CardHeader>
              <CardTitle className="text-2xl">Format & Conditions</CardTitle>
              <CardDescription>Summary of rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <ul className="list-disc pl-5 space-y-2">
                <li>Team count: 5 fixed departments.</li>
                <li>Format: T10, 10 overs per side.</li>
                <li>Knockout and league structure may vary per season.</li>
                <li>Playing conditions follow standard T10 rules.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TournamentDetails;
