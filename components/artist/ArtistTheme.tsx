'use client'

import { useEffect } from 'react'

export default function ArtistTheme({ themeColor }: { themeColor: string | null }) {
  useEffect(() => {
    if (!themeColor) return
    document.documentElement.style.setProperty('--theme', themeColor)
    document.documentElement.style.setProperty('--theme-dim', `${themeColor}26`)
    document.documentElement.style.setProperty('--theme-glow', `${themeColor}59`)

    return () => {
      document.documentElement.style.removeProperty('--theme')
      document.documentElement.style.removeProperty('--theme-dim')
      document.documentElement.style.removeProperty('--theme-glow')
    }
  }, [themeColor])

  return null
}