<template>
  <div class="chat-container">
    <div v-if="selectedUser" class="chat-header">
      <div class="avatar-small">
        <img v-if="selectedUser.avatar_url" :src="selectedUser.avatar_url" alt="avatar" />
        <div v-else class="avatar-placeholder-small">{{ selectedUser.username.charAt(0).toUpperCase() }}</div>
      </div>
      <div class="info">
        <div class="name">{{ selectedUser.full_name || selectedUser.username }}</div>
        <div class="status">{{ selectedUser.last_seen ? formatLastSeen(selectedUser.last_seen) : 'не в сети' }}</div>
      </div>
      <button class="chat-settings-btn" @click="showSettings = true">
        <i class="bi bi-three-dots-vertical"></i>
      </button>
    </div>

    <!-- Модальное окно настроек чата -->
    <div v-if="showSettings" class="modal-overlay" @click.self="showSettings = false">
      <div class="modal">
        <h3><i class="bi bi-palette"></i> Оформление чата</h3>
        <div class="bg-options">
          <div class="color-options">
            <button
              v-for="color in presetColors"
              :key="color"
              class="color-btn"
              :style="{ background: color }"
              @click="applyColor(color)"
            ></button>
          </div>
          <div class="custom-bg">
            <label class="upload-btn">
              <i class="bi bi-cloud-upload"></i> Загрузить изображение
              <input type="file" accept="image/*" @change="uploadBackground" hidden />
            </label>
          </div>
          <button v-if="currentBackground" class="reset-btn" @click="resetBackground">
            <i class="bi bi-arrow-counterclockwise"></i> Сбросить фон
          </button>
        </div>
        <button class="close-btn" @click="showSettings = false">Закрыть</button>
      </div>
    </div>

    <div class="main-panel" :style="mainPanelStyle">
      <div class="users-panel">
        <UserSearch />
        <UserList />
      </div>
      <div class="messages-panel" v-if="usersStore.selectedUserId" :style="messagesPanelStyle">
        <MessageList />
        <div class="message-input">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            placeholder="Введите сообщение..."
            ref="messageInput"
          />
          <button @click="sendMessage">Отправить</button>
        </div>
      </div>
      <div v-else class="no-chat">
        <p>👋 Выберите пользователя, чтобы начать общение</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useUsersStore } from '../stores/users'
import { useChatStore } from '../stores/chat'
import { useChatSettingsStore } from '../stores/chatSettings'
import UserSearch from './UserSearch.vue'
import UserList from './UserList.vue'
import MessageList from './MessageList.vue'

const authStore = useAuthStore()
const usersStore = useUsersStore()
const chatStore = useChatStore()
const chatSettingsStore = useChatSettingsStore()

const newMessage = ref('')
const messageInput = ref(null)
const showSettings = ref(false)

const selectedUser = computed(() => {
  if (!usersStore.selectedUserId) return null
  return usersStore.users.find(u => u.id === usersStore.selectedUserId) ||
         usersStore.searchResults.find(u => u.id === usersStore.selectedUserId)
})

const currentSettings = computed(() => {
  if (!authStore.user?.id || !selectedUser.value?.id) return { background: null }
  return chatSettingsStore.getSettings(authStore.user.id, selectedUser.value.id)
})

const currentBackground = computed(() => currentSettings.value.background)

const mainPanelStyle = computed(() => {
  if (currentBackground.value) {
    return {
      '--chat-bg': currentBackground.value.startsWith('url') ? null : currentBackground.value,
      '--chat-bg-image': currentBackground.value.startsWith('url') ? currentBackground.value : 'none'
    }
  }
  return {}
})

const messagesPanelStyle = computed(() => {
  if (currentBackground.value) {
    if (currentBackground.value.startsWith('url')) {
      return { backgroundImage: currentBackground.value, backgroundSize: 'cover' }
    } else {
      return { backgroundColor: currentBackground.value }
    }
  }
  return {}
})

const presetColors = ['#e5ddd5', '#c1d5c1', '#d5d1c1', '#c1c9d5', '#d5c1c1', '#c1d5d5']

