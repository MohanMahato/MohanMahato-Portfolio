import { createClient } from '@supabase/supabase-js'
import { looksLikeSecretKey } from './keyGuard'

const url = import.meta.env.VITE_SUPABASE_URL
// New projects use the "publishable" key. Older projects call the same thing the "anon" key.
const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

// Refuse to start if someone pasted a SECRET key here.
const unsafeKey = looksLikeSecretKey(publicKey)
if (unsafeKey) {
  console.error('[Supabase] A SECRET key was found in the frontend settings. It was NOT used. Use the publishable key.')
}

// True only when URL + a safe public key exist in your .env file.
export const isSupabaseConfigured = Boolean(url && publicKey && url.startsWith('https://') && !unsafeKey)

// Security comes from RLS rules in the database, not from hiding this key.
export const supabase = isSupabaseConfigured
  ? createClient(url, publicKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null

if (!isSupabaseConfigured && !unsafeKey && import.meta.env.DEV) {
  console.warn('[Supabase] Not configured. Copy .env.example to .env and add your keys.')
}
