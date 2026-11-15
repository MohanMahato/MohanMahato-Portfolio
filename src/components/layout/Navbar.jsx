import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { SITE } from '@/config/site'
import { cn } from '@/lib/utils'

// More links (About, Skills, Certificates...) are added in Phase 6 when sections exist.
const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects' },
]

const linkClass = ({ isActive }) =>
  cn('rounded-lg px-3 py-2 text-sm font-medium transition', isActive ? 'text-fg' : 'text-muted hover:text-fg')

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="glass sticky top-0 z-40 border-x-0 border-t-0">
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Main">
        <Link to="/" className="font-display text-lg font-bold" onClick={() => setOpen(false)}>
          <span className="gradient-text">{SITE.name}</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          <div className="ml-3">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="container-page flex flex-col py-3">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={linkClass} onClick={() => setOpen(false)}>
                  {l.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
