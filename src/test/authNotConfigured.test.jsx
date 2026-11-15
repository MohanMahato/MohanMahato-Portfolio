import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '@/App'

// No mocks here: the test environment has no Supabase keys, like a fresh project.
describe('admin login without Supabase keys', () => {
  it('explains the problem and disables the Sign in button', async () => {
    window.history.pushState({}, '', '/admin/login')
    render(<App />)
    expect(await screen.findByText(/Supabase is not configured/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled()
  })
})
