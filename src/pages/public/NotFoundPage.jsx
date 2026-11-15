import { Link } from 'react-router-dom'
import SEO from '@/components/common/SEO'
import Button from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <section className="container-page flex flex-col items-center py-28 text-center">
      <SEO title="Page not found" noindex />
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-2 text-4xl font-bold">Page not found</h1>
      <p className="mt-3 text-muted">The page you are looking for does not exist.</p>
      <Button as={Link} to="/" className="mt-8">Back to home</Button>
    </section>
  )
}
