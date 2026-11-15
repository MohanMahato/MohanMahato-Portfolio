import { Inbox } from 'lucide-react'

// Shown when a section has no published content yet. Never shows fake data.
export default function EmptyState({ title = 'Nothing here yet', message }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      <Inbox className="mb-3 h-8 w-8 text-muted" aria-hidden="true" />
      <h3 className="text-lg font-semibold">{title}</h3>
      {message && <p className="mt-1 max-w-md text-sm text-muted">{message}</p>}
    </div>
  )
}
