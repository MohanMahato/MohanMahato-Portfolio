import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './ThemeContext'

export const THEMES = [
  { id: 'dark-neon', name: 'Dark Neon', description: 'Black, violet and cyan' },
  { id: 'clean-light', name: 'Clean Light', description: 'Bright white and blue' },
  { id: 'glass', name: 'Glassmorphism', description: 'Soft translucent surfaces' },
  { id: 'gradient', name: 'Gradient', description: 'Vibrant violet and pink' },
  { id: 'editorial', name: 'Editorial', description: 'Warm cream and ink' },
  { id: 'cyber', name: 'Cyber Tech', description: 'Deep navy and electric cyan' },
]
const KEY = 'mm-theme'
const VALID = THEMES.map((theme) => theme.id)

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(KEY)
    if (VALID.includes(saved)) return saved
    if (saved === 'dark') return 'dark-neon'
    if (saved === 'light') return 'clean-light'
  } catch { /* storage may be blocked */ }
  return 'dark-neon'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.classList.toggle('dark', !['clean-light', 'editorial'].includes(theme))
    try { localStorage.setItem(KEY, theme) } catch { /* ignore */ }
  }, [theme])
  const selectTheme = useCallback((next) => {
    if (VALID.includes(next)) setTheme(next)
  }, [])
  const toggleTheme = useCallback(() => {
    setTheme((current) => current === 'clean-light' ? 'dark-neon' : 'clean-light')
  }, [])
  const value = useMemo(() => ({ theme, selectTheme, toggleTheme, themes: THEMES }), [theme, selectTheme, toggleTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
