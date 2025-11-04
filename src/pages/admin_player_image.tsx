import React, { useEffect, useMemo, useState, useCallback } from "react";
import { X } from "lucide-react";
import { useSearchParams } from "react-router-dom"; // To read URL params
import { buildUrl } from "../config/api";

interface AdminPlayerImageProps {
  player: any;
  onClose: () => void;
}

export const AdminPlayerImage: React.FC<AdminPlayerImageProps> = ({ player, onClose }) => {
  const [livePlayer, setLivePlayer] = useState<any>(player);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [searchParams] = useSearchParams();
  const tournamentId = String(searchParams.get('tournament_id') || '');
  const START_POSITION_OPTIONS: { value: string; label: string }[] = [
    { value: 'A', label: 'STAR' },
    { value: 'B', label: 'Diamond-1' },
    { value: 'C', label: 'Diamond-2' },
    { value: 'D', label: 'Platinum-1' },
    { value: 'E', label: 'Platinum-2' },
    { value: 'F', label: 'Gold-1' },
    { value: 'G', label: 'Gold-2' },
    { value: 'H', label: 'Silver-1' },
    { value: 'I', label: 'Silver-2' },
    { value: 'J', label: 'Bronze-1' },
    { value: 'K', label: 'Bronze-2' },
    { value: 'L', label: 'Titanium-1' },
    { value: 'M', label: 'Titanium-2' },
  ];

  const getStartPositionLabel = (value: any): string => {
    if (value == null) return "N/A";
    const raw = String(value).trim();
    if (!raw) return "N/A";
    const found = START_POSITION_OPTIONS.find(opt => opt.value.toUpperCase() === raw.toUpperCase());
    if (found) return found.label;
    // If API may already send the label, return as-is
    return raw;
  };
  const demoImages = [
    "https://images.pexels.com/photos/2240844/pexels-photo-2240844.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1596445/pexels-photo-1596445.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/6646919/pexels-photo-6646919.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/247878/pexels-photo-247878.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/247881/pexels-photo-247881.jpeg?auto=compress&cs=tinysrgb&w=800",
  ];

  const randomDemoImage = useMemo(() => {
    return demoImages[Math.floor(Math.random() * demoImages.length)];
  }, []);

  const imageUrl = livePlayer.photo_url && livePlayer.photo_url !== "null" && livePlayer.photo_url.trim() !== ""
    ? buildUrl(livePlayer.photo_url)
    : randomDemoImage;

  // Sold list state - all sold players for the tournament
  const [soldList, setSoldList] = useState<any[]>([]);
  const playerId = String((livePlayer as any).id || new URLSearchParams(window.location.search).get('player_id') || '').trim();

  // Fetch all sold players for the tournament
  const fetchAllSoldPlayers = useCallback(async () => {
    if (!tournamentId) return;
    try {
      const token = localStorage.getItem("auth_token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      // Fetch auction players to get sold ones
      const response = await fetch(buildUrl(`/api/v1/admin/auction/tournaments/${tournamentId}/players`), {
        headers,
      });
      if (response.ok) {
        const auctionPlayers = await response.json();
        if (Array.isArray(auctionPlayers)) {
          // Filter only sold players (those with sold_to_team_id)
          const soldPlayers = auctionPlayers
            .filter((p: any) => p.sold_to_team_id && p.sold_price)
            .map((p: any) => ({
              playerId: p.player_id || p.id,
              playerName: p.player_name || p.name || 'Unknown',
              teamId: p.sold_to_team_id,
              teamName: 'Team ' + p.sold_to_team_id, // Will try to fetch team name
              amount: p.sold_price || 0,
            }));
          
          // Fetch teams to get team names
          try {
            const teamsResponse = await fetch(buildUrl(`/api/v1/admin/tournaments/${tournamentId}/teams`), {
              headers,
            });
            if (teamsResponse.ok) {
              const teams = await teamsResponse.json();
              if (Array.isArray(teams)) {
                const teamMap = new Map(teams.map((t: any) => [t.id, t.team_name || t.name || 'Unknown Team']));
                const soldWithTeamNames = soldPlayers.map((s: any) => ({
                  ...s,
                  teamName: teamMap.get(s.teamId) || s.teamName,
                }));
                setSoldList(soldWithTeamNames);
                return;
              }
            }
          } catch {}
          
          setSoldList(soldPlayers);
        }
      }
    } catch (error) {
      console.error('Failed to fetch sold players:', error);
      // Fallback to localStorage
      try {
        const allSold: any[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sold_')) {
            try {
              const arr = JSON.parse(localStorage.getItem(key) || '[]');
              if (Array.isArray(arr)) {
                allSold.push(...arr);
              }
            } catch {}
          }
        }
        setSoldList(allSold);
      } catch {}
    }
  }, [tournamentId]);

  // Load existing from localStorage and fetch from API
  useEffect(() => {
    const currentPlayerId = String((livePlayer as any).id || playerId || '').trim();
    if (!currentPlayerId) return;
    try {
      const b = Number(localStorage.getItem(`bid_${currentPlayerId}`) || '0');
      setBidAmount(Number.isFinite(b) ? b : 0);
    } catch { setBidAmount(0); }
    
    // Fetch all sold players for tournament
    fetchAllSoldPlayers();
  }, [playerId, tournamentId, livePlayer, fetchAllSoldPlayers]);

  // Listen to broadcast updates
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('auction-updates');
      bc.onmessage = (ev: MessageEvent) => {
        const data = ev.data;
        // Handle player update - change the right part
        if (data && data.type === 'player-update' && data.payload) {
          const payload = data.payload;
          const newPlayer = {
            id: payload.id,
            name: payload.name,
            email: payload.email,
            category: payload.category,
            base_price: payload.base_price,
            start_players: payload.start_players,
            photo_url: payload.photo_url,
            auction_player_id: payload.auction_player_id,
          };
          setLivePlayer(newPlayer);
          // Reset bid amount for new player
          setBidAmount(0);
          // Update playerId for bid tracking
          const newPlayerId = String(payload.id || '');
          if (newPlayerId) {
            try {
              const b = Number(localStorage.getItem(`bid_${newPlayerId}`) || '0');
              setBidAmount(Number.isFinite(b) ? b : 0);
            } catch { setBidAmount(0); }
          }
        }
        // Handle sold player - refresh sold list
        if (data && data.type === 'sold') {
          // Refresh all sold players from API
          fetchAllSoldPlayers();
        }
        // Handle bid update
        if (data && data.type === 'bid') {
          const currentPlayerId = String((livePlayer as any).id || playerId || '');
          if (String(data.playerId) === currentPlayerId) {
            const amt = Number(data.amount || 0);
            setBidAmount(Number.isFinite(amt) ? amt : 0);
            try { localStorage.setItem(`bid_${currentPlayerId}`, String(amt)); } catch {}
          }
        }
      };
    } catch {}
    return () => { try { bc && bc.close(); } catch {} };
  }, [playerId, tournamentId, livePlayer, fetchAllSoldPlayers]);

  // Also listen to storage events as a robustness fallback
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (!e || !e.key) return;
      if (e.key === `bid_${playerId}`) {
        const amt = Number(e.newValue || '0');
        setBidAmount(Number.isFinite(amt) ? amt : 0);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [playerId]);

  const basePriceNum = useMemo(() => {
    const n = Number(livePlayer.base_price || livePlayer.basePrice || 0);
    return Number.isFinite(n) ? n : 0;
  }, [livePlayer.base_price, livePlayer.basePrice]);
  const currentPrice = basePriceNum + (Number.isFinite(bidAmount) ? bidAmount : 0);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 flex items-center justify-center z-50 p-6">
      <div className="w-full max-w-7xl h-full max-h-[90vh] grid grid-cols-[260px_1fr] gap-0 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md border border-white/20">
        {/* Left Sidebar */}
        <aside className="bg-gradient-to-b from-indigo-700/80 to-blue-700/80 text-white p-5 flex flex-col gap-4">
          <div>
            <div className="text-lg font-semibold mb-2">Sold List</div>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {soldList.length === 0 ? (
                <div className="text-sm opacity-80">No sold players yet.</div>
              ) : (
                soldList.map((s, idx) => (
                  <div key={`${s.playerId}-${s.teamId}-${idx}`} className="bg-white/10 rounded-lg p-2 flex items-center justify-between">
                    <div className="truncate flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{s.playerName || 'Unknown Player'}</div>
                      <div className="text-xs opacity-80 truncate">Team: {s.teamName || 'Unknown Team'}</div>
                    </div>
                    <div className="text-sm font-semibold ml-2 flex-shrink-0">৳{s.amount || 0}</div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mt-auto">
            <button onClick={onClose} className="w-full bg-white/90 hover:bg-white text-indigo-700 font-semibold py-2.5 rounded-xl shadow-lg transition">
              <div className="flex items-center justify-center gap-2"><X className="h-5 w-5" /> Close</div>
            </button>
          </div>
        </aside>

        {/* Right Content (existing full layout) */}
        <section className="bg-gradient-to-br from-blue-600/40 to-indigo-700/40 grid grid-cols-[2fr_1fr]">
          <div className="flex items-center justify-center p-8 bg-gradient-to-br from-blue-500/20 to-indigo-600/20">
            <div className="relative w-full h-full max-w-3xl max-h-[600px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 to-emerald-400/30 rounded-3xl blur-3xl -z-10 scale-95"></div>
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border-8 border-white/90 bg-white/10 backdrop-blur-sm">
                <img
                  src={imageUrl}
                  alt={livePlayer.name || livePlayer.player_name || "Player"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = randomDemoImage;
                  }}
                />
                <div className="absolute top-10 left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col bg-white/95 backdrop-blur-md p-6 rounded-l-none rounded-r-3xl shadow-2xl border-l border-indigo-200/50 overflow-y-auto">
            <div className="flex-1 flex flex-col justify-center space-y-6">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-center tracking-tight">
                {livePlayer.name || livePlayer.player_name || "Unknown Player"}
              </h2>

              <div className="space-y-4">
                <InfoCard label="Category" value={livePlayer.category || "N/A"} />
                <InfoCard label="Base Price" value={`৳${basePriceNum}`} highlight />
                <InfoCard label="Current Bid" value={`৳${bidAmount}`} />
                <InfoCard label="Total Price" value={`৳${currentPrice}`} highlight />
                <InfoCard label="Start Position" value={getStartPositionLabel(livePlayer.start_players)} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const InfoCard: React.FC<{ label: string; value: string; highlight?: boolean }> = ({
  label,
  value,
  highlight,
}) => (
  <div
    className={`group p-4 rounded-2xl transition-all duration-300 border ${
      highlight
        ? "border-green-100/50 hover:bg-green-50/50"
        : "border-indigo-100/50 hover:bg-indigo-50/50"
    } hover:shadow-lg hover:-translate-y-1`}
  >
    <p className={`text-sm font-semibold mb-1 ${highlight ? "text-green-600" : "text-indigo-600"}`}>
      {label}
    </p>
    <p
      className={`text-lg font-medium transition-colors break-words ${
        highlight ? "text-green-700 group-hover:text-green-800" : "text-gray-700 group-hover:text-indigo-700"
      }`}
    >
      {value}
    </p>
  </div>
);

// === Standalone Page to Read URL Params ===
export const AdminPlayerImagePage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const player = {
    name: searchParams.get("name") || "",
    email: searchParams.get("email") || "",
    category: searchParams.get("category") || "",
    base_price: searchParams.get("base_price") || 0,
    start_players: searchParams.get("start_players") || "",
    photo_url: searchParams.get("photo_url") || "",
  };

  return <AdminPlayerImage player={player} onClose={() => window.close()} />;
};
