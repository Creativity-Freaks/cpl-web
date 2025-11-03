import React, { useEffect, useState } from "react";
import { AuthContext, AuthContextValue, User, Credentials } from './auth-shared';
import { login as apiLogin, registerUser as apiRegister, getAuthToken } from "@/lib/api";

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
  useEffect(() => {
    const tok = getAuthToken();
    if (!tok) return; // keep any existing user from localStorage
    // Optionally, we could decode JWT or fetch profile if backend provides it.
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
    // Minimal user shape; extend if your backend provides profile fetch.
    const u: User = { name: email.split('@')[0] || 'User', email };
    persistCurrent(u);
    return u;
  };

  const register = async ({ name, email, password, category, avatar }: { name: string; email: string; password: string; category: string; avatar?: string }) => {
    const payload: Record<string, unknown> = { name, email, password, category, avatar };
    await apiRegister(payload);
    const u = await login({ email, password });
    return u;
  };

  const logout = async () => {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    } finally {
      persistCurrent(null);
    }
  };

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
