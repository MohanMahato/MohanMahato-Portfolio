import { describe, expect, it } from 'vitest'
import { THEMES } from '@/context/ThemeProvider'

describe('portfolio themes', () => {
  it('provides six selectable themes', () => {
    expect(THEMES).toHaveLength(6)
    expect(THEMES.map((theme) => theme.id)).toEqual([
      'dark-neon', 'clean-light', 'glass', 'gradient', 'editorial', 'cyber',
    ])
  })
})
