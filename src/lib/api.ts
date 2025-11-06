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
  year?: string;
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
    const dataUnknown = await apiFetchJson<unknown>("/api/v1/admin/teams");
    const data = Array.isArray(dataUnknown) ? (dataUnknown as TeamAPIResponse[]) : [];
    return data.map((r) => ({
      id: String(r.id),
      name: String(r.name ?? r.team_name ?? ""),
      short: String(r.short_name ?? r.team_code ?? ""),
      players: Number(r.players_count ?? r.player_count ?? 0),
    }));
  } catch (_) {
    return [];
  }
};

export const fetchTournamentById = async (id: string): Promise<UITournament | null> => {
  try {
    type Resp = Partial<UITournament> & { id: string | number; name?: string; title?: string; teams_count?: number; venue?: string; matches?: Match[]; start_date?: string; end_date?: string; date?: string; status?: string; year?: string | number };
    const t = await apiFetchJson<Resp>(`/api/v1/admin/tournaments/${id}`);
    const derivedYear = deriveYearFrom({
      name: String(t.name ?? t.title ?? ""),
      start_date: t.start_date,
      date: t.date,
      year: t.year,
    });
    return {
      id: String(t.id),
      title: String(t.name ?? t.title ?? "Tournament"),
      description: String((t as Record<string, unknown>).description || ""),
      date: t.start_date && t.end_date ? `${t.start_date} – ${t.end_date}` : String(t.date || ""),
      year: derivedYear,
      teams: Number((t as unknown as { teams?: number }).teams ?? t.teams_count ?? 0),
      venue: String(t.venue || "PSTU Central Playground"),
      status: normalizeTournamentStatus(t.status),
      statusColor: "",
      matches: Array.isArray(t.matches) ? (t.matches as Match[]) : [],
    };
  } catch (_) {
    // Fallback: derive from the tournaments list if details endpoint is unavailable
    try {
      const all = await fetchTournaments();
      const found = all.find((x) => String(x.id) === String(id));
      if (found) return found;
    } catch { /* noop */ }
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
  id: string | number;
  // backend may return either of these
  name?: string;
  short_name?: string;
  players_count?: number;
  // alternate keys
  team_name?: string;
  team_code?: string;
  player_count?: number;
  // sometimes tournament team lists include the real team id under team_id
  team_id?: string | number;
};

export const fetchTeamsByTournament = async (tournamentId: string): Promise<UITeamOverview[]> => {
  try {
    const response = await fetch(buildUrl(`/api/v1/admin/tournaments/${tournamentId}/teams`));
    if (!response.ok) {
      throw new Error(`Failed to fetch teams: ${response.statusText}`);
    }
    const data: TeamAPIResponse[] = await response.json();
    const base = data.map((team) => ({
      // Prefer team_id when available; some endpoints return a tournament-team id in id
      id: String(team.team_id ?? team.id),
      name: String(team.name ?? team.team_name ?? ""),
      short: String(team.short_name ?? team.team_code ?? ""),
      players: Number(team.players_count ?? team.player_count ?? 0),
    }));
    // Refresh counts using the per-team-per-tournament players endpoint (authoritative per requirement)
    const withCounts = await Promise.all(
      base.map(async (t) => {
        try {
          const list = await getTeamPlayersByTournament(t.id, tournamentId);
          return { ...t, players: Array.isArray(list) ? list.length : 0 };
        } catch {
          // Fallback to generic count endpoint if specific endpoint fails
          try {
            const count = await getTeamPlayerCount(t.id);
            return { ...t, players: Number(count || 0) };
          } catch {
            return t;
          }
        }
      })
    );
    return withCounts;
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
    if (!found) {
      // Fallback: construct a minimal object so the department page still renders
      const fallbackShort = String(codeOrName).toUpperCase();
      return { short: fallbackShort, description: `${fallbackShort}` };
    }
    return { short: found.short || found.name, description: `${found.name} (${found.players} players)` };
  } catch (_) {
    const code = String(codeOrName).toUpperCase();
    return { short: code, description: code };
  }
}

type TournamentAPIResponse = {
  id: string;
  name: string;
  short_name?: string;
  status?: string;
  date?: string; // legacy
  start_date?: string;
  end_date?: string;
  year?: number | string;
};

function normalizeTournamentStatus(s: unknown): "Live" | "Upcoming" | "Completed" {
  const key = String(s || "").toLowerCase();
  if (key === "live" || key === "active") return "Live";
  if (key === "upcoming") return "Upcoming";
  if (key === "completed" || key === "past") return "Completed";
  return "Upcoming";
}

export const fetchTournaments = async (): Promise<UITournament[]> => {
  try {
    const raw = await apiFetchJson<unknown>(API_PATHS.listTournaments);
    let arr: TournamentAPIResponse[] = [];
    if (Array.isArray(raw)) {
      arr = raw as TournamentAPIResponse[];
    } else if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      if (Array.isArray(obj.data)) arr = obj.data as TournamentAPIResponse[];
      else if (Array.isArray(obj.results)) arr = obj.results as TournamentAPIResponse[];
    }
    const base = arr.map((t) => {
      const duration = t.start_date && t.end_date ? `${t.start_date} – ${t.end_date}` : (t.date || "");
      const derivedYear = deriveYearFrom(t);
      return {
        id: String(t.id),
        title: String(t.name ?? "Tournament"),
        description: "",
        date: duration,
        year: derivedYear,
        teams: 0,
        venue: "PSTU Central Playground",
        status: normalizeTournamentStatus(t.status),
        statusColor: "",
        matches: [] as Match[],
      } as UITournament;
    });
    // Enrich with team counts (best-effort)
    const withCounts = await Promise.all(
      base.map(async (t) => {
        try {
          const teams = await fetchTeamsByTournament(t.id);
          return { ...t, teams: teams.length };
        } catch {
          return t;
        }
      })
    );
    return withCounts;
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return [];
  }
};

