import { buildUrl } from "@/config/api";

// Core app types (no local data, no Supabase)
export type TeamCode = "CSIT" | "CCE" | "PME" | "EEE" | "Mathematics" | string;

export type TeamScore = { name: string; score?: string; overs?: string };
export type BatterRow = { name: string; runs: number; balls: number; fours?: number; sixes?: number; sr: number; howOut?: string };
export type BowlerRow = { name: string; overs: string; maidens?: number; runs: number; wickets: number; eco: number };
export type WicketEvent = { runs: number; wicket: number; batter: string; over: string };
export type Partnership = { bat1: string; bat2: string; runs: number; balls: number };
export type CommentaryEvent = { over: number; ball: number; text: string };

export type Match = {
  id: string;
  teamA: TeamScore;
  teamB: TeamScore;
  venue?: string;
  startTime: string | number;
  toss?: string;
  note?: string;
  status: "live" | "upcoming" | "completed";
  result?: string;
  battingA?: BatterRow[];
  battingB?: BatterRow[];
  bowlingA?: BowlerRow[];
  bowlingB?: BowlerRow[];
  extrasA?: { b: number; lb: number; w: number; nb: number; p: number };
  extrasB?: { b: number; lb: number; w: number; nb: number; p: number };
  fowA?: WicketEvent[];
  fowB?: WicketEvent[];
  partnershipsA?: Partnership[];
  partnershipsB?: Partnership[];
  commentary?: CommentaryEvent[];
  playerOfTheMatch?: { name: string; team: TeamCode; performance?: string };
};

export type UITournament = {
  id: string;
  title: string;
  description?: string;
  date?: string;
  teams?: number;
  venue?: string;
  status: "Live" | "Upcoming" | "Completed";
  statusColor?: string;
  champion?: string;
  runnerUp?: string;
  matches: Match[];
};

export type SeasonLeaderboards = {
  seasonId: string;
  seasonTitle: string;
  batting: { name: string; team: TeamCode; runs: number; innings: number; average: number; strikeRate: number }[];
  bowling: { name: string; team: TeamCode; wickets: number; innings: number; economy: number; average: number }[];
};

export type UIMatchItem = { match: Match; tournamentTitle: string; tournamentId: string };
export type UITeamOverview = { id: string; name: string; short: string; players: number };

export const fetchMatches = async (): Promise<UIMatchItem[]> => {
  try {
    const tournaments = await fetchTournaments();
    return tournaments.flatMap((t) => (t.matches || []).map((m) => ({ match: m, tournamentTitle: t.title, tournamentId: t.id })));
  } catch (_) {
    return [];
  }
};

export const fetchMatchById = async (
  tournamentId: string,
  matchId: string
): Promise<{ match: Match; tournamentTitle: string } | null> => {
  try {
    const resp = await fetch(buildUrl(`/api/v1/admin/tournaments/${tournamentId}/matches/${matchId}`));
    if (resp.ok) {
      const json = await resp.json();
      if (json?.match) return { match: json.match as Match, tournamentTitle: String(json.tournamentTitle || "") };
    }
  } catch (_) { /* noop */ }
  try {
    const tournaments = await fetchTournaments();
    for (const t of tournaments) {
      const m = (t.matches || []).find((x) => String(x.id) === String(matchId));
      if (m) return { match: m, tournamentTitle: t.title };
    }
  } catch (_) { /* noop */ }
  return null;
};

export const fetchTeamsOverview = async (): Promise<UITeamOverview[]> => {
  try {
    const resp = await fetch(buildUrl("/api/v1/admin/teams"));
    if (!resp.ok) throw new Error("teams fetch failed");
    const dataUnknown: unknown = await resp.json();
    const data = Array.isArray(dataUnknown) ? (dataUnknown as TeamAPIResponse[]) : [];
    return data.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      short: String(r.short_name || ""),
      players: Number(r.players_count || 0),
    }));
  } catch (_) {
    return [];
  }
};

export const fetchTournamentById = async (id: string): Promise<UITournament | null> => {
  try {
    const resp = await fetch(buildUrl(`/api/v1/admin/tournaments/${id}`));
    if (!resp.ok) throw new Error("tournament fetch failed");
    const t = await resp.json();
    return {
      id: String(t.id),
      title: String(t.name ?? t.title ?? "Tournament"),
      description: String(t.description || ""),
      date: String(t.date || ""),
      teams: Number(t.teams || t.teams_count || 0),
      venue: String(t.venue || ""),
      status: (t.status || "Upcoming") as UITournament["status"],
      statusColor: "",
      matches: Array.isArray(t.matches) ? (t.matches as Match[]) : [],
    };
  } catch (_) {
    return null;
  }
};

// Note: These are simple local implementations. When Supabase is configured, you can extend
// these functions to query Supabase tables instead. For now, returning local static data keeps pages working.

