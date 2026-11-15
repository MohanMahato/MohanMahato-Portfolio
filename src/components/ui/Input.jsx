import { useId } from 'react'
import { cn } from '@/lib/utils'

const fieldClass =
  'w-full rounded-xl border bg-surface px-4 text-sm text-fg placeholder:text-muted/70 transition focus:border-accent'

// Input with a label and an error message. Pass multiline for a textarea.
export default function Input({ label, error, className, multiline = false, ...props }) {
  const id = useId()
  const Tag = multiline ? 'textarea' : 'input'
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      )}
      <Tag
        id={id}
        aria-invalid={Boolean(error)}
        className={cn(fieldClass, multiline ? 'min-h-28 py-3' : 'h-11', error ? 'border-danger' : 'border-border', className)}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
