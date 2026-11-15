import { SITE } from '@/config/site'

export default function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="container-page text-sm text-muted">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  )
}