// New helpers for homepage dynamics
export type HomeStats = { players: number; teams: number; matches: number; prizePool: number };

export const fetchHomeStats = async (): Promise<HomeStats> => {
  try {
    const [teamsResp, playersResp, matchesResp] = await Promise.all([
      fetch(buildUrl("/api/v1/admin/teams/count")),
      fetch(buildUrl("/api/v1/admin/players/count")),
      fetch(buildUrl("/api/v1/admin/matches/count")),
    ]);
    const teams = teamsResp.ok ? Number(await teamsResp.json()) : 0;
    const players = playersResp.ok ? Number(await playersResp.json()) : 0;
    const matches = matchesResp.ok ? Number(await matchesResp.json()) : 0;
    const prizePool = 50000;
    return { teams, players, matches, prizePool };
  } catch (_) {
    return { teams: 5, players: 0, matches: 0, prizePool: 50000 };
  }
};

export const fetchUpcomingTournaments = async (): Promise<UITournament[]> => {
  try {
    const all = await fetchTournaments();
    return all.filter((t) => t.status === "Upcoming");
  } catch (_) {
    return [];
  }
};

export const fetchAllTournaments = async (): Promise<UITournament[]> => fetchTournaments();

export const fetchLeaderboards = async (): Promise<SeasonLeaderboards> => {
  try {
    const resp = await fetch(buildUrl("/api/v1/admin/leaderboards"));
    if (resp.ok) return (await resp.json()) as SeasonLeaderboards;
  } catch (_) { /* noop */ }
  return { seasonId: "current", seasonTitle: "Current Season", batting: [], bowling: [] };
};

type TeamAPIResponse = {
  id: string;
  name: string;
  short_name?: string;
  players_count?: number;
};

export const fetchTeamsByTournament = async (tournamentId: string): Promise<UITeamOverview[]> => {
  try {
    const response = await fetch(buildUrl(`/api/v1/admin/tournaments/${tournamentId}/teams`));
    if (!response.ok) {
      throw new Error(`Failed to fetch teams: ${response.statusText}`);
    }
    const data: TeamAPIResponse[] = await response.json();
    return data.map((team) => ({
      id: team.id,
      name: team.name,
      short: team.short_name || "",
      players: team.players_count || 0,
    }));
  } catch (error) {
    console.error("Error fetching teams by tournament:", error);
    return [];
  }
};

// Lightweight department/team fetch by short code or name
export async function fetchDepartmentTeam(codeOrName: string): Promise<{ short: string; description?: string } | null> {
  try {
    const teams = await fetchTeamsOverview();
    const key = String(codeOrName).toLowerCase();
    const found = teams.find(
      (t) => t.short.toLowerCase() === key || t.name.toLowerCase() === key || t.name.toLowerCase().includes(key)
    );
    if (!found) return null;
    return { short: found.short || found.name, description: `${found.name} (${found.players} players)` };
  } catch (_) {
    return null;
  }
}

type TournamentAPIResponse = {
  id: string;
  name: string;
  short_name?: string;
  status?: string;
  date?: string;
};

export const fetchTournaments = async (): Promise<UITournament[]> => {
  try {
    const response = await fetch(buildUrl("/api/v1/admin/tournaments/fetch"));
    if (!response.ok) {
      throw new Error(`Failed to fetch tournaments: ${response.statusText}`);
    }
    const data: TournamentAPIResponse[] = await response.json();
    return data.map((tournament) => ({
      id: tournament.id,
      title: tournament.name,
      description: "", // Add description if available in API
      date: tournament.date || "",
      teams: 0, // Add teams count if available in API
      venue: "", // Add venue if available in API
      status: (tournament.status || "Upcoming") as "Live" | "Upcoming" | "Completed",
      statusColor: "", // Add status color logic if needed
      matches: [], // Add matches if available in API
    }));
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return [];
  }
};

export type Standings = {
  seasonTitle: string;
  table: { team: TeamCode; played: number; won: number; lost: number; nrr: number; points: number; last5: ("W" | "L")[] }[];
};

export const fetchStandings = async (): Promise<Standings> => {
  try {
    const resp = await fetch(buildUrl("/api/v1/admin/standings"));
    if (resp.ok) return (await resp.json()) as Standings;
  } catch (_) { /* noop */ }
  return { seasonTitle: "Current Season", table: [] };
};

export default {};

// -------- Generic helpers and endpoint wrappers (from provided API list) --------