onMounted(async () => {
  await usersStore.fetchUsers()
  chatStore.connectWebSocket()
})

onUnmounted(() => {
  chatStore.disconnectWebSocket()
})

watch(() => usersStore.selectedUserId, async (newUserId) => {
  if (newUserId) {
    await chatStore.fetchMessages(newUserId)
    nextTick(() => messageInput.value?.focus())
  } else {
    chatStore.clearMessages()
  }
})

const sendMessage = () => {
  const content = newMessage.value.trim()
  if (!content || !usersStore.selectedUserId) return
  chatStore.sendMessage(usersStore.selectedUserId, content)
  newMessage.value = ''
}

const applyColor = (color) => {
  if (authStore.user?.id && selectedUser.value?.id) {
    chatSettingsStore.setBackground(authStore.user.id, selectedUser.value.id, color)
    showSettings.value = false
  }
}

const uploadBackground = (event) => {
  const file = event.target.files[0]
  if (file && authStore.user?.id && selectedUser.value?.id) {
    const reader = new FileReader()
    reader.onload = (e) => {
      chatSettingsStore.setBackground(authStore.user.id, selectedUser.value.id, `url('${e.target.result}')`)
      showSettings.value = false
    }
    reader.readAsDataURL(file)
  }
}

const resetBackground = () => {
  if (authStore.user?.id && selectedUser.value?.id) {
    chatSettingsStore.removeBackground(authStore.user.id, selectedUser.value.id)
    showSettings.value = false
  }
}

const formatLastSeen = (timestamp) => {
  // ... без изменений
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
}

/* Шапка чата */
.chat-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
}

.avatar-small {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
}

.avatar-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder-small {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info {
  flex: 1;
}

.info .name {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.info .status {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* Кнопка настроек чата */
.chat-settings-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 50%;
  transition: background 0.2s, color 0.2s;
  line-height: 1;
}

.chat-settings-btn:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

/* Основная панель (список пользователей + сообщения) */
.main-panel {
  flex: 1;
  display: flex;
  overflow: hidden;
  background-color: var(--bg-primary);
}

/* Левая панель со списком пользователей */
.users-panel {
  width: 320px;
  border-right: 1px solid var(--border-light);
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Правая панель сообщений */
.messages-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* фон задаётся динамически через :style в шаблоне */
  background-color: var(--bg-tertiary);
  background-size: cover;
  background-position: center;
  transition: background 0.3s;
}

/* Поле ввода сообщения */
.message-input {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-light);
  backdrop-filter: blur(8px);
  background: color-mix(in srgb, var(--bg-primary) 90%, transparent);
}

.message-input input {
  flex: 1;
  padding: 12px 18px;
  border: 1px solid var(--border-light);
  border-radius: 30px;
  font-size: 0.95rem;
  outline: none;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.message-input input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
}

.message-input input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.message-input button {
  padding: 10px 24px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  white-space: nowrap;
}

.message-input button:hover {
  background: var(--accent-light);
  transform: scale(1.02);
}

.message-input button:active {
  transform: scale(0.98);
}

/* Заглушка, когда чат не выбран */
.no-chat {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 1rem;
  text-align: center;
  padding: 2rem;
}

/* Модальное окно настроек фона */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal {
  background: var(--bg-primary);
  border-radius: 20px;
  padding: 24px;
  min-width: 320px;
  max-width: 420px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-light);
}

.modal h3 {
  margin-bottom: 24px;
  color: var(--text-primary);
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bg-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.color-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.color-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 2px solid var(--border-light);
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.2s;
}

.color-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.custom-bg {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--accent);
  color: white;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: background 0.2s;
  border: none;
}

.upload-btn:hover {
  background: var(--accent-light);
}

.reset-btn {
  background: none;
  border: 1px solid var(--border-light);
  padding: 10px 16px;
  border-radius: 12px;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.2s;
}

.reset-btn:hover {
  background: var(--hover-bg);
}

.close-btn {
  margin-top: 24px;
  width: 100%;
  padding: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.close-btn:hover {
  background: var(--hover-bg);
}
</style>