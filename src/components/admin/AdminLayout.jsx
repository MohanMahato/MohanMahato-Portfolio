import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'
import SEO from '@/components/common/SEO'

// Frame for every admin page: sidebar (drawer on mobile) + top bar + page content.
export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg lg:flex">
      <SEO title="Admin" noindex />

      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:sticky lg:top-0 lg:block lg:h-screen">
        <AdminSidebar />
      </aside>

      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-border bg-surface"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
            >
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close admin menu"
                className="absolute right-3 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2"
              >
                <X className="h-5 w-5" />
              </button>
              <AdminSidebar onNavigate={() => setMenuOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="min-w-0 flex-1">
        <AdminTopbar onOpenMenu={() => setMenuOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
