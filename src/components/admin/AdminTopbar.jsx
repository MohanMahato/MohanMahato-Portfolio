import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ExternalLink, LogOut, Menu } from 'lucide-react'
import { toast } from 'sonner'
import ThemeToggle from '@/components/layout/ThemeToggle'
import Button from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export default function AdminTopbar({ onOpenMenu }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  const handleLogout = async () => {
    setBusy(true)
    try {
      await signOut()
    } catch {
      toast.error('Sign-out had a problem, but this device was signed out.')
    } finally {
      navigate('/admin/login', { replace: true })
    }
  }

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center gap-3 border-x-0 border-t-0 px-4 sm:px-6">
      <button
        onClick={onOpenMenu}
        aria-label="Open admin menu"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-muted">
          Signed in as <span className="font-medium text-fg">{user?.email}</span>
        </p>
      </div>
      <Button as={Link} to="/" variant="ghost" size="sm" className="hidden sm:inline-flex">
        <ExternalLink className="h-4 w-4" aria-hidden="true" /> View site
      </Button>
      <ThemeToggle />
      <Button variant="secondary" size="sm" onClick={handleLogout} disabled={busy}>
        <LogOut className="h-4 w-4" aria-hidden="true" />
        {busy ? 'Signing out…' : 'Logout'}
      </Button>
    </header>
  )
}
