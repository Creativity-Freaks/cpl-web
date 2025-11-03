import { tournaments, Tournament, Match } from "@/data/tournaments";
import { departmentList, DepartmentTeam } from "@/data/teams";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { currentLeaderboards, SeasonLeaderboards } from "@/data/leaderboards";

export type UIMatchItem = { match: Match; tournamentTitle: string; tournamentId: string };
export type UITeamOverview = { id: string; name: string; short: string; players: number };
export type UITournament = Tournament;

// Supabase row typings (minimal subset used by queries)
type SupabaseMatchRow = {
  id: string;
  tournament_id: string;
  match_date?: string;
  team_a?: string;
  team_b?: string;
  venue?: string;
  status?: string;
  scorecard?: unknown;
  tournaments?: { id: string; name: string } | null;
};

type SupabaseTeamRow = {
  id: string;
  name: string;
  short_name?: string;
  description?: string;
  team_members?: SupabaseTeamMember[] | null;
};

type SupabaseTeamMember = {
  team_id: string;
  profile_id: string;
  profile_name?: string;
  role?: string;
};

export const fetchMatches = async (): Promise<UIMatchItem[]> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('matches').select('*, tournaments: tournament_id(id, name, season)').order('match_date', { ascending: true });
    if (error) return [];
    const rows: UIMatchItem[] = (data || []).map((r: unknown) => {
      const rec = r as SupabaseMatchRow;
      return { match: (rec as unknown) as Match, tournamentTitle: rec?.tournaments?.name || '', tournamentId: rec?.tournament_id } as UIMatchItem;
    });
    return rows;
  }
  // local fallback
  return tournaments.flatMap((t) => t.matches.map((m) => ({ match: m, tournamentTitle: t.title, tournamentId: t.id })));
};

export const fetchMatchById = async (tournamentId: string, matchId: string): Promise<Match | null> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('matches').select('*').eq('id', matchId).limit(1).maybeSingle();
    if (error) return null;
    return (data as Match) || null;
  }
  const t = tournaments.find((x) => x.id === tournamentId);
  if (!t) return null;
  return t.matches.find((m) => m.id === matchId) || null;
};

export const fetchTeamsOverview = async (): Promise<UITeamOverview[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      // Try to fetch teams with nested team_members if available
      const { data, error } = await supabase.from('teams').select('id, name, short_name, team_members(id)');
      if (!error && Array.isArray(data)) {
        return data.map((r: unknown) => {
          const rec = r as Record<string, unknown>;
          const teamMembers = Array.isArray(rec['team_members']) ? (rec['team_members'] as unknown[]) : [];
          return { id: String(rec['id']), name: String(rec['name']), short: String(rec['short_name'] || ''), players: teamMembers.length };
        });
      }
    } catch (e) {
      // fall through to local
    }
  }
  return departmentList.map((d) => ({ id: d.key, name: d.name, short: d.short, players: d.players.length }));
};

export const fetchDepartmentTeam = async (deptKey: string): Promise<DepartmentTeam | null> => {
  if (isSupabaseConfigured && supabase) {
    // Assuming deptKey maps to team short_name
    const { data, error } = await supabase.from('teams').select('*, team_members(*)').eq('short_name', deptKey).limit(1).maybeSingle();
    if (error || !data) return null;
    // Map to DepartmentTeam shape minimally
    const team = data as SupabaseTeamRow;
    const players = (team.team_members || []).map((m) => ({ id: String(m.profile_id), name: m.profile_name || 'Player', role: (m.role as string) || 'Batsman' }));
    const dept: DepartmentTeam = {
      key: String(team.id),
      name: team.name,
      short: team.short_name || team.name,
      description: team.description || '',
      players,
    } as DepartmentTeam;
    return dept;
  }
  return departmentList.find((d) => d.key === (deptKey as DepartmentTeam['key'])) || null;
};

export const fetchTournamentById = async (id: string): Promise<UITournament | null> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('tournaments').select('*').eq('id', id).limit(1).maybeSingle();
    if (error || !data) return null;
    return data as UITournament;
  }
  return tournaments.find((t) => t.id === id) || null;
};

// Note: These are simple local implementations. When Supabase is configured, you can extend
// these functions to query Supabase tables instead. For now, returning local static data keeps pages working.

// New helpers for homepage dynamics
export type HomeStats = { players: number; teams: number; matches: number; prizePool: number };

