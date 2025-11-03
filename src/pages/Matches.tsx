import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { tournaments, Match } from "@/data/tournaments";
import { useMemo, useState } from "react";
import PointsTable from "@/components/PointsTable";
import LeaderboardsWidget from "@/components/LeaderboardsWidget";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { fetchMatches, UIMatchItem } from "@/lib/api";

const teamColors: Record<string, string> = {
  CSIT: "from-fuchsia-500 to-purple-600",
  EEE: "from-emerald-500 to-green-600",
  CCE: "from-sky-500 to-blue-600",
  PME: "from-amber-500 to-orange-600",
  Mathematics: "from-rose-500 to-pink-600",
};

// Local helper types for safely coercing optional scorecard rows
type BatterRow = { name?: string; runs?: number; balls?: number };
type BowlerRow = { name?: string; wickets?: number; runs?: number; overs?: string; eco?: number };

const TeamBadge = ({ name }: { name?: string }) => (
  <span className={`h-8 w-8 rounded-full grid place-items-center text-[10px] font-bold text-white bg-gradient-to-br ${teamColors[name ?? ''] || "from-zinc-600 to-zinc-800"}`}>
    {(name ?? '').slice(0, 2)}
  </span>
);

const Ticker = ({ items }: { items: { a: string; b: string; score?: string }[] }) => (
  <div className="w-full overflow-x-auto">
    <div className="flex gap-3 min-w-max py-2">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-sm">
          <TeamBadge name={it.a} />
          <span className="font-semibold">{it.a}</span>
          <span className="text-muted-foreground">vs</span>
          <span className="font-semibold">{it.b}</span>
          {it.score && <span className="text-xs text-muted-foreground">• {it.score}</span>}
        </span>
      ))}
    </div>
  </div>
);

const LiveScoreCard = ({ match, tournamentTitle, tournamentId }: { match: Match; tournamentTitle: string; tournamentId: string }) => {
  const topBatter = (match.battingA ?? []).slice().sort((a, b) => (Number(b.runs ?? 0) - Number(a.runs ?? 0)))[0];
  const topBowler = (match.bowlingB ?? []).slice().sort((a, b) => {
    const wk = Number(b.wickets ?? 0) - Number(a.wickets ?? 0);
    if (wk !== 0) return wk;
    const ae = Number(a.eco ?? Infinity);
    const be = Number(b.eco ?? Infinity);
    return ae - be;
  })[0];
  return (
  <Card className="border-border hover:shadow-glow transition-all animate-scale-in">
    <CardHeader>
      <CardTitle className="flex items-center justify-between text-lg md:text-xl">
        <span className="flex items-center gap-2">
          <TeamBadge name={match.teamA?.name ?? ''} />
          <span className="font-semibold">{match.teamA?.name ?? ''}</span>
          <span className="text-muted-foreground">vs</span>
          <span className="font-semibold">{match.teamB?.name ?? ''}</span>
          <TeamBadge name={match.teamB?.name ?? ''} />
        </span>
        <span className="text-xs px-2 py-1 rounded bg-red-500 text-white animate-pulse">LIVE</span>
      </CardTitle>
      <CardDescription>{tournamentTitle} • {match.venue} • {new Date(match.startTime).toLocaleString()}</CardDescription>
  </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">{match.teamA?.name ?? ''}</p>
          <p className="text-3xl font-bold">{match.teamA?.score || "--/--"} <span className="text-base font-normal">({match.teamA?.overs || "--"})</span></p>
        </div>
        <div className="p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">{match.teamB?.name ?? ''}</p>
          <p className="text-3xl font-bold">{match.teamB?.score || "--/--"} <span className="text-base font-normal">({match.teamB?.overs || "--"})</span></p>
        </div>
      </div>
      {match.toss && <p className="text-sm text-muted-foreground">{match.toss}</p>}
      {match.note && <p className="text-sm">{match.note}</p>}
      {(topBatter || topBowler) && (
        <div className="text-xs text-muted-foreground flex flex-wrap gap-4">
          {topBatter && (
            <span>
              Top batter: <span className="font-medium text-foreground">{topBatter?.name ?? ''}</span>
              {typeof topBatter?.runs === 'number' ? ` ${topBatter!.runs}` : ''}
              {topBatter?.balls ? ` (${topBatter!.balls})` : ''}
            </span>
          )}
          {topBowler && (
            <span>
              Best bowler: <span className="font-medium text-foreground">{topBowler?.name ?? ''}</span>
              {typeof topBowler?.wickets === 'number' ? ` ${topBowler!.wickets}` : ''}/{typeof topBowler?.runs === 'number' ? `${topBowler!.runs}` : '--'}
              {topBowler?.overs ? ` • ${topBowler!.overs}` : ''}
              {typeof topBowler?.eco === 'number' ? ` (Eco ${topBowler!.eco.toFixed(1)})` : ''}
            </span>
          )}
        </div>
      )}
      <div className="pt-2">
        <Link to={`/match/${tournamentId}/${match.id}`} className="text-sm text-accent hover:underline">Open Match Center →</Link>
      </div>
    </CardContent>
  </Card>
  );
};

