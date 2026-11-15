import { describe, expect, it } from 'vitest'
import { findForbiddenEnv, looksLikeSecretKey } from '@/lib/keyGuard'

// Builds a fake (unsigned) JWT, only for testing.
const fakeJwt = (role) => {
  const b64 = (o) => btoa(JSON.stringify(o)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${b64({ alg: 'HS256' })}.${b64({ role })}.signature`
}

describe('keyGuard', () => {
  it('flags new-style secret keys', () => {
    expect(looksLikeSecretKey('sb_secret_abc123')).toBe(true)
  })
  it('flags legacy service_role JWT keys', () => {
    expect(looksLikeSecretKey(fakeJwt('service_role'))).toBe(true)
  })
  it('allows publishable and legacy anon keys', () => {
    expect(looksLikeSecretKey('sb_publishable_abc123')).toBe(false)
    expect(looksLikeSecretKey(fakeJwt('anon'))).toBe(false)
  })
  it('ignores empty or garbage values', () => {
    expect(looksLikeSecretKey('')).toBe(false)
    expect(looksLikeSecretKey(undefined)).toBe(false)
    expect(looksLikeSecretKey('not.a.jwt')).toBe(false)
  })
  it('reports unsafe env variables by name and by value', () => {
    expect(findForbiddenEnv({ VITE_SUPABASE_SERVICE_ROLE_KEY: 'x' })).toHaveLength(1)
    expect(findForbiddenEnv({ VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_x' })).toHaveLength(1)
    expect(
      findForbiddenEnv({
        VITE_SUPABASE_URL: 'https://abc.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_x',
      }),
    ).toHaveLength(0)
  })
})
