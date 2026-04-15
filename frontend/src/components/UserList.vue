<template>
  <div class="user-list">
    <div v-if="displayUsers.length === 0" class="no-users">
      {{ searchActive ? 'Ничего не найдено' : 'Нет пользователей' }}
    </div>
    <div
      v-for="user in displayUsers"
      :key="user.id"
      class="user-item"
      :class="{ active: user.id === usersStore.selectedUserId }"
      @click="usersStore.selectUser(user.id)"
    >
      <div class="avatar">
        <img v-if="user.avatar_url" :src="user.avatar_url" :alt="user.username" />
        <div v-else class="avatar-placeholder">
          {{ user.username.charAt(0).toUpperCase() }}
        </div>
      </div>
      <div class="user-info">
        <div class="name">{{ user.full_name || user.username }}</div>
        <div class="username">@{{ user.username }}</div>
        <div v-if="user.last_seen" class="last-seen">
          {{ formatLastSeen(user.last_seen) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUsersStore } from '../stores/users'

const usersStore = useUsersStore()

const searchActive = computed(() => usersStore.searchResults.length > 0)
const displayUsers = computed(() => {
  return searchActive.value ? usersStore.searchResults : usersStore.users
})

const formatLastSeen = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'был(а) только что'
  if (minutes < 60) return `был(а) ${minutes} мин назад`
  if (hours < 24) return `был(а) ${hours} ч назад`
  return `был(а) ${days} дн назад`
}
</script>

<style scoped>
.user-list {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-primary);
}

.user-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid var(--border-light);
  transition: background 0.15s;
}

.user-item:hover {
  background: var(--hover-bg);
}

.user-item.active {
  background: color-mix(in srgb, var(--accent) 15%, var(--bg-primary));
  border-left: 3px solid var(--accent);
}

.avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 0.75rem;
  flex-shrink: 0;
  background: var(--accent);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.name {
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 1rem;
}

.username {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.last-seen {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

.no-users {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}
</style>