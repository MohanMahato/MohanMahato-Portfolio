import { QueryClient } from '@tanstack/react-query'

// Caches server data so we don't hit Supabase again and again (saves free-tier quota).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false, retry: 1 },
  },
})
