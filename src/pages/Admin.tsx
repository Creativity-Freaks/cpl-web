import React, { useState, useEffect } from 'react';
import { Trophy, Users, DollarSign, LogOut, Activity } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { AdminAuctionPlayerDetails } from './admin_auction_player_details';
import { AdminPlayerUpdateInfo } from './admin_player_update_info';
// --- CONFIG ---
import { API_BASE, LOGIN_URL, buildUrl } from '../config/api';
const API_TIMEOUT = 10000;
// --- API HELPER ---
const api = {
async request(url: string, options: RequestInit = {}) {
const controller = new AbortController();
const id = setTimeout(() => controller.abort(), API_TIMEOUT);

const token = localStorage.getItem("auth_token");
const headers: HeadersInit = {
  "Content-Type": "application/json",
  ...options.headers,
};

if (token && !url.includes("/token")) {
  headers["Authorization"] = `Bearer ${token}`;
}

try {
  const response = await fetch(buildUrl(url), {
    ...options,
    headers,
    signal: controller.signal,
  });

  clearTimeout(id);
  const text = await response.text();
  console.log(`API ${options.method || 'GET'} ${url} →`, response.status, text);

  if (!response.ok) {
    let errMsg = "Request failed";
    try {
      const err = JSON.parse(text);
      errMsg = err.detail?.[0]?.msg || err.detail || err.message || text;
    } catch {}
    throw new Error(errMsg);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
} catch (error: any) {
  throw error;
}
},
get: (url: string) => api.request(url),
post: (url: string, data: any) => api.request(url, { method: "POST", body: JSON.stringify(data) }),
put: (url: string, data: any) => api.request(url, { method: "PUT", body: JSON.stringify(data) }),
delete: (url: string) => api.request(url, { method: "DELETE" }),
};
// --- UI COMPONENTS ---
const Card = ({ children, className = '', ...p }: any) => (
<div className={`bg-white shadow-lg rounded-xl ${className}`} {...p}>{children}</div> ); const CardContent = ({ children, className = '', ...p }: any) => ( <div className={`p-6 ${className}`} {...p}>{children}</div> ); const Button = ({ children, variant = 'default', className = '', size = '', ...p }: any) => { const v = { default: 'bg-blue-600 hover:bg-blue-700 text-white', outline: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50', }; const s = size === 'sm' ? 'px-3 py-1 text-sm' : 'px-8 py-3'; return <button className={`rounded-lg font-medium ${v[variant]} ${s} ${className}`} {...p}>{children}</button>; }; const Input = (p: any) => <input className="w-full p-4 border border-gray-300 rounded-lg" {...p} />; const Label = ({ children, ...p }: any) => <label className="block font-medium mb-2" {...p}>{children}</label>; const Select = (p: any) => <select className="w-full p-4 border rounded-lg" {...p}>{p.children}</select>; const Footer = () => <footer className="h-12 flex items-center justify-center text-xs bg-white border-t">© CPL Admin</footer>;
// --- MAIN APP ---
const Admin: React.FC = () => {
const navigate = useNavigate();
const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("auth_token"));
const [activeSection, setActiveSection] = useState("tournaments");
const [toastMsg, setToastMsg] = useState<{type: 'success' | 'error', msg: string} | null>(null);
const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
const [selectedUpdatePlayer, setSelectedUpdatePlayer] = useState<any | null>(null);
const [updatedPlayers, setUpdatedPlayers] = useState<any[]>([]);
// Tournament States
const [tournaments, setTournaments] = useState<any[]>([]);
const [loadingTournaments, setLoadingTournaments] = useState(false);
const [newTournament, setNewTournament] = useState({
name: '', year: '', startDate: null as Date | null, endDate: null as Date | null
});
// Team States
const [teams, setTeams] = useState<any[]>([]);
const [loadingTeams, setLoadingTeams] = useState(false);
const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
const [createTeamTournamentId, setCreateTeamTournamentId] = useState<number | null>(null);
const [newTeam, setNewTeam] = useState({ name: '', code: '' });
// Match States
const [selectedMatchTournamentId, setSelectedMatchTournamentId] = useState<number | null>(null);
const [matches, setMatches] = useState<any[]>([]);
const [loadingMatches, setLoadingMatches] = useState(false);
const [newMatch, setNewMatch] = useState({ homeTeamId: '', awayTeamId: '', date: null as Date | null, venue: '' });
// Auction States
const [auctionTournamentId, setAuctionTournamentId] = useState<number | null>(null);
// Live Auction states
const [livePlayers, setLivePlayers] = useState<any[]>([]);
const [liveCategory, setLiveCategory] = useState<string>('Batter');
const [liveAmount, setLiveAmount] = useState<string>('');
const [selectedLiveTeamId, setSelectedLiveTeamId] = useState<number | null>(null);
const [selectedLiveTeamStats, setSelectedLiveTeamStats] = useState<any | null>(null);
const [allPlayers, setAllPlayers] = useState<any[]>([]);
const [displayedPlayers, setDisplayedPlayers] = useState<any[]>([]);
const [pendingSelectedPlayers, setPendingSelectedPlayers] = useState<any[]>([]);
const [confirmedAuctionPlayers, setConfirmedAuctionPlayers] = useState<any[]>([]);
const [displayedConfirmedPlayers, setDisplayedConfirmedPlayers] = useState<any[]>([]);
const [loadingAuctionPlayers, setLoadingAuctionPlayers] = useState(false);
const [visibleCount] = useState(5); // 5 players at a time
const visibleCountConfirmed = 5;
const toast = {
success: (msg: string) => setToastMsg({type: 'success' as const, msg: `Success: ${msg}`}),
error: (msg: string) => setToastMsg({type: 'error' as const, msg: `Error: ${msg}`}),
};
useEffect(() => {
if (toastMsg) {
const timer = setTimeout(() => setToastMsg(null), 3000);
return () => clearTimeout(timer);
}
}, [toastMsg]);
// --- FETCH TOURNAMENTS ---
const fetchTournaments = async () => {
try {
setLoadingTournaments(true);
const data = await api.get("/api/v1/admin/tournaments/fetch");
setTournaments(Array.isArray(data) ? data : []);
} catch (error: any) {
toast.error("Tournament load failed: " + error.message);
} finally {
setLoadingTournaments(false);
}
};
// --- FETCH TEAMS ---
const fetchTeams = async (tournamentId: number) => {
if (!tournamentId) return;
try {
setLoadingTeams(true);
const data = await api.get(`/api/v1/admin/tournaments/${tournamentId}/teams`);
setTeams(Array.isArray(data) ? data : []);
} catch (error: any) {
toast.error("Team load failed: " + error.message);
setTeams([]);
} finally {
setLoadingTeams(false);
}
};
// --- FETCH MATCHES ---
const fetchMatches = async (tournamentId: number) => {
if (!tournamentId) return;
try {
setLoadingMatches(true);
const data = await api.get(`/api/v1/admin/tournaments/${tournamentId}/matches`);
setMatches(Array.isArray(data) ? data : []);
} catch (error: any) {
toast.error("Match load failed: " + error.message);
setMatches([]);
} finally {
setLoadingMatches(false);
}
};
// --- FETCH RAW CONFIRMED AUCTION PLAYERS ---
const fetchConfirmedAuctionPlayers = async (tournamentId: number): Promise<any[]> => {
if (!tournamentId) return [];
try {
const data = await api.get(`/api/v1/admin/auction/tournaments/${tournamentId}/players`);
return Array.isArray(data) ? data : [];
} catch (error: any) {
console.error("Failed to load auction players:", error.message);
return [];
}
};
// --- LOAD AUCTION DATA (ALL + CONFIRMED, FILTER AVAILABLE, MERGE FULL DETAILS) ---
const loadAuctionData = async () => {
if (!auctionTournamentId) {
setAllPlayers([]);
setDisplayedPlayers([]);
setPendingSelectedPlayers([]);
setConfirmedAuctionPlayers([]);
setDisplayedConfirmedPlayers([]);
setUpdatedPlayers([]);
setLoadingAuctionPlayers(false);
return;
}

setLoadingAuctionPlayers(true);
let allPlayersList: any[] = [];
try {
  // Fetch all players (full details)
  const allData = await api.get("/api/v1/adminall/players");
  allPlayersList = Array.isArray(allData) ? allData : [];

  // Fetch raw confirmed auction players
  const confirmedRaw = await fetchConfirmedAuctionPlayers(auctionTournamentId);

  // Extract confirmed IDs for filtering
  const confirmedIds = confirmedRaw.map((p: any) => p.player_id || p.id);

  // Filter available players
  const availablePlayers = allPlayersList.filter((p: any) => !confirmedIds.includes(p.id));

  setAllPlayers(availablePlayers);
  setDisplayedPlayers(availablePlayers.slice(0, visibleCount));
  setPendingSelectedPlayers([]);

  // Merge full details for confirmed players
  const fullConfirmed = confirmedRaw.map((c: any) => {
    const fullP = allPlayersList.find((p: any) => p.id === (c.player_id || c.id));
    if (fullP) {
      return {
        ...fullP,
        auction_player_id: c.auction_player_id || c.id,
        start_players: c.start_players,
        base_price: c.base_price,
      };
    }
    return { ...c, name: c.player_name }; // Fallback to raw if no match
  });

  setConfirmedAuctionPlayers(fullConfirmed);
  setDisplayedConfirmedPlayers(fullConfirmed.slice(0, visibleCountConfirmed));

  // Filter updated players: those with start_players and base_price set
  const updated = fullConfirmed.filter((p: any) => p.start_players && p.base_price && p.start_players !== '' && p.base_price !== 0);
  setUpdatedPlayers(updated);
} catch (error: any) {
  console.error("Failed to load auction data:", error.message);
  // Fallback: set all as available, confirmed empty
  setAllPlayers(allPlayersList);
  setDisplayedPlayers(allPlayersList.slice(0, visibleCount));
  setConfirmedAuctionPlayers([]);
  setDisplayedConfirmedPlayers([]);
  setUpdatedPlayers([]);
  setPendingSelectedPlayers([]);
} finally {
  setLoadingAuctionPlayers(false);
}
};
// --- HANDLE SCROLL TO LOAD MORE (5 at a time) ---
const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
if (scrollHeight - scrollTop <= clientHeight + 10) {
const nextBatch = allPlayers.slice(displayedPlayers.length, displayedPlayers.length + visibleCount);
if (nextBatch.length > 0) {
setDisplayedPlayers(prev => [...prev, ...nextBatch]);
}
}
};
const handleScrollConfirmed = (e: React.UIEvent<HTMLDivElement>) => {
  const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
  if (scrollHeight - scrollTop <= clientHeight + 10 && displayedConfirmedPlayers.length < confirmedAuctionPlayers.length) {
    const nextBatch = confirmedAuctionPlayers.slice(displayedConfirmedPlayers.length, displayedConfirmedPlayers.length + visibleCountConfirmed);
    if (nextBatch.length > 0) {
      setDisplayedConfirmedPlayers(prev => [...prev, ...nextBatch]);
    }
  }
};
// --- TOGGLE PLAYER SELECTION (Only highlights, for pending) ---
const togglePlayerSelection = (player: any) => {
setPendingSelectedPlayers(prev =>
prev.some(p => p.id === player.id)
? prev.filter(p => p.id !== player.id)
: [...prev, player]
);
};
// --- SELECT PLAYERS FOR AUCTION ---
const handleSelectPlayersForAuction = async () => {
if (!auctionTournamentId || auctionTournamentId === 0) {
toast.error("Please select a valid tournament!");
return;
}

if (pendingSelectedPlayers.length === 0) {
  toast.error("Select at least one player!");
  return;
}

const tournamentId = parseInt(String(auctionTournamentId), 10);
const playerIds = pendingSelectedPlayers.map(p => parseInt(String(p.id), 10)).filter(id => !isNaN(id));

if (isNaN(tournamentId) || playerIds.length === 0) {
  toast.error("Invalid IDs!");
  return;
}

const url = `/api/v1/admin/auction/select-players?tournament_id=${tournamentId}`;
const payload = playerIds;

console.log("🚀 Sending payload:", JSON.stringify(payload, null, 2));
console.log("🚀 To URL:", url);

try {
  const response = await api.post(url, payload);
  console.log("✅ API Response:", response);

  let addedConfirmed = pendingSelectedPlayers;
  if (Array.isArray(response)) {
    addedConfirmed = pendingSelectedPlayers.map(sp => {
      const match = response.find((r: any) => r.player_id === sp.id);
      return match ? { ...sp, auction_player_id: match.auction_player_id || match.id } : sp;
    });
  }

  const numAdded = addedConfirmed.length;

  // Local update
  setConfirmedAuctionPlayers(prev => [...prev, ...addedConfirmed]);
  setDisplayedConfirmedPlayers(prev => {
    const currentLength = prev.length;
    const newSlice = [...prev, ...addedConfirmed.slice(0, visibleCountConfirmed - (currentLength % visibleCountConfirmed))];
    return newSlice.length < confirmedAuctionPlayers.length + addedConfirmed.length ? newSlice : [...prev, ...addedConfirmed];
  });
  setPendingSelectedPlayers([]);

  const idsToRemove = pendingSelectedPlayers.map(p => p.id);
  setAllPlayers(prev => prev.filter(p => !idsToRemove.includes(p.id)));
  setDisplayedPlayers(prev => prev.filter(p => !idsToRemove.includes(p.id)));

  toast.success(`${numAdded} players added to auction!`);
} catch (error: any) {
  console.error("❌ API Error Details:", error);
  toast.error(`Failed: ${error.message}`);
}
};
// --- REMOVE PLAYER FROM AUCTION ---
const handleRemovePlayer = async (auctionPlayerId: number) => {
if (!auctionPlayerId) {
toast.error("Invalid player ID");
return;
}

try {
  await api.delete(`/api/v1/admin/auction/remove-player/${auctionPlayerId}`);
  toast.success("Player removed from auction");

  // Refetch data to update lists from server
  await loadAuctionData();
} catch (error: any) {
  toast.error("Remove failed: " + error.message);
}
};
// --- CREATE TEAM ---
const handleCreateTeam = async () => {
if (!createTeamTournamentId || !newTeam.name.trim() || !newTeam.code.trim()) {
toast.error("Tournament, Name & Code required");
return;
}

try {
  await api.post("/api/v1/admin/teams", {
    tournament_id: createTeamTournamentId,
    team_name: newTeam.name.trim(),
    team_code: newTeam.code.trim()
  });
  setNewTeam({ name: '', code: '' });
  toast.success("Team created!");
  if (selectedTournamentId === createTeamTournamentId) fetchTeams(createTeamTournamentId);
} catch (error: any) {
  toast.error("Team create failed: " + error.message);
}
};
// --- CREATE MATCH ---
const handleCreateMatch = async () => {
if (!selectedMatchTournamentId || !newMatch.homeTeamId || !newMatch.awayTeamId || !newMatch.date || !newMatch.venue.trim()) {
toast.error("All fields required");
return;
}

if (parseInt(newMatch.homeTeamId) === parseInt(newMatch.awayTeamId)) {
  toast.error("Home and away teams must be different");
  return;
}

try {
  await api.post("/api/v1/admin/matches", {
    tournament_id: selectedMatchTournamentId,
    home_team_id: parseInt(newMatch.homeTeamId),
    away_team_id: parseInt(newMatch.awayTeamId),
    date: newMatch.date!.toISOString().split('T')[0],
    venue: newMatch.venue.trim()
  });
  setNewMatch({ homeTeamId: '', awayTeamId: '', date: null, venue: '' });
  toast.success("Match created!");
  fetchMatches(selectedMatchTournamentId);
} catch (error: any) {
  toast.error("Match create failed: " + error.message);
}
};
// --- UPDATE MATCH STATUS ---
const updateMatchStatus = async (id: number, status: string) => {
const previous = matches.find(m => m.id === id);
setMatches(p => p.map(m => m.id === id ? { ...m, status } : m));

try {
  await api.put(`/api/v1/admin/matches/${id}/status?new_status=${status}`, {});
  toast.success("Match status updated to " + status);
} catch (error: any) {
  toast.error("Update failed: " + error.message);
  setMatches(p => p.map(m => m.id === id ? previous! : m));
  if (selectedMatchTournamentId) fetchMatches(selectedMatchTournamentId);
}
};
// --- CREATE TOURNAMENT ---
const handleCreateTournament = async () => {
if (!newTournament.name || !newTournament.year || !newTournament.startDate || !newTournament.endDate) {
toast.error("Fill all fields");
return;
}

const payload = {
  name: newTournament.name.trim(),
  year: parseInt(newTournament.year),
  start_date: newTournament.startDate!.toISOString().split('T')[0],
  end_date: newTournament.endDate!.toISOString().split('T')[0]
};

try {
  await api.post("/api/v1/admin/tournaments/create", payload);
  setNewTournament({ name: '', year: '', startDate: null, endDate: null });
  toast.success("Tournament created!");
  fetchTournaments();
} catch (error: any) {
  toast.error("Create error: " + error.message);
}
};
// --- UPDATE TOURNAMENT STATUS ---
const updateStatus = async (id: number, status: string) => {
const previous = tournaments.find(t => t.id === id);
setTournaments(p => p.map(t => t.id === id ? { ...t, status } : t));

try {
  await api.put(`/api/v1/admin/tournaments/${id}/status?new_status=${status}`, {});
  toast.success("Status updated to " + status);
} catch (error: any) {
  toast.error("Update failed: " + error.message);
  setTournaments(p => p.map(t => t.id === id ? previous! : t));
  fetchTournaments();
}
};
// --- EFFECTS ---
useEffect(() => {
if (isAuthenticated) fetchTournaments();
}, [isAuthenticated]);
useEffect(() => {
if (selectedTournamentId) fetchTeams(selectedTournamentId);
else setTeams([]);
}, [selectedTournamentId]);
useEffect(() => {
if (selectedMatchTournamentId) {
fetchTeams(selectedMatchTournamentId);
fetchMatches(selectedMatchTournamentId);
} else {
setTeams([]);
setMatches([]);
}
}, [selectedMatchTournamentId]);
useEffect(() => {
loadAuctionData();
}, [auctionTournamentId]);

// Also fetch teams when live auction tournament changes
useEffect(() => {
  if (auctionTournamentId) {
    fetchTeams(auctionTournamentId);
  }
}, [auctionTournamentId]);

// Fetch all players for Live Auction view from adminall/players
useEffect(() => {
  (async () => {
    try {
      const data = await api.get(`/api/v1/adminall/players`);
      setLivePlayers(Array.isArray(data) ? data : []);
    } catch {
      setLivePlayers([]);
    }
  })();
}, []);

// Fetch team stats when a team is selected in Live Auction
useEffect(() => {
  if (!selectedLiveTeamId) {
    setSelectedLiveTeamStats(null);
    return;
  }
  (async () => {
    try {
      const stats = await api.get(`/api/v1/admin/dashboard/teams/${selectedLiveTeamId}/player-distribution`);
      // Some backends return an array of all teams; pick the selected one
      let picked = stats;
      if (Array.isArray(stats)) {
        const selectedTeam = teams.find(t => String(t.id) === String(selectedLiveTeamId));
        const targetName = (selectedTeam?.team_name || selectedTeam?.name || '').toString().trim().toLowerCase();
        const targetCode = (selectedTeam?.team_code || selectedTeam?.code || '').toString().trim().toLowerCase();
        picked = stats.find((t: any) => String(t.team_id) === String(selectedLiveTeamId))
          || stats.find((t: any) => (t.id && String(t.id) === String(selectedLiveTeamId)))
          || (targetName ? stats.find((t:any)=> (t.team_name||t.name||'').toString().trim().toLowerCase() === targetName) : undefined)
          || (targetCode ? stats.find((t:any)=> (t.team_code||t.code||'').toString().trim().toLowerCase() === targetCode) : undefined)
          || (stats.length > 0 ? stats[0] : null);
      }
      let normalized = normalizeTeamStats(picked);
      // Fallback attempt: if not found or empty, try fetching the distribution list (if backend supports it)
      if (!normalized) {
        try {
          const list = await api.get(`/api/v1/admin/dashboard/teams/player-distribution`);
          if (Array.isArray(list)) {
            const selectedTeam = teams.find(t => String(t.id) === String(selectedLiveTeamId));
            const targetName = (selectedTeam?.team_name || selectedTeam?.name || '').toString().trim().toLowerCase();
            const targetCode = (selectedTeam?.team_code || selectedTeam?.code || '').toString().trim().toLowerCase();
            const m = list.find((t:any)=> String(t.team_id) === String(selectedLiveTeamId))
              || (targetName ? list.find((t:any)=> (t.team_name||t.name||'').toString().trim().toLowerCase() === targetName) : undefined)
              || (targetCode ? list.find((t:any)=> (t.team_code||t.code||'').toString().trim().toLowerCase() === targetCode) : undefined)
              || null;
            normalized = normalizeTeamStats(m);
          }
        } catch {}
      }
      setSelectedLiveTeamStats(normalized);
    } catch (e) {
      setSelectedLiveTeamStats(null);
    }
  })();
}, [selectedLiveTeamId]);

// Helpers for Live Auction rendering
// Robust category normalizer to ensure strict matching with UI filter
const normalizeCategory = (value: any): 'Batter' | 'Bowler' | 'All-rounder' | 'WK Batsman' | 'Batter' => {
  const v = String(value || '').trim().toLowerCase().replace(/[-_\s]+/g, '');
  if (v === 'wkbatsman' || v === 'wicketkeeperbatsman' || v === 'wk' || v === 'wicketkeeper') return 'WK Batsman';
  if (v === 'allrounder' || v === 'allround' || v === 'all') return 'All-rounder';
  if (v === 'bowler' || v.startsWith('bowl')) return 'Bowler';
  if (v === 'batter' || v.startsWith('bat')) return 'Batter';
  return 'Batter';
};

const getPlayerCategory = (p: any) => {
  const raw = p?.category ?? p?.player_category ?? p?.role ?? p?.group ?? p?.section;
  return normalizeCategory(raw);
};

// Normalize varying team stats keys from API into a consistent shape for UI
const normalizeTeamStats = (stats: any) => {
  if (!stats) return null as any;

  // Some backends wrap payloads or return arrays; unwrap them robustly
  let payload: any = stats;
  if (Array.isArray(payload)) {
    payload = payload[0] ?? {};
  }
  if (payload && typeof payload === 'object' && (payload.data || payload.result || payload.payload)) {
    payload = payload.data || payload.result || payload.payload;
  }

  if (!payload || typeof payload !== 'object') return null as any;

  const toNum = (v: any) => {
    // Accept numbers, numeric strings, and fallback dashes
    if (v === null || v === undefined || v === '-') return undefined;
    const n = Number(String(v).replace(/[,\s]/g, ''));
    return Number.isFinite(n) ? n : undefined;
  };

  return {
    teamCoins: toNum(payload.team_coin ?? payload.team_coins ?? payload.coins ?? payload.teamCoins ?? payload.coin ?? payload.balance),
    playerCount: toNum(payload.player_count ?? payload.players_count ?? payload.playerCount ?? payload.count),
    maxCount: toNum(payload.max_count ?? payload.max_player ?? payload.max_players ?? payload.maxPlayers),
    available: toNum(payload.available_slots ?? payload.available ?? payload.available_player ?? payload.available_players ?? payload.availableCount),
  };
};

// Sections limited A..J (10 sections), each shows up to 5 players
const lettersAZ = Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i));

