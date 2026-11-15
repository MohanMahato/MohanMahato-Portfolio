import { beforeEach, describe, expect, it, vi } from 'vitest'

const limit = vi.fn()
vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: () => ({ select: () => ({ limit: (...a) => limit(...a) }) }) },
}))

import { checkDatabase } from '@/services/healthService'

beforeEach(() => limit.mockReset())

describe('checkDatabase', () => {
  it('passes when site_settings has its row', async () => {
    limit.mockResolvedValue({ data: [{ id: 1 }], error: null })
    await expect(checkDatabase()).resolves.toBe(true)
  })
  it('fails with a helpful message when the table is empty (migrations not run)', async () => {
    limit.mockResolvedValue({ data: [], error: null })
    await expect(checkDatabase()).rejects.toThrow(/Run all 6 SQL migrations/)
  })
  it('fails when Supabase returns an error', async () => {
    limit.mockResolvedValue({ data: null, error: { message: 'permission denied' } })
    await expect(checkDatabase()).rejects.toThrow('permission denied')
  })
})
