// After login we send the admin back to the page they wanted.
// Only paths INSIDE /admin are allowed, so a crafted link can never send you to another website
// (this is called preventing an "open redirect").
export function safeAdminRedirect(path) {
  const fallback = '/admin'
  if (typeof path !== 'string') return fallback
  if (!path.startsWith('/admin')) return fallback
  if (path.includes('//') || path.includes('\\') || path.includes('..')) return fallback
  if (path === '/admin/login' || path.startsWith('/admin/login/') || path.startsWith('/admin/login?')) return fallback
  if (path !== '/admin' && !/^\/admin[/?#]/.test(path)) return fallback
  return path
}
