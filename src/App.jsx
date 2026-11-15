import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { ThemeProvider } from '@/context/ThemeProvider'
import { useTheme } from '@/hooks/useTheme'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import AppRoutes from '@/routes/AppRoutes'

function ThemedToaster() {
  const { theme } = useTheme()
  return <Toaster theme={theme} position="top-right" richColors />
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          {/* reducedMotion="user": animations are skipped for people who turned them off in their OS */}
          <MotionConfig reducedMotion="user">
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
            <ThemedToaster />
          </MotionConfig>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
