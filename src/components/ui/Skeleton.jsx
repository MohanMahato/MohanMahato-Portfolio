import { cn } from '@/lib/utils'

// Grey pulsing placeholder shown while data is loading.
export default function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-xl bg-surface-2', className)} aria-hidden="true" />
}
