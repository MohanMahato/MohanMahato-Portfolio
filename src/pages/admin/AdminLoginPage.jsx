import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { LockKeyhole } from 'lucide-react'
import SEO from '@/components/common/SEO'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import FullPageLoader from '@/components/admin/FullPageLoader'
import AccessMessage from '@/components/admin/AccessMessage'
import { useAuth } from '@/hooks/useAuth'
import { friendlyAuthMessage } from '@/lib/authErrors'
import { safeAdminRedirect } from '@/lib/safeRedirect'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import { SITE } from '@/config/site'

const MAX_FAILURES = 5
const LOCK_MS = 30_000

export default function AdminLoginPage() {
  const { loading, user, isAdmin, adminError, signIn, signOut, recheck } = useAuth()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [failures, setFailures] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(0)
  const [signingOut, setSigningOut] = useState(false)

  // Short pause after too many wrong attempts (Supabase also rate-limits on the server).
  useEffect(() => {
    if (!lockedUntil) return undefined
    const timer = setTimeout(() => {
      setLockedUntil(0)
      setFailures(0)
    }, Math.max(lockedUntil - Date.now(), 0))
    return () => clearTimeout(timer)
  }, [lockedUntil])

  const locked = lockedUntil > 0

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting || locked) return
    const cleanEmail = email.trim()
    if (!cleanEmail || !password) {
      setError('Please enter your email and password.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await signIn(cleanEmail, password)
      setFailures(0)
    } catch (err) {
      const count = failures + 1
      setFailures(count)
      if (count >= MAX_FAILURES) setLockedUntil(Date.now() + LOCK_MS)
      setError(friendlyAuthMessage(err))
    } finally {
      setPassword('') // never keep the password around
      setSubmitting(false)
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
    }
  }

  if (loading) return <FullPageLoader />

  // Already an admin: go straight to the dashboard (or the page they originally wanted).
  if (user && isAdmin) return <Navigate to={safeAdminRedirect(location.state?.from)} replace />

  let body
  if (user && adminError) {
    body = (
      <AccessMessage
        title="Could not verify admin access"
        message="We could not check your permissions. Check your connection and try again."
        onRetry={recheck}
        onSignOut={handleSignOut}
        signingOut={signingOut}
      />
    )
  } else if (user) {
    body = (
      <AccessMessage
        title="Not authorised"
        message="You are signed in, but this account is not an administrator of this portfolio."
        email={user.email}
        onSignOut={handleSignOut}
        signingOut={signingOut}
      />
    )
  } else {
    body = (
      <form onSubmit={handleSubmit} noValidate className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <LockKeyhole className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Admin Login</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage {SITE.name}&rsquo;s portfolio.</p>
        </div>

        {!isSupabaseConfigured && (
          <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            Supabase is not configured. Add your keys to the .env file (see docs/SUPABASE_SETUP.md) and restart the app.
          </p>
        )}

        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="username"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
        />
        <div className="space-y-2">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />
          <label className="flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
            Show password
          </label>
        </div>

        {error && !locked && (
          <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </p>
        )}
        {locked && (
          <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            Too many failed attempts. Please wait 30 seconds before trying again.
          </p>
        )}

        <Button type="submit" className="w-full" disabled={submitting || locked || !isSupabaseConfigured}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-bg p-6">
      <SEO title="Admin Login" noindex />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-accent/10 to-transparent" />
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-glow">
        <div className="flex justify-center">{body}</div>
      </div>
      <Link to="/" className="relative mt-6 text-sm text-muted hover:text-fg">
        &larr; Back to website
      </Link>
    </div>
  )
}