// Helper to derive a year string from API fields
function deriveYearFrom(t: { year?: string | number; start_date?: string; date?: string; name?: string }): string | undefined {
  if (t.year !== undefined && t.year !== null && String(t.year).trim() !== "") return String(t.year);
  const fromStart = (t.start_date || "").slice(0, 4);
  if (/^\d{4}$/.test(fromStart)) return fromStart;
  if (t.date) {
    const m = String(t.date).match(/\d{4}/);
    if (m) return m[0];
  }
  if (t.name) {
    const m2 = String(t.name).match(/\d{4}/);
    if (m2) return m2[0];
  }
  return undefined;
}

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
  // Player profiles
  playerProfiles: "/api/v1/player/profiles",
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
  teamPlayers: (teamId: string) => `/api/v1/admin/teams/${teamId}/players`,
  // Players for a specific team in a specific tournament
  teamPlayersByTournament: (teamId: string, tournamentId: string) => `/api/v1/admin/team/details/${teamId}/${tournamentId}/players`,
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
const ACCESS_TOKEN_KEY_PRIMARY = "cpl_access_token";
const ACCESS_TOKEN_KEY_FALLBACK = "auth_token"; // used by Admin.tsx
export function getAuthToken(): string | null {
  try {
    // Prefer the primary key, but fall back to Admin's key if present
    return (
      localStorage.getItem(ACCESS_TOKEN_KEY_PRIMARY) ||
      localStorage.getItem(ACCESS_TOKEN_KEY_FALLBACK)
    );
  } catch {
    return null;
  }
}

// Global logout handler for session expiry
let globalLogoutHandler: (() => void) | null = null;
export function setGlobalLogoutHandler(handler: () => void) {
  globalLogoutHandler = handler;
}

// Clear auth tokens
export function clearAuthTokens() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY_PRIMARY);
    localStorage.removeItem(ACCESS_TOKEN_KEY_FALLBACK);
    localStorage.removeItem("cpl_current_user");
  } catch {}
}

