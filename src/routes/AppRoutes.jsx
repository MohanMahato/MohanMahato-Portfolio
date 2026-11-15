import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import PublicLayout from '@/components/layout/PublicLayout'
import Skeleton from '@/components/ui/Skeleton'

// lazy() loads each page only when it is visited, which keeps the first load fast.
const HomePage = lazy(() => import('@/pages/public/HomePage'))
const ProjectsPage = lazy(() => import('@/pages/public/ProjectsPage'))
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'))
// Admin code is loaded only when someone opens /admin, so public visitors never download it.
const AdminRoot = lazy(() => import('@/routes/AdminRoot'))
const ProtectedRoute = lazy(() => import('@/routes/ProtectedRoute'))
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'))
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminSectionPage = lazy(() => import('@/pages/admin/AdminSectionPage'))

const Loading = () => (
  <div className="container-page space-y-4 py-20">
    <Skeleton className="h-10 w-1/2" />
    <Skeleton className="h-5 w-2/3" />
  </div>
)

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin area: AdminRoot provides login state. Only /admin/login is open to everyone. */}
        <Route element={<AdminRoot />}>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="*" element={<AdminSectionPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
