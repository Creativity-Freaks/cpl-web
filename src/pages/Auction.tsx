import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAllTournaments, fetchTeamsByTournament, getAuctionStatus, getTeamPlayerDistribution, getTeamPlayersByTournament, resolveProfileImageUrl, type UITournament, type UITeamOverview } from "@/lib/api";
import { Users2, User, Clock3, Radio } from "lucide-react";

type Player = { id: string | number; name: string; category?: string | null; avatarUrl: string | null };
type TeamBucket = { teamId?: string; teamName: string; teamCode?: string; players: Player[] };

const POLL_MS = 5000;
const MAX_VISIBLE_PER_TEAM = 10; // show 10 players per team before scrolling
const ROW_HEIGHT_PX = 42; // approximate row height (avatar + text)
const GAP_PX = 8; // space-y-2 gap

const Auction = () => {
  const [live, setLive] = useState(false);
  const [tournament, setTournament] = useState<Pick<UITournament, "id" | "title" | "year"> | null>(null);
  const [teams, setTeams] = useState<TeamBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Pick the live tournament
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await fetchAllTournaments();
        const liveT = list.find((t) => t.status === "Live") || null;
        if (mounted) setTournament(liveT ? { id: liveT.id, title: liveT.title, year: liveT.year } : null);
      } finally {
        // nothing
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Poll auction status
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const raw = await getAuctionStatus();
        let val = false;
        if (typeof raw === 'boolean') val = raw;
        else if (raw && typeof raw === 'object') {
          const r = raw as Record<string, unknown>;
          val = Boolean(r.live ?? r.is_live ?? r.status ?? r.value);
        }
        if (mounted) setLive(!!val);
      } catch {
        if (mounted) setLive(false);
      }
    };
    check();
    const id = setInterval(check, 15000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  // Poll team rosters while live (primary: per-team endpoint, fallback: distribution)
  useEffect(() => {
    if (!live || !tournament?.id) return;
    let mounted = true;
    const parseDistribution = (raw: unknown): TeamBucket[] => {
      const buckets: TeamBucket[] = [];
      type DistPlayerLike = {
        id?: string | number; player_id?: string | number; name?: string; player_name?: string; full_name?: string;
        category?: string; role?: string; photo_url?: string | null; photo?: string | null; image_url?: string | null;
      };
      type DistBucket = { team_id?: string | number; team_code?: string; short_name?: string; code?: string; team?: string; team_name?: string; players?: DistPlayerLike[] };

      const asPlayers = (arr: DistPlayerLike[]): Player[] =>
        arr.map((p: DistPlayerLike) => {
          const name = String(p?.name ?? p?.player_name ?? p?.full_name ?? "");
          const id = String(p?.id ?? p?.player_id ?? name);
          const category = (p?.category ?? p?.role ?? null) ?? null;
          const photo = (p?.photo_url ?? p?.photo ?? p?.image_url ?? null) ?? null;
          return { id, name, category, avatarUrl: resolveProfileImageUrl(photo) };
        });

      const tryPush = (b: DistBucket) => {
        if (!b) return;
        const code = String(b.team_code ?? b.short_name ?? b.code ?? "").toUpperCase();
        const name = String(b.team_name ?? b.team ?? (code || "Team"));
        const list = Array.isArray(b.players) ? asPlayers(b.players as DistPlayerLike[]) : [];
        buckets.push({ teamId: b.team_id ? String(b.team_id) : undefined, teamName: name, teamCode: code, players: list });
      };

      const scan = (obj: unknown) => {
        if (!obj) return;
        if (Array.isArray(obj)) {
          obj.forEach(tryPush);
          return;
        }
        if (typeof obj === 'object') {
          const o = obj as Record<string, unknown>;
          ["data","result","results","response","payload","teams","distribution","by_team"].forEach((k) => {
            const v = (o as Record<string, unknown>)[k];
            if (Array.isArray(v)) v.forEach(tryPush);
          });
        }
      };
      scan(raw);
      return buckets;
    };

    const mapPlayers = (arr: Array<{ id: string | number; name: string; category?: string | null; avatarUrl: string | null }>): Player[] =>
      arr.map((p) => ({ id: p.id, name: p.name, category: p.category ?? null, avatarUrl: p.avatarUrl }));

    const load = async () => {
      try {
        setLoading(true);
        // 1) Get teams in this tournament
        const baseTeams: UITeamOverview[] = await fetchTeamsByTournament(tournament.id);
        // 2) Fetch players per team in parallel
        const withPlayers: TeamBucket[] = await Promise.all(
          baseTeams.map(async (t) => {
            try {
              const playersRaw = await getTeamPlayersByTournament(t.id, tournament.id);
              const players = mapPlayers(playersRaw);
              return { teamId: t.id, teamName: t.name, teamCode: t.short, players } as TeamBucket;
            } catch {
              return { teamId: t.id, teamName: t.name, teamCode: t.short, players: [] } as TeamBucket;
            }
          })
        );
        // 3) If all empty, best-effort fallback to distribution endpoint
        const allEmpty = withPlayers.every((b) => b.players.length === 0);
        if (allEmpty) {
          try {
            const raw = await getTeamPlayerDistribution(tournament.id);
            const dist = parseDistribution(raw);
            if (mounted) setTeams(dist);
          } catch {
            if (mounted) setTeams(withPlayers);
          }
        } else {
          if (mounted) setTeams(withPlayers);
        }
        if (mounted) setLastUpdated(Date.now());
      } finally {
        if (mounted) setLoading(false);
      }
    };

  void load();
  const timer = window.setInterval(load, POLL_MS);
  return () => { mounted = false; window.clearInterval(timer); };
  }, [live, tournament?.id]);

  const title = useMemo(() => (tournament ? `${tournament.title} ${tournament.year ? `(${tournament.year})` : ''}` : ''), [tournament]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Auction <span className="text-accent">Live</span></h1>
              {tournament && (
                <p className="text-sm text-muted-foreground mt-1">Tournament: {title}</p>
              )}
            </div>
            {live ? (
              <span className="mt-1 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/90 text-white shadow-sm">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" /> Live
              </span>
            ) : (
              <span className="mt-1 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground/70">Not live</span>
            )}
          </div>
          {lastUpdated && (
            <p className="flex items-center gap-1 text-[12px] text-muted-foreground mb-6">
              <Clock3 className="h-3 w-3" /> Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}

          {!live && (
            <Card className="border-border mb-8">
              <CardHeader>
                <CardTitle>Waiting for Auction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Auction isn’t live right now. This page will update automatically when it goes live—no refresh needed.</p>
              </CardContent>
            </Card>
          )}

          {loading && teams.length === 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-border animate-in fade-in-50 slide-in-from-bottom-2">
                  <CardHeader>
                    <div className="h-5 w-40 bg-muted rounded animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((t, idx) => (
                <Card
                  key={`${t.teamCode}-${idx}`}
                  className="group border-border hover:shadow-lg transition-all duration-300 hover:border-accent/40 animate-in fade-in-50 slide-in-from-bottom-2"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl leading-none flex items-center gap-2">
                        <Users2 className="h-5 w-5 text-accent/80" />
                        {t.teamName} {t.teamCode ? <span className="text-accent">({t.teamCode})</span> : null}
                      </CardTitle>
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground/80 group-hover:bg-accent/10 transition-colors">
                        {t.players.length} players
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {t.players.length === 0 ? (
                      <div className="text-sm text-muted-foreground border border-dashed border-border rounded-md p-3">
                        No players assigned yet.
                      </div>
                    ) : (
                      <>
                        <ul
                          className="space-y-2 overflow-y-auto pr-1"
                          style={{ maxHeight: MAX_VISIBLE_PER_TEAM * ROW_HEIGHT_PX + (MAX_VISIBLE_PER_TEAM - 1) * GAP_PX }}
                        >
                          {t.players.map((p, i) => (
                          <li
                            key={p.id}
                            className="flex items-center gap-3 rounded-md p-1 hover:bg-muted/60 transition-colors animate-in fade-in-50 min-h-10"
                            style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}
                          >
                            {p.avatarUrl ? (
                              <img src={p.avatarUrl} alt={p.name} className="h-8 w-8 rounded-full object-cover ring-1 ring-border group-hover:ring-accent/40 transition" />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs text-foreground/70">
                                <User className="h-4 w-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="text-sm font-medium leading-tight truncate">{p.name}</div>
                              {p.category ? (
                                <div className="text-[11px] text-muted-foreground capitalize">{String(p.category).replace(/_/g, " ")}</div>
                              ) : null}
                            </div>
                          </li>
                          ))}
                        </ul>
                        {t.players.length > MAX_VISIBLE_PER_TEAM && (
                          <p className="mt-2 text-[11px] text-muted-foreground">Scroll to see {t.players.length - MAX_VISIBLE_PER_TEAM} more</p>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {live && loading && teams.length === 0 && (
            <p className="text-sm text-muted-foreground mt-6">Loading live team rosters…</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auction;
