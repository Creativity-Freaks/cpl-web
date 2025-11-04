import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Users, DollarSign, LogOut, Activity } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { AdminAuctionPlayerDetails } from './admin_auction_player_details';
import { AdminPlayerUpdateInfo } from './admin_player_update_info';
import { AdminPlayerImage } from './admin_player_image';
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
const [activeSection, setActiveSection] = useState(() => {
try { return localStorage.getItem('admin_active_section') || 'tournaments'; } catch { return 'tournaments'; }
});
const [toastMsg, setToastMsg] = useState<{type: 'success' | 'error', msg: string} | null>(null);
const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
const [selectedUpdatePlayer, setSelectedUpdatePlayer] = useState<any | null>(null);
const [selectedLivePlayer, setSelectedLivePlayer] = useState<any | null>(null);
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
const [loadingLivePlayers, setLoadingLivePlayers] = useState(false);
const [liveCategory, setLiveCategory] = useState<string>('Batter');
const [liveAmount, setLiveAmount] = useState<string>('');
const [selectedLiveTeamId, setSelectedLiveTeamId] = useState<number | null>(null);
const [selectedLiveTeamStats, setSelectedLiveTeamStats] = useState<any | null>(null);
const [lastClickedPlayer, setLastClickedPlayer] = useState<any | null>(null);
const bcRef = useRef<BroadcastChannel | null>(null);
const playerImageWindowRef = useRef<Window | null>(null);
const [allTeamsStatsMap, setAllTeamsStatsMap] = useState<Record<string, any>>({});
const [allPlayers, setAllPlayers] = useState<any[]>([]);
const [displayedPlayers, setDisplayedPlayers] = useState<any[]>([]);
const [pendingSelectedPlayers, setPendingSelectedPlayers] = useState<any[]>([]);
const [confirmedAuctionPlayers, setConfirmedAuctionPlayers] = useState<any[]>([]);
const [displayedConfirmedPlayers, setDisplayedConfirmedPlayers] = useState<any[]>([]);
const [loadingAuctionPlayers, setLoadingAuctionPlayers] = useState(false);
const [selectingPlayers, setSelectingPlayers] = useState(false);
const [visibleCount] = useState(5); // 5 players at a time
const visibleCountConfirmed = 5;
const [teamCoinInputMap, setTeamCoinInputMap] = useState<Record<string, number>>({});
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
// Persist and restore active section across reloads
useEffect(() => {
try { if (activeSection) localStorage.setItem('admin_active_section', activeSection); } catch {}
}, [activeSection]);
// --- FETCH TOURNAMENTS ---
const fetchTournaments = async (silent = false) => {
try {
if (!silent) setLoadingTournaments(true);
const data = await api.get("/api/v1/admin/tournaments/fetch");
setTournaments(Array.isArray(data) ? data : []);
} catch (error: any) {
if (!silent) toast.error("Tournament load failed: " + error.message);
} finally {
if (!silent) setLoadingTournaments(false);
}
};
// --- FETCH TEAMS ---
const fetchTeams = async (tournamentId: number, silent = false) => {
if (!tournamentId) return;
try {
if (!silent) setLoadingTeams(true);
const data = await api.get(`/api/v1/admin/tournaments/${tournamentId}/teams`);
setTeams(Array.isArray(data) ? data : []);
} catch (error: any) {
if (!silent) toast.error("Team load failed: " + error.message);
setTeams([]);
} finally {
if (!silent) setLoadingTeams(false);
}
};
// --- FETCH MATCHES ---
const fetchMatches = async (tournamentId: number, silent = false) => {
if (!tournamentId) return;
try {
if (!silent) setLoadingMatches(true);
const data = await api.get(`/api/v1/admin/tournaments/${tournamentId}/matches`);
setMatches(Array.isArray(data) ? data : []);
} catch (error: any) {
if (!silent) toast.error("Match load failed: " + error.message);
setMatches([]);
} finally {
if (!silent) setLoadingMatches(false);
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
const loadAuctionData = async (silent = false) => {
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
if (!silent) setLoadingAuctionPlayers(true);
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
  if (!silent) setLoadingAuctionPlayers(false);
}
};
// --- FETCH LIVE PLAYERS ---
const fetchLivePlayers = async (silent = false) => {
  if (!auctionTournamentId) {
    setLivePlayers([]);
    return;
  }
  if (!silent) setLoadingLivePlayers(true);
  try {
    // Fetch raw auction players
    const auctionData = await api.get(`/api/v1/admin/auction/tournaments/${auctionTournamentId}/players`);
   
    // Fetch all players for full details to merge accurate categories
    const allData = await api.get("/api/v1/adminall/players");
    const allPlayersList = Array.isArray(allData) ? allData : [];
    // Map auction to full details, prioritizing full player category
    let normalized = Array.isArray(auctionData)
      ? auctionData.map((p: any) => {
          const fullP = allPlayersList.find((ap: any) => ap.id === (p.player_id ?? p.id));
          const fullCategory = fullP ? (fullP.category ?? fullP.player_category ?? fullP.role ?? '') : (p.category ?? p.player_category ?? p.role ?? '');
          return {
            id: p.player_id ?? p.id,
            auction_player_id: p.auction_player_id ?? p.id,
            name: p.player_name ?? p.name ?? fullP?.name,
            email: p.email ?? p.player_email ?? fullP?.email,
            category: fullCategory, // Use full player category for accuracy
            start_players: p.start_players ?? p.start_section ?? p.section,
            base_price: p.base_price ?? p.basePrice ?? 0,
            photo_url: p.photo_url ?? p.image_url ?? p.avatar_url ?? fullP?.photo_url,
          };
        })
      : [];
    // Remove duplicates by player ID
    normalized = [...new Map(normalized.map((item: any) => [item.id, item])).values()];
    setLivePlayers(normalized);
  } catch {
    setLivePlayers([]);
  } finally {
    if (!silent) setLoadingLivePlayers(false);
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
setSelectingPlayers(true);
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
  // Refresh live players immediately
  await fetchLivePlayers();
  // Broadcast refresh to other tabs
  try { bcRef.current?.postMessage({ type: 'refresh', section: 'auction' }); } catch {}
} catch (error: any) {
  console.error("❌ API Error Details:", error);
  toast.error(`Failed: ${error.message}`);
} finally {
  setSelectingPlayers(false);
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
  // Also refresh live players
  await fetchLivePlayers();
  // Broadcast refresh to other tabs
  try { bcRef.current?.postMessage({ type: 'refresh', section: 'auction-players' }); } catch {}
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
  // Broadcast refresh to other tabs
  try { bcRef.current?.postMessage({ type: 'refresh', section: 'team' }); } catch {}
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
  // Broadcast refresh to other tabs
  try { bcRef.current?.postMessage({ type: 'refresh', section: 'match' }); } catch {}
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
  // Broadcast refresh to other tabs
  try { bcRef.current?.postMessage({ type: 'refresh', section: 'tournaments' }); } catch {}
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
// Fetch Live Auction players for selected tournament (category-wise filtering happens in UI)
useEffect(() => {
  fetchLivePlayers();
}, [auctionTournamentId]);
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
// Setup broadcast channel for live updates to other tabs
useEffect(() => {
  try {
    bcRef.current = new BroadcastChannel('auction-updates');
    // Listen for refresh requests from other tabs
    bcRef.current.onmessage = (ev: MessageEvent) => {
      const data = ev.data;
      if (data && data.type === 'refresh') {
        // Silently refresh data based on active section (pass true for silent mode)
        if (data.section === 'tournaments' || !data.section) {
          fetchTournaments(true);
        }
        if (data.section === 'team' || !data.section) {
          if (selectedTournamentId) fetchTeams(selectedTournamentId, true);
        }
        if (data.section === 'match' || !data.section) {
          if (selectedMatchTournamentId) {
            fetchTeams(selectedMatchTournamentId, true);
            fetchMatches(selectedMatchTournamentId, true);
          }
        }
        if (data.section === 'auction' || data.section === 'auction-players' || !data.section) {
          if (auctionTournamentId) {
            loadAuctionData(true);
            fetchLivePlayers(true);
          }
        }
        if (data.section === 'live-auction' || !data.section) {
          if (auctionTournamentId) {
            fetchLivePlayers(true);
            fetchTeams(auctionTournamentId, true);
          }
        }
      }
    };
  } catch {}
  return () => { try { bcRef.current && bcRef.current.close(); } catch {} };
}, [selectedTournamentId, selectedMatchTournamentId, auctionTournamentId]);
// Load teams' stats for the selected tournament and map to team.id
useEffect(() => {
  (async () => {
    try {
      if (!auctionTournamentId) { setAllTeamsStatsMap({}); return; }
      const list = await api.get(`/api/v1/admin/dashboard/teams/${auctionTournamentId}/player-distribution`);
      if (Array.isArray(list)) {
        const map: Record<string, any> = {};
        list.forEach((item: any) => {
          const normalized = normalizeTeamStats(item);
          const key = String(item.team_id || item.id || '');
          if (key) map[key] = normalized;
        });
        setAllTeamsStatsMap(map);
      } else {
        setAllTeamsStatsMap({});
      }
    } catch {
      setAllTeamsStatsMap({});
    }
  })();
}, [auctionTournamentId]);

// Automatic background refresh for all sections
// Refresh every 5 seconds when section is active, but don't show loading states
useEffect(() => {
  if (!isAuthenticated) return;
  
  const refreshInterval = setInterval(() => {
    // Silently refresh based on active section (pass true for silent mode)
    switch (activeSection) {
      case 'tournaments':
        // Refresh tournaments silently
        fetchTournaments(true).catch(() => {});
        break;
      case 'team':
        if (selectedTournamentId) {
          fetchTeams(selectedTournamentId, true).catch(() => {});
        }
        break;
      case 'match':
        if (selectedMatchTournamentId) {
          fetchMatches(selectedMatchTournamentId, true).catch(() => {});
          fetchTeams(selectedMatchTournamentId, true).catch(() => {});
        }
        break;
      case 'auction':
      case 'auction-players':
        if (auctionTournamentId) {
          loadAuctionData(true).catch(() => {});
        }
        break;
      case 'live-auction':
        if (auctionTournamentId) {
          fetchLivePlayers(true).catch(() => {});
          // Refresh team stats silently
          (async () => {
            try {
              const list = await api.get(`/api/v1/admin/dashboard/teams/${auctionTournamentId}/player-distribution`);
              if (Array.isArray(list)) {
                const map: Record<string, any> = {};
                list.forEach((item: any) => {
                  const normalized = normalizeTeamStats(item);
                  const key = String(item.team_id || item.id || '');
                  if (key) map[key] = normalized;
                });
                setAllTeamsStatsMap(prev => ({ ...prev, ...map }));
              }
            } catch {}
          })();
        }
        break;
    }
  }, 5000); // Refresh every 5 seconds
  
  return () => clearInterval(refreshInterval);
}, [activeSection, isAuthenticated, selectedTournamentId, selectedMatchTournamentId, auctionTournamentId]);
// Helpers for Live Auction rendering
// Robust category normalizer to ensure strict matching with UI filter
const normalizeCategory = (value: any): string => {
  const v = String(value || '').trim().toLowerCase().replace(/[-_\s]+/g, '');
  if (!v) return '';
  if (v === 'wkbatsman' || v === 'wicketkeeperbatsman' || v === 'wk' || v === 'wicketkeeper') return 'WK Batsman';
  if (v === 'allrounder' || v === 'allround' || v === 'all') return 'All-rounder';
  if (v === 'bowler' || v.startsWith('bowl')) return 'Bowler';
  if (v === 'batter' || v.startsWith('bat')) return 'Batter';
  return '';
};
const getPlayerCategory = (p: any) => {
  const raw = p?.category ?? p?.player_category ?? p?.role;
  return normalizeCategory(raw);
};
// Bid amount helpers for inline +/- controls
const parseLiveAmount = (): number => {
  const n = parseInt(String(liveAmount || '0'), 10);
  return Number.isFinite(n) ? n : 0;
};
const changeLiveAmount = (delta: number) => {
  const next = Math.max(0, parseLiveAmount() + delta);
  setLiveAmount(String(next));
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
    teamCoins: toNum(payload.current_coins ?? payload.total_coins ?? payload.team_coin ?? payload.team_coins ?? payload.coins ?? payload.teamCoins ?? payload.coin ?? payload.balance),
    totalCoins: toNum(payload.total_coins ?? payload.team_coins ?? payload.coins ?? payload.totalCoins),
    playerCount: toNum(payload.player_count ?? payload.players_count ?? payload.playerCount ?? payload.count),
    maxCount: toNum(payload.max_count ?? payload.max_player ?? payload.max_players ?? payload.maxPlayers),
    available: toNum(payload.available_slots ?? payload.available ?? payload.available_player ?? payload.available_players ?? payload.availableCount),
  };
};
// Section label mapping: A→Diamond, B→Platinum, etc.
const SECTION_LABELS: Record<string, string> = {
  'A': 'Diamond',
  'B': 'Platinum',
  'C': 'Gold-I',
  'D': 'Gold-II',
  'E': 'Silver-I',
  'F': 'Silver-II',
  'G': 'Bronze-I',
  'H': 'Bronze-II',
  'I': 'Titanium-I',
  'J': 'Titanium-II',
};

// Build sections A..J with 5 players per section, ordered by highest base price
// Special handling for STAR category: shows only one section with 5 players
// For other categories: Players are distributed into sections based purely on base_price ranking
const getSectionedPlayers = (categoryLabel: string) => {
  const perSection = 5;
  const toBasePrice = (p: any) => Number(p.base_price ?? p.basePrice ?? 0) || 0;
  
  // Special handling for STAR category
  if (categoryLabel === 'STAR') {
    // Filter players by start_players = 'A' (STAR position) only
    const starPlayers = livePlayers
      .filter((p: any) => {
        const startPos = String(p.start_players || '').trim().toUpperCase();
        return startPos === 'A' || startPos === 'STAR';
      })
      .sort((a: any, b: any) => toBasePrice(b) - toBasePrice(a));
    
    // Return single STAR section with up to 5 players
    return [{
      key: 'STAR',
      label: 'STAR',
      players: starPlayers.slice(0, perSection),
    }];
  }
  
  // For other categories: Batter, Bowler, All-rounder, WK Batsman
  // Filter by category and sort by base_price (highest first)
  const categoryFiltered = livePlayers
    .filter((p: any) => {
      const playerCategory = getPlayerCategory(p);
      return playerCategory === normalizeCategory(categoryLabel);
    })
    .sort((a: any, b: any) => toBasePrice(b) - toBasePrice(a)); // Sort by base_price descending
  
  // Distribute players into sections based on base_price ranking
  // Top 5 → Diamond, Next 5 → Platinum, etc.
  const lettersAZ = Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i)); // A..J
  const sections: { key: string; label: string; players: any[] }[] = [];
  
  for (let i = 0; i < categoryFiltered.length && sections.length < lettersAZ.length; i += perSection) {
    const letter = lettersAZ[sections.length];
    const sectionPlayers = categoryFiltered.slice(i, i + perSection);
    
    if (sectionPlayers.length > 0) {
      sections.push({
        key: letter,
        label: SECTION_LABELS[letter] || `Section ${letter}`,
        players: sectionPlayers,
      });
    }
  }
  
  return sections;
};
// --- LOGIN PAGE ---
if (!isAuthenticated) {
return (
<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
<Card className="w-full max-w-md shadow-2xl mx-4">
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
<header className="bg-red-600 text-white h-16 flex items-center justify-between px-4 md:px-6">
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
    <aside className="bg-blue-900 w-64 p-4 hidden md:block">
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
    <main className="flex-1 p-4 md:p-8 overflow-auto">
      {/* === TOURNAMENT SECTION === */}
      {activeSection === "tournaments" && (
        <>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-6">
            <Trophy className="text-yellow-600" /> Tournament
          </h1>
          <Card className="mb-8">
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Card key={t.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="mb-4 md:mb-0">
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
                disabled={pendingSelectedPlayers.length === 0 || !auctionTournamentId || selectingPlayers}
              >
                {selectingPlayers ? 'Selecting...' : `Select Players for Auction (${pendingSelectedPlayers.length})`}
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
              <div className="flex flex-col md:flex-row items-end justify-between gap-4">
                <div className="w-full md:min-w-[260px]">
                  <Label>League / Tournament</Label>
                  <Select value={auctionTournamentId || ''} onChange={e => setAuctionTournamentId(e.target.value ? parseInt(e.target.value, 10) : null)}>
                    <option value="">Select Tournament</option>
                    {tournaments.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.year})</option>
                    ))}
                  </Select>
                </div>
                <div className="flex-1" />
                <div className="flex justify-end">
                  <Button className="bg-yellow-500 text-red-700" onClick={() => window.open('/settings', '_blank')}>Update Account</Button>
                </div>
              </div>
              {/* Team Overview banner removed as per request */}
              {/* Available teams rendered as stacked banners */}
              <div className="mt-3 space-y-1.5">
                {teams.filter((t:any, i:number, a:any[]) => a.findIndex(x => String(x.id) === String(t.id)) === i).slice(0, 50).map((team: any) => (
                  <Card
                    key={team.id}
                    className={`border shadow-sm hover:shadow-md transition rounded-lg ${selectedLiveTeamId===team.id? 'ring-1 ring-blue-400' : ''} bg-white`}
                    onClick={() => setSelectedLiveTeamId(team.id)}
                  >
                    <CardContent className="p-2 md:p-2.5">
                      <div className="grid grid-cols-12 items-center gap-2">
                        <div className="col-span-5 md:col-span-4 min-w-0">
                          <div className="text-[10px] uppercase tracking-wide text-gray-500">Team</div>
                          <div className="text-sm md:text-base font-semibold truncate">{team.team_name || team.name}</div>
                        </div>
                        {(() => {
                          const s = allTeamsStatsMap[String(team.id)] || {};
                          const Box = ({label, value}:{label:string, value:any}) => (
                            <div className="px-1.5 py-1 rounded border bg-gray-50 text-center">
                              <div className="text-[9px] text-gray-500 leading-none">{label}</div>
                              <div className="text-[11px] font-semibold leading-tight">{value ?? '-'}</div>
                            </div>
                          );
                          return (
                            <div className="col-span-7 md:col-span-8 grid grid-cols-5 gap-1.5">
                              <Box label="Coins" value={s?.teamCoins} />
                              <Box label="Total Coin" value={s?.totalCoins} />
                              <Box label="Players" value={s?.playerCount} />
                              <Box label="Max" value={s?.maxCount} />
                              <Box label="Avail" value={s?.available} />
                              <div className="col-span-5 flex items-center gap-2 mt-1">
                                <input
                                  type="number"
                                  className="w-24 px-2 py-1 border rounded"
                                  placeholder="Add coins"
                                  value={teamCoinInputMap[String(team.id)] ?? ''}
                                  onChange={(e)=>{
                                    const v = Number(e.target.value);
                                    setTeamCoinInputMap(prev=>({ ...prev, [String(team.id)]: v }));
                                  }}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={()=>{
                                    const add = Number(teamCoinInputMap[String(team.id)] ?? 0) || 0;
                                    if (add === 0) return;
                                    setAllTeamsStatsMap(prev=>{
                                      const copy = { ...prev } as any;
                                      const cur = { ...(copy[String(team.id)] || {}) };
                                      cur.teamCoins = Number(cur.teamCoins ?? 0) + add;
                                      copy[String(team.id)] = cur;
                                      return copy;
                                    });
                                    setTeamCoinInputMap(prev=>({ ...prev, [String(team.id)]: 0 }));
                                    toast.success(`Added ${add} coins to ${team.team_name || team.name}`);
                                  }}
                                >
                                  Add Coin
                                </Button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {teams.length === 0 && (
                  <div className="text-sm text-gray-500">No teams available</div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Center lanes - Section A..Z built by category */}
            <div className="lg:col-span-8 col-span-1">
              {loadingLivePlayers ? (
                <Card>
                  <CardContent>
                    <p className="text-center py-4">Loading players...</p>
                  </CardContent>
                </Card>
              ) : getSectionedPlayers(liveCategory).length === 0 ? (
                <Card>
                  <CardContent>
                    <div className="text-sm text-gray-500">No players found for {liveCategory}. Try another tournament or category.</div>
                  </CardContent>
                </Card>
              ) : (
                getSectionedPlayers(liveCategory).map(section => (
                  <Card key={section.key} className="mb-6">
                    <CardContent>
                      <h3 className="font-semibold mb-3">{section.label || `Section ${section.key}`}</h3>
                      <div className="space-y-3">
                        {section.players.map((p:any) => (
                          <div
                            key={p.id}
                            className="h-14 rounded-md border bg-white flex items-center px-4 justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              setLastClickedPlayer({ id: p.id, name: p.name || p.player_name, base_price: (p.base_price ?? p.basePrice ?? 0), auction_player_id: p.auction_player_id });
                              const playerData = {
                                id: String(p.id),
                                name: String(p.name || p.player_name || ''),
                                email: String(p.email || ''),
                                category: String(getPlayerCategory(p) || ''),
                                base_price: String(p.base_price ?? p.basePrice ?? 0),
                                start_players: String(p.start_players || ''),
                                photo_url: String(p.photo_url || ''),
                                tournament_id: String(auctionTournamentId || ''),
                                auction_player_id: String(p.auction_player_id || ''),
                              };
                              
                              // Check if window already exists and is open
                              if (playerImageWindowRef.current && !playerImageWindowRef.current.closed) {
                                // Window exists, send update message via BroadcastChannel
                                try {
                                  bcRef.current?.postMessage({
                                    type: 'player-update',
                                    payload: playerData,
                                  });
                                } catch {}
                              } else {
                                // First player or window was closed, open new window
                                const params = new URLSearchParams(playerData);
                                const newWindow = window.open(`/admin/live-player/${p.id}?${params.toString()}`, '_blank');
                                if (newWindow) {
                                  playerImageWindowRef.current = newWindow;
                                  // Also send via BroadcastChannel for immediate update
                                  try {
                                    bcRef.current?.postMessage({
                                      type: 'player-update',
                                      payload: playerData,
                                    });
                                  } catch {}
                                }
                              }
                            }}
                          >
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
            {/* Right controls - Category, Amount, Overview */}
            <div className="lg:col-span-4 col-span-1">
              <Card className="mb-6">
                <CardContent>
                  <Label>Category</Label>
                  <Select value={liveCategory} onChange={e => setLiveCategory(e.target.value)}>
                    {['STAR','Batter','Bowler','All-rounder','WK Batsman'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                  <div className="h-4" />
                  <Label>Bid Amount</Label>
                  <div className="bg-gray-50 border rounded-lg p-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changeLiveAmount(-50)}
                      className="rounded-full w-9 h-9 flex items-center justify-center"
                    >
                      −
                    </Button>
                    <div className="px-3 py-2 bg-white rounded-md border flex items-center gap-2 w-full">
                      <span className="text-gray-500">৳</span>
                      <input
                        type="number"
                        className="w-full outline-none"
                        placeholder="Enter bid amount"
                        value={liveAmount}
                        onChange={e => setLiveAmount(e.target.value)}
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => changeLiveAmount(50)}
                      className="rounded-full w-9 h-9 flex items-center justify-center"
                    >
                      +
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[100,200,500,1000].map(v => (
                      <button
                        key={v}
                        className="px-3 py-1 text-sm rounded-full bg-white border text-gray-700 hover:bg-gray-50"
                        onClick={() => changeLiveAmount(v)}
                        type="button"
                      >
                        +{v}
                      </button>
                    ))}
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => {
                      if (!lastClickedPlayer) { toast.error('Open a player first.'); return; }
                      const newBidAmount = parseLiveAmount();
                      if (newBidAmount <= 0) {
                        toast.error('Bid amount must be greater than 0');
                        return;
                      }
                      
                      // Get current total price (base_price + previous bids)
                      const lp = livePlayers.find((x:any)=> String(x.id) === String(lastClickedPlayer.id));
                      const basePrice = Number(lp?.base_price ?? lp?.basePrice ?? (lastClickedPlayer as any)?.base_price ?? 0) || 0;
                      
                      // Get previous total price from localStorage or calculate from current bid
                      let previousTotalPrice = basePrice;
                      try {
                        const previousBid = Number(localStorage.getItem(`bid_${lastClickedPlayer.id}`) || '0');
                        if (previousBid > 0) {
                          // Get previous total from localStorage if exists
                          const previousTotal = localStorage.getItem(`total_${lastClickedPlayer.id}`);
                          if (previousTotal) {
                            previousTotalPrice = Number(previousTotal) || basePrice;
                          } else {
                            // If no previous total, calculate: base + previous bid
                            previousTotalPrice = basePrice + previousBid;
                          }
                        }
                      } catch {}
                      
                      // New total = previous total + new bid amount
                      const newTotalPrice = previousTotalPrice + newBidAmount;
                      
                      // Store the new bid amount and new total price
                      const record = { 
                        type: 'bid', 
                        playerId: lastClickedPlayer.id, 
                        amount: newBidAmount,
                        totalPrice: newTotalPrice,
                        timestamp: Date.now() 
                      };
                      
                      // Persist bid and total for refresh safety
                      try {
                        localStorage.setItem(`bid_${record.playerId}`, String(newBidAmount));
                        localStorage.setItem(`total_${record.playerId}`, String(newTotalPrice));
                      } catch {}
                      
                      // Broadcast to other tabs (admin_player_image listens)
                      try { bcRef.current?.postMessage(record); } catch {}
                      toast.success(`Bid placed: ৳${newBidAmount}. New total: ৳${newTotalPrice}`);
                    }}
                  >
                    Place Bid
                  </Button>
                  <div className="h-3" />
                </CardContent>
              </Card>
              {/* Teams list with per-team Add to Sold */}
              <Card className="mt-6">
                <CardContent>
                  <h3 className="text-lg font-bold mb-3 text-blue-700">Teams {teams.length ? `(${teams.length})` : ''}</h3>
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {teams.length === 0 ? (
                      <div className="text-sm text-gray-500">No teams available</div>
                    ) : (
                      teams.map(team => (
                        <div
                          key={team.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                          <div className="min-w-0 mr-3">
                            <p className="font-semibold truncate">{team.team_name || team.name}</p>
                            <p className="text-xs text-gray-600 truncate">Code: {team.team_code || team.code || '-'}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-700 border-green-300 hover:bg-green-50"
                            onClick={async () => {
                              if (!lastClickedPlayer) { toast.error('Open a player first.'); return; }
                              // Helper to resolve auction_player_id from first image endpoint
                              // First image endpoint: /api/v1/admin/auction/tournaments/{tournament_id}/players
                              // Returns players with "id" field which is the auction_player_id
                              const resolveAuctionPlayerId = async (): Promise<{ id: number | null; alreadyAssignedTeamId?: number | null }> => {
                                const fromClicked = (lastClickedPlayer as any)?.auction_player_id;
                                if (fromClicked) return { id: Number(fromClicked) };
                                const byLocal = confirmedAuctionPlayers.find((cp:any) => String(cp.id) === String(lastClickedPlayer.id) || String(cp.player_id) === String(lastClickedPlayer.id));
                                const localId = byLocal?.auction_player_id || byLocal?.id;
                                if (localId) return { id: Number(localId) };
                                if (!auctionTournamentId) return null;
                                try {
                                  // Fetch from first image endpoint to get auction_player_id (the "id" field)
                                  const list = await api.get(`/api/v1/admin/auction/tournaments/${auctionTournamentId}/players`);
                                  if (Array.isArray(list)) {
                                    // Find player by player_id to get the auction_player_id (which is the "id" field in response)
                                    const found = list.find((it:any) => String(it.player_id ?? it.id) === String(lastClickedPlayer.id));
                                    // The "id" field in the response is the auction_player_id we need
                                    const auctionPlayerId = found?.id; // This is the auction_player_id from first endpoint
                                    const assigned = Number(found?.sold_to_team_id || 0) || null;
                                    return auctionPlayerId ? { id: Number(auctionPlayerId), alreadyAssignedTeamId: assigned } : { id: null };
                                  }
                                } catch {}
                                return { id: null };
                              };
                              const resolved = await resolveAuctionPlayerId();
                              const auctionPlayerId = resolved?.id || null;
                              if (!auctionPlayerId) { toast.error('auction_player_id not found. Please ensure player is selected for auction.'); return; }
                              // compute sold price = base + all cumulative bids
                              const lp = livePlayers.find((x:any)=> String(x.id) === String(lastClickedPlayer.id));
                              const baseFromList = Number(lp?.base_price ?? lp?.basePrice ?? 0) || 0;
                              const baseFromState = Number((lastClickedPlayer as any)?.base_price ?? 0) || 0;
                              const base = baseFromState || baseFromList;
                              
                              // Get current total price (which includes all cumulative bids)
                              let totalPrice = base;
                              try {
                                const storedTotal = localStorage.getItem(`total_${lastClickedPlayer.id}`);
                                if (storedTotal) {
                                  totalPrice = Number(storedTotal) || base;
                                } else {
                                  // Fallback: calculate from current bid
                                  const currentBid = parseLiveAmount();
                                  totalPrice = base + currentBid;
                                }
                              } catch {
                                const currentBid = parseLiveAmount();
                                totalPrice = base + currentBid;
                              }
                              try {
                                // Prevent duplicate assignment: if already assigned, skip PUT
                                let alreadyAssigned = false;
                                if (resolved?.alreadyAssignedTeamId) {
                                  alreadyAssigned = true;
                                }
                                try {
                                  if (auctionTournamentId) {
                                    const teamsList = await api.get(`/api/v1/admin/tournaments/${auctionTournamentId}/teams`);
                                    if (Array.isArray(teamsList)) {
                                      const foundTeam = teamsList.find((t:any) => Array.isArray(t.players) && t.players.some((pl:any) => String(pl.id ?? pl.player_id) === String(lastClickedPlayer.id)));
                                      alreadyAssigned = !!foundTeam;
                                    }
                                  }
                                } catch {}

                                if (!alreadyAssigned) {
                                  // Use third image endpoint: PUT /api/v1/admin/auction/assign-player/{auction_player_id}
                                  // auction_player_id comes from first image endpoint (the "id" field)
                                  // sold_to_team_id comes from second image endpoint (team "id" field)
                                  // sold_price is the total price (base + cumulative bids)
                                  try {
                                    await api.put(`/api/v1/admin/auction/assign-player/${auctionPlayerId}`, {
                                      sold_price: Number(totalPrice),
                                      sold_to_team_id: Number(team.id), // team.id from second image endpoint
                                    });
                                  } catch (e:any) {
                                    // Retry with string price if server rejects
                                    await api.put(`/api/v1/admin/auction/assign-player/${auctionPlayerId}`, {
                                      sold_price: String(totalPrice),
                                      sold_to_team_id: Number(team.id), // team.id from second image endpoint
                                    });
                                  }
                                }
                                const teamName = team?.team_name || team?.name || 'Team';
                                const record = {
                                  type: 'sold',
                                  playerId: lastClickedPlayer.id,
                                  playerName: lastClickedPlayer.name,
                                  teamId: team.id,
                                  teamName,
                                  amount: totalPrice,
                                  timestamp: Date.now(),
                                };
                                try {
                                  const key = `sold_${record.playerId}`;
                                  const prev = JSON.parse(localStorage.getItem(key) || '[]');
                                  const next = Array.isArray(prev) ? [...prev, record] : [record];
                                  localStorage.setItem(key, JSON.stringify(next));
                                } catch {}
                                try { bcRef.current?.postMessage(record); } catch {}
                                
                                // Update team stats: decrease coins and increase player count
                                setAllTeamsStatsMap(prev => {
                                  const copy = { ...prev };
                                  const teamKey = String(team.id);
                                  const currentStats = copy[teamKey] || {};
                                  const currentCoins = Number(currentStats.teamCoins || currentStats.totalCoins || 0);
                                  const currentPlayers = Number(currentStats.playerCount || 0);
                                  
                                  copy[teamKey] = {
                                    ...currentStats,
                                    teamCoins: Math.max(0, currentCoins - totalPrice),
                                    totalCoins: currentStats.totalCoins || currentCoins,
                                    playerCount: currentPlayers + 1,
                                    maxCount: currentStats.maxCount || 30,
                                    available: Math.max(0, (currentStats.maxCount || 30) - (currentPlayers + 1)),
                                  };
                                  return copy;
                                });
                                
                                // Refresh team stats from API to get updated server data
                                if (auctionTournamentId) {
                                  (async () => {
                                    try {
                                      const list = await api.get(`/api/v1/admin/dashboard/teams/${auctionTournamentId}/player-distribution`);
                                      if (Array.isArray(list)) {
                                        const map: Record<string, any> = {};
                                        list.forEach((item: any) => {
                                          const normalized = normalizeTeamStats(item);
                                          const key = String(item.team_id || item.id || '');
                                          if (key) map[key] = normalized;
                                        });
                                        setAllTeamsStatsMap(map);
                                      }
                                    } catch {}
                                  })();
                                }
                                
                                toast.success(`Assigned and added to Sold: ${teamName}`);
                                // Remove the player from section list after assignment
                                setLivePlayers(prev => prev.filter((x:any) => String(x.id) !== String(lastClickedPlayer.id)));
                              } catch (e:any) {
                                toast.error('Assign failed: ' + (e?.message || 'Unknown error'));
                              }
                            }}
                          >
                            Add to Sold
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
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
                      className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer"
                      onClick={() => setSelectedUpdatePlayer(player)}
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
                          e.stopPropagation();
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => handleRemovePlayer(player.auction_player_id || player.id)}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Card key={match.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div className="mb-4 md:mb-0">
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
      onUpdate={async (updatedData: any) => {
        // After update, refresh from API endpoint to get latest data
        if (auctionTournamentId) {
          try {
            // Refresh auction players from the GET endpoint
            const refreshedPlayers = await fetchConfirmedAuctionPlayers(auctionTournamentId);
            
            // Fetch all players for full details
            const allData = await api.get("/api/v1/adminall/players");
            const allPlayersList = Array.isArray(allData) ? allData : [];
            
            // Merge full details for confirmed players
            const fullConfirmed = refreshedPlayers.map((c: any) => {
              const fullP = allPlayersList.find((p: any) => p.id === (c.player_id || c.id));
              if (fullP) {
                return {
                  ...fullP,
                  auction_player_id: c.auction_player_id || c.id,
                  start_players: c.start_players,
                  base_price: c.base_price,
                };
              }
              return { ...c, name: c.player_name };
            });
            
            // Update confirmed players list
            setConfirmedAuctionPlayers(fullConfirmed);
            setDisplayedConfirmedPlayers(fullConfirmed.slice(0, visibleCountConfirmed));
            
            // Filter updated players: only those with both base_price and start_players set
            const updated = fullConfirmed.filter((p: any) => 
              p.start_players && 
              p.base_price && 
              p.start_players !== '' && 
              p.base_price !== 0 &&
              Number(p.base_price) > 0
            );
            setUpdatedPlayers(updated);
            
            toast.success("Player updated successfully!");
          } catch (error: any) {
            console.error("Failed to refresh after update:", error);
            toast.error("Update saved but failed to refresh list");
            // Fallback: try to update local state
            const id = updatedData?.auction_player_id || selectedUpdatePlayer?.auction_player_id || selectedUpdatePlayer?.id;
            const merged = { ...(selectedUpdatePlayer || {}), ...(updatedData || {}) };
            setUpdatedPlayers(prev => {
              const idx = prev.findIndex(p => (p.auction_player_id || p.id) === id);
              if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = { ...copy[idx], ...merged };
                return copy;
              }
              // Only add if both base_price and start_players are set
              if (merged.base_price && merged.start_players && merged.base_price !== 0) {
                return [...prev, merged];
              }
              return prev;
            });
          }
        }
      }}
    />
  )}
</div>
);
};
export default Admin;