export const fetchHomeStats = async (): Promise<HomeStats> => {
  if (isSupabaseConfigured && supabase) {
    try {
      // Count teams, registered player profiles and matches
      const teamsResp = await supabase.from('teams').select('id', { count: 'exact', head: true });
      // Prefer counting profiles table for registered players
      const profilesResp = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'player');
      const matchesResp = await supabase.from('matches').select('id', { count: 'exact', head: true });

      const teamsCount = Number(teamsResp.count || 0);
      const playersCount = Number(profilesResp.count || 0);
      const matchesCount = Number(matchesResp.count || 0);

      // Per product requirement: prize pool shown on homepage stays static at 50,000 BDT.
      const STATIC_PRIZE_POOL = 50000;
      return {
        teams: teamsCount,
        players: playersCount,
        matches: matchesCount,
        prizePool: STATIC_PRIZE_POOL,
      };
    } catch (e) {
      // fall through to local
    }
  }
  // Local fallback using static data
  const teams = 5; // default to 5 teams as requested
  const players = departmentList.reduce((s, d) => s + (d.players?.length || 0), 0);
  const matches = tournaments.flatMap((t) => t.matches).length;
  const prizePool = 50000; // default prize pool set to 50,000 as requested
  return { teams, players, matches, prizePool };
};

export const fetchUpcomingTournaments = async (): Promise<UITournament[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('tournaments').select('*').order('date', { ascending: true });
      if (!error && Array.isArray(data)) return data as UITournament[];
    } catch (e) {
      // fallthrough to local
    }
    // fallthrough to local
  }
  // Local: return upcoming or live tournaments first
  return tournaments.filter((t) => t.status === 'Live' || t.status === 'Upcoming');
};

export const fetchAllTournaments = async (): Promise<UITournament[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('tournaments').select('*').order('date', { ascending: true });
      if (!error && Array.isArray(data)) return data as UITournament[];
    } catch (e) {
      // fallthrough to local
    }
  }
  return tournaments;
};

export const fetchLeaderboards = async (): Promise<SeasonLeaderboards> => {
  if (isSupabaseConfigured && supabase) {
    try {
      // Attempt to read a player_stats table with common columns. If your schema
      // differs, adjust column names accordingly. We'll build batting and bowling
      // lists from the same table and pick the top performers.
      const { data: battingData, error: bErr } = await supabase.from('player_stats').select('*').order('runs', { ascending: false }).limit(5);
      const { data: bowlingData, error: bwErr } = await supabase.from('player_stats').select('*').order('wickets', { ascending: false }).limit(5);
      if ((bErr && !Array.isArray(battingData)) || (bwErr && !Array.isArray(bowlingData))) {
        throw new Error('leaderboards table missing or unexpected shape');
      }

      const batting = (Array.isArray(battingData) ? battingData : []).map((r: unknown) => {
        const rec = r as Record<string, unknown>;
        return {
          name: String(rec['player_name'] || rec['name'] || 'Player'),
          team: (String(rec['team'] || rec['team_code'] || 'CSIT') as 'CSIT' | 'CCE' | 'PME' | 'EEE' | 'Mathematics'),
          runs: Number(rec['runs'] as unknown) || 0,
          innings: Number(rec['innings'] as unknown) || 0,
          average: Number(rec['average'] as unknown) || 0,
          strikeRate: Number(rec['strike_rate'] as unknown) || Number(rec['strikeRate'] as unknown) || 0,
        };
      });

      const bowling = (Array.isArray(bowlingData) ? bowlingData : []).map((r: unknown) => {
        const rec = r as Record<string, unknown>;
        return {
          name: String(rec['player_name'] || rec['name'] || 'Player'),
          team: (String(rec['team'] || rec['team_code'] || 'CSIT') as 'CSIT' | 'CCE' | 'PME' | 'EEE' | 'Mathematics'),
          wickets: Number(rec['wickets'] as unknown) || 0,
          innings: Number(rec['innings'] as unknown) || 0,
          economy: Number(rec['economy'] as unknown) || 0,
          average: Number(rec['average'] as unknown) || 0,
        };
      });

      const seasonId = 'current';
      const seasonTitle = 'Current Season';
      return { seasonId, seasonTitle, batting, bowling } as SeasonLeaderboards;
    } catch (e) {
      // fallthrough to local
    }
  }
  // fallback to local static leaderboards
  return currentLeaderboards;
};

export default {};
