import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useChatSettingsStore = defineStore('chatSettings', () => {
  const settings = ref(JSON.parse(localStorage.getItem('chat_settings')) || {})

  const getChatKey = (userId1, userId2) => {
    return [userId1, userId2].sort().join('_')
  }

  const getSettings = (currentUserId, peerId) => {
    if (!currentUserId || !peerId) return { background: null }
    const key = getChatKey(currentUserId, peerId)
    return settings.value[key] || { background: null }
  }

  const setBackground = (currentUserId, peerId, background) => {
    if (!currentUserId || !peerId) return
    const key = getChatKey(currentUserId, peerId)
    if (!settings.value[key]) settings.value[key] = {}
    settings.value[key].background = background
    localStorage.setItem('chat_settings', JSON.stringify(settings.value))
  }

  const removeBackground = (currentUserId, peerId) => {
    if (!currentUserId || !peerId) return
    const key = getChatKey(currentUserId, peerId)
    if (settings.value[key]) {
      delete settings.value[key].background
      if (Object.keys(settings.value[key]).length === 0) {
        delete settings.value[key]
      }
      localStorage.setItem('chat_settings', JSON.stringify(settings.value))
    }
  }

  return { settings, getSettings, setBackground, removeBackground }
})