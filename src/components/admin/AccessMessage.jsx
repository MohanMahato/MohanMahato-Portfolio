import { ShieldAlert } from 'lucide-react'
import Button from '@/components/ui/Button'

// Reusable "you cannot enter" screen: not an admin, or the check failed.
export default function AccessMessage({ title, message, email, onRetry, onSignOut, signingOut = false }) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center text-center">
      <ShieldAlert className="h-10 w-10 text-danger" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted">{message}</p>
      {email && <p className="mt-3 rounded-lg bg-surface-2 px-3 py-1.5 font-mono text-xs">{email}</p>}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {onRetry && <Button onClick={onRetry}>Try again</Button>}
        {onSignOut && (
          <Button variant="secondary" onClick={onSignOut} disabled={signingOut}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </Button>
        )}
      </div>
    </div>
  )
}
