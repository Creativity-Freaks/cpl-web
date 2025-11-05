import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Check, DollarSign } from 'lucide-react';

// --- CONFIG ---
import { API_BASE, buildUrl } from '../config/api';
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
  put: (url: string, data: any) => api.request(url, { method: "PUT", body: JSON.stringify(data) }),
};

// --- UI COMPONENTS --- (unchanged for brevity)
const Button = ({ children, variant = 'primary', className = '', size = 'md', ...p }: any) => {
  const v = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200',
    secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300 hover:border-gray-400 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200',
    success: 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200',
  };
  const s = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  return (
    <button 
      className={`rounded-xl font-semibold ${v[variant]} ${s[size]} ${className} focus:outline-none focus:ring-4 focus:ring-opacity-50`} 
      {...p}
    >
      {children}
    </button>
  );
};

const Input = ({ label, error, icon: Icon, ...p }: any) => (
  <div className="relative">
    {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />}
      <input 
        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-200 bg-white shadow-inner ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 hover:border-gray-300'
        }`} 
        {...p} 
      />
    </div>
    {error && <p className="text-red-500 text-sm mt-1 flex items-center"><Check className="w-3 h-3 mr-1" /> {error}</p>}
  </div>
);

const SelectCustom = ({ label, value, onChange, options, error, placeholder = "Select an option" }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt: any) => opt.value === value);

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div 
        className={`w-full p-3 border-2 rounded-xl cursor-pointer hover:border-blue-500 transition-all duration-200 bg-white shadow-inner flex justify-between items-center ${
          error ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
        } focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-200`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-700">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
          {options.map((opt: any) => (
            <div
              key={opt.value}
              className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors duration-150 flex items-center ${
                value === opt.value ? 'bg-blue-100 text-blue-700 font-semibold' : ''
              }`}
              onClick={() => {
                onChange({ target: { name: 'start_players', value: opt.value } } as React.ChangeEvent<HTMLSelectElement>);
                setIsOpen(false);
              }}
            >
              <span className="mr-2">{opt.label}</span>
              {value === opt.value && <Check className="w-4 h-4 text-green-500" />}
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-1 flex items-center"><Check className="w-3 h-3 mr-1" /> {error}</p>}
    </div>
  );
};

// Updated interface: Accept player for backward compat, but prioritize auctionPlayerId if passed
interface AdminPlayerUpdateInfoProps {
  player?: any;  // Optional for name display, etc.
  auctionPlayerId?: number;  // Direct auction_player_id (preferred)
  onClose: () => void;
  onUpdate?: (updatedData: any) => void;
}

export const AdminPlayerUpdateInfo: React.FC<AdminPlayerUpdateInfoProps> = ({ player, auctionPlayerId: propAuctionPlayerId, onClose, onUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);

  // Determine auctionPlayerId: Prefer prop, fallback to player.auction_player_id or player.id
  const auctionPlayerId = propAuctionPlayerId || player?.auction_player_id || player?.id;
  console.log('Debug - Player object:', player);  // Log to check structure
  console.log('Debug - Using auctionPlayerId:', auctionPlayerId);  // Log the ID used

  // Form state for the two fields only
  const [formData, setFormData] = useState({
    base_price: '',
    start_players: '',
  });

  // Setup broadcast channel for cross-tab communication
  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel('auction-updates');
      // Listen for refresh requests - form doesn't need to refresh, but we can listen for updates
      bcRef.current.onmessage = (ev: MessageEvent) => {
        const data = ev.data;
        // If player data is updated elsewhere, we could refresh here silently
        // But for a form, we typically don't auto-refresh to avoid losing user input
      };
    } catch {}
    return () => {
      try {
        if (bcRef.current) {
          bcRef.current.close();
        }
      } catch {}
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
    let name: string;
    let value: string;

    if ('target' in e && 'name' in e.target && 'value' in e.target) {
      name = e.target.name;
      value = e.target.value;
    } else {
      name = e.target.name;
      value = e.target.value;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleUpdate = async () => {
    if (!formData.base_price || !formData.start_players) {
      setError("Base Price and Start Player are required");
      return;
    }

    if (!auctionPlayerId) {
      setError("Invalid auction player ID - check data");
      return;
    }

    setUpdating(true);
    try {
      // Hit the specific PUT endpoint - base_price as STRING per schema
      const dataToSend = {
        base_price: formData.base_price.toString(),  // Convert to string
        start_players: formData.start_players,
      };
      console.log('Debug - Sending data:', dataToSend, 'to ID:', auctionPlayerId);  // Log payload
      await api.put(`/api/v1/admin/auction/prepared-player/${auctionPlayerId}`, dataToSend);
      
      // Broadcast refresh to other tabs/windows
      try {
        bcRef.current?.postMessage({ type: 'refresh', section: 'auction-players' });
      } catch {}
      
      // Success: Notify parent
      const updatedData = { ...formData, auction_player_id: auctionPlayerId };
      if (onUpdate) {
        onUpdate(updatedData);
      }
      onClose();
    } catch (err: any) {
      console.error('Update error:', err);  // Log full error
      setError("Update failed: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (!auctionPlayerId) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600">No valid auction player ID found. Check console logs.</p>
          <Button onClick={onClose} variant="secondary" className="mt-4 w-full">Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="w-full h-full bg-white rounded-2xl shadow-2xl m-4 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Prepare Player for Auction</h2>
            <p className="text-blue-100 mt-1">Set base price and starting position for {player?.name || 'Player'}</p>
          </div>
          <button 
            onClick={onClose} 
            className="bg-white bg-opacity-20 p-2 rounded-xl hover:bg-opacity-30 transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8 flex-1 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-6">
            {/* Decorative Element */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold">🏆</span>
              </div>
              <p className="text-gray-500 mt-2">Auction Preparation</p>
            </div>

            {/* Base Price Field */}
            <Input
              label="Base Price (BDT)"
              name="base_price"
              type="number"
              value={formData.base_price}
              onChange={handleInputChange as React.ChangeEventHandler<HTMLInputElement>}
              placeholder="Enter base price"
              icon={DollarSign}
              error={error && !formData.base_price ? "Base price is required" : null}
              min="0"
              step="0.01"
            />

            {/* Start Players Select */}
            <SelectCustom
              label="Start Player Position"
              name="start_players"
              value={formData.start_players}
              onChange={handleInputChange}
              options={[
                { value: 'A', label: 'Elite' },
                { value: 'B', label: 'Platinum' },
                { value: 'C', label: 'Diamond' },
                { value: 'D', label: 'Gold-1' },
                { value: 'E', label: 'Gold-2' },
                { value: 'F', label: 'Silver-1' },
                { value: 'G', label: 'Silver-2' },
                { value: 'H', label: 'Bronze-1' },
                { value: 'I', label: 'Bronze-2' },
                { value: 'J', label: 'Titanium-1' },
                { value: 'K', label: 'Titanium-2' },

                
              ]}
              error={error && !formData.start_players ? "Start player position is required" : null}
              placeholder="Select Platinum, Diamond, ..."
            />

            {/* Error Display */}
            {error && !updating && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm flex items-center justify-center">
                  <Check className="w-4 h-4 mr-2" /> {error}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleUpdate} 
                variant="success" 
                size="lg" 
                className="flex-1" 
                disabled={updating || !formData.base_price || !formData.start_players}
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Preparing...
                  </>
                ) : (
                  'Preview and Update'
                )}
              </Button>
              <Button variant="secondary" size="lg" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 rounded-b-2xl text-center text-sm text-gray-500">
          Securely preparing player for auction
        </div>
      </div>
    </div>
  );
};