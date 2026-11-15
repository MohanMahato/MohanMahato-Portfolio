import { useQuery } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/hooks/useAuth'
import { CONTENT_TABLES, fetchContentCounts } from '@/services/adminService'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const counts = useQuery({ queryKey: ['admin', 'content-counts'], queryFn: fetchContentCounts, retry: false })

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted">Welcome back. Content management tools are added in Phase 5.</p>
      </div>

      <Card className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
        <div>
          <h2 className="font-semibold">Admin access verified</h2>
          <p className="mt-1 text-sm text-muted">
            {user?.email} is listed in the admin allow-list, and the database accepts this login for admin actions.
          </p>
        </div>
      </Card>

      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="mb-4 text-xl font-semibold">Content overview</h2>

        {counts.isPending && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CONTENT_TABLES.slice(0, 6).map((t) => (
              <Skeleton key={t.table} className="h-24" />
            ))}
          </div>
        )}

        {counts.isError && (
          <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
            Could not load the overview. Check that the Phase 3 migrations were run. ({counts.error.message})
          </p>
        )}

        {counts.isSuccess && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {counts.data.map((row) => (
              <Card key={row.table} className="p-5">
                <p className="text-sm text-muted">{row.label}</p>
                {row.error ? (
                  <p className="mt-2 text-sm text-danger">Error: {row.error}</p>
                ) : (
                  <>
                    <p className="mt-1 text-3xl font-bold" aria-label={`${row.label} total`}>{row.total}</p>
                    <div className="mt-2 flex gap-2">
                      <Badge tone="success">{row.published} published</Badge>
                      <Badge>{row.drafts} draft</Badge>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
