<template>
  <div class="user-search">
    <input
      v-model="searchQuery"
      @input="handleSearch"
      placeholder="Поиск пользователей..."
      type="text"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useUsersStore } from '../stores/users'

const usersStore = useUsersStore()
const searchQuery = ref('')

let debounceTimer = null

const handleSearch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    usersStore.searchUsers(searchQuery.value)
  }, 300)
}

watch(() => searchQuery.value, (val) => {
  if (!val) {
    usersStore.clearSearch()
  }
})
</script>

<style scoped>
.user-search {
  padding: 12px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-primary);
}

.user-search input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid var(--border-light);
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.user-search input::placeholder {
  color: var(--text-secondary);
}

.user-search input:focus {
  border-color: var(--accent);
}
</style>