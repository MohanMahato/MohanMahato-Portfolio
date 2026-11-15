// Safety net: makes sure a SECRET Supabase key is never used in the browser app.
// Allowed in the frontend: Project URL + publishable (sb_publishable_...) or legacy anon key.
// Forbidden in the frontend: secret key (sb_secret_...) or legacy "service_role" key.

function decodeJwtPayload(token) {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export function looksLikeSecretKey(value) {
  if (!value || typeof value !== 'string') return false
  if (value.startsWith('sb_secret_')) return true
  const payload = decodeJwtPayload(value)
  return payload?.role === 'service_role'
}

// env = an object of VITE_* variables. Returns a list of human-readable problems.
export function findForbiddenEnv(env) {
  const problems = []
  for (const [name, value] of Object.entries(env)) {
    if (/service[_-]?role|secret/i.test(name)) {
      problems.push(`${name}: the name suggests a secret. Variables starting with VITE_ are public.`)
    } else if (looksLikeSecretKey(String(value))) {
      problems.push(`${name}: the value is a SECRET Supabase key. Use the publishable key instead.`)
    }
  }
  return problems
}
