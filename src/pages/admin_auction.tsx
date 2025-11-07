// admin_auction.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gavel, Play, Pause, StopCircle, UserPlus, DollarSign, Clock, Hammer, Users, Trophy, LogOut, Settings, Search, Mic2, Zap, Crown, Target, IndianRupee, Sparkles, Award, TrendingUp, Star, Activity } from "lucide-react";
import { toast } from "sonner";
import { buildUrl } from '../config/api';

// Import logo and player images from src/assets
import cplLogo from "@/assets/cpl2026logo.png";
import durjoyImage from "@/assets/image.png";
import farhadulImage from "@/assets/trophy.jpg";
import toukirImage from "@/assets/trophy.jpg";
import shaidImage from "@/assets/trophy.jpg";
import hadiImage from "@/assets/trophy.jpg";

// Fallback images in case some images are missing
const fallbackImages = {
  durjoy: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=400&fit=crop&crop=face",
  farhadul: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=face",
  toukir: "https://images.unsplash.com/photo-1587132137056-6a17f6467c6e?w=400&h=400&fit=crop&crop=face",
  shaid: "https://images.unsplash.com/photo-1593115057322-e94b77572f20?w=400&h=400&fit=crop&crop=face",
  hadi: "https://images.unsplash.com/photo-1541336032412-2048a678540d?w=400&h=400&fit=crop&crop=face"
};

type Player = {
  id: string;
  name: string;
  role: string;
  base_price: number;
  current_bid: number;
  bidding_team: string | null;
  status: "available" | "sold" | "reserved";
  image: string;
  stats?: {
    matches: number;
    runs: number;
    wickets: number;
    strike_rate: number;
  };
};

type Team = {
  id: string;
  name: string;
  budget: number;
  spent: number;
  color: string;
};

