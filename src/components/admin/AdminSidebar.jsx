import { NavLink } from 'react-router-dom'
import {
  Award, Briefcase, Clock, Code, FileText, FlaskConical, FolderOpen, GraduationCap,
  LayoutDashboard, Link as LinkIcon, Medal, Settings, Trophy, User, Wrench,
} from 'lucide-react'
import { ADMIN_NAV } from '@/config/adminNav'
import { SITE } from '@/config/site'
import { cn } from '@/lib/utils'

const icons = {
  dashboard: LayoutDashboard, user: User, academics: GraduationCap, skills: Wrench, code: Code,
  projects: FolderOpen, briefcase: Briefcase, award: Award, trophy: Trophy, research: FlaskConical,
  medal: Medal, link: LinkIcon, clock: Clock, file: FileText, settings: Settings,
}

export default function AdminSidebar({ onNavigate }) {
  return (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <div className="px-5 py-5">
        <p className="font-display text-lg font-bold gradient-text">{SITE.name}</p>
        <p className="text-xs text-muted">Admin Dashboard</p>
      </div>
      <ul className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
        {ADMIN_NAV.map((item) => {
          const Icon = icons[item.icon]
          const base = 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition'
          if (!item.ready) {
            return (
              <li key={item.to}>
                <span className={cn(base, 'cursor-not-allowed text-muted/60')} aria-disabled="true">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                  <span className="ml-auto rounded-full border border-border px-2 py-0.5 text-[10px]">Soon</span>
                </span>
              </li>
            )
          }
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(base, isActive ? 'bg-accent/10 text-accent' : 'text-muted hover:bg-surface-2 hover:text-fg')
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
