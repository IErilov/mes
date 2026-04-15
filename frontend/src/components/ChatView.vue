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
/* добавляем стили для модалки и кнопки */
.chat-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  position: relative;
}

.chat-settings-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 50%;
  transition: background 0.2s;
}
.chat-settings-btn:hover {
  background: var(--hover-bg);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
.modal h3 {
  margin-bottom: 20px;
  color: var(--text-primary);
}
.bg-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.color-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.color-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid var(--border-light);
  cursor: pointer;
  transition: transform 0.1s;
}
.color-btn:hover {
  transform: scale(1.1);
}
.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--accent);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
}
.reset-btn {
  background: none;
  border: 1px solid var(--border-light);
  padding: 8px;
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
}
.close-btn {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
}
</style>