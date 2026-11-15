import { describe, expect, it } from 'vitest'
import { friendlyAuthMessage } from '@/lib/authErrors'
import { safeAdminRedirect } from '@/lib/safeRedirect'

describe('safeAdminRedirect (blocks open redirects)', () => {
  it('allows paths inside /admin', () => {
    expect(safeAdminRedirect('/admin')).toBe('/admin')
    expect(safeAdminRedirect('/admin/projects')).toBe('/admin/projects')
    expect(safeAdminRedirect('/admin/projects?x=1')).toBe('/admin/projects?x=1')
  })
  it('falls back to /admin for anything else', () => {
    for (const bad of [undefined, null, 42, '', '/', '/projects', 'https://evil.com', '//evil.com',
      '/admin//evil.com', '/adminx', '/admin/login', '/admin\\evil', '/admin/../x://y', 'javascript:alert(1)']) {
      expect(safeAdminRedirect(bad)).toBe('/admin')
    }
  })
})

describe('friendlyAuthMessage', () => {
  it('maps common Supabase errors to friendly text', () => {
    expect(friendlyAuthMessage({ code: 'invalid_credentials', message: 'Invalid login credentials' })).toBe('Incorrect email or password.')
    expect(friendlyAuthMessage({ message: 'Email not confirmed' })).toMatch(/not confirmed/)
    expect(friendlyAuthMessage({ status: 429, message: 'x' })).toMatch(/Too many attempts/)
    expect(friendlyAuthMessage({ message: 'Failed to fetch' })).toMatch(/Cannot reach the server/)
    expect(friendlyAuthMessage(new Error('not-configured'))).toMatch(/not connected to Supabase/)
  })
  it('never shows raw technical errors', () => {
    expect(friendlyAuthMessage({ message: 'PGRST301 internal stack trace' })).toBe('Something went wrong. Please try again.')
    expect(friendlyAuthMessage(undefined)).toBe('Something went wrong. Please try again.')
  })
})