async function apiFetchJson<T>(path: string, init?: JsonInit): Promise<T> {
  const { body, headers, ...rest } = init || {};
  const token = getAuthToken();
  const res = await fetch(buildUrl(path), {
    headers: { "Content-Type": "application/json", ...(headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });
  
  // Check for session expiry (401 Unauthorized or 403 Forbidden)
  if (res.status === 401 || res.status === 403) {
    // Clear tokens
    clearAuthTokens();
    // Trigger global logout handler if set
    if (globalLogoutHandler) {
      globalLogoutHandler();
    }
    // Also trigger logout via BroadcastChannel for cross-tab communication
    try {
      const bc = new BroadcastChannel('auth-updates');
      bc.postMessage({ type: 'session-expired' });
      bc.close();
    } catch {}
    throw new Error('Session expired. Please login again.');
  }
  
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
  
  // Check for session expiry
  if (res.status === 401 || res.status === 403) {
    clearAuthTokens();
    if (globalLogoutHandler) {
      globalLogoutHandler();
    }
    try {
      const bc = new BroadcastChannel('auth-updates');
      bc.postMessage({ type: 'session-expired' });
      bc.close();
    } catch {}
    throw new Error('Session expired. Please login again.');
  }
  
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json();
}
export function playerProfileImageUrl(filename: string): string {
  return buildUrl(API_PATHS.getPlayerProfile(filename));
}

// Player profile(s)
export type PlayerProfile = {
  id: number;
  name: string;
  photo_url?: string | null;
  category: string;
  runs: number;
  batting_strike_rate: number;
  wickets: number;
  bowling_strike_rate: number;
  overs_bowled: number;
  total_runs_conceded: number;
};

export async function getPlayerProfiles(): Promise<PlayerProfile | PlayerProfile[] | null> {
  try {
    return await apiFetchJson<PlayerProfile | PlayerProfile[]>(API_PATHS.playerProfiles);
  } catch (_) {
    return null;
  }
}

export function extractFilename(pathLike: string): string {
  // Handles values like "app/photo/player/abc.png" or just "abc.png"
  const parts = String(pathLike).split("\\");
  return parts[parts.length - 1] || String(pathLike);
}

export function resolveProfileImageUrl(pathLike?: string | null): string | null {
  if (!pathLike) return null;
  if (/^https?:\/\//i.test(pathLike)) return pathLike;
  const filename = extractFilename(pathLike);
  return playerProfileImageUrl(filename);
}

export async function fetchCurrentPlayerProfile(): Promise<(PlayerProfile & { avatarUrl: string | null }) | null> {
  const raw = await getPlayerProfiles();
  if (!raw) return null;
  const one = Array.isArray(raw) ? (raw[0] as PlayerProfile | undefined) : (raw as PlayerProfile);
  if (!one) return null;
  return { ...one, avatarUrl: resolveProfileImageUrl(one.photo_url ?? null) };
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
export async function uploadTournamentImage(file: File, tournamentId?: string | number): Promise<unknown> {
  // Try multiple endpoint/param combinations to maximize compatibility
  const fd = new FormData();
  // Match backend exactly: single field named "file"
  fd.set("file", file);
  const token = getAuthToken();
  // Prepare multiple auth header variants to accommodate different backend schemes
  const authHeaderVariants: Array<Record<string, string> | undefined> = (() => {
    if (!token) return [undefined];
    return [
      { Authorization: `Bearer ${token}` },
      { Authorization: `JWT ${token}` },
      { Authorization: `Token ${token}` },
      { Authorization: token }, // raw token as Authorization value
      { "X-Auth-Token": token },
      { "X-API-KEY": token },
    ];
  })();
  const idQ = tournamentId !== undefined ? String(tournamentId) : undefined;
  const candidates: string[] = [];
  // Provided paths (with misspelling)
  if (idQ) candidates.push(`${buildUrl(API_PATHS.uploadTournamentImage)}?tounament_id=${encodeURIComponent(idQ)}`);
  candidates.push(buildUrl(API_PATHS.uploadTournamentImage));
  // Alternate: correct spelling "tournament"
  const altBase = buildUrl("/api/v1/upload/tournament/image");
  if (idQ) {
    candidates.push(`${altBase}?tournament_id=${encodeURIComponent(idQ)}`);
    candidates.push(`${altBase}?tounament_id=${encodeURIComponent(idQ)}`);
  }
  candidates.push(altBase);

  let lastErr: unknown = null;
  const attempts: Array<{ url: string; status?: number; note?: string; auth?: string }> = [];
  for (const url of candidates) {
    // Try each auth scheme for this URL
    for (const hdr of authHeaderVariants) {
      try {
        const headers: Record<string, string> | undefined = hdr ? { ...hdr, accept: "application/json" } : { accept: "application/json" };
        const res = await fetch(url, { method: "POST", headers, body: fd });
        if (res.ok) {
          try { return await res.json(); } catch { return null; }
        }
        // For 404/405/415, attempt next combination
        if ([404, 405, 415].includes(res.status)) {
          lastErr = new Error(`${res.status} ${res.statusText}`);
          attempts.push({ url, status: res.status, auth: hdr ? Object.keys(hdr)[0] : "none" });
          // break auth loop if clearly not found; try next URL
          break;
        }
        const text = await res.text();
        const msg = text || `${res.status} ${res.statusText}`;
        attempts.push({ url, status: res.status, note: msg, auth: hdr ? Object.keys(hdr)[0] : "none" });
        // If unauthorized, keep trying other auth variants for the same URL
        if (res.status === 401 || res.status === 403) {
          continue; // try next auth header variant for this URL
        }
        throw new Error(`Upload failed @ ${url} → ${msg}`);
      } catch (err) {
        lastErr = err as unknown;
        // Continue to next auth header or URL
      }
    }
  }
  if (lastErr) {
    const summary = attempts.map(a => `${a.url} [auth:${a.auth ?? 'none'}] ${a.status ?? ''} ${a.note ?? ''}`.trim()).join(" | ");
    const err = lastErr instanceof Error ? new Error(`${lastErr.message}${summary ? ` | Tried: ${summary}` : ''}`) : new Error(summary || 'Unknown upload error');
    throw err;
  }
  throw new Error("Upload failed: no valid endpoint");
}
export async function listTournamentImageFiles(tournamentId?: string): Promise<unknown> {
  const path = tournamentId
    ? `${API_PATHS.listTournamentImages}?tounament_id=${encodeURIComponent(tournamentId)}`
    : API_PATHS.listTournamentImages;
  return apiFetchJson(path);
}
export function tournamentImageUrl(filename: string): string {
  const safe = encodeURIComponent(filename);
  return buildUrl(API_PATHS.getTournamentImage(safe));
}

// Gallery: tournament images
export type TournamentImageFile = { filename: string; url: string; id?: string; tournament_id?: string; year?: string };
export async function fetchTournamentImages(tournamentId?: string): Promise<TournamentImageFile[]> {
  try {
    let raw: unknown;
    try {
      raw = await listTournamentImageFiles(tournamentId);
    } catch (err) {
      // If the API strictly requires tounament_id and rejects other shapes, or vice versa,
      // retry without the param to get a superset and then filter locally.
      try {
        raw = await listTournamentImageFiles(undefined);
      } catch {
        raw = [];
      }
    }
  type RawItem = { filename?: string; name?: string; file?: string; photo_url?: string; id?: string | number; tournament_id?: string | number; tournamentId?: string | number; tournament?: string | number; year?: string | number } | string;
    // Accept a variety of server payload shapes
    const extractArray = (val: unknown): RawItem[] => {
      if (Array.isArray(val)) return val as RawItem[];
      if (val && typeof val === 'object') {
        const obj = val as Record<string, unknown>;
        const keys = ["data", "files", "filenames", "results", "items", "response"];
        for (const k of keys) {
          const v = obj[k];
          if (Array.isArray(v)) return v as RawItem[];
        }
      }
      return [];
    };
    const arr: RawItem[] = extractArray(raw);
    const norm: TournamentImageFile[] = arr
      .map((it: RawItem) => {
        const obj: { filename?: string; name?: string; file?: string; photo_url?: string; id?: string | number; tournament_id?: string | number; tournamentId?: string | number; tournament?: string | number; year?: string | number } = typeof it === 'string' ? { filename: it } : (it as Exclude<RawItem, string>);
        const fileFromObj = obj?.filename ?? obj?.name ?? obj?.file;
        const filenameRaw = String(fileFromObj ?? (typeof it === 'string' ? it : '') ?? "");
        const fromPhotoUrl = obj?.photo_url ? extractFilename(String(obj.photo_url)) : undefined;
        const filename = String(fromPhotoUrl ?? filenameRaw);
        const tidRaw = obj?.tournament_id ?? obj?.tournamentId ?? obj?.tournament;
        const tid = tidRaw !== undefined && tidRaw !== null && String(tidRaw) !== "" ? String(tidRaw) : undefined;
        const yr = obj?.year !== undefined ? String(obj.year) : undefined;
        const id = obj?.id !== undefined ? String(obj.id) : filename;
        // Backend serves images via /api/v1/tounament/image/{filename}
        const url = tournamentImageUrl(filename);
        return { filename, url, id, tournament_id: tid, year: yr } as TournamentImageFile;
      })
      .filter((x) => x.filename);
    if (!tournamentId) return norm;
    const key = String(tournamentId);
    // Filter by explicit t.tournament_id if present; otherwise try loose match by filename containing id or year
    const byId = norm.filter((x) => x.tournament_id && String(x.tournament_id) === key);
    if (byId.length > 0) return byId;
    const loose = norm.filter((x) => x.filename.includes(key) || (x.year && x.year === key));
    // If no match at all, return everything so users at least see uploads
    return loose.length > 0 ? loose : norm;
  } catch {
    return [];
  }
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
  // API may return a raw number or an object with a count field
  try {
    const raw = await apiFetchJson<unknown>(API_PATHS.teamPlayerCount(teamId));
    if (typeof raw === "number") return raw;
    if (raw && typeof raw === "object") {
      const r = raw as Record<string, unknown>;
      const val = r.count ?? r.player_count ?? r.players_count ?? r.total ?? r.value ?? Object.values(r)[0];
      const n = Number(val);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  } catch (err) {
    console.warn("getTeamPlayerCount failed for", teamId, err);
    return 0;
  }
}
export async function getTournamentOverview(tournamentId: string): Promise<unknown> {
  return apiFetchJson(API_PATHS.dashboardTournamentOverview(tournamentId));
}
export async function getTeamPlayerDistribution(tournamentId: string): Promise<unknown> {
  return apiFetchJson(API_PATHS.dashboardTeamPlayerDistribution(tournamentId));
}

// Teams: players list by team
export type TeamPlayer = {
  id: string | number;
  name: string;
  category?: string | null; // batter | bowler | all_rounder | wicket_keeper (or custom)
  photo_url?: string | null;
};

export async function getTeamPlayers(teamId: string): Promise<Array<TeamPlayer & { avatarUrl: string | null }>> {
  try {
    const raw = await apiFetchJson<unknown>(API_PATHS.teamPlayers(teamId));
    const arr: TeamPlayer[] = Array.isArray(raw) ? (raw as TeamPlayer[]) : [];
    return arr.map((p) => ({
      ...p,
      avatarUrl: resolveProfileImageUrl(p.photo_url ?? null),
    }));
  } catch (_) {
    return [];
  }
}

// Fetch team players for a specific tournament using
// /api/v1/admin/team/details/{team_id}/{tournament_id}/players
export async function getTeamPlayersByTournament(
  teamId: string,
  tournamentId: string
): Promise<Array<TeamPlayer & { avatarUrl: string | null }>> {
  try {
    const raw = await apiFetchJson<unknown>(API_PATHS.teamPlayersByTournament(teamId, tournamentId));
    const arr: TeamPlayer[] = Array.isArray(raw) ? (raw as TeamPlayer[]) : [];
    return arr.map((p) => ({
      ...p,
      avatarUrl: resolveProfileImageUrl(p.photo_url ?? null),
    }));
  } catch (_) {
    return [];
  }
}

// Parse the dashboard player-distribution payload to extract players for a given team short code
export async function getPlayersByTeamFromDistribution(
  tournamentId: string,
  teamShort: string
): Promise<{ teamId?: string; teamName?: string; players: Array<TeamPlayer & { avatarUrl: string | null }> }> {
  try {
    const raw = await getTeamPlayerDistribution(tournamentId);
    const key = String(teamShort).toLowerCase();

    type TeamPlayerLike = { id?: string | number; player_id?: string | number; name?: string; player_name?: string; full_name?: string; category?: string; role?: string; photo_url?: string | null; photo?: string | null; image_url?: string | null };
    type DistBucket = { team_id?: string | number; team_code?: string; short_name?: string; code?: string; team?: string; team_name?: string; players?: TeamPlayerLike[] };

    const mapPlayer = (p: TeamPlayerLike): TeamPlayer & { avatarUrl: string | null } => {
      const name = String(p?.name ?? p?.player_name ?? p?.full_name ?? "");
      const category = (p?.category ?? p?.role ?? null) ?? null;
      const photo = (p?.photo_url ?? p?.photo ?? p?.image_url ?? null) ?? null;
      const id = String((p?.id ?? p?.player_id ?? name) ?? name);
      return { id, name, category: category as string | null, photo_url: photo, avatarUrl: resolveProfileImageUrl(photo) };
    };

    const matchesTeam = (bucket?: DistBucket) => {
      if (!bucket) return false;
      const short = String(bucket?.team_code ?? bucket?.short_name ?? bucket?.code ?? bucket?.team ?? "").toLowerCase();
      const name = String(bucket?.team_name ?? bucket?.team ?? "").toLowerCase();
      return (
        short === key ||
        name === key ||
        (name && name.includes(key)) ||
        (key && key.includes(name))
      );
    };

    const bucketsFrom = (obj: unknown): DistBucket[] => {
      const arr: DistBucket[] = [];
      const tryPush = (val: unknown) => {
        if (Array.isArray(val)) arr.push(...(val as unknown as DistBucket[]));
      };
      if (Array.isArray(obj)) tryPush(obj);
      if (obj && typeof obj === "object") {
        const o = obj as Record<string, unknown>;
        // common keys
        tryPush(o["data"]);
        tryPush(o["result"]);
        tryPush(o["results"]);
        tryPush(o["response"]);
        tryPush(o["payload"]);
        tryPush(o["teams"]);
        tryPush(o["distribution"]);
        tryPush(o["by_team"]);
      }
      return arr;
    };

    // Direct array of buckets
    const buckets = bucketsFrom(raw);
    if (buckets.length === 0 && raw && typeof raw === "object") {
      // maybe nested deeply under data.*
      const top = raw as Record<string, unknown>;
      for (const v of Object.values(top)) buckets.push(...bucketsFrom(v));
    }
    if (buckets.length > 0) {
      for (const b of buckets) {
        if (matchesTeam(b)) {
          const list = Array.isArray(b?.players) ? (b.players as TeamPlayerLike[]) : [];
          const players = list.map(mapPlayer);
          return { teamId: b?.team_id !== undefined ? String(b.team_id) : undefined, teamName: String(b?.team_name ?? b?.team ?? teamShort), players };
        }
      }
    }
    // Case 2: object map { CSIT: [players], CSE: [players] } or { teams: [...] }
    if (raw && typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      if (Array.isArray(obj.teams)) {
        const buckets = obj.teams as unknown as DistBucket[];
        for (const b of buckets) {
          if (matchesTeam(b)) {
            const list = Array.isArray(b?.players) ? (b.players as TeamPlayerLike[]) : [];
            const players = list.map(mapPlayer);
            return { teamId: b?.team_id !== undefined ? String(b.team_id) : undefined, teamName: String(b?.team_name ?? b?.team ?? teamShort), players };
          }
        }
      }
      // Direct map by key
      for (const [k, v] of Object.entries(obj)) {
        if (k.toLowerCase() === key && Array.isArray(v)) {
          const list = v as unknown as TeamPlayerLike[];
          const players = list.map(mapPlayer);
          return { teamName: k, players };
        }
      }
    }
  } catch (_) { /* noop */ }
  return { teamName: teamShort, players: [] };
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
