
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import HomePage from '@/pages/public/HomePage'
import { fetchPortfolio } from '@/services/publicPortfolioService'

vi.mock('@/services/publicPortfolioService', () => ({
  fetchPortfolio: vi.fn(),
}))

const renderHome = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({
        defaultOptions: { queries: { retry: false } },
      })}
    >
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>,
  )

describe('Homepage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows profile information when portfolio data loads', async () => {
    fetchPortfolio.mockResolvedValueOnce({
      profile: {
        full_name: 'Mohan Mahato',
        headline: 'B.Tech CSE Student',
      },
      links: [],
      skills: [],
      projects: [],
      academics: [],
    })

    renderHome()

    expect(await screen.findByText('Mohan Mahato')).toBeInTheDocument()
    expect(await screen.findByText('Computer Science & Engineering Student')).toBeInTheDocument()
  })

  it('shows default information when portfolio loading fails', async () => {
    fetchPortfolio.mockRejectedValueOnce(new Error('Database error'))

    renderHome()

    expect(
      await screen.findByText('Computer Science & Engineering Student'),
    ).toBeInTheDocument()
  })
})
