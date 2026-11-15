import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = path.resolve(import.meta.dirname, '..', '..')
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })

// The ONLY frontend file allowed to mention secret-key names is the guard that blocks them.
const allowed = [path.join('src', 'lib', 'keyGuard.js')]
const sourceFiles = [...walk(path.join(root, 'src')), path.join(root, 'index.html')].filter(
  (f) => /\.(js|jsx|html|css)$/.test(f) && !f.includes(`${path.sep}test${path.sep}`),
)

describe('frontend never contains secret Supabase keys', () => {
  it('has no service_role / sb_secret_ references in app code', () => {
    const offenders = sourceFiles
      .filter((f) => !allowed.some((a) => f.endsWith(a)))
      .filter((f) => /service_role|SERVICE_ROLE|sb_secret_/.test(readFileSync(f, 'utf8')))
      .map((f) => path.relative(root, f))
    expect(offenders).toEqual([])
  })

  it('.env.example only lists public VITE_ variables', () => {
    const lines = readFileSync(path.join(root, '.env.example'), 'utf8')
      .split('\n')
      .filter((l) => l.trim() && !l.trim().startsWith('#'))
    expect(lines.length).toBeGreaterThan(0)
    for (const line of lines) expect(line).toMatch(/^VITE_[A-Z_]+=/)
    expect(lines.join('\n')).not.toMatch(/service|secret/i)
  })

  it('.env files are git-ignored', () => {
    expect(readFileSync(path.join(root, '.gitignore'), 'utf8')).toMatch(/^\.env$/m)
  })

  const appFiles = () => sourceFiles.filter((f) => f.endsWith('.js') || f.endsWith('.jsx'))

  it('has no hard-coded user ids or personal emails in app code', () => {
    const uuid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    const email = /[\w.+-]+@(?!example\.com)[\w-]+\.[a-z]{2,}/i
    const offenders = appFiles()
      .filter((f) => {
        const text = readFileSync(f, 'utf8')
        return uuid.test(text) || email.test(text)
      })
      .map((f) => path.relative(root, f))
    expect(offenders).toEqual([])
  })

  it('never writes passwords to browser storage', () => {
    const offenders = appFiles()
      .filter((f) => {
        const text = readFileSync(f, 'utf8')
        return /password/i.test(text) && /(localStorage|sessionStorage)/.test(text)
      })
      .map((f) => path.relative(root, f))
    expect(offenders).toEqual([])
  })
})