const UpcomingMatchCard = ({ match, tournamentTitle, tournamentId }: { match: Match; tournamentTitle: string; tournamentId: string }) => (
  <Card className="border-border">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg md:text-xl">{match.teamA?.name ?? ''} vs {match.teamB?.name ?? ''}</CardTitle>
        <Link to={`/match/${tournamentId}/${match.id}`} className="text-xs text-accent hover:underline">Details</Link>
      </div>
      <CardDescription>{tournamentTitle} • {match.venue} • {new Date(match.startTime).toLocaleString()}</CardDescription>
    </CardHeader>
  </Card>
);

const CompletedMatchCard = ({ match, tournamentTitle, tournamentId }: { match: Match; tournamentTitle: string; tournamentId: string }) => {
  const topBatter = ([...(match.battingA ?? []), ...(match.battingB ?? [])] as BatterRow[]).slice().sort((a, b) => (Number(b.runs ?? 0) - Number(a.runs ?? 0)))[0];
  const topBowler = ([...(match.bowlingA ?? []), ...(match.bowlingB ?? [])] as BowlerRow[]).slice().sort((a, b) => {
    const wk = Number(b.wickets ?? 0) - Number(a.wickets ?? 0);
    if (wk !== 0) return wk;
    const ae = Number(a.eco ?? Infinity);
    const be = Number(b.eco ?? Infinity);
    return ae - be;
  })[0];
  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl">{match.teamA?.name ?? ''} vs {match.teamB?.name ?? ''}</CardTitle>
          <Link to={`/match/${tournamentId}/${match.id}`} className="text-xs text-accent hover:underline">Scorecard</Link>
        </div>
        <CardDescription>{tournamentTitle} • {match.venue} • {new Date(match.startTime).toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-3 rounded border border-border">
            <p className="text-sm text-muted-foreground">{match.teamA.name}</p>
            <p className="font-semibold">{match.teamA.score} ({match.teamA.overs})</p>
          </div>
          <div className="p-3 rounded border border-border">
            <p className="text-sm text-muted-foreground">{match.teamB.name}</p>
            <p className="font-semibold">{match.teamB.score} ({match.teamB.overs})</p>
          </div>
        </div>
        {match.result && <p className="text-sm font-medium">Result: {match.result}</p>}
        {(topBatter || topBowler) && (
          <div className="text-xs text-muted-foreground flex flex-wrap gap-4">
            {topBatter && (
              <span>
                Top batter: <span className="font-medium text-foreground">{topBatter?.name ?? ''}</span>
                {typeof topBatter?.runs === 'number' ? ` ${topBatter!.runs}` : ''}
                {topBatter?.balls ? ` (${topBatter!.balls})` : ''}
              </span>
            )}
            {topBowler && (
              <span>
                Best bowler: <span className="font-medium text-foreground">{topBowler?.name ?? ''}</span>
                {typeof topBowler?.wickets === 'number' ? ` ${topBowler!.wickets}` : ''}/{typeof topBowler?.runs === 'number' ? `${topBowler!.runs}` : '--'}
                {topBowler?.overs ? ` • ${topBowler!.overs}` : ''}
                {typeof topBowler?.eco === 'number' ? ` (Eco ${topBowler!.eco.toFixed(1)})` : ''}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Matches = () => {
  const [query, setQuery] = useState("");
  const [dynamic, setDynamic] = useState<UIMatchItem[] | null>(null);
  useEffect(() => {
    fetchMatches().then((rows) => {
      if (rows && rows.length) setDynamic(rows);
    }).catch(() => void 0);
  }, []);
  const allRaw = useMemo(() => (dynamic && dynamic.length ? dynamic : tournaments.flatMap((t) => t.matches.map((m) => ({ match: m, tournamentTitle: t.title, tournamentId: t.id })))), [dynamic]);
  const [teamFilter, setTeamFilter] = useState<string>("All");
  const all = useMemo(() => {
    if (!query.trim()) return allRaw;
    const q = query.toLowerCase();
    return allRaw.filter(({ match }) =>
      (teamFilter === "All" || match.teamA?.name === teamFilter || match.teamB?.name === teamFilter) &&
      ((match.teamA?.name || '').toLowerCase().includes(q) || (match.teamB?.name || '').toLowerCase().includes(q))
    );
  }, [allRaw, query, teamFilter]);
  const live = all.filter((x) => x.match.status === "live");
  const upcoming = all.filter((x) => x.match.status === "upcoming");
  const completed = all.filter((x) => x.match.status === "completed");

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <h1 className="text-5xl font-bold text-foreground mb-3 text-center animate-fade-in-up">Live & Recent <span className="text-accent">Matches</span></h1>
          <p className="text-xl text-muted-foreground text-center mb-6 max-w-2xl mx-auto animate-fade-in-up">See what's happening right now, what's next, and recent results.</p>

          {/* Live ticker */}
          <Ticker
            items={(live.length ? live : upcoming).slice(0, 6).map(({ match }) => ({
              a: match.teamA?.name ?? '',
              b: match.teamB?.name ?? '',
              score: match.teamA?.score && match.teamB?.score ? `${match.teamA.score} vs ${match.teamB.score}` : undefined,
            }))}
          />

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 text-sm font-medium">Live: {live.length}</span>
            <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 text-sm font-medium">Upcoming: {upcoming.length}</span>
            <span className="px-3 py-1 rounded-full bg-muted text-foreground/80 text-sm font-medium">Completed: {completed.length}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            {/* Left: filters + lists */}
            <div className="lg:col-span-2">
              <div className="max-w-3xl mb-6">
                <div className="grid gap-3">
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by team name (e.g., CSIT, EEE)" />
                  <div className="flex flex-wrap gap-2 text-sm">
                    {["All", "CSIT", "CCE", "PME", "EEE", "Mathematics"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTeamFilter(t)}
                        className={`px-3 py-1 rounded-full border ${teamFilter === t ? 'bg-accent text-accent-foreground border-accent' : 'border-border hover:bg-secondary'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Tabs defaultValue={live.length ? "live" : (upcoming.length ? "upcoming" : "completed") }>
                <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
                  <TabsTrigger value="live">Live</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value="live">
                  {live.length === 0 ? (
                    <Card className="border-border"><CardContent className="p-8 text-center text-muted-foreground">No live matches right now.</CardContent></Card>
                  ) : (
                    <div className="grid lg:grid-cols-2 gap-6">
                          {live.map(({ match, tournamentTitle, tournamentId }) => (
                            <LiveScoreCard key={match.id} match={match} tournamentTitle={tournamentTitle} tournamentId={tournamentId} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="upcoming">
                  {upcoming.length === 0 ? (
                    <Card className="border-border"><CardContent className="p-8 text-center text-muted-foreground">No upcoming matches scheduled.</CardContent></Card>
                  ) : (
                    <div className="grid lg:grid-cols-2 gap-6">
                      {upcoming.map(({ match, tournamentTitle, tournamentId }) => (
                        <UpcomingMatchCard key={match.id} match={match} tournamentTitle={tournamentTitle} tournamentId={tournamentId} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completed">
                  {completed.length === 0 ? (
                    <Card className="border-border"><CardContent className="p-8 text-center text-muted-foreground">No completed matches yet.</CardContent></Card>
                  ) : (
                    <div className="grid lg:grid-cols-2 gap-6">
                      {completed.map(({ match, tournamentTitle, tournamentId }) => (
                        <CompletedMatchCard key={match.id} match={match} tournamentTitle={tournamentTitle} tournamentId={tournamentId} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Right: sticky standings & leaderboards */}
            <div className="space-y-8 lg:sticky top-28 self-start">
              <PointsTable compact />
              <LeaderboardsWidget stacked />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Matches;
