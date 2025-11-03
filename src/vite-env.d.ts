/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_SUPABASE_URL?: string
	readonly VITE_SUPABASE_ANON_KEY?: string
	readonly VITE_ADMIN_EMAILS?: string
	readonly VITE_ADMIN_EMAIL?: string
	readonly VITE_ADMIN_PASSWORD?: string
	readonly VITE_ADMIN_DOMAIN?: string
	readonly VITE_SIMPLE_AUTH?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
