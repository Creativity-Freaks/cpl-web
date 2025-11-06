import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Users, X } from "lucide-react";
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
  const [showFireworks, setShowFireworks] = useState(false);

  // Category Options (Start Position নয়)
  const CATEGORY_OPTIONS: { value: string; label: string }[] = [
    { value: 'Elite', label: 'Elite' },
    { value: 'Platinum', label: 'Platinum' },
    { value: 'Diamond', label: 'Diamond' },
    { value: 'Gold-I', label: 'Gold-I' },
    { value: 'Gold-II', label: 'Gold-II' },
    { value: 'Silver-I', label: 'Silver-I' },
    { value: 'Silver-II', label: 'Silver-II' },
    { value: 'Titanium-I', label: 'Titanium-I' },
    { value: 'Titanium-II', label: 'Titanium-II' },
  ];

  const getCategoryLabel = (value: any): string => {
    if (value == null) return "N/A";
    const raw = String(value).trim();
    if (!raw) return "N/A";
    const found = CATEGORY_OPTIONS.find(opt => opt.value === raw);
    if (found) return found.label;
    return raw;
  };

  // Image URL helper
  const getPlayerImageUrl = (photoUrl: string | null): string => {
    if (!photoUrl || photoUrl === 'null' || photoUrl === 'undefined' || photoUrl.trim() === "") {
      return buildUrl('/api/v1/player/profile/default.png');
    }
    const filename = photoUrl.split('\\').pop() || 'default.png';
    return buildUrl(`/api/v1/player/profile/${filename}`);
  };

  const imageUrl = useMemo(() => {
    return getPlayerImageUrl(livePlayer.photo_url);
  }, [livePlayer.photo_url]);

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
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const teamsResponse = await fetch(buildUrl(`/api/v1/admin/tournaments/${tournamentId}/teams`), { headers });
      if (!teamsResponse.ok) return;

      const teams = await teamsResponse.json();
      if (!Array.isArray(teams)) return;

      const allSoldPlayers: any[] = [];
      teams.forEach((team: any) => {
        const teamId = team.id;
        const teamName = team.team_name || team.name || 'Unknown Team';
        if (Array.isArray(team.players)) {
          team.players.forEach((player: any) => {
            allSoldPlayers.push({
              playerId: player.id || player.player_id,
              playerName: player.name || player.player_name || 'Unknown Player',
              teamId,
              teamName,
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
              if (Array.isArray(arr)) allSold.push(...arr);
            } catch {}
          }
        }
        const sorted = allSold.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
        setSoldList(sorted);
      } catch {}
    }
  }, [tournamentId, auctionPlayers, readSoldOrder, readSoldAmountMap]);

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
    return auctionPlayers.find((p: any) => String(p.player_id || p.id) === currentId) || null;
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

  // Fireworks effect for sold player
  const triggerFireworks = useCallback(() => {
    setShowFireworks(true);
    setTimeout(() => setShowFireworks(false), 3000);
  }, []);

  // Initial load
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

  // BroadcastChannel
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('auction-updates');
      bc.onmessage = (ev: MessageEvent) => {
        const data = ev.data;

        if (data?.type === 'player-update' && data.payload) {
          const payload = data.payload;
          const newPlayer = {
            id: payload.id,
            name: payload.name,
            email: payload.email,
            category: payload.category,
            base_price: payload.base_price,
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

        if (data?.type === 'sold') {
          const payload = data.payload || {};
          const teamId = payload.teamId || payload.sold_to_team_id;
          const teamName = payload.teamName || payload.team_name || '';
          const amount = Number(payload.amount || payload.sold_price || 0);

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
                return [{
                  playerId: ap.player_id || ap.id,
                  playerName: livePlayer.name || 'Unknown Player',
                  teamId,
                  teamName,
                  amount,
                  timestamp: now,
                }, ...withoutDup];
              });
              fetchAuctionPlayers();
              fetchAllSoldPlayers(true);
              triggerFireworks(); // Trigger fireworks when player is sold
              try {
                const bc2 = new BroadcastChannel('auction-updates');
                bc2.postMessage({ type: 'sold-committed', playerId: ap.player_id || ap.id, teamId, amount });
                bc2.close();
              } catch {}
            })();
          }
        }

        if (data?.type === 'bid') {
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

        if (data?.type === 'refresh') {
          fetchAllSoldPlayers(true);
          fetchTeamDistributions(true);
        }
      };
    } catch {}
    return () => { try { bc?.close(); } catch {} };
  }, [playerId, tournamentId, livePlayer, fetchAllSoldPlayers, fetchTeamDistributions, getCurrentAuctionPlayer, getAuthHeaders, triggerFireworks]);

  // Auto refresh
  useEffect(() => {
    if (!tournamentId) return;
    const interval = setInterval(() => {
      fetchAllSoldPlayers(true);
      fetchAuctionPlayers();
      fetchTeamDistributions(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [tournamentId, fetchAllSoldPlayers, fetchAuctionPlayers, fetchTeamDistributions]);

  // Storage event for bid
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === `bid_${playerId}`) {
        const amt = Number(e.newValue || '0');
        setBidAmount(Number.isFinite(amt) ? amt : 0);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [playerId]);

  const basePriceNum = useMemo(() => {
    const n = Number(livePlayer.base_price || 0);
    return Number.isFinite(n) ? n : 0;
  }, [livePlayer.base_price]);

  const currentPrice = useMemo(() => {
    const currentPlayerId = String((livePlayer as any).id || playerId || '').trim();
    if (currentPlayerId) {
      try {
        const storedTotal = localStorage.getItem(`total_${currentPlayerId}`);
        if (storedTotal) {
          const total = Number(storedTotal);
          if (Number.isFinite(total) && total > 0) return total;
        }
      } catch {}
    }
    return basePriceNum + (Number.isFinite(bidAmount) ? bidAmount : 0);
  }, [basePriceNum, bidAmount, playerId]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 flex items-center justify-center z-50 p-1 sm:p-2">
      {/* Fireworks Overlay */}
      {showFireworks && (
        <div className="fixed inset-0 z-60 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-red-500/20 to-purple-600/20 animate-pulse"></div>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full animate-firework"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}
      
      <div className="w-full h-full max-w-[98vw] max-h-[96vh] grid grid-rows-[1fr_auto] gap-1 sm:gap-2 rounded-xl sm:rounded-3xl overflow-hidden">
        
        {/* Main Content - Mobile Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr_360px] xl:grid-cols-[420px_1fr_420px] gap-2 sm:gap-4 lg:gap-5 h-full overflow-hidden">
          
          {/* Left: Sold List - Enhanced Design - Mobile Responsive */}
          <div className="bg-gradient-to-br from-indigo-600/90 via-purple-600/90 to-pink-600/90 text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-2xl border border-white/20 flex flex-col backdrop-blur-sm order-2 lg:order-1">
            <div className="flex-1 flex flex-col min-h-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold mb-3 sm:mb-4 lg:mb-5 text-white/95 border-b border-white/30 pb-2 sm:pb-3 lg:pb-4 flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">Sold Players</span>
                <span className="sm:hidden">Sold</span>
                <span className="ml-auto bg-white/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-sm sm:text-base">
                  {soldList.length}
                </span>
              </h2>
              <div className="space-y-2 sm:space-y-3 lg:space-y-4 flex-1 overflow-y-auto pr-2 sm:pr-3 custom-scrollbar min-h-0">
                {soldList.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 bg-white/10 rounded-full flex items-center justify-center">
                      <Users className="w-9 h-9 text-white/60" />
                    </div>
                    <p className="text-white/80 text-base">No sold players yet.</p>
                  </div>
                ) : (
                  soldList.map((s, idx) => (
                    <div 
                      key={`${s.playerId}-${idx}`} 
                      className="bg-white/10 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 border border-white/10 hover:border-white/20 hover:shadow-lg backdrop-blur-sm group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-base font-semibold truncate text-white group-hover:text-yellow-200 transition-colors">
                            {s.playerName}
                          </div>
                          <div className="text-sm text-white/80 truncate mt-1 flex items-center gap-1">
                            <span className="bg-blue-500/20 px-2 py-0.5 rounded">→ {s.teamName}</span>
                          </div>
                        </div>
                        <div className="text-lg font-extrabold ml-4 flex-shrink-0 bg-gradient-to-r from-green-300 to-emerald-400 text-transparent bg-clip-text">
                          ৳{s.amount?.toLocaleString() || 0}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Middle: Player Image - Mobile Responsive */}
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-xl sm:rounded-2xl p-2 sm:p-3 flex items-center justify-center shadow-2xl border border-white/20 overflow-hidden backdrop-blur-sm order-1 lg:order-2 min-h-[300px] sm:min-h-[400px] lg:min-h-0 lg:h-full">
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={imageUrl}
                alt={livePlayer.name || "Player"}
                className="w-full h-full object-contain rounded-lg sm:rounded-xl shadow-2xl"
                onError={(e) => {
                  e.currentTarget.src = buildUrl('/api/v1/player/profile/default.png');
                }}
              />
            </div>
          </div>

          {/* Right: Player Info - Enhanced Design - Mobile Responsive */}
          <div className="bg-gradient-to-br from-slate-800/95 via-gray-800/95 to-slate-900/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-2xl border border-white/20 flex flex-col text-white order-3 min-h-0">
            <div className="text-center mb-4 sm:mb-5 lg:mb-7">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 drop-shadow-lg mb-2 sm:mb-3 break-words px-2">
                {livePlayer.name || "Unknown Player"}
              </h1>
              <div className="h-1 sm:h-1.5 rounded-full mx-auto w-20 sm:w-24 lg:w-28 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-90"></div>
            </div>

            <div className="space-y-2 sm:space-y-3 lg:space-y-4 flex-1 overflow-y-auto pr-2 sm:pr-3 custom-scrollbar min-h-0">
              <InfoCard label="Category" value={getCategoryLabel(livePlayer.category)} />
              <InfoCard label="Base Price" value={`৳${basePriceNum.toLocaleString()}`} highlight />
              <InfoCard label="Current Bid" value={`৳${bidAmount.toLocaleString()}`} />
              <InfoCard label="Total Price" value={`৳${currentPrice.toLocaleString()}`} highlight />
            </div>
          </div>
        </div>

        {/* Footer: Teams - Mobile Responsive */}
        <div className="bg-gradient-to-br from-blue-600/40 to-indigo-700/40 rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 shadow-2xl border border-white/20 backdrop-blur-sm">
          <div className="rounded-lg sm:rounded-xl border border-white/30 bg-white/10 backdrop-blur-md shadow-xl p-2 sm:p-3 lg:p-4 h-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 max-h-20 sm:max-h-24 lg:max-h-28 overflow-y-auto custom-scrollbar pr-1 sm:pr-2">
              {teamDistributions.length === 0 ? (
                <div className="text-white/80 text-xs sm:text-sm col-span-full text-center py-4 sm:py-6">No teams found.</div>
              ) : (
                teamDistributions.map((t: any) => (
                  <div 
                    key={t.teamId} 
                    className="rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500/30 to-blue-500/30 border border-white/30 hover:border-cyan-300/60 transition-all duration-300 shadow-lg p-2 sm:p-3 hover:scale-105 min-h-16 sm:min-h-20 backdrop-blur-sm group"
                  >
                    <div className="text-white font-bold truncate mb-1 sm:mb-2 text-xs sm:text-sm text-center group-hover:text-cyan-200 transition-colors">
                      {t.teamName}
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80 text-[10px] sm:text-xs">Current:</span>
                        <span className="text-green-300 font-bold text-[10px] sm:text-xs">৳{t.currentCoins.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/80 text-[10px] sm:text-xs">Total:</span>
                        <span className="text-cyan-300 font-bold text-[10px] sm:text-xs">৳{t.totalCoins.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.5); }
        
        @keyframes firework {
          0% { 
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% { 
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }
        
        .animate-firework {
          --tx: ${Math.random() * 200 - 100}px;
          --ty: ${Math.random() * 200 - 100}px;
          animation: firework 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const InfoCard: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`group p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 border ${
    highlight 
      ? "border-cyan-400/50 hover:bg-cyan-500/20 bg-cyan-500/10" 
      : "border-blue-400/30 hover:bg-blue-500/20 bg-blue-500/10"
  } hover:shadow-lg hover:-translate-y-1 backdrop-blur-sm`}>
    <p className={`text-xs sm:text-sm font-bold mb-1 sm:mb-2 uppercase tracking-wide ${
      highlight ? "text-cyan-300" : "text-blue-300"
    }`}>{label}</p>
    <p className={`text-base sm:text-lg lg:text-xl font-extrabold transition-colors break-words ${
      highlight 
        ? "text-cyan-100 group-hover:text-white" 
        : "text-white/90 group-hover:text-white"
    }`}>{value}</p>
  </div>
);

export const AdminPlayerImagePage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const player = {
    name: searchParams.get("name") || "",
    email: searchParams.get("email") || "",
    category: searchParams.get("category") || "",
    base_price: searchParams.get("base_price") || 0,
    photo_url: searchParams.get("photo_url") || "",
    id: searchParams.get("id") || "",
    auction_player_id: searchParams.get("auction_player_id") || "",
  };

  return <AdminPlayerImage player={player} onClose={() => window.close()} />;
};