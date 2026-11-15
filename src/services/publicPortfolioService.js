
import { supabase } from '@/lib/supabaseClient'

async function published(table, order = 'display_order') {
  if (!supabase) return []
  let query = supabase.from(table).select('*').eq('is_published', true)
  if (order) query = query.order(order, { ascending: true })
  const { data, error } = await query
  if (error) return []
  return data || []
}

export async function fetchPortfolio() {
  if (!supabase) return {
    profile: null, academics: [], education: [], skills: [],
    codingProfiles: [], projects: [], internships: [],
    certifications: [], hackathons: [], research: [],
    achievements: [], links: [], learning: []
  }

  const [
    profileResult, academics, education, skills, codingProfiles,
    projects, internships, certifications, hackathons,
    research, achievements, links, learning
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', 1).eq('is_published', true).maybeSingle(),
    published('academic_records', 'semester_number'),
    published('education_records'),
    published('skills'),
    published('coding_profiles'),
    published('projects'),
    published('internships'),
    published('certifications'),
    published('hackathons'),
    published('research'),
    published('achievements'),
    published('professional_links'),
    published('learning_timeline'),
  ])

  return {
    profile: profileResult.error ? null : profileResult.data,
    academics, education, skills, codingProfiles, projects,
    internships, certifications, hackathons, research,
    achievements, links, learning,
  }
}
