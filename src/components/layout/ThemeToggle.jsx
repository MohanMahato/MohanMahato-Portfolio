import { Palette } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export default function ThemeToggle() {
  const { theme, selectTheme, themes } = useTheme()
  return (
    <label className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm text-muted">
      <Palette className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">Choose website theme</span>
      <select
        aria-label="Choose website theme"
        value={theme}
        onChange={(event) => selectTheme(event.target.value)}
        className="max-w-32 bg-transparent text-fg outline-none"
      >
        {themes.map((item) => (
  <option
    key={item.id}
    value={item.id}
    className="bg-white text-gray-900"
  >
    {item.name}
  </option>
))}
      </select>
    </label>
  )
}