const getSectionedPlayers = (categoryLabel: string) => {
  const filtered = livePlayers
    .filter((p: any) => getPlayerCategory(p) === (normalizeCategory(categoryLabel) as any))
    .sort((a: any, b: any) => Number(b.base_price || b.basePrice || 0) - Number(a.base_price || a.basePrice || 0));
  const perSection = 5;
  const sections: { key: string; players: any[] }[] = [];
  for (let i = 0; i < filtered.length && sections.length < lettersAZ.length; i += perSection) {
    const letter = lettersAZ[sections.length] || `S${sections.length + 1}`;
    sections.push({ key: letter, players: filtered.slice(i, i + perSection) });
  }
  return sections;
};
// --- LOGIN PAGE ---
if (!isAuthenticated) {
return (
<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
<Card className="w-96 shadow-2xl">
<CardContent>
<h2 className="text-2xl font-bold text-center mb-6 text-blue-800">CPL Admin Login</h2>
        <div className="space-y-4">
          <div><Label>Email</Label><Input type="email" placeholder="ug2102030@cse.pstu.ac.bd" id="email" /></div>
          <div><Label>Password</Label><Input type="password" placeholder="••••••" id="password" /></div>
          <Button className="w-full" onClick={async () => {
            const email = (document.getElementById("email") as HTMLInputElement).value.trim();
            const password = (document.getElementById("password") as HTMLInputElement).value.trim();
            if (!email || !password) return toast.error("Email & Password required");

            try {
              const formData = new URLSearchParams();
              formData.append('grant_type', 'password');
              formData.append('username', email);
              formData.append('password', password);
              formData.append('scope', '');
              formData.append('client_id', '');

              // Try multiple likely token endpoints to avoid 404 due to path mismatch
              const candidatePaths = [LOGIN_URL, '/api/v1/token', '/auth/token', '/api/token'];
              let res: Response | null = null;
              let data: any = null;
              for (const p of candidatePaths) {
                try {
                  const attempt = await fetch(buildUrl(p), {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: formData.toString()
                  });
                  // Save last attempt; break on success (200-299)
                  res = attempt;
                  try { data = await attempt.json(); } catch { data = null; }
                  if (attempt.ok) break;
                  if (attempt.status !== 404) break; // don't keep trying for non-404 errors
                } catch {
                  // continue trying next path
                }
              }
              if (res && res.ok && data && data.access_token) {
                localStorage.setItem("auth_token", data.access_token);
                setIsAuthenticated(true);
                toast.success("Login successful!");
              } else {
                const detail = (data && (data.detail || data.message)) || (res ? `${res.status} ${res.statusText}` : 'No response');
                toast.error(detail || "Invalid email or password");
              }
            } catch (err: any) {
              toast.error("Login error: " + err.message);
            }
          }}>Login</Button>
        </div>
      </CardContent>
    </Card>
    {toastMsg && (
      <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${toastMsg.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
        {toastMsg.msg}
      </div>
    )}
  </div>
);
}
// --- DASHBOARD ---
return (
<div className="flex flex-col min-h-screen bg-gray-50">
<header className="bg-red-600 text-white h-16 flex items-center justify-between px-6">
<h1 className="text-xl font-bold">CPL Admin</h1>
<Button className="bg-yellow-500 text-red-600" onClick={() => {
localStorage.removeItem("auth_token");
setIsAuthenticated(false);
toast.success("Logged out");
}}>
<LogOut className="h-4 w-4 inline mr-1" /> Logout
</Button>
</header>

  <div className="flex flex-1">
    <aside className="bg-blue-900 w-64 p-4">
      <nav>
        {[
          { id: "tournaments", label: "Tournaments", icon: Trophy },
          { id: "team", label: "Team", icon: Users },
          { id: "auction", label: "Auction", icon: DollarSign },
          { id: "auction-players", label: "Auction Players", icon: DollarSign },
          { id: "live-auction", label: "Live Auction", icon: Activity },
          { id: "match", label: "Match", icon: Activity },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full text-left text-white py-3 px-4 flex items-center gap-3 hover:bg-blue-800 rounded-lg transition ${activeSection === item.id ? 'bg-blue-800' : ''}`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>

    <main className="flex-1 p-8 overflow-auto">

      {/* === TOURNAMENT SECTION === */}
      {activeSection === "tournaments" && (
        <>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-6">
            <Trophy className="text-yellow-600" /> Tournament
          </h1>

          <Card className="mb-8">
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Name</Label><Input value={newTournament.name} onChange={e => setNewTournament(s => ({...s, name: e.target.value}))} /></div>
                <div><Label>Year</Label><Input value={newTournament.year} onChange={e => setNewTournament(s => ({...s, year: e.target.value}))} /></div>
                <div><Label>Start Date</Label>
                  <DatePicker selected={newTournament.startDate} onChange={(d: Date | null) => setNewTournament(s => ({...s, startDate: d}))} className="w-full p-4 border rounded-lg" />
                </div>
                <div><Label>End Date</Label>
                  <DatePicker selected={newTournament.endDate} onChange={(d: Date | null) => setNewTournament(s => ({...s, endDate: d}))} className="w-full p-4 border rounded-lg" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={handleCreateTournament} className="flex-1">Create</Button>
                <Button variant="outline" className="flex-1" onClick={() => setNewTournament({ name: '', year: '', startDate: null, endDate: null })}>Cancel</Button>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-xl font-bold mb-4">Existing Tournaments</h2>
          {loadingTournaments ? <p>Loading...</p> : tournaments.length === 0 ? <p>No tournaments</p> : (
            <div className="space-y-3">
              {tournaments.map(t => (
                <Card key={t.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-sm text-gray-600">{t.year} | {t.start_date} to {t.end_date}</p>
                    <p className="text-xs text-blue-600">Status: {t.status}</p>
                  </div>
                  <Select value={t.status} onChange={e => updateStatus(t.id, e.target.value)}>
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </Select>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* === TEAM SECTION === */}
      {activeSection === "team" && (
        <>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-6">
            <Users className="text-green-600" /> Team Create
          </h1>

          <Card className="mb-8">
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Tournament</Label>
                  <Select value={createTeamTournamentId || ''} onChange={e => setCreateTeamTournamentId(parseInt(e.target.value))}>
                    <option value="">Select Tournament</option>
                    {tournaments.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.year})</option>
                    ))}
                  </Select>
                </div>
                <div><Label>Team Name</Label><Input value={newTeam.name} onChange={e => setNewTeam(s => ({...s, name: e.target.value}))} placeholder="e.g. BitLockers" /></div>
                <div><Label>Team Code</Label><Input value={newTeam.code} onChange={e => setNewTeam(s => ({...s, code: e.target.value}))} placeholder="e.g. CCE" /></div>
                <Button onClick={handleCreateTeam} className="w-full">Create Team</Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <Label>Select Tournament:</Label>
            <Select value={selectedTournamentId || ''} onChange={e => setSelectedTournamentId(parseInt(e.target.value) || null)}>
              <option value="">Select to view teams</option>
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.year})</option>
              ))}
            </Select>

            <div className="mt-6">
              {loadingTeams ? <p>Loading teams...</p> : teams.length === 0 ? <p>No teams</p> : (
                <div className="space-y-3">
                  {teams.map(team => (
                    <Card key={team.id} className="p-4">
                      <p className="font-medium">{team.team_name || team.name}</p>
                      <p className="text-sm text-gray-600">Code: {team.team_code || team.code}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* === AUCTION SECTION === */}
      {activeSection === "auction" && (
        <>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-6">
            <DollarSign className="text-orange-600" /> Auction Player Select
          </h1>

          <Card className="mb-8">
            <CardContent>
              <Label>Tournament</Label>
              <Select value={auctionTournamentId || ''} onChange={e => {
                const value = e.target.value;
                const id = value ? parseInt(value, 10) : null;
                console.log("Tournament selected:", value, "→", id);
                setAuctionTournamentId(id);
              }}>
                <option value="">Select Tournament</option>
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.year})</option>
                ))}
              </Select>
            </CardContent>
          </Card>

          {/* Players Multi-Select (5 at a time) */}
          <Card className="mb-6">
            <CardContent>
              <Label>Players (multi-select):</Label>
              <div
                className="max-h-80 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50"
                onScroll={handleScroll}
              >
                {loadingAuctionPlayers ? (
                  <p className="text-center py-4">Loading players...</p>
                ) : displayedPlayers.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">No players available</p>
                ) : (
                  <div className="space-y-2">
                    {displayedPlayers.map(player => (
                      <div
                        key={player.id}
                        onClick={() => togglePlayerSelection(player)}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition ${
                          pendingSelectedPlayers.some(p => p.id === player.id)
                            ? 'bg-blue-100 border-2 border-blue-500'
                            : 'bg-white border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={pendingSelectedPlayers.some(p => p.id === player.id)}
                          onChange={() => {}}
                          className="mr-3 pointer-events-none"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{player.name}</p>
                          <p className="text-sm text-gray-600">{player.email} • {player.category}</p>
                        </div>
                        {player.photo_url && player.photo_url !== 'null' ? (
                          <img src={buildUrl(player.photo_url)} alt={player.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleSelectPlayersForAuction}
                className="w-full mt-4"
                disabled={pendingSelectedPlayers.length === 0 || !auctionTournamentId}
              >
                Select Players for Auction ({pendingSelectedPlayers.length})
              </Button>
            </CardContent>
          </Card>

          {/* Confirmed Selected Players - Always show if any */}
          {confirmedAuctionPlayers.length > 0 && (
            <Card>
              <CardContent>
                <h3 className="text-lg font-bold mb-4 text-green-700">
                  Selected Players for Auction ({confirmedAuctionPlayers.length})
                </h3>
                <div className="space-y-3">
                  {confirmedAuctionPlayers.map(player => (
                    <div
                      key={player.auction_player_id || player.id}
                      className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {player.photo_url && player.photo_url !== 'null' ? (
                          <img src={buildUrl(player.photo_url)} alt={player.name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-full w-12 h-12" />
                        )}
                        <div>
                          <p className="font-semibold">{player.name}</p>
                          <p className="text-sm text-gray-600">{player.email} • {player.category}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={(e) => {
                          handleRemovePlayer(player.auction_player_id || player.id);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* === LIVE AUCTION SECTION === */}
      {activeSection === "live-auction" && (
        <>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-6">
            <Activity className="text-red-600" /> Live Auction
          </h1>

          <Card className="mb-6">
            <CardContent>
              <div className="grid grid-cols-4 gap-4 items-end">
                <div>
                  <Label>League / Tournament</Label>
                  <Select value={auctionTournamentId || ''} onChange={e => setAuctionTournamentId(e.target.value ? parseInt(e.target.value, 10) : null)}>
                    <option value="">Select Tournament</option>
                    {tournaments.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.year})</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Current Bid</Label>
                  <div className="w-full p-4 border rounded-lg bg-gray-50 font-semibold">৳ 0</div>
                </div>
                <div>
                  <Label>Timer</Label>
                  <div className="w-full p-4 border rounded-lg bg-gray-50">00:30</div>
                </div>
                <div className="flex justify-end">
                  <Button className="bg-yellow-500 text-red-700" onClick={() => window.open('/settings', '_blank')}>Update Account</Button>
                </div>
              </div>

              {/* Team Overview banner */}
              <div className="mt-6">
                <Card className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 border-blue-100">
                  <CardContent>
                    {selectedLiveTeamId ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-500">Team</div>
                          <div className="text-xl font-bold">
                            {teams.find(t=>t.id===selectedLiveTeamId)?.team_name || teams.find(t=>t.id===selectedLiveTeamId)?.name || 'Team'}
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 w-3/4">
                          <div className="p-3 rounded-lg bg-white border text-center">
                            <div className="text-xs text-gray-500">Team Coins</div>
                            <div className="text-lg font-semibold">{selectedLiveTeamStats?.teamCoins ?? '-'}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-white border text-center">
                            <div className="text-xs text-gray-500">Player Count</div>
                            <div className="text-lg font-semibold">{selectedLiveTeamStats?.playerCount ?? '-'}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-white border text-center">
                            <div className="text-xs text-gray-500">Max Player</div>
                            <div className="text-lg font-semibold">{selectedLiveTeamStats?.maxCount ?? '-'}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-white border text-center">
                            <div className="text-xs text-gray-500">Available</div>
                            <div className="text-lg font-semibold">{selectedLiveTeamStats?.available ?? '-'}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">Select a team from "Team Auction" to view overview here.</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-12 gap-6">
            {/* Left strip - Team Auction */}
            <div className="col-span-2">
              <Card>
                <CardContent>
                  <h3 className="font-semibold mb-3">Team Auction</h3>
                  <div className="space-y-2">
                    {teams.slice(0, 20).map((team) => (
                      <div key={team.id} onClick={() => setSelectedLiveTeamId(team.id)} className={`p-3 rounded-lg border bg-white text-sm cursor-pointer ${selectedLiveTeamId===team.id? 'border-blue-500 bg-blue-50' : ''}`}>
                        {team.team_name || team.name}
                      </div>
                    ))}
                    {teams.length === 0 && <p className="text-sm text-gray-500">No teams</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Center lanes - Section A..Z built by category */}
            <div className="col-span-7">
              {getSectionedPlayers(liveCategory).length === 0 ? (
                <Card>
                  <CardContent>
                    <div className="text-sm text-gray-500">No players found for {liveCategory}. Try another tournament or category.</div>
                  </CardContent>
                </Card>
              ) : (
                getSectionedPlayers(liveCategory).map(section => (
                  <Card key={section.key} className="mb-6">
                    <CardContent>
                      <h3 className="font-semibold mb-3">Section {section.key}</h3>
                      <div className="space-y-3">
                        {section.players.map((p:any) => (
                          <div key={p.id} className="h-14 rounded-md border bg-white flex items-center px-4 justify-between cursor-pointer" onClick={() => navigate(`/admin/auction/player/${p.id}`)}>
                            <div className="font-medium">{p.name || p.player_name}</div>
                            <div className="text-sm text-gray-500">Base: ৳{p.base_price || p.basePrice || 0}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Right controls - Amount + Submit like sketch */}
            <div className="col-span-3">
              <Card className="mb-6">
                <CardContent>
                  <Label>Category</Label>
                  <Select value={liveCategory} onChange={e => setLiveCategory(e.target.value)}>
                    {['Batter','Bowler','All-rounder','WK Batsman'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                  <div className="h-4" />
                  <Label>Amount</Label>
                  <Input type="number" placeholder="Enter bid amount" value={liveAmount} onChange={e => setLiveAmount(e.target.value)} />
                  <Button className="w-full mt-4">Place Bid</Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Label>Team Overview</Label>
                  {selectedLiveTeamId ? (
                    <div className="mt-3 text-sm">
                      <div className="font-semibold mb-1">{teams.find(t=>t.id===selectedLiveTeamId)?.team_name || teams.find(t=>t.id===selectedLiveTeamId)?.name || 'Team'}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-gray-50 rounded border">Team Coins: {selectedLiveTeamStats?.teamCoins ?? '-'}</div>
                        <div className="p-2 bg-gray-50 rounded border">Player count: {selectedLiveTeamStats?.playerCount ?? '-'}</div>
                        <div className="p-2 bg-gray-50 rounded border">Max player: {selectedLiveTeamStats?.maxCount ?? '-'}</div>
                        <div className="p-2 bg-gray-50 rounded border">Available: {selectedLiveTeamStats?.available ?? '-'}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-gray-600">Select a team to view coins, player count and availability.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* === AUCTION PLAYERS SECTION === */}
      {activeSection === "auction-players" && (
        <>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-6">
            <DollarSign className="text-orange-600" /> Auction Players
          </h1>

          <Card className="mb-8">
            <CardContent>
              <Label>Tournament</Label>
              <Select value={auctionTournamentId || ''} onChange={e => {
                const value = e.target.value;
                const id = value ? parseInt(value, 10) : null;
                console.log("Tournament selected:", value, "→", id);
                setAuctionTournamentId(id);
              }}>
                <option value="">Select Tournament</option>
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.year})</option>
                ))}
              </Select>
            </CardContent>
          </Card>

          {/* Selected Auction Players List */}
          <Card className="mb-6">
            <CardContent>
              <Label>Selected Auction players:</Label>
              {loadingAuctionPlayers ? (
                <p className="text-center py-4">Loading players...</p>
              ) : confirmedAuctionPlayers.length === 0 ? (
                <p className="text-center py-4 text-gray-500">No selected auction players</p>
              ) : (
                <div 
                  className="space-y-3 max-h-80 overflow-y-auto" 
                  onScroll={handleScrollConfirmed}
                >
                  {displayedConfirmedPlayers.map(player => (
                    <div
                      key={player.auction_player_id || player.id}
                      className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {player.photo_url && player.photo_url !== 'null' ? (
                          <img src={`${API_BASE}${player.photo_url}`} alt={player.name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-full w-12 h-12" />
                        )}
                        <div>
                          <p className="font-semibold">{player.name}</p>
                          <p className="text-sm text-gray-600">{player.email} • {player.category}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => {
                          handleRemovePlayer(player.auction_player_id || player.id);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fancy Interactive Divider */}
          {confirmedAuctionPlayers.length > 0 && updatedPlayers.length > 0 && (
            <div className="my-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-500 transform rotate-[-0.5deg] hover:rotate-0 transition-transform duration-300" />
              </div>
              <div className="relative flex justify-center">
                <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                  <span className="text-sm font-semibold text-gray-700">Updated Players</span>
                </div>
              </div>
            </div>
          )}

          {/* Updated Players Section - Always show if any */}
          {updatedPlayers.length > 0 && (
            <Card>
              <CardContent>
                <h3 className="text-lg font-bold mb-4 text-blue-700">
                  Updated Players ({updatedPlayers.length})
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {updatedPlayers.map(player => (
                    <div
                      key={player.auction_player_id || player.id}
                      className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      {player.photo_url && player.photo_url !== 'null' ? (
                        <img src={buildUrl(player.photo_url)} alt={player.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-full w-12 h-12" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{player.name || player.player_name || 'Unknown Player'}</p>
                        <p className="text-sm text-gray-600">{player.email || 'No email'} • {player.category || 'No category'}</p>
                        {player.base_price && (
                          <p className="text-xs text-blue-500 mt-1">Base Price: ${player.base_price} • Start Pos: {player.start_players}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* === MATCH SECTION === */}
      {activeSection === "match" && (
        <>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-6">
            <Activity className="text-purple-600" /> Match
          </h1>

          <Card className="mb-8">
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Tournament</Label>
                  <Select value={selectedMatchTournamentId || ''} onChange={e => setSelectedMatchTournamentId(parseInt(e.target.value) || null)}>
                    <option value="">Select Tournament</option>
                    {tournaments.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.year})</option>
                    ))}
                  </Select>
                </div>
                {selectedMatchTournamentId && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Home Team</Label>
                        <Select value={newMatch.homeTeamId || ''} onChange={e => setNewMatch(s => ({...s, homeTeamId: e.target.value}))}>
                          <option value="">Select Home Team</option>
                          {teams.map(team => (
                            <option key={team.id} value={team.id}>{team.team_name || team.name}</option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <Label>Away Team</Label>
                        <Select value={newMatch.awayTeamId || ''} onChange={e => setNewMatch(s => ({...s, awayTeamId: e.target.value}))}>
                          <option value="">Select Away Team</option>
                          {teams.map(team => (
                            <option key={team.id} value={team.id}>{team.team_name || team.name}</option>
                          ))}
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Match Date</Label>
                      <DatePicker selected={newMatch.date} onChange={(d: Date | null) => setNewMatch(s => ({...s, date: d}))} className="w-full p-4 border rounded-lg" />
                    </div>
                    <div>
                      <Label>Venue</Label>
                      <Input value={newMatch.venue} onChange={e => setNewMatch(s => ({...s, venue: e.target.value}))} placeholder="e.g. Sher-e-Bangla National Cricket Stadium" />
                    </div>
                    <Button onClick={handleCreateMatch} className="w-full">Create Match</Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Label>Select Tournament to view matches:</Label>
            <Select value={selectedMatchTournamentId || ''} onChange={e => setSelectedMatchTournamentId(parseInt(e.target.value) || null)}>
              <option value="">Select Tournament</option>
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.year})</option>
              ))}
            </Select>

            <div className="mt-6">
              {loadingMatches ? <p>Loading matches...</p> : matches.length === 0 ? <p>No matches</p> : (
                <div className="space-y-3">
                  {matches.map(match => (
                    <Card key={match.id} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {teams.find(t => t.id === match.home_team_id)?.team_name || 'Unknown'} vs {teams.find(t => t.id === match.away_team_id)?.team_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">{match.date} at {match.venue}</p>
                        <p className="text-xs text-blue-600">Status: {match.status}</p>
                      </div>
                      <Select value={match.status} onChange={e => updateMatchStatus(match.id, e.target.value)}>
                        <option value="upcoming">Upcoming</option>
                        <option value="live">Live</option>
                        <option value="completed">Completed</option>
                      </Select>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  </div>

  <Footer />
  {toastMsg && (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${toastMsg.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
      {toastMsg.msg}
    </div>
  )}
  {selectedPlayerId && (
    <AdminAuctionPlayerDetails 
      playerId={selectedPlayerId} 
      onClose={() => setSelectedPlayerId(null)} 
    />
  )}
  {selectedUpdatePlayer && (
    <AdminPlayerUpdateInfo 
      player={selectedUpdatePlayer} 
      onClose={() => {
        setSelectedUpdatePlayer(null);
        if (auctionTournamentId) loadAuctionData();
      }}
      onUpdate={(updatedData: any) => {
        if (auctionTournamentId) loadAuctionData();
      }} 
    />
  )}
</div>
);
};
export default Admin;