<template>
  <div class="users-page">
    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Поиск по имени или юзернейму..."
        class="search-input"
      />
    </div>
    <div class="users-list">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="user-card"
        @click="startChat(user)"
      >
        <div class="user-avatar">
          {{ user.name.charAt(0).toUpperCase() }}
        </div>
        <div class="user-info">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-username">@{{ user.username }}</div>
        </div>
        <button class="chat-btn">Написать</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'UsersPage',
  setup() {
    const router = useRouter()
    const searchQuery = ref('')

    // Список пользователей (без avatarColor, всё через CSS)
    const users = ref([
      { id: 1, name: 'Анна Кузнецова', username: 'anna_k' },
      { id: 2, name: 'Дмитрий Соколов', username: 'dima_s' },
      { id: 3, name: 'Елена Ветрова', username: 'lenav' },
      { id: 4, name: 'Максим Иванов', username: 'maxim_i' },
      { id: 5, name: 'Ольга Смирнова', username: 'olga_s' }
    ])

    const filteredUsers = computed(() => {
      if (!searchQuery.value) return users.value
      const q = searchQuery.value.toLowerCase()
      return users.value.filter(
        u => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
      )
    })

    const startChat = (user) => {
      // Получаем текущие чаты из localStorage
      let chats = []
      const stored = localStorage.getItem('messenger_chats')
      if (stored) {
        try {
          chats = JSON.parse(stored)
        } catch (e) {
          chats = []
        }
      }
      // Проверяем, есть ли уже чат с этим пользователем
      let existing = chats.find(c => c.participantId === user.id)
      if (!existing) {
        const newChat = {
  id: Date.now(),
  name: user.name,
  participantId: user.id,
  participantName: user.name,
  username: user.username,
  lastMessage: '',
  messages: [],
  settings: { emoji: '', theme: 'default', fontSize: 16, notifications: false }
}
        chats.unshift(newChat)
        localStorage.setItem('messenger_chats', JSON.stringify(chats))
        existing = newChat
      }
      // Переходим в чаты с параметром chatId
      router.push({ path: '/chats', query: { chatId: existing.id } })
    }

    return { searchQuery, filteredUsers, startChat }
  }
}
</script>

<style scoped>
.users-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.search-bar {
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 30px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 1rem;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: background 0.2s;
}

.user-card:hover {
  background-color: var(--hover-bg);
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-weight: bold;
  font-size: 1.2rem;
  color: white;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
}

.user-username {
  font-size: 0.85rem;
  opacity: 0.7;
}

.chat-btn {
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  cursor: pointer;
}
</style>