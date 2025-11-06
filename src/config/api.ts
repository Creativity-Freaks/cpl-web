// Central API configuration
// Change only API_BASE to point to your backend. Keep it without trailing slash.
export const API_BASE = "https://club.cse.pstu.ac.bd:2125";

// FastAPI default OAuth2PasswordRequestForm token route is usually "/token".
// If your backend exposes a different path, change it here once.
// OAuth2 token endpoint (FastAPI default is usually /token, but backend exposes /api/v1/token)
export const LOGIN_URL = "/api/v1/token";

// Small utility to safely join base + path (avoids double slashes)
export function buildUrl(path: string): string {
  if (!path) return API_BASE;
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}