const AdminAuction = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("live-auction");
  const [auctionStatus, setAuctionStatus] = useState<"idle" | "running" | "paused" | "ended">("idle");
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [reservePrice, setReservePrice] = useState(0);
  const [timer, setTimer] = useState(60);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Handle image loading errors
  const handleImageError = (playerId: string, fallbackUrl: string) => {
    setImageErrors(prev => new Set(prev.add(playerId)));
    
    // Update the player's image to fallback
    setPlayers(prev => prev.map(player => 
      player.id === playerId ? { ...player, image: fallbackUrl } : player
    ));
    
    if (currentPlayer?.id === playerId) {
      setCurrentPlayer(prev => prev ? { ...prev, image: fallbackUrl } : null);
    }
  };

  // Mock data for demonstration with local images
  useEffect(() => {
    const mockPlayers: Player[] = [
      { 
        id: "1", 
        name: "Durjoy Das", 
        role: "Batsman", 
        base_price: 500, 
        current_bid: 500, 
        bidding_team: null, 
        status: "available",
        image: durjoyImage,
        stats: { matches: 45, runs: 1250, wickets: 12, strike_rate: 135.5 }
      },
      { 
        id: "2", 
        name: "Farhadul Hauque Fuad", 
        role: "Bowler", 
        base_price: 500, 
        current_bid: 500, 
        bidding_team: "1", 
        status: "available",
        image: farhadulImage,
        stats: { matches: 38, runs: 320, wickets: 65, strike_rate: 85.2 }
      },
      { 
        id: "3", 
        name: "Toukir Ahmed", 
        role: "All-rounder", 
        base_price: 500, 
        current_bid: 500, 
        bidding_team: null, 
        status: "available",
        image: toukirImage,
        stats: { matches: 52, runs: 890, wickets: 42, strike_rate: 125.8 }
      },
      { 
        id: "4", 
        name: "shaid Mehraj", 
        role: "Batsman", 
        base_price: 500, 
        current_bid: 500, 
        bidding_team: "2", 
        status: "available",
        image: shaidImage,
        stats: { matches: 41, runs: 1100, wickets: 8, strike_rate: 142.3 }
      },
      { 
        id: "5", 
        name: "Md Hadi", 
        role: "Bowler", 
        base_price: 400, 
        current_bid: 500, 
        bidding_team: "3", 
        status: "available",
        image: hadiImage,
        stats: { matches: 36, runs: 150, wickets: 58, strike_rate: 72.1 }
      },
    ];

    const mockTeams: Team[] = [
      { id: "1", name: "CSIT", budget: 5000, spent: 0, color: "from-blue-500 to-cyan-500" },
      { id: "2", name: "CCE", budget: 5000, spent: 0, color: "from-yellow-500 to-orange-500" },
      { id: "3", name: "PME", budget: 5000, spent: 0, color: "from-red-500 to-pink-500" },
      { id: "4", name: "EEE", budget: 5000, spent: 0, color: "from-purple-500 to-indigo-500" },
      { id: "5", name: "Mathematics", budget: 5000, spent: 0, color: "from-green-500 to-indigo-500" },
    ];

    setPlayers(mockPlayers);
    setTeams(mockTeams);
    setCurrentPlayer(mockPlayers[0]);
  }, []);

  // Sell current player and advance to next available
  const sellPlayer = React.useCallback(() => {
    if (!currentPlayer) return;
    const updatedPlayers: Player[] = players.map(p =>
      p.id === currentPlayer.id ? { ...p, status: "sold" as Player["status"] } : p
    );
    setPlayers(updatedPlayers);
    const nextPlayer = updatedPlayers.find(p => p.status === "available");
    setCurrentPlayer(nextPlayer || null);
    setTimer(60);
    toast.success(`Player ${currentPlayer.name} sold for TK${currentPlayer.current_bid}!`);
  }, [currentPlayer, players]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (auctionStatus === "running" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && currentPlayer) {
      sellPlayer();
    }
    return () => clearInterval(interval);
  }, [auctionStatus, timer, currentPlayer, sellPlayer]);

  const startAuction = () => {
    if (players.length === 0) return toast.error("No players available");
    setAuctionStatus("running");
    setTimer(60);
    toast.success("Auction started!");
  };

  const pauseAuction = () => {
    setAuctionStatus("paused");
    toast.info("Auction paused");
  };

  const resumeAuction = () => {
    setAuctionStatus("running");
    toast.info("Auction resumed");
  };

  const endAuction = () => {
    setAuctionStatus("ended");
    toast.success("Auction ended!");
  };

  const placeBid = async (teamId: string, amount: number) => {
    if (auctionStatus !== "running") return toast.error("Auction not running");
    if (!currentPlayer) return;
    if (amount <= currentPlayer.current_bid) return toast.error("Bid must be higher than current");

    setCurrentPlayer({
      ...currentPlayer,
      current_bid: amount,
      bidding_team: teamId,
    });

    setTimer(60);
    toast.success(`Bid placed: ${amount} by ${teams.find(t => t.id === teamId)?.name}`);
  };

  

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "text-green-600";
      case "paused": return "text-yellow-600";
      case "ended": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const formatCurrency = (amount: number) => {
    return `TK${amount}`;
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "batsman": return "from-orange-500 to-red-500";
      case "bowler": return "from-blue-500 to-cyan-500";
      case "all-rounder": return "from-green-500 to-emerald-500";
      default: return "from-purple-500 to-pink-500";
    }
  };

  // Image component with error handling
  const PlayerImage = ({ player, size = "medium", className = "" }: { player: Player; size?: "small" | "medium" | "large"; className?: string }) => {
    const sizes = {
      small: "w-20 h-20",
      medium: "w-32 h-32",
      large: "w-48 h-48"
    };

    const getFallbackImage = (playerId: string) => {
      const fallbackMap: { [key: string]: string } = {
        "1": fallbackImages.durjoy,
        "2": fallbackImages.farhadul,
        "3": fallbackImages.toukir,
        "4": fallbackImages.shaid,
        "5": fallbackImages.hadi
      };
      return fallbackMap[playerId] || fallbackImages.durjoy;
    };

    return (
      <img 
        src={imageErrors.has(player.id) ? getFallbackImage(player.id) : player.image}
        alt={player.name}
        className={`${sizes[size]} rounded-2xl object-cover border-4 border-white shadow-lg ${className}`}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={async (e) => {
          // First try to fetch with auth/accept headers and use blob URL
          try {
            const el = e.currentTarget as HTMLImageElement;
            const { fetchImageAsObjectUrl } = await import('@/lib/api');
            const blobUrl = await fetchImageAsObjectUrl(el.src);
            if (blobUrl) { el.src = blobUrl; return; }
          } catch {/* fallthrough */}
          // If that fails, fall back to predefined local image
          handleImageError(player.id, getFallbackImage(player.id));
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 text-gray-900">
      {/* Enhanced Navbar */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg flex items-center justify-center">
                <img 
                  src={cplLogo} 
                  alt="CPL 2026 Logo" 
                  className="h-12 w-12 object-contain"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CSE PREMIER LEAGUE ELITE XI AUCTIONS
                </h1>
                <p className="text-xs text-gray-500 font-medium">CPL 2026 • PSTU</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center bg-white rounded-2xl p-3 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span className={`text-lg font-bold ${getStatusColor(auctionStatus)}`}>
                    {auctionStatus === "running" ? `${timer}s` : auctionStatus.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1 font-medium">Auction Timer</div>
              </div>
              
              <Button
                onClick={startAuction}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-6 py-3 shadow-lg"
              >
                <Play className="h-5 w-5 mr-2" /> Start Auction
              </Button>

              <Button
                variant="outline"
                onClick={logout}
                className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all font-medium"
              >
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Players</p>
                  <p className="text-2xl font-bold">{players.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Sold Players</p>
                  <p className="text-2xl font-bold">{players.filter(p => p.status === "sold").length}</p>
                </div>
                <Award className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-xl border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Values</p>
                  <p className="text-2xl font-bold">{formatCurrency(players.reduce((sum, p) => sum + p.current_bid, 0))}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Active Teams</p>
                  <p className="text-2xl font-bold">{teams.length}</p>
                </div>
                <Trophy className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-white rounded-2xl p-1 shadow-lg border border-gray-200 grid grid-cols-5 h-auto">
            {[
              { value: "live-auction", icon: Mic2, label: "Live Auction" },
              { value: "players", icon: Users, label: "Players" },
              { value: "teams", icon: Trophy, label: "Teams" },
              { value: "bids", icon: DollarSign, label: "Bids" },
              { value: "search", icon: Search, label: "Search" }
            ].map((tab) => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 px-3 py-3 rounded-xl transition-all duration-300 font-medium text-gray-600 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:shadow-lg border-0"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Live Auction Tab */}
          <TabsContent value="live-auction" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Player Card */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white border border-gray-200 shadow-2xl">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                    <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-lg">
                        <Hammer className="h-5 w-5 text-white" />
                      </div>
                      CURRENT PLAYER ON AUCTION
                      <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800">
                        BO: {players.findIndex(p => p.id === currentPlayer?.id) + 1 || 0}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {currentPlayer ? (
                      <div className="space-y-6">
                        {/* Enhanced Current Player Display with Image */}
                        <div className="flex flex-col lg:flex-row gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-gray-200">
                          {/* Player Image */}
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <PlayerImage player={currentPlayer} size="large" className="group-hover:scale-105 transition-transform duration-300" />
                              <div className={`absolute -top-2 -right-2 bg-gradient-to-r ${getRoleColor(currentPlayer.role)} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}>
                                {currentPlayer.role}
                              </div>
                              <div className="absolute -bottom-2 -left-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                {formatCurrency(currentPlayer.base_price)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Player Details */}
                          <div className="flex-1 space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-4xl font-bold text-gray-900">{currentPlayer.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm">
                                    {currentPlayer.role}
                                  </Badge>
                                  <span className="text-gray-600 text-sm font-medium">
                                    Base: {formatCurrency(currentPlayer.base_price)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right space-y-2">
                                <div className="text-5xl font-black text-green-600 animate-pulse">
                                  {formatCurrency(currentPlayer.current_bid)}
                                </div>
                                <p className="text-sm text-gray-600 font-medium">Current Bid</p>
                                {currentPlayer.bidding_team && (
                                  <Badge className="bg-green-600 text-white text-sm">
                                    {teams.find(t => t.id === currentPlayer.bidding_team)?.name}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Player Stats */}
                            {currentPlayer.stats && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded-xl border border-gray-200">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">{currentPlayer.stats.matches}</div>
                                  <div className="text-xs text-gray-500">Matches</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-600">{currentPlayer.stats.runs}</div>
                                  <div className="text-xs text-gray-500">Runs</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-purple-600">{currentPlayer.stats.wickets}</div>
                                  <div className="text-xs text-gray-500">Wickets</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-orange-600">{currentPlayer.stats.strike_rate}</div>
                                  <div className="text-xs text-gray-500">SR</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Team Bidding Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {teams.slice(0, 2).map((team) => (
                            <Card key={team.id} className="bg-white border border-gray-200 hover:border-blue-300 transition-all shadow-lg">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-gray-900">{team.name}</h4>
                                  <Crown className={`h-5 w-5 ${
                                    currentPlayer.bidding_team === team.id ? "text-yellow-500" : "text-gray-300"
                                  }`} />
                                </div>
                                <div className="space-y-2 text-sm mb-4">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Budget:</span>
                                    <span className="font-semibold">{formatCurrency(team.budget - team.spent)}</span>
                                  </div>
                                  <div className="flex justify-between text-gray-500">
                                    <span>Spent:</span>
                                    <span>{formatCurrency(team.spent)}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    placeholder="Enter bid..."
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(Number(e.target.value))}
                                    className="flex-1 bg-gray-50 border-gray-300 text-gray-900 font-medium"
                                    min={currentPlayer.current_bid + 1}
                                  />
                                  <Button
                                    onClick={() => placeBid(team.id, bidAmount)}
                                    disabled={bidAmount <= currentPlayer.current_bid || (team.budget - team.spent) < bidAmount}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold"
                                  >
                                    <Zap className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <Button 
                          onClick={sellPlayer}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 py-4 text-lg font-bold text-white shadow-xl"
                        >
                          <Gavel className="h-5 w-5 mr-2" />
                          SELL TO HIGHEST BIDDER
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🏏</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Player on Auction</h3>
                        <p className="text-gray-500">Start the auction to begin bidding</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Additional Teams */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams.slice(2, 4).map((team) => (
                    <Card key={team.id} className="bg-white border border-gray-200 hover:border-blue-300 transition-all shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">{team.name}</h4>
                          <Crown className={`h-5 w-5 ${
                            currentPlayer?.bidding_team === team.id ? "text-yellow-500" : "text-gray-300"
                          }`} />
                        </div>
                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Budget:</span>
                            <span className="font-semibold">{formatCurrency(team.budget - team.spent)}</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Spent:</span>
                            <span>{formatCurrency(team.spent)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Enter bid..."
                            value={bidAmount}
                            onChange={(e) => setBidAmount(Number(e.target.value))}
                            className="flex-1 bg-gray-50 border-gray-300 text-gray-900 font-medium"
                            min={currentPlayer ? currentPlayer.current_bid + 1 : 0}
                          />
                          <Button
                            onClick={() => placeBid(team.id, bidAmount)}
                            disabled={!currentPlayer || bidAmount <= (currentPlayer?.current_bid || 0) || (team.budget - team.spent) < bidAmount}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold"
                          >
                            <Zap className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Live Bidding Feed */}
              <Card className="bg-white border border-gray-200 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    LIVE BIDDING FEED
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {[
                      { player: "Durjoy Das", amount: "1000", team: "CSIT" },
                      { player: "Farhadul Hauque Fuad", amount: "500", team: "CCE" },
                      { player: "Toukir Ahmed", amount: "1500", team: "PME" },
                      { player: "shaid Mehraj", amount: "1000", team: "EEE" },
                      { player: "Md Hadi", amount: "500", team: "Mathematics" },
                    ].map((bid, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:bg-blue-50 transition-all">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">{bid.player}</span>
                          <span className="text-sm text-gray-600 ml-2">→ {bid.team}</span>
                        </div>
                        <span className="text-sm font-bold text-green-600">{bid.amount}</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs border-0">LIVE</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Upcoming Players with Images */}
            <Card className="bg-white border border-gray-200 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Users className="h-5 w-5 text-blue-600" />
                  UPCOMING PLAYERS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {players.filter(p => p.status === "available").slice(0, 4).map((player) => (
                    <div 
                      key={player.id} 
                      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border border-gray-200 hover:border-blue-300 transition-all shadow-lg hover:shadow-xl cursor-pointer group"
                      onClick={() => setCurrentPlayer(player)}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        {/* Player Image */}
                        <div className="relative">
                          <PlayerImage player={player} size="small" className="group-hover:scale-110 transition-transform duration-300" />
                          <div className={`absolute -bottom-1 -right-1 bg-gradient-to-r ${getRoleColor(player.role)} text-white px-2 py-1 rounded-full text-xs font-bold`}>
                            {player.role.charAt(0)}
                          </div>
                        </div>
                        
                        {/* Player Info */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900 text-lg">{player.name}</h4>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {player.role}
                          </Badge>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Base:</span>
                            <span className="font-bold text-green-600">{formatCurrency(player.base_price)}</span>
                          </div>
                          
                          {player.stats && (
                            <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                              <div className="text-center">
                                <Activity className="h-3 w-3 mx-auto mb-1" />
                                <div>{player.stats.matches}M</div>
                              </div>
                              <div className="text-center">
                                <TrendingUp className="h-3 w-3 mx-auto mb-1" />
                                <div>{player.stats.runs}R</div>
                              </div>
                              <div className="text-center">
                                <Zap className="h-3 w-3 mx-auto mb-1" />
                                <div>{player.stats.wickets}W</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Players Tab - Updated with Images */}
          <TabsContent value="players" className="mt-6">
            <Card className="bg-white border border-gray-200 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Users className="h-5 w-5 text-blue-600" />
                  PLAYER ROSTER
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 hover:bg-gray-50">
                        <TableHead className="text-gray-900 font-bold">Player</TableHead>
                        <TableHead className="text-gray-900 font-bold">Role</TableHead>
                        <TableHead className="text-gray-900 font-bold">Base Price</TableHead>
                        <TableHead className="text-gray-900 font-bold">Current Bid</TableHead>
                        <TableHead className="text-gray-900 font-bold">Status</TableHead>
                        <TableHead className="text-gray-900 font-bold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPlayers.map((player) => (
                        <TableRow key={player.id} className="border-gray-200 hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <PlayerImage player={player} size="small" className="w-10 h-10" />
                              <span className="font-semibold text-gray-900">{player.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {player.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(player.base_price)}</TableCell>
                          <TableCell>
                            <span className={player.current_bid > player.base_price ? "text-green-600 font-bold" : "text-gray-600 font-medium"}>
                              {formatCurrency(player.current_bid)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                player.status === "sold" ? "bg-green-600 text-white" : 
                                player.status === "reserved" ? "bg-yellow-500 text-white" : "bg-blue-600 text-white"
                              }
                            >
                              {player.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setCurrentPlayer(player)}
                              disabled={player.status === "sold"}
                              className="border-blue-500 text-blue-600 hover:bg-blue-50 font-medium"
                            >
                              Set Current
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="mt-6">
            <Card className="bg-white border border-gray-200 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  TEAM MANAGEMENT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teams.map((team) => {
                    const remaining = team.budget - team.spent;
                    const percentage = (team.spent / team.budget) * 100;
                    
                    return (
                      <Card key={team.id} className="bg-white border border-gray-200 hover:shadow-xl transition-all">
                        <CardHeader className={`bg-gradient-to-r ${team.color} text-white rounded-t-lg p-4`}>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Trophy className="h-5 w-5" />
                            {team.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Total Budget:</span>
                              <span className="font-semibold text-gray-900">{formatCurrency(team.budget)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Amount Spent:</span>
                              <span className="text-red-600 font-semibold">{formatCurrency(team.spent)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold">
                              <span className="text-gray-600">Remaining:</span>
                              <span className={remaining > 0 ? "text-green-600" : "text-red-600"}>
                                {formatCurrency(remaining)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Budget Usage</span>
                              <span>{percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  percentage > 90 ? "bg-red-500" : 
                                  percentage > 70 ? "bg-yellow-500" : "bg-green-500"
                                }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bids History Tab */}
          <TabsContent value="bids" className="mt-6">
            <Card className="bg-white border border-gray-200 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  BIDS HISTORY
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Bid History Dashboard</h3>
                  <p className="text-gray-500 mb-8">All bidding activity will be displayed here in real-time</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">24</div>
                      <div className="text-sm text-blue-700 font-medium">Total Bids</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                      <div className="text-2xl font-bold text-green-600">TK{players.reduce((sum, p) => sum + p.current_bid, 0)}</div>
                      <div className="text-sm text-green-700 font-medium">Total Value</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600">{players.filter(p => p.status === "sold").length}</div>
                      <div className="text-sm text-purple-700 font-medium">Players Sold</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="mt-6">
            <Card className="bg-white border border-gray-200 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Search className="h-5 w-5 text-purple-600" />
                  ADVANCED SEARCH
                </CardTitle>
                <CardDescription>Search players by name, role, or status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      placeholder="Search players by name or role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 bg-white border-gray-300 text-gray-900 font-medium"
                    />
                    <Select defaultValue="all">
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 w-full sm:w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {searchTerm && (
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4 text-lg">Search Results ({filteredPlayers.length})</h4>
                      <div className="space-y-3">
                        {filteredPlayers.slice(0, 5).map((player) => (
                          <div key={player.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3">
                              <PlayerImage player={player} size="small" className="w-12 h-12" />
                              <div>
                                <span className="font-medium text-gray-900">{player.name}</span>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 ml-2">
                                  {player.role}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-green-600 font-bold">{formatCurrency(player.current_bid)}</span>
                              <div className="text-xs text-gray-500">Base: {formatCurrency(player.base_price)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminAuction;