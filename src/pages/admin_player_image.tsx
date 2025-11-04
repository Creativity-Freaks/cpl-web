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

  // Fetch all sold players for the tournament from second image endpoint
  // Second image endpoint: /api/v1/admin/tournaments/{tournament_id}/teams
  // This endpoint returns teams with players array, showing which players are sold to which teams
  const fetchAllSoldPlayers = useCallback(async (silent = false) => {
    if (!tournamentId) return;
    try {
      const token = localStorage.getItem("auth_token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      // Fetch from second image endpoint: /api/v1/admin/tournaments/{tournament_id}/teams
      // This endpoint shows teams with their players array, indicating sold players
      const teamsResponse = await fetch(buildUrl(`/api/v1/admin/tournaments/${tournamentId}/teams`), {
        headers,
      });
      
      if (teamsResponse.ok) {
        const teams = await teamsResponse.json();
        if (Array.isArray(teams)) {
          // Extract all sold players from all teams
          const allSoldPlayers: any[] = [];
          
          teams.forEach((team: any) => {
            const teamId = team.id;
            const teamName = team.team_name || team.name || 'Unknown Team';
            
            // If team has players array, those are the sold players for this team
            if (Array.isArray(team.players)) {
              team.players.forEach((player: any) => {
                allSoldPlayers.push({
                  playerId: player.id || player.player_id,
                  playerName: player.name || player.player_name || 'Unknown Player',
                  teamId: teamId,
                  teamName: teamName,
                  amount: 0, // Will fetch from first endpoint if needed
                  timestamp: Date.now(),
                });
              });
            }
          });
          
          // Also fetch from first endpoint to get sold_price information
          try {
            const playersResponse = await fetch(buildUrl(`/api/v1/admin/auction/tournaments/${tournamentId}/players`), {
              headers,
            });
            if (playersResponse.ok) {
              const auctionPlayers = await playersResponse.json();
              if (Array.isArray(auctionPlayers)) {
                // Merge sold_price information
                const soldWithPrice = allSoldPlayers.map((sold: any) => {
                  const auctionPlayer = auctionPlayers.find((ap: any) => 
                    String(ap.player_id || ap.id) === String(sold.playerId)
                  );
                  return {
                    ...sold,
                    amount: auctionPlayer?.sold_price || 0,
                  };
                });
                
                // Sort: current player at top, then by timestamp (newest first)
                const currentPlayerId = String((livePlayer as any).id || playerId || '').trim();
                const sorted = soldWithPrice.sort((a: any, b: any) => {
                  // Current player first
                  if (String(a.playerId) === currentPlayerId) return -1;
                  if (String(b.playerId) === currentPlayerId) return 1;
                  // Then by timestamp (newest first)
                  return (b.timestamp || 0) - (a.timestamp || 0);
                });
                
                setSoldList(sorted);
                return;
              }
            }
          } catch {}
          
          // If first endpoint fails, still show the list from second endpoint
          const currentPlayerId = String((livePlayer as any).id || playerId || '').trim();
          const sorted = allSoldPlayers.sort((a: any, b: any) => {
            if (String(a.playerId) === currentPlayerId) return -1;
            if (String(b.playerId) === currentPlayerId) return 1;
            return (b.timestamp || 0) - (a.timestamp || 0);
          });
          setSoldList(sorted);
          return;
        }
      }
    } catch (error) {
      if (!silent) console.error('Failed to fetch sold players:', error);
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
        // Sort by current player first
        const currentPlayerId = String((livePlayer as any).id || playerId || '').trim();
        const sorted = allSold.sort((a: any, b: any) => {
          if (String(a.playerId) === currentPlayerId) return -1;
          if (String(b.playerId) === currentPlayerId) return 1;
          return (b.timestamp || 0) - (a.timestamp || 0);
        });
        setSoldList(sorted);
      } catch {}
    }
  }, [tournamentId, livePlayer, playerId]);

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
          // Refresh all sold players from API silently
          // This will show the newly sold player in the history
          fetchAllSoldPlayers(true);
        }
        // Handle bid update
        if (data && data.type === 'bid') {
          const currentPlayerId = String((livePlayer as any).id || playerId || '');
          if (String(data.playerId) === currentPlayerId) {
            const amt = Number(data.amount || 0);
            setBidAmount(Number.isFinite(amt) ? amt : 0);
            try { 
              localStorage.setItem(`bid_${currentPlayerId}`, String(amt));
              // Also store total price if provided
              if (data.totalPrice !== undefined) {
                localStorage.setItem(`total_${currentPlayerId}`, String(data.totalPrice));
              }
            } catch {}
          }
        }
        // Handle refresh request
        if (data && data.type === 'refresh') {
          fetchAllSoldPlayers(true);
        }
      };
    } catch {}
    return () => { try { bc && bc.close(); } catch {} };
  }, [playerId, tournamentId, livePlayer, fetchAllSoldPlayers]);

  // Automatic background refresh for sold list
  useEffect(() => {
    if (!tournamentId) return;
    
    const refreshInterval = setInterval(() => {
      // Silently refresh sold players list every 5 seconds
      fetchAllSoldPlayers(true);
    }, 5000);
    
    return () => clearInterval(refreshInterval);
  }, [tournamentId, fetchAllSoldPlayers]);

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
  
  // Calculate current price: use stored total if available, otherwise base + bid
  const currentPrice = useMemo(() => {
    const currentPlayerId = String((livePlayer as any).id || playerId || '').trim();
    if (currentPlayerId) {
      try {
        const storedTotal = localStorage.getItem(`total_${currentPlayerId}`);
        if (storedTotal) {
          const total = Number(storedTotal);
          if (Number.isFinite(total) && total > 0) {
            return total;
          }
        }
      } catch {}
    }
    // Fallback: base price + current bid amount
    return basePriceNum + (Number.isFinite(bidAmount) ? bidAmount : 0);
  }, [basePriceNum, bidAmount, livePlayer, playerId]);

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
                  <div key={`${s.playerId}-${s.teamId}-${idx}`} className="bg-white/10 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium truncate flex-1 min-w-0">
                        {s.playerName || 'Unknown Player'} <span className="text-white/60">--&gt;</span> <span className="text-white/90">{s.teamName || 'Unknown Team'}</span>
                      </div>
                      <div className="text-sm font-semibold ml-2 flex-shrink-0">৳{s.amount || 0}</div>
                    </div>
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
