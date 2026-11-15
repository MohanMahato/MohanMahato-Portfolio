import { cn } from '@/lib/utils'

export default function Card({ className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-surface p-6',
        hover && 'transition duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-glow',
        className,
      )}
      {...props}
    />
  )
}
