import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'

function open(path) {
  window.history.pushState({}, '', path)
  return render(<App />)
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.className = 'dark'
})

describe('Phase 2 foundation', () => {
  it('renders the home page', async () => {
    open('/')
   expect(await screen.findByLabelText('Main')).toBeInTheDocument()
    
  })

  it('renders /projects with an empty state (no fake projects)', async () => {
    open('/projects')
    expect(await screen.findByText('Projects will appear here')).toBeInTheDocument()
  })

  it('sends visitors who are not logged in from /admin to the login page', async () => {
    open('/admin')
    expect(await screen.findByRole('heading', { name: 'Admin Login' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin/login')
  })

  it('shows 404 for unknown routes', async () => {
    open('/does-not-exist')
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })

  it('toggles dark/light theme and remembers it', async () => {
    open('/')
    const user = userEvent.setup()
    expect(document.documentElement).toHaveClass('dark')
    await user.selectOptions(screen.getAllByLabelText('Choose website theme')[0], 'clean-light')
    await waitFor(() => expect(document.documentElement).not.toHaveClass('dark'))
    expect(localStorage.getItem('mm-theme')).toBe('clean-light')
  })

  it('opens and closes the mobile menu', async () => {
    open('/')
    const user = userEvent.setup()
    const btn = await screen.findByLabelText('Open menu')
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    await user.click(btn)
    expect(screen.getByLabelText('Close menu')).toHaveAttribute('aria-expanded', 'true')
    // desktop link + mobile link both exist now
    expect(screen.getAllByRole('link', { name: 'Projects' })).toHaveLength(2)
  })

  it('navigates from home to /projects using the navbar', async () => {
    open('/')
    const user = userEvent.setup()
    await user.click((await screen.findAllByRole('link', { name: 'Projects' }))[0])
    expect(await screen.findByText('Projects will appear here')).toBeInTheDocument()
  })
})
