import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref(localStorage.getItem('theme') || 'system')
  const fontSize = ref(parseInt(localStorage.getItem('fontSize')) || 16)

  const applyTheme = (theme) => {
    const root = document.documentElement
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.setAttribute('data-theme', isDark ? 'dark' : 'light')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }

  const setTheme = (theme) => {
    currentTheme.value = theme
    localStorage.setItem('theme', theme)
    applyTheme(theme)
  }

  const setFontSize = (size) => {
    fontSize.value = size
    document.documentElement.style.setProperty('--font-size-base', size + 'px')
    localStorage.setItem('fontSize', size)
  }

  // При старте применяем сохранённый размер
  setFontSize(fontSize.value)

  if (currentTheme.value === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mediaQuery.addEventListener('change', handler)
  }

  applyTheme(currentTheme.value)

  return { currentTheme, fontSize, setTheme, setFontSize }
})