import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ---- Fake Supabase layer (no network). We control what each service returns. ----
const m = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  fetchIsAdmin: vi.fn(),
  fetchContentCounts: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({ isSupabaseConfigured: true, supabase: {} }))
vi.mock('@/services/authService', () => ({
  signInWithPassword: (...a) => m.signInWithPassword(...a),
  signOut: (...a) => m.signOut(...a),
  getSession: (...a) => m.getSession(...a),
  onAuthChange: () => () => {},
  fetchIsAdmin: (...a) => m.fetchIsAdmin(...a),
}))
vi.mock('@/services/adminService', () => ({
  CONTENT_TABLES: [{ table: 'projects', label: 'Projects' }],
  fetchContentCounts: (...a) => m.fetchContentCounts(...a),
}))

import App from '@/App'
import { queryClient } from '@/lib/queryClient'

const session = { user: { id: 'user-1', email: 'owner@example.com' } }
const credentialsError = Object.assign(new Error('Invalid login credentials'), { code: 'invalid_credentials' })

function open(path) {
  window.history.pushState({}, '', path)
  return render(<App />)
}

async function fillAndSubmit(user, email = 'owner@example.com', password = 'secret-pass') {
  await user.type(await screen.findByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Password'), password)
  await user.click(screen.getByRole('button', { name: 'Sign in' }))
}

beforeEach(() => {
  queryClient.clear()
  localStorage.clear()
  Object.values(m).forEach((fn) => fn.mockReset())
  m.getSession.mockResolvedValue(null) // nobody logged in by default
  m.signOut.mockResolvedValue(undefined)
  m.fetchContentCounts.mockResolvedValue([{ table: 'projects', label: 'Projects', total: 3, published: 2, drafts: 1 }])
})

describe('route protection', () => {
  it('redirects /admin to /admin/login when not logged in', async () => {
    open('/admin')
    expect(await screen.findByRole('heading', { name: 'Admin Login' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin/login')
  })

  it('also protects deeper admin routes like /admin/projects', async () => {
    open('/admin/projects')
    expect(await screen.findByRole('heading', { name: 'Admin Login' })).toBeInTheDocument()
    expect(m.fetchIsAdmin).not.toHaveBeenCalled()
  })

  it('shows the dashboard for a logged-in admin, verified against admin_users with their id', async () => {
    m.getSession.mockResolvedValue(session)
    m.fetchIsAdmin.mockResolvedValue(true)
    open('/admin')
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(m.fetchIsAdmin).toHaveBeenCalledWith('user-1')
    expect(screen.getByText('Admin access verified')).toBeInTheDocument()
    expect(await screen.findByLabelText('Projects total')).toHaveTextContent('3')
  })

  it('denies a logged-in user who is NOT in admin_users', async () => {
    m.getSession.mockResolvedValue(session)
    m.fetchIsAdmin.mockResolvedValue(false)
    open('/admin')
    expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Dashboard' })).not.toBeInTheDocument()
    expect(m.fetchContentCounts).not.toHaveBeenCalled() // no admin data requested for a non-admin
  })

  it('denies deeper admin routes to a non-admin too', async () => {
    m.getSession.mockResolvedValue(session)
    m.fetchIsAdmin.mockResolvedValue(false)
    open('/admin/anything')
    expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeInTheDocument()
  })

  it('sends an already-logged-in admin from /admin/login to the dashboard', async () => {
    m.getSession.mockResolvedValue(session)
    m.fetchIsAdmin.mockResolvedValue(true)
    open('/admin/login')
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin')
  })

  it('shows a friendly page for admin sections that are not built yet', async () => {
    m.getSession.mockResolvedValue(session)
    m.fetchIsAdmin.mockResolvedValue(true)
    open('/admin/projects')
    expect(await screen.findByRole('heading', { name: 'Projects' })).toBeInTheDocument()
    expect(screen.getByText('Content management')).toBeInTheDocument()
  })

  it('lets the admin retry when the permission check fails (e.g. offline)', async () => {
    m.getSession.mockResolvedValue(session)
    m.fetchIsAdmin.mockRejectedValueOnce(new Error('Failed to fetch')).mockResolvedValue(true)
    const user = userEvent.setup()
    open('/admin')
    expect(await screen.findByRole('heading', { name: 'Could not verify admin access' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })
})

describe('login form', () => {
  it('logs in an admin and opens the dashboard', async () => {
    m.signInWithPassword.mockResolvedValue({ session })
    m.fetchIsAdmin.mockResolvedValue(true)
    const user = userEvent.setup()
    open('/admin')
    await fillAndSubmit(user)
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(m.signInWithPassword).toHaveBeenCalledWith('owner@example.com', 'secret-pass')
  })

  it('returns to the page the admin originally wanted', async () => {
    m.signInWithPassword.mockResolvedValue({ session })
    m.fetchIsAdmin.mockResolvedValue(true)
    const user = userEvent.setup()
    open('/admin/projects')
    await fillAndSubmit(user)
    expect(await screen.findByRole('heading', { name: 'Projects' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin/projects')
  })

  it('shows a friendly message for a wrong password and clears the password field', async () => {
    m.signInWithPassword.mockRejectedValue(credentialsError)
    const user = userEvent.setup()
    open('/admin/login')
    await fillAndSubmit(user)
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password.')
    expect(screen.getByLabelText('Password')).toHaveValue('')
    expect(screen.getByLabelText('Email')).toHaveValue('owner@example.com')
    expect(window.location.pathname).toBe('/admin/login')
  })

  it('shows a loading state and blocks double submit while signing in', async () => {
    let finish
    m.signInWithPassword.mockReturnValue(new Promise((resolve) => (finish = resolve)))
    m.fetchIsAdmin.mockResolvedValue(true)
    const user = userEvent.setup()
    open('/admin/login')
    await fillAndSubmit(user)
    const button = await screen.findByRole('button', { name: 'Signing in…' })
    expect(button).toBeDisabled()
    finish({ session })
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(m.signInWithPassword).toHaveBeenCalledTimes(1)
  })

  it('refuses a correct login of a user who is not an admin', async () => {
    m.signInWithPassword.mockResolvedValue({ session })
    m.fetchIsAdmin.mockResolvedValue(false)
    const user = userEvent.setup()
    open('/admin/login')
    await fillAndSubmit(user)
    expect(await screen.findByRole('heading', { name: 'Not authorised' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Dashboard' })).not.toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin/login')
  })

  it('asks for both fields before calling Supabase', async () => {
    const user = userEvent.setup()
    open('/admin/login')
    await user.click(await screen.findByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Please enter your email and password.')
    expect(m.signInWithPassword).not.toHaveBeenCalled()
  })

  it('pauses after 5 wrong attempts', async () => {
    m.signInWithPassword.mockRejectedValue(credentialsError)
    const user = userEvent.setup()
    open('/admin/login')
    await user.type(await screen.findByLabelText('Email'), 'owner@example.com')
    for (let i = 0; i < 5; i += 1) {
      await user.type(screen.getByLabelText('Password'), 'wrong')
      await user.click(screen.getByRole('button', { name: 'Sign in' }))
      await waitFor(() => expect(m.signInWithPassword).toHaveBeenCalledTimes(i + 1))
    }
    expect(await screen.findByText(/Too many failed attempts/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled()
  })

  it('never stores the password in browser storage', async () => {
    m.signInWithPassword.mockRejectedValue(credentialsError)
    const user = userEvent.setup()
    open('/admin/login')
    await fillAndSubmit(user, 'owner@example.com', 'super-secret-123')
    await screen.findByRole('alert')
    expect(JSON.stringify({ ...localStorage })).not.toContain('super-secret-123')
    expect(JSON.stringify({ ...sessionStorage })).not.toContain('super-secret-123')
  })
})

describe('logout', () => {
  it('signs out, clears cached admin data and returns to the login page', async () => {
    m.getSession.mockResolvedValue(session)
    m.fetchIsAdmin.mockResolvedValue(true)
    const user = userEvent.setup()
    open('/admin')
    await screen.findByRole('heading', { name: 'Dashboard' })
    expect(queryClient.getQueryCache().getAll().length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: 'Logout' }))
    expect(await screen.findByRole('heading', { name: 'Admin Login' })).toBeInTheDocument()
    expect(m.signOut).toHaveBeenCalledTimes(1)
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
  })

  it('lets a non-admin sign out from the access denied screen', async () => {
    m.getSession.mockResolvedValue(session)
    m.fetchIsAdmin.mockResolvedValue(false)
    const user = userEvent.setup()
    open('/admin')
    await user.click(await screen.findByRole('button', { name: 'Sign out' }))
    expect(await screen.findByRole('heading', { name: 'Admin Login' })).toBeInTheDocument()
  })
})

describe('mobile admin menu', () => {
  it('opens and closes the sidebar drawer', async () => {
    m.getSession.mockResolvedValue(session)
    m.fetchIsAdmin.mockResolvedValue(true)
    const user = userEvent.setup()
    open('/admin')
    await screen.findByRole('heading', { name: 'Dashboard' })
    await user.click(screen.getByLabelText('Open admin menu'))
    expect(await screen.findByLabelText('Close admin menu')).toBeInTheDocument()
    await user.click(screen.getByLabelText('Close admin menu'))
    await waitFor(() => expect(screen.queryByLabelText('Close admin menu')).not.toBeInTheDocument())
  })
})
