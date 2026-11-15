import { supabase } from '@/lib/supabaseClient'

// All Supabase Auth calls live here. Passwords are only passed straight to Supabase and are never stored.

export async function signInWithPassword(email, password) {
  if (!supabase) throw new Error('not-configured')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

// Returns a function that stops listening. The callback must only set state (no Supabase calls inside it).
export function onAuthChange(callback) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange(callback)
  return () => data.subscription.unsubscribe()
}

// AUTHORIZATION CHECK: is this user listed in public.admin_users (column user_id)?
// The database enforces this too: RLS only lets a logged-in user read THEIR OWN row,
// and it evaluates the request's login token on the server, so a forged or expired
// token cannot pass. The frontend check below is only for showing the right screen.
export async function fetchIsAdmin(userId) {
  if (!supabase) throw new Error('not-configured')
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data?.user_id === userId
}
