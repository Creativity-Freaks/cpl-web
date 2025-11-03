#!/usr/bin/env node
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Lightweight .env parser so this script has zero runtime deps
function loadDotEnv(path = '.env') {
  try {
    const raw = readFileSync(path, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch (err) {
    // ignore if file not present
  }
}

loadDotEnv();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment (.env).');
  process.exit(2);
}

const supabase = createClient(url, key);

async function main() {
  try {
    console.log('Checking Supabase connectivity...');
    // Basic read against `profiles` to see if the DB is reachable and public selects are allowed
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.error('Error querying `profiles` table:', error.message || error);
      process.exit(3);
    }
    console.log('profiles query OK — rows returned:', Array.isArray(data) ? data.length : 0);

    // Check auth session endpoint (will be empty without a signed-in user)
    const { data: sessionData, error: sErr } = await supabase.auth.getSession();
    if (sErr) console.warn('auth.getSession warning:', sErr.message || sErr);
    else console.log('auth.getSession ok — session present?', !!sessionData.session);

    console.log('Supabase connectivity check passed.');
  } catch (err) {
    console.error('Unexpected error while checking Supabase:', err);
    process.exit(4);
  }
}

main();
