import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import FullPageLoader from '@/components/admin/FullPageLoader'
import AccessMessage from '@/components/admin/AccessMessage'
import SEO from '@/components/common/SEO'

// Lets a request through ONLY when: logged in AND listed in public.admin_users.
// (This only decides which screen to show. The real protection is RLS in the database.)
export default function ProtectedRoute() {
  const { loading, user, isAdmin, adminError, recheck, signOut } = useAuth()
  const location = useLocation()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
    }
  }

  if (loading) return <FullPageLoader />

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }

  if (adminError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-6">
        <SEO title="Admin" noindex />
        <AccessMessage
          title="Could not verify admin access"
          message="We could not check your permissions. Check your internet connection and try again."
          onRetry={recheck}
          onSignOut={handleSignOut}
          signingOut={signingOut}
        />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-6">
        <SEO title="Access denied" noindex />
        <AccessMessage
          title="Access denied"
          message="This account is signed in, but it is not an administrator of this portfolio."
          email={user.email}
          onSignOut={handleSignOut}
          signingOut={signingOut}
        />
      </div>
    )
  }

  return <Outlet />
}
