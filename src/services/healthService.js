import { supabase } from '@/lib/supabaseClient'

// Checks that the browser can reach Supabase AND that the Phase 3 migrations were applied.
export async function checkDatabase() {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.from('website_settings').select('id').limit(1)
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    throw new Error('Connected, but no data found. Run all 6 SQL migrations (see docs/SUPABASE_SETUP.md).')
  }
  return true
}
