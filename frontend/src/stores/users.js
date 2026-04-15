import { defineStore } from 'pinia'
import api from '../api'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],           // все пользователи (кроме текущего)
    searchResults: [],   // результаты поиска
    selectedUserId: null
  }),
  actions: {
    async fetchUsers() {
      const response = await api.get('/users')
      this.users = response.data
    },
    async searchUsers(query) {
      if (!query.trim()) {
        this.searchResults = []
        return
      }
      const response = await api.get('/users/search', { params: { q: query } })
      this.searchResults = response.data
    },
    selectUser(userId) {
      this.selectedUserId = userId
    },
    clearSearch() {
      this.searchResults = []
    }
  }
})