export const API_PATHS = {
  // Auth
  login: "/api/v1/token",
  registration: "/api/v1/registration",
  // Player profile image
  uploadPlayerProfile: "/api/v1/upload/player/profile",
  getPlayerProfile: (filename: string) => `/api/v1/player/profile/${filename}`,
  // Player stats
  updateBattingInfo: (playerId: string | number) => `/api/v1/admin/update/batting/info/${playerId}`,
  // Admin players
  adminAllPlayers: "/api/v1/adminall/players",
  // Background image
  updateBackgroundImage: "/api/v1/background/image/update",
  getBackgroundImage: (filename: string) => `/api/v1/background/image/${filename}`,
  // Tournament images (note: path uses "tounament" as provided)
  uploadTournamentImage: "/api/v1/upload/tounament/image",
  listTournamentImages: "/api/v1/tounament/image/files",
  getTournamentImage: (filename: string) => `/api/v1/tounament/image/${filename}`,
  // Tournaments
  createTournament: "/api/v1/admin/tournaments/create",
  listTournaments: "/api/v1/admin/tournaments/fetch",
  updateTournamentStatus: (tournamentId: string) => `/api/v1/admin/tournaments/${tournamentId}/status`,
  // Teams
  createTeam: "/api/v1/admin/teams",
  listTeamsByTournament: (tournamentId: string) => `/api/v1/admin/tournaments/${tournamentId}/teams`,
  updateTeamCoin: (tournamentId: string, teamId: string) => `/api/v1/admin/update/team/coin/${tournamentId}/${teamId}`,
  // Admin stats
  teamPlayerCount: (teamId: string) => `/api/v1/admin/teams/${teamId}/player-count`,
  dashboardTournamentOverview: (tournamentId: string) => `/api/v1/admin/dashboard/tournaments/${tournamentId}/overview`,
  dashboardTeamPlayerDistribution: (tournamentId: string) => `/api/v1/admin/dashboard/teams/${tournamentId}/player-distribution`,
  // Auction
  auctionGoLive: (tournamentId: string) => `/api/v1/auction/go-live/${tournamentId}`,
  auctionStopLive: "/api/v1/auction/stop-live",
  auctionStatus: "/api/v1/auction/status",
  // Admin auction
  auctionSelectPlayers: "/api/v1/admin/auction/select-players",
  auctionTournamentPlayers: (tournamentId: string) => `/api/v1/admin/auction/tournaments/${tournamentId}/players`,
  auctionPreparedPlayer: (auctionPlayerId: string) => `/api/v1/admin/auction/prepared-player/${auctionPlayerId}`,
  auctionAssignPlayer: (auctionPlayerId: string) => `/api/v1/admin/auction/assign-player/${auctionPlayerId}`,
  auctionAvailablePlayers: "/api/v1/admin/players/available-for-auction",
  auctionRemovePlayer: (auctionPlayerId: string) => `/api/v1/admin/auction/remove-player/${auctionPlayerId}`,
  // Matches
  createMatch: "/api/v1/admin/matches",
  listMatchesByTournament: (tournamentId: string) => `/api/v1/admin/tournaments/${tournamentId}/matches`,
  createMatchStats: "/api/v1/admin/match-stats",
  getMatchStats: (matchId: string) => `/api/v1/admin/matches/${matchId}/stats`,
} as const;

type JsonInit = Omit<RequestInit, "body"> & { body?: unknown };
const ACCESS_TOKEN_KEY = "cpl_access_token";
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

