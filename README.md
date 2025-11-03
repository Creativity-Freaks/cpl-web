## CPL-PSTU Webapp

A React + TypeScript + Tailwind CSS single-page app for CSE Premier League (CPL) at PSTU. It includes a public site with dynamic sections and a simple role-based authentication demo with protected Admin and Player dashboards.

### Tech

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui components (Radix UI)
- React Router v6
- TanStack Query (ready for data fetching)

### Features

- Public pages
  - Home: Hero, About, Stats (count), Tournament teaser, Gallery (video + image), Testimonials, Sponsors, FAQ, Contact, Footer
  - About, Team, Tournament, Gallery, Contact
- Auth and roles (mock/demo)
  - Login (no role selection; admin inferred by email)
  - Registration (always Player)
  - Role-based protected routes
  - Admin Dashboard and Player Dashboard
  - Hidden Auction page (admin-only, not in navbar)

### Routes

- `/` Home
- `/about`, `/team`, `/tournament`, `/gallery`, `/contact`
- `/auth` Auth (Login/Register tabs)
- `/login` -> redirects to `/auth?tab=login`
- `/register` -> redirects to `/auth?tab=register`
- `/dashboard` Player Dashboard (protected)
- `/admin` Admin Dashboard (admin-only)
- `/admin/auction` Auction (admin-only, hidden from navbar)

### Quick start

1. Install dependencies (npm, pnpm, yarn, or bun):

```sh
# using npm
npm install

# or using bun
bun install
```

2. Start the dev server:

```sh
npm run dev
```

3. Open the app at the printed local URL (typically http://localhost:5173).

### Auth demo

This project ships with a lightweight, client-side mock auth:

Role access:

- Admin is determined by allowed admin emails (see `src/config/auth.ts`) or your backend logic.

### Auth

Two modes are supported:

1. Simple client-only mode (no backend):

- Configure env vars in your `.env` file:
  - `VITE_ADMIN_EMAILS` (comma-separated) or `VITE_ADMIN_EMAIL`
  - `VITE_ADMIN_PASSWORD` (shared admin password)
- When `VITE_ADMIN_PASSWORD` is set, the app bypasses Supabase and stores sessions in localStorage.
- Login: users enter email/password; if email is admin and password matches `VITE_ADMIN_PASSWORD`, role is admin; otherwise player.

2. Supabase mode:

- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Email/password auth with profile upsert and optional avatar upload to `avatars` bucket.

### Notes and next steps

Role access:

- Player: can open `/dashboard`
- Add forms and flows for team registration and tournament management.
- Add tests and CI.

### License

MIT
