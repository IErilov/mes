import { defineStore } from 'pinia'
import api from '../api'
import { useAuthStore } from './auth'
import { useUsersStore } from './users'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],      // сообщения текущего диалога
    ws: null,
    connected: false,
    onlineUsers: new Set() // можно расширить для индикации онлайна
  }),
  actions: {
    async fetchMessages(userId) {
      const response = await api.get(`/messages/${userId}`)
      this.messages = response.data
    },
    connectWebSocket() {
      const authStore = useAuthStore()
      if (!authStore.token) return

      // Закрываем предыдущее соединение
      if (this.ws) {
        this.ws.close()
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/ws/${authStore.token}`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.connected = true
        console.log('WebSocket connected')
      }

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        const usersStore = useUsersStore()
        // Добавляем сообщение, если оно относится к выбранному диалогу
        if (message.sender_id === usersStore.selectedUserId || message.receiver_id === usersStore.selectedUserId) {
          this.messages.push(message)
        }
      }

      this.ws.onclose = () => {
        this.connected = false
        console.log('WebSocket disconnected, reconnecting in 3s...')
        setTimeout(() => {
          if (authStore.token) {
            this.connectWebSocket()
          }
        }, 3000)
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    },
    sendMessage(receiverId, content) {
      if (this.ws && this.connected) {
        this.ws.send(JSON.stringify({ receiver_id: receiverId, content }))
      }
    },
    disconnectWebSocket() {
      if (this.ws) {
        this.ws.close()
        this.ws = null
        this.connected = false
      }
    },
    clearMessages() {
      this.messages = []
    }
  }
})