async function apiFetchJson<T>(path: string, init?: JsonInit): Promise<T> {
  const { body, headers, ...rest } = init || {};
  const token = getAuthToken();
  const res = await fetch(buildUrl(path), {
    headers: { "Content-Type": "application/json", ...(headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  // Handle 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

// Auth
export type LoginResponse = { access_token: string; token_type?: string };
export async function login(username: string, password: string): Promise<LoginResponse> {
  // FastAPI OAuth2PasswordRequestForm expects application/x-www-form-urlencoded by default
  const form = new URLSearchParams();
  form.set("username", username);
  form.set("password", password);
  const res = await fetch(buildUrl(API_PATHS.login), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as LoginResponse;
}

export async function registerUser(payload: Record<string, unknown>): Promise<unknown> {
  return apiFetchJson(API_PATHS.registration, { method: "POST", body: payload });
}

// Player profile image
export async function uploadPlayerProfileImage(file: File): Promise<unknown> {
  const fd = new FormData();
  fd.set("file", file);
  const token = getAuthToken();
  const res = await fetch(buildUrl(API_PATHS.uploadPlayerProfile), { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: fd });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json();
}
export function playerProfileImageUrl(filename: string): string {
  return buildUrl(API_PATHS.getPlayerProfile(filename));
}

// Player statistics
export async function updatePlayerBattingInfo(playerId: string | number, payload: Record<string, unknown>): Promise<unknown> {
  return apiFetchJson(API_PATHS.updateBattingInfo(String(playerId)), { method: "PUT", body: payload });
}

// Admin: players list
export async function getAdminAllPlayers(): Promise<unknown> {
  return apiFetchJson(API_PATHS.adminAllPlayers);
}

// Background images
export async function updateBackgroundImage(file: File): Promise<unknown> {
  const fd = new FormData();
  fd.set("file", file);
  const token = getAuthToken();
  const res = await fetch(buildUrl(API_PATHS.updateBackgroundImage), { method: "PUT", headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: fd });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json();
}
export function backgroundImageUrl(filename: string): string {
  return buildUrl(API_PATHS.getBackgroundImage(filename));
}

// Tournament images
export async function uploadTournamentImage(file: File): Promise<unknown> {
  const fd = new FormData();
  fd.set("file", file);
  const token = getAuthToken();
  const res = await fetch(buildUrl(API_PATHS.uploadTournamentImage), { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: fd });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json();
}
export async function listTournamentImageFiles(): Promise<unknown> {
  return apiFetchJson(API_PATHS.listTournamentImages);
}
export function tournamentImageUrl(filename: string): string {
  return buildUrl(API_PATHS.getTournamentImage(filename));
}

// Admin tournaments
export async function createTournament(payload: Record<string, unknown>): Promise<unknown> {
  return apiFetchJson(API_PATHS.createTournament, { method: "POST", body: payload });
}
export async function updateTournamentStatus(tournamentId: string, statusPayload: Record<string, unknown>): Promise<unknown> {
  return apiFetchJson(API_PATHS.updateTournamentStatus(tournamentId), { method: "PUT", body: statusPayload });
}

// Teams
export async function createTeam(payload: Record<string, unknown>): Promise<unknown> {
  return apiFetchJson(API_PATHS.createTeam, { method: "POST", body: payload });
}
export async function updateTeamCoin(tournamentId: string, teamId: string, payload: Record<string, unknown>): Promise<unknown> {
  return apiFetchJson(API_PATHS.updateTeamCoin(tournamentId, teamId), { method: "POST", body: payload });
}
export async function getTeamPlayerCount(teamId: string): Promise<number> {
  return apiFetchJson<number>(API_PATHS.teamPlayerCount(teamId));
}
export async function getTournamentOverview(tournamentId: string): Promise<unknown> {
  return apiFetchJson(API_PATHS.dashboardTournamentOverview(tournamentId));
}
export async function getTeamPlayerDistribution(tournamentId: string): Promise<unknown> {
  return apiFetchJson(API_PATHS.dashboardTeamPlayerDistribution(tournamentId));
}

// Auction
export async function auctionGoLive(tournamentId: string): Promise<unknown> {
  return apiFetchJson(API_PATHS.auctionGoLive(tournamentId), { method: "POST" });
}
export async function auctionStopLive(): Promise<unknown> {
  return apiFetchJson(API_PATHS.auctionStopLive, { method: "POST" });
}
export async function getAuctionStatus(): Promise<unknown> {
  return apiFetchJson(API_PATHS.auctionStatus);
}

// Admin auction
export async function auctionSelectPlayers(payload: Record<string, unknown>): Promise<unknown> {
  return apiFetchJson(API_PATHS.auctionSelectPlayers, { method: "POST", body: payload });
}
export async function getAuctionTournamentPlayers(tournamentId: string): Promise<unknown> {
  return apiFetchJson(API_PATHS.auctionTournamentPlayers(tournamentId));
}
export async function auctionPreparedPlayer(auctionPlayerId: string, payload: Record<string, unknown>): Promise<unknown> {
  return apiFetchJson(API_PATHS.auctionPreparedPlayer(auctionPlayerId), { method: "PUT", body: payload });
}
export async function auctionAssignPlayer(auctionPlayerId: string, payload: Record<string, unknown>): Promise<unknown> {
  return apiFetchJson(API_PATHS.auctionAssignPlayer(auctionPlayerId), { method: "PUT", body: payload });
}
export async function getAvailablePlayersForAuction(): Promise<unknown> {
  return apiFetchJson(API_PATHS.auctionAvailablePlayers);
}
export async function auctionRemovePlayer(auctionPlayerId: string): Promise<unknown> {
  const res = await fetch(buildUrl(API_PATHS.auctionRemovePlayer(auctionPlayerId)), { method: "DELETE" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.status === 204 ? undefined : await res.json();
}

// Matches
export async function createMatch(payload: Record<string, unknown>): Promise<unknown> {
  return apiFetchJson(API_PATHS.createMatch, { method: "POST", body: payload });
}
export async function listMatchesByTournament(tournamentId: string): Promise<unknown> {
  return apiFetchJson(API_PATHS.listMatchesByTournament(tournamentId));
}
export async function createMatchStats(payload: Record<string, unknown>): Promise<unknown> {
  return apiFetchJson(API_PATHS.createMatchStats, { method: "POST", body: payload });
}
export async function getMatchStats(matchId: string): Promise<unknown> {
  return apiFetchJson(API_PATHS.getMatchStats(matchId));
}
