import React, { useEffect, useMemo, useState, useCallback } from "react";
import { X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
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

  const [soldList, setSoldList] = useState<any[]>([]);
  const playerId = String((livePlayer as any).id || new URLSearchParams(window.location.search).get('player_id') || '').trim();
  const [teamDistributions, setTeamDistributions] = useState<any[]>([]);
  const [auctionPlayers, setAuctionPlayers] = useState<any[]>([]);
  const soldOrderStorageKey = useMemo(() => `sold_order_${tournamentId}`, [tournamentId]);
  const soldAmountStorageKey = useMemo(() => `sold_amount_${tournamentId}`, [tournamentId]);

  const readSoldOrder = useCallback((): Record<string, number> => {
    try {
      const raw = localStorage.getItem(soldOrderStorageKey) || '{}';
      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed ? parsed : {};
    } catch { return {}; }
  }, [soldOrderStorageKey]);

  const writeSoldOrder = useCallback((order: Record<string, number>) => {
    try { localStorage.setItem(soldOrderStorageKey, JSON.stringify(order)); } catch {}
  }, [soldOrderStorageKey]);

  const readSoldAmountMap = useCallback((): Record<string, number> => {
    try {
      const raw = localStorage.getItem(soldAmountStorageKey) || '{}';
      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed ? parsed : {};
    } catch { return {}; }
  }, [soldAmountStorageKey]);

  const writeSoldAmountMap = useCallback((map: Record<string, number>) => {
    try { localStorage.setItem(soldAmountStorageKey, JSON.stringify(map)); } catch {}
  }, [soldAmountStorageKey]);

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
      
      const teamsResponse = await fetch(buildUrl(`/api/v1/admin/tournaments/${tournamentId}/teams`), {
        headers,
      });
      
      if (teamsResponse.ok) {
        const teams = await teamsResponse.json();
        if (Array.isArray(teams)) {
          const allSoldPlayers: any[] = [];
          
          teams.forEach((team: any) => {
            const teamId = team.id;
            const teamName = team.team_name || team.name || 'Unknown Team';
            
            if (Array.isArray(team.players)) {
              team.players.forEach((player: any) => {
                allSoldPlayers.push({
                  playerId: player.id || player.player_id,
                  playerName: player.name || player.player_name || 'Unknown Player',
                  teamId: teamId,
                  teamName: teamName,
                  amount: 0,
                  timestamp: 0,
                });
              });
            }
          });
          
          const orderMap = readSoldOrder();
          const amountMap = readSoldAmountMap();
          const merged = allSoldPlayers.map((sold: any) => {
            const ap = auctionPlayers.find((p: any) => String(p.player_id || p.id) === String(sold.playerId));
            return {
              ...sold,
              amount: Number(amountMap[String(sold.playerId)] || ap?.sold_price || 0),
              timestamp: Number(orderMap[String(sold.playerId)] || 0),
            };
          });
          const sorted = merged.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
          setSoldList(sorted);
          return;
        }
      }
    } catch (error) {
      if (!silent) console.error('Failed to fetch sold players:', error);
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
        const sorted = allSold.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
        setSoldList(sorted);
      } catch {}
    }
  }, [tournamentId, livePlayer, playerId]);

  const fetchAuctionPlayers = useCallback(async () => {
    if (!tournamentId) return;
    try {
      const token = localStorage.getItem("auth_token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(buildUrl(`/api/v1/admin/auction/tournaments/${tournamentId}/players`), { headers });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setAuctionPlayers(data);
    } catch {}
  }, [tournamentId]);

  const getCurrentAuctionPlayer = useCallback(() => {
    const currentId = String((livePlayer as any).id || playerId || '').trim();
    if (!currentId) return null;
    const ap = auctionPlayers.find((p: any) => String(p.player_id || p.id) === currentId);
    return ap || null;
  }, [auctionPlayers, livePlayer, playerId]);

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = localStorage.getItem("auth_token");
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }, []);

  const fetchTeamDistributions = useCallback(async (silent = false) => {
    if (!tournamentId) return;
    try {
      const token = localStorage.getItem("auth_token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(buildUrl(`/api/v1/admin/dashboard/teams/${tournamentId}/player-distribution`), { headers });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized = data.map((item: any) => {
          const payload = item?.data || item?.result || item?.payload || item || {};
          return {
            teamId: payload.team_id ?? item.team_id ?? item.id,
            teamName: payload.team_name ?? item.team_name ?? item.name ?? 'Team',
            currentCoins: Number(payload.current_coins ?? payload.team_coin ?? payload.teamCoins ?? payload.coins ?? 0) || 0,
            totalCoins: Number(payload.total_coins ?? payload.totalCoins ?? 0) || 0,
          };
        });
        const uniq = Array.from(new Map(normalized.map((t: any) => [String(t.teamId), t])).values());
        setTeamDistributions(uniq);
      }
    } catch (e) {
      if (!silent) console.error('Failed to load team distributions', e);
    }
  }, [tournamentId]);

  useEffect(() => {
    const currentPlayerId = String((livePlayer as any).id || playerId || '').trim();
    if (!currentPlayerId) return;
    try {
      const b = Number(localStorage.getItem(`bid_${currentPlayerId}`) || '0');
      setBidAmount(Number.isFinite(b) ? b : 0);
    } catch { setBidAmount(0); }
    
    fetchAllSoldPlayers();
    fetchAuctionPlayers();
    fetchTeamDistributions();
  }, [playerId, tournamentId, livePlayer, fetchAllSoldPlayers, fetchTeamDistributions]);

  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('auction-updates');
      bc.onmessage = (ev: MessageEvent) => {
        const data = ev.data;
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
          setBidAmount(0);
          const newPlayerId = String(payload.id || '');
          if (newPlayerId) {
            try {
              const b = Number(localStorage.getItem(`bid_${newPlayerId}`) || '0');
              setBidAmount(Number.isFinite(b) ? b : 0);
            } catch { setBidAmount(0); }
          }
        }
        if (data && data.type === 'sold') {
          const payload = data.payload || {};
          const teamId = payload.teamId || payload.sold_to_team_id;
          const teamName = payload.teamName || payload.team_name || '';
          const amount = Number(payload.amount || payload.sold_price || currentPrice || 0);

          const ap = getCurrentAuctionPlayer();
          if (ap && teamId) {
            const auctionPlayerId = ap.auction_player_id || ap.id;
            (async () => {
              try {
                await fetch(buildUrl(`/api/v1/admin/auction/assign-player/${auctionPlayerId}`), {
                  method: 'PUT',
                  headers: getAuthHeaders(),
                  body: JSON.stringify({ sold_price: amount, sold_to_team_id: teamId }),
                });
              } catch {}
              const now = Date.now();
              const order = readSoldOrder();
              order[String(ap.player_id || ap.id)] = now;
              writeSoldOrder(order);
              const amountMap = readSoldAmountMap();
              amountMap[String(ap.player_id || ap.id)] = amount;
              writeSoldAmountMap(amountMap);
              setSoldList(prev => {
                const withoutDup = prev.filter(x => String(x.playerId) !== String(ap.player_id || ap.id));
                return [
                  {
                    playerId: ap.player_id || ap.id,
                    playerName: livePlayer.name || livePlayer.player_name || 'Unknown Player',
                    teamId,
                    teamName,
                    amount,
                    timestamp: now,
                  },
                  ...withoutDup,
                ];
              });
              fetchAuctionPlayers();
              fetchAllSoldPlayers(true);
              try {
                const bc = new BroadcastChannel('auction-updates');
                bc.postMessage({ type: 'sold-committed', playerId: ap.player_id || ap.id, teamId, amount });
                bc.close();
              } catch {}
            })();
          } else {
            const now = Date.now();
            const order = readSoldOrder();
            order[String((livePlayer as any).id)] = now;
            writeSoldOrder(order);
            const amountMap = readSoldAmountMap();
            amountMap[String((livePlayer as any).id)] = amount;
            writeSoldAmountMap(amountMap);
            setSoldList(prev => [{
              playerId: (livePlayer as any).id,
              playerName: livePlayer.name || livePlayer.player_name || 'Unknown Player',
              teamId,
              teamName,
              amount,
              timestamp: now,
            }, ...prev.filter(x => String(x.playerId) !== String((livePlayer as any).id))]);
            try {
              const bc = new BroadcastChannel('auction-updates');
              bc.postMessage({ type: 'sold-committed', playerId: (livePlayer as any).id, teamId, amount });
              bc.close();
            } catch {}
          }
        }
        if (data && data.type === 'bid') {
          const currentPlayerId = String((livePlayer as any).id || playerId || '');
          if (String(data.playerId) === currentPlayerId) {
            const amt = Number(data.amount || 0);
            setBidAmount(Number.isFinite(amt) ? amt : 0);
            try { 
              localStorage.setItem(`bid_${currentPlayerId}`, String(amt));
              if (data.totalPrice !== undefined) {
                localStorage.setItem(`total_${currentPlayerId}`, String(data.totalPrice));
              }
            } catch {}
          }
        }
        if (data && data.type === 'refresh') {
          fetchAllSoldPlayers(true);
          fetchTeamDistributions(true);
        }
      };
    } catch {}
    return () => { try { bc && bc.close(); } catch {} };
  }, [playerId, tournamentId, livePlayer, fetchAllSoldPlayers, fetchTeamDistributions]);

  useEffect(() => {
    if (!tournamentId) return;
    
    const refreshInterval = setInterval(() => {
      fetchAllSoldPlayers(true);
      fetchAuctionPlayers();
      fetchTeamDistributions(true);
    }, 5000);
    
    return () => clearInterval(refreshInterval);
  }, [tournamentId, fetchAllSoldPlayers, fetchTeamDistributions]);

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
    return basePriceNum + (Number.isFinite(bidAmount) ? bidAmount : 0);
  }, [basePriceNum, bidAmount, livePlayer, playerId]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 flex items-center justify-center z-50 p-4">
      <div className="w-full h-full max-w-[98vw] max-h-[96vh] grid grid-rows-[1fr_auto] gap-4 rounded-3xl overflow-hidden">
        
        {/* Main Content Area */}
        <div className="grid grid-cols-[320px_1fr] gap-4 h-full">
          {/* Left Sidebar - Sold List (Scrollable) */}
          <aside className="bg-gradient-to-b from-indigo-700/80 to-blue-700/80 text-white p-5 rounded-2xl shadow-2xl border border-white/20 flex flex-col">
            <div className="flex-1 flex flex-col">
              <div className="text-xl font-bold mb-4 text-white/90">Sold List</div>
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {soldList.length === 0 ? (
                  <div className="text-sm opacity-80 text-center py-8">No sold players yet.</div>
                ) : (
                  soldList.map((s, idx) => (
                    <div key={`${s.playerId}-${s.teamId}-${idx}`} className="bg-white/10 rounded-xl p-3 hover:bg-white/15 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate text-white">
                            {s.playerName || 'Unknown Player'}
                          </div>
                          <div className="text-xs text-white/70 truncate">
                            → {s.teamName || 'Unknown Team'}
                          </div>
                        </div>
                        <div className="text-sm font-bold ml-3 flex-shrink-0 text-green-300">
                          ৳{s.amount || 0}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="pt-4">
              <button 
                onClick={onClose} 
                className="w-full bg-white/90 hover:bg-white text-indigo-700 font-bold py-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center justify-center gap-2">
                  <X className="h-5 w-5" /> Close
                </div>
              </button>
            </div>
          </aside>

          {/* Right Section - Image and Info */}
          <section className="grid grid-cols-[65%_35%] gap-4 h-full">
            {/* Image Section - Perfect Square */}
            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl p-4 flex items-center justify-center shadow-2xl border border-white/20">
              <div className="relative w-full h-full max-w-[500px] max-h-[500px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white/90 bg-white/10">
                <img
                  src={imageUrl}
                  alt={livePlayer.name || livePlayer.player_name || "Player"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = randomDemoImage;
                  }}
                />
                <div className="absolute top-4 left-4 w-20 h-20 bg-white/20 rounded-full blur-xl pointer-events-none"></div>
              </div>
            </div>

            {/* Info Section - Smaller Width */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20 flex flex-col">
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-2xl lg:text-3xl font-extrabold text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-purple-600 drop-shadow-[0_3px_10px_rgba(99,102,241,0.45)] mb-3">
                  {livePlayer.name || livePlayer.player_name || "Unknown Player"}
                </h2>
                <div className="h-1 rounded-full mx-auto w-24 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-purple-500 opacity-80 mb-4" />

                <div className="space-y-3">
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

        {/* Footer Section - Teams Overview (Full Width) */}
        <div className="bg-gradient-to-br from-blue-600/40 to-indigo-700/40 rounded-2xl p-4 shadow-2xl border border-white/20">
          <div className="rounded-2xl border border-white/30 bg-white/10 backdrop-blur-md shadow-xl p-4 h-full">
            <div className="text-white/90 font-bold text-lg mb-3 text-center">Teams Overview</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
              {teamDistributions.length === 0 ? (
                <div className="text-white/80 text-sm col-span-full text-center py-8">No teams found.</div>
              ) : (
                teamDistributions.map((t:any) => (
                  <div 
                    key={t.teamId} 
                    className="rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-white/30 hover:border-white/60 transition-all duration-200 shadow-md p-3 hover:scale-105 min-h-20"
                  >
                    <div className="text-white font-semibold truncate mb-2 text-sm text-center">
                      {t.teamName}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80 text-xs">Current:</span>
                        <span className="text-green-300 font-bold text-sm">৳{t.currentCoins.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/80 text-xs">Total:</span>
                        <span className="text-blue-300 font-bold text-sm">৳{t.totalCoins.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

const InfoCard: React.FC<{ label: string; value: string; highlight?: boolean }> = ({
  label,
  value,
  highlight,
}) => (
  <div
    className={`group p-3 rounded-xl transition-all duration-300 border ${
      highlight
        ? "border-green-200/50 hover:bg-green-50/80 bg-green-50/40"
        : "border-indigo-200/50 hover:bg-indigo-50/80 bg-white/60"
    } hover:shadow-lg hover:-translate-y-0.5`}
  >
    <p className={`text-xs font-bold mb-1 ${highlight ? "text-green-700" : "text-indigo-700"}`}>
      {label}
    </p>
    <p
      className={`text-base font-bold transition-colors break-words ${
        highlight ? "text-green-800 group-hover:text-green-900" : "text-gray-800 group-hover:text-indigo-800"
      }`}
    >
      {value}
    </p>
  </div>
);

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