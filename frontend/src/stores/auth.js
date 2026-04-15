import { defineStore } from 'pinia'
import api from '../api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('access_token') || null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user
  },
  actions: {
    async register(username, password, fullName = '') {
      await api.post('/register', { username, password, full_name: fullName })
    },
    async login(username, password) {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('password', password)
      const response = await api.post('/token', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      this.token = response.data.access_token
      localStorage.setItem('access_token', this.token)
      await this.fetchUser()
    },
    async fetchUser() {
      const response = await api.get('/users/me')
      this.user = response.data
    },
    async updateProfile(updates) {
      const response = await api.put('/users/me', updates)
      this.user = response.data
    },
    async uploadAvatar(file) {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      this.user.avatar_url = response.data.avatar_url
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('access_token')
    }
  }
})