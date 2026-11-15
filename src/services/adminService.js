import { supabase } from '@/lib/supabaseClient'

// Content tables that have an is_published column (website_settings has none).
export const CONTENT_TABLES = [
  { table: 'profiles', label: 'Profile' },
  { table: 'academic_records', label: 'Academic records' },
  { table: 'skills', label: 'Skills' },
  { table: 'coding_profiles', label: 'Coding profiles' },
  { table: 'projects', label: 'Projects' },
  { table: 'internships', label: 'Internships' },
  { table: 'certifications', label: 'Certifications' },
  { table: 'hackathons', label: 'Hackathons' },
  { table: 'research', label: 'Research' },
  { table: 'achievements', label: 'Achievements' },
  { table: 'professional_links', label: 'Professional links' },
  { table: 'learning_timeline', label: 'Learning timeline' },
  { table: 'custom_sections', label: 'Custom sections' },
]

// Real counts read with the admin's login (RLS lets admins see drafts too).
export async function fetchContentCounts() {
  if (!supabase) throw new Error('not-configured')
  return Promise.all(
    CONTENT_TABLES.map(async ({ table, label }) => {
      const { data, error } = await supabase.from(table).select('is_published')
      if (error) return { table, label, error: error.message }
      const total = data.length
      const published = data.filter((row) => row.is_published).length
      return { table, label, total, published, drafts: total - published }
    }),
  )
}
