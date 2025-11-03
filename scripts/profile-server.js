#!/usr/bin/env node
/**
 * Simple profile creation server that uses the Supabase service role key to
 * upsert profiles and upload avatars. This avoids row-level security issues
 * when creating profiles from the client.
 *
 * Usage (locally):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/profile-server.js
 *
 * Install dependencies: npm install express @supabase/supabase-js
 */

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env variables');
  process.exit(1);
}

const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const app = express();
app.use(express.json({ limit: '10mb' }));

const DEFAULT_BUCKET = process.env.SUPABASE_AVATAR_BUCKET || process.env.SUPABASE_BUCKET || 'avatars';

function dataUrlToBuffer(dataUrl) {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) return null;
  const mime = matches[1];
  const b64 = matches[2];
  const buffer = Buffer.from(b64, 'base64');
  return { buffer, mime };
}

app.post('/api/create-profile', async (req, res) => {
  try {
    const body = req.body || {};
    const { id, name, email, role = 'player', session, player_type, semester, payment_method, payment_number, transaction_id, avatar } = body;
    if (!id || !email) return res.status(400).json({ error: 'missing id or email' });

    let avatar_url = null;
    if (avatar && typeof avatar === 'string' && avatar.startsWith('data:')) {
      const parsed = dataUrlToBuffer(avatar);
      if (parsed) {
        const ext = (parsed.mime.split('/')[1] || 'png').replace(/[^a-z0-9]/gi, '');
  // Do not include the bucket name in the object path. The bucket is
  // specified separately when calling storage.from(bucket). Use a
  // per-user folder so storage policies (which check the object name
  // prefix) can be enforced.
  const filename = `${id}/${Date.now()}.${ext}`;
        // upload buffer to storage
        const { error: upErr } = await svc.storage.from(DEFAULT_BUCKET).upload(filename, parsed.buffer, { upsert: true, contentType: parsed.mime });
        if (upErr) {
          console.error('Avatar upload failed', upErr);
        } else {
          const { data: urlData } = svc.storage.from(DEFAULT_BUCKET).getPublicUrl(filename);
          avatar_url = urlData?.publicUrl || null;
        }
      }
    }

    const profile = {
      id,
      name,
      email,
      role,
      avatar_url: avatar_url || null,
      session: session || null,
      player_type: player_type || null,
      semester: semester || null,
      payment_method: payment_method || null,
      payment_number: payment_number || null,
      transaction_id: transaction_id || null,
    };

    const { data, error } = await svc.from('profiles').upsert(profile).select().maybeSingle();
    if (error) {
      console.error('Failed to upsert profile', error);
      return res.status(500).json({ error });
    }

    return res.status(200).json({ profile: data });
  } catch (err) {
    console.error('Unexpected error in create-profile', err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`Profile server listening on http://localhost:${port}`));
