import { createContext } from 'react'
export const ThemeContext = createContext({
  theme: 'dark-neon',
  selectTheme: () => {},
  toggleTheme: () => {},
  themes: [],
})
