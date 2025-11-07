import React, { useEffect, useRef, useState } from "react";
import { AuthContext, AuthContextValue, User, Credentials } from './auth-shared';
import { login as apiLogin, registerUser as apiRegister, getAuthToken, fetchCurrentPlayerProfile, setGlobalLogoutHandler, clearAuthTokens } from "@/lib/api";

const STORAGE_USERS = "cpl_users";
const STORAGE_CURRENT = "cpl_current_user";
// API-based auth provider using token endpoint and localStorage persistence.

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(STORAGE_CURRENT);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  });

  // On mount: if a token exists and a user is saved, we're logged in.
  const hydratedRef = useRef(false);
  useEffect(() => {
    const tok = getAuthToken();
    if (!tok || hydratedRef.current) return; // keep any existing user from localStorage
    hydratedRef.current = true;
    // Fetch and hydrate profile info if available
    (async () => {
      try {
        const prof = await fetchCurrentPlayerProfile();
        if (!prof) return;
        // Read existing persisted user to avoid dependency on state and re-render loops
        let existing: User | null = null;
        try {
          const raw = localStorage.getItem(STORAGE_CURRENT);
          existing = raw ? (JSON.parse(raw) as User) : null;
        } catch { /* ignore */ }
        const base: User = existing || { name: 'User', email: '' };
        // Prefer locally saved values for user-editable fields (name, avatar, category)
        // so that a refresh doesn't overwrite changes when the backend doesn't persist them yet.
        const rawAvatar = base.avatar ?? prof.avatarUrl ?? null;
        let finalAvatar: string | null = null;
        if (rawAvatar) {
          if (/^https?:\/\//i.test(String(rawAvatar))) finalAvatar = String(rawAvatar);
          else {
            try {
              const { resolveProfileImageUrl } = await import("@/lib/api");
              finalAvatar = resolveProfileImageUrl(String(rawAvatar));
            } catch { finalAvatar = String(rawAvatar); }
          }
        }
        const merged: User = {
          ...base,
          name: base.name || prof.name || 'User',
          avatar: finalAvatar,
          category: base.category ?? prof.category,
          // Always refresh stats from server when available
          runs: prof.runs,
          battingStrikeRate: prof.batting_strike_rate,
          wickets: prof.wickets,
          bowlingStrikeRate: prof.bowling_strike_rate,
          oversBowled: prof.overs_bowled,
          totalRunsConceded: prof.total_runs_conceded,
        };
        persistCurrent(merged);
      } catch (_) {
        // ignore
      }
    })();
  }, []);

  const persistCurrent = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_CURRENT, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_CURRENT);
  };

  // For now, avatar uploads are not handled here; use player profile image API separately if needed.

  const ACCESS_TOKEN_KEY = "cpl_access_token";
  const login = async ({ email, password }: Credentials) => {
    // Backend expects OAuth2 username/password; we use email as username.
    const res = await apiLogin(email, password);
    // Persist token
    localStorage.setItem(ACCESS_TOKEN_KEY, res.access_token);
    // Try to fetch profile after login
    try {
      const prof = await fetchCurrentPlayerProfile();
      if (prof) {
        const u: User = {
          name: prof.name || email.split('@')[0] || 'User',
          email,
          avatar: prof.avatarUrl || null,
          category: prof.category,
          runs: prof.runs,
          battingStrikeRate: prof.batting_strike_rate,
          wickets: prof.wickets,
          bowlingStrikeRate: prof.bowling_strike_rate,
          oversBowled: prof.overs_bowled,
          totalRunsConceded: prof.total_runs_conceded,
        };
        persistCurrent(u);
        return u;
      }
    } catch (_) { /* ignore and fallback */ }
    const fallback: User = { name: email.split('@')[0] || 'User', email };
    persistCurrent(fallback);
    return fallback;
  };

  const register = async ({ name, email, password, category }: { name: string; email: string; password: string; category: string }) => {
    const payload: Record<string, unknown> = { name, email, password, category };
    await apiRegister(payload);
    const u = await login({ email, password });
    return u;
  };

  const logout = async () => {
    try {
      clearAuthTokens();
    } finally {
      persistCurrent(null);
    }
  };

  // Set up global logout handler for session expiry
  useEffect(() => {
    setGlobalLogoutHandler(() => {
      persistCurrent(null);
      // Redirect to login page if we're in a protected route
      if (window.location.pathname !== '/auth' && !window.location.pathname.startsWith('/admin')) {
        window.location.href = '/auth';
      }
    });

    // Listen for session expiry from BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('auth-updates');
      bc.onmessage = (ev: MessageEvent) => {
        if (ev.data?.type === 'session-expired') {
          logout();
        }
      };
    } catch {}

    return () => {
      try { bc?.close(); } catch {}
    };
  }, []);

  const updateUser = async (patch: Partial<User>) => {
    // Without a dedicated profile API, update only local state for now.
    if (!user) throw new Error('Not authenticated');
    const merged = { ...user, ...patch } as User;
    persistCurrent(merged);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>{children}</AuthContext.Provider>
  );
};

// hook exported from a separate module to avoid fast-refresh warnings
