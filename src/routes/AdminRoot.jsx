import { Outlet } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthProvider'

// Wraps ONLY the admin routes with login logic, so public visitors never load it.
export default function AdminRoot() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
