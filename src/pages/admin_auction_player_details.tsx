// src/pages/admin_auction_player_details.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Star, Trophy, Calendar, Award } from 'lucide-react';
import { buildUrl } from '../config/api';

const API_BASE = ""; // Prefer buildUrl for environment-aware base

interface PlayerDetails {
  name: string;
  image: string;
  basePrice: string;
  category: string;
  session: string;
  bestPerformance: string;
  battingStyle?: string;
  bowlingStyle?: string;
  age: string;
  nationality: string;
  rating: string;
}

interface AdminAuctionPlayerDetailsProps {
  playerId?: string;
  onClose?: () => void;
}

export const AdminAuctionPlayerDetails: React.FC<AdminAuctionPlayerDetailsProps> = ({ playerId, onClose }) => {
  const navigate = useNavigate();
  const params = useParams();
  const effectivePlayerId = playerId || (params.playerId as string | undefined) || '';
  const [details, setDetails] = useState<PlayerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("auth_token");
        
        // Fetch all players since single endpoint returns 404
  const response = await fetch(buildUrl(`/api/v1/adminall/players`), {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch players: ${response.statusText}`);
        }

        const allPlayers = await response.json();
        
        // Find the specific player by ID
        const playerData = Array.isArray(allPlayers) ? allPlayers.find((p: any) => p.id === parseInt(effectivePlayerId)) : null;
        
        if (!playerData) {
          throw new Error("Player not found in the list");
        }

        // Map to details interface; use available fields, fallback for missing ones
        // Build robust image URL from filename only
        const photoUrl: string | null = playerData.photo_url && playerData.photo_url !== 'null' ? String(playerData.photo_url) : null;
        const filename = photoUrl ? String(photoUrl).split(/[/\\]/).pop() : null;
        const imageUrl = filename ? buildUrl(`/api/v1/player/profile/${filename}`) : 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=400&h=400&fit=crop&crop=face';
        setDetails({
          name: playerData.name || 'Unknown Player',
          image: imageUrl,
          basePrice: playerData.base_price || '$0', // Assume field; adjust if different
          category: playerData.category || 'Unknown',
          session: playerData.session || '2026', // Assume field
          bestPerformance: playerData.best_performance || 'No data available', // Assume field
          // battingStyle: playerData.batting_style || 'N/A',
          // bowlingStyle: playerData.bowling_style || 'N/A',
          age: playerData.age ? playerData.age.toString() : 'N/A',
          nationality: playerData.nationality || 'Bangladesh',
          rating: playerData.rating ? playerData.rating.toString() : '4.0',
        });
      } catch (err: any) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (effectivePlayerId) {
      fetchPlayerDetails();
    }
  }, [effectivePlayerId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center z-50">
        <div className="text-white text-xl">Loading player details...</div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center z-50">
        <div className="bg-red-500 text-white p-4 rounded-lg max-w-md text-center">
          <h3 className="text-lg font-bold mb-2">Error Loading Details</h3>
          <p>{error || 'Player details not available'}</p>
          <button 
            onClick={() => {
              if (onClose) return onClose();
              navigate(-1);
            }} 
            className="mt-4 bg-white text-red-500 px-4 py-2 rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 z-50 overflow-y-auto p-4 md:p-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Close Button */}
      <button
        onClick={() => {
          if (onClose) return onClose();
          navigate(-1);
        }}
        className="fixed top-6 right-6 p-3 rounded-full bg-white/10 backdrop-blur-lg shadow-2xl hover:shadow-red-500/30 transition-all hover:scale-110 z-50 border border-white/20 hover:border-red-400 group"
      >
        <X className="h-7 w-7 text-white group-hover:text-red-300 transition-colors" />
      </button>

      {/* Main Content Card */}
      <div className="w-full max-w-6xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20 transform transition-all duration-500 hover:scale-[1.02] max-h-[95vh] overflow-y-auto">
        {/* Compact Header Section - Always visible at top */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-red-600 via-yellow-500 to-orange-500 text-white p-4 overflow-hidden bg-opacity-95 backdrop-blur-sm">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
          
          {/* LIVE Badge */}
          <div className="absolute top-3 left-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
              <span className="text-xs font-semibold">LIVE</span>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-2xl text-center px-4">
              {details.name}
            </h1>
          </div>
        </div>

        {/* Body - Image with Right Side Information */}
        <div className="p-4 sm:p-6 md:p-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
            {/* Large Image - Responsive sizing */}
            <div className="w-full lg:w-3/5 flex justify-center lg:justify-start">
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-[500px] aspect-square max-h-[40vh] lg:max-h-[500px]">
                <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 relative group">
                  <img
                    src={details.image}
                    alt={details.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onError={async (e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      try {
                        const { fetchImageAsObjectUrl } = await import('@/lib/api');
                        const blob = await fetchImageAsObjectUrl(el.src);
                        if (blob) { el.src = blob; return; }
                      } catch {/* ignore */}
                      el.src = 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=400&h=400&fit=crop&crop=face';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Floating Stats Badges - Adjusted for small screens */}
                <div className="absolute -top-2 -left-2 sm:-top-4 sm:-left-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-2xl shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform text-xs sm:text-sm">
                  <div className="text-center">
                    <p className="font-semibold">Base Price</p>
                    <p className="text-lg sm:text-2xl font-bold">{details.basePrice}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Information - Smaller Text */}
            <div className="w-full lg:w-2/5 space-y-4 sm:space-y-6 flex-shrink-0">
              {/* Category */}
              <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-white/20 hover:border-yellow-400/50 transition-all group">
                <div className="flex items-center gap-3">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-300 truncate">Category</p>
                    <p className="text-base sm:text-lg font-bold text-white truncate">{details.category}</p>
                  </div>
                </div>
              </div>

              {/* Session */}
              <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-white/20 hover:border-green-400/50 transition-all group">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-300 truncate">Session</p>
                    <p className="text-base sm:text-lg font-bold text-white truncate">{details.session}</p>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-white/20 hover:border-red-400/50 transition-all group">
                <div className="flex items-center gap-3">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-300 truncate">Best Performance</p>
                    <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">{details.bestPerformance}</p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-white/20 hover:border-blue-400/50 transition-all group">
                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-300 truncate">Player Rating</p>
                    <div className="flex items-center gap-2">
                      <p className="text-base sm:text-lg font-bold text-white">{details.rating}</p>
                      <span className="text-xs sm:text-sm text-gray-300">/5.0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Stats if available */}
              {details.battingStyle && (
                <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-white/20 hover:border-purple-400/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-300 truncate">Batting Style</p>
                      <p className="text-base sm:text-lg font-bold text-white truncate">{details.battingStyle}</p>
                    </div>
                  </div>
                </div>
              )}

              {details.bowlingStyle && details.bowlingStyle !== 'N/A' && (
                <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-white/20 hover:border-indigo-400/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-300 truncate">Bowling Style</p>
                      <p className="text-base sm:text-lg font-bold text-white truncate">{details.bowlingStyle}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bid Action Button */}
              <div className="mt-4 sm:mt-6">
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-2xl text-sm sm:text-lg font-bold shadow-2xl transform hover:scale-105 transition-all duration-300 border border-green-400/30 hover:shadow-green-500/40">
                  PLACE BID NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};