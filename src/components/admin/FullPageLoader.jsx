// Shown while we check the saved login session.
export default function FullPageLoader({ label = 'Checking your session…' }) {
  return (
    <div role="status" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg text-muted">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-accent" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
