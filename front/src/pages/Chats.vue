<template>
  <div class="chats-container">
    <!-- Список чатов -->
    <div class="chats-sidebar">
      <div class="chats-header">
        <h3>Диалоги</h3>
        <button class="add-chat-btn" @click="openNewChatModal">+</button>
      </div>
      <div class="chats-list">
        <div
          v-for="chat in chats"
          :key="chat.id"
          class="chat-item"
          :class="{ active: activeChat?.id === chat.id }"
          @click="selectChat(chat)"
        >
          <div class="chat-avatar">
            <div class="avatar-placeholder">{{ chat.name.charAt(0) }}</div>
          </div>
          <div class="chat-info">
            <div class="chat-name">{{ chat.name }}</div>
            <div class="chat-last-message">{{ chat.lastMessage }}</div>
          </div>
          <button class="delete-chat-btn" @click.stop="deleteChat(chat.id)">✕</button>
        </div>
      </div>
    </div>

    <!-- Окно чата -->
    <div class="chat-window" v-if="activeChat">
      <div class="chat-header">
        <div class="chat-avatar small">
          <div class="avatar-placeholder">{{ activeChat.name.charAt(0) }}</div>
        </div>
        <div class="chat-name">{{ activeChat.name }}</div>
      </div>

      <div class="messages-area" ref="messagesContainer">
        <div
          v-for="message in activeMessages"
          :key="message.id"
          class="message"
          :class="{ 'message-out': message.isOutgoing, 'message-in': !message.isOutgoing }"
        >
          <div class="message-bubble">
            <div class="message-text">{{ message.text }}</div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
      </div>

      <div class="message-input-area">
        <input
          type="text"
          v-model="newMessageText"
          @keyup.enter="sendMessage"
          placeholder="Введите сообщение..."
          class="message-input"
        />
        <button @click="sendMessage" class="send-btn">➤</button>
      </div>
    </div>

    <div class="no-chat-selected" v-else>
      <p>Выберите чат или создайте новый</p>
    </div>

    <!-- Модальное окно создания чата -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>Новый чат</h3>
        <input
          type="text"
          v-model="searchUsername"
          placeholder="Введите username пользователя"
          class="search-input"
          @input="searchUsers"
        />
        <div class="users-list-modal" v-if="searchResults.length">
          <div
            v-for="user in searchResults"
            :key="user.id"
            class="user-item"
            @click="createChatWithUser(user)"
          >
            <div class="user-avatar">{{ user.username.charAt(0).toUpperCase() }}</div>
            <div class="user-info">
              <div class="user-username">@{{ user.username }}</div>
              <div class="user-name">{{ user.name }}</div>
            </div>
          </div>
        </div>
        <div v-else-if="searchUsername && searchResults.length === 0" class="no-results">
          Пользователь не найден
        </div>
        <button class="close-modal-btn" @click="closeModal">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick, watch, onMounted } from 'vue'

export default {
  name: 'ChatsPage',
  setup() {
    // ---------- Моковые данные пользователей (как в Telegram) ----------
    const allUsers = ref([
      { id: 1, username: 'alex', name: 'Алексей Иванов' },
      { id: 2, username: 'maria', name: 'Мария Петрова' },
      { id: 3, username: 'ivan', name: 'Иван Соколов' },
      { id: 4, username: 'olga', name: 'Ольга Кузнецова' },
      { id: 5, username: 'dmitry', name: 'Дмитрий Орлов' }
    ])

    // Загружаем чаты из localStorage или создаём начальные
    const loadChats = () => {
      const stored = localStorage.getItem('chats')
      if (stored) {
        return JSON.parse(stored)
      } else {
        // Пример начального чата с Алексеем
        return [
          {
            id: 1,
            userId: 1,
            name: 'Алексей Иванов',
            username: 'alex',
            lastMessage: 'Привет! Как дела?',
            messages: [
              { id: 1, text: 'Привет! Как дела?', timestamp: new Date(2025, 2, 10, 10, 30), isOutgoing: false },
              { id: 2, text: 'Отлично! А у тебя?', timestamp: new Date(2025, 2, 10, 10, 32), isOutgoing: true },
            ]
          }
        ]
      }
    }

    const chats = ref(loadChats())
    const activeChat = ref(null)
    const newMessageText = ref('')
    const messagesContainer = ref(null)

    // Состояние модального окна
    const showModal = ref(false)
    const searchUsername = ref('')
    const searchResults = ref([])

    const activeMessages = computed(() => activeChat.value?.messages || [])

    const selectChat = (chat) => {
      activeChat.value = chat
    }

    const sendMessage = () => {
      if (!newMessageText.value.trim() || !activeChat.value) return
      const newMsg = {
        id: Date.now(),
        text: newMessageText.value.trim(),
        timestamp: new Date(),
        isOutgoing: true
      }
      activeChat.value.messages.push(newMsg)
      activeChat.value.lastMessage = newMsg.text
      newMessageText.value = ''
      saveChatsToLocalStorage()
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }

    const formatTime = (date) => {
      return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const deleteChat = (chatId) => {
      const index = chats.value.findIndex(c => c.id === chatId)
      if (index !== -1) {
        chats.value.splice(index, 1)
        if (activeChat.value?.id === chatId) {
          activeChat.value = chats.value[0] || null
        }
        saveChatsToLocalStorage()
      }
    }

    const saveChatsToLocalStorage = () => {
      localStorage.setItem('chats', JSON.stringify(chats.value))
    }

    // Поиск пользователей по username
    const searchUsers = () => {
      if (!searchUsername.value.trim()) {
        searchResults.value = []
        return
      }
      const query = searchUsername.value.toLowerCase()
      searchResults.value = allUsers.value.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.name.toLowerCase().includes(query)
      )
    }

    // Создание чата с выбранным пользователем
    const createChatWithUser = (user) => {
      // Проверяем, нет ли уже чата с этим пользователем
      const existingChat = chats.value.find(chat => chat.userId === user.id)
      if (existingChat) {
        // Если есть, просто открываем его
        selectChat(existingChat)
        closeModal()
        return
      }
      // Создаём новый чат
      const newChat = {
        id: Date.now(),
        userId: user.id,
        name: user.name,
        username: user.username,
        lastMessage: 'Новый чат',
        messages: []
      }
      chats.value.unshift(newChat)
      saveChatsToLocalStorage()
      selectChat(newChat)
      closeModal()
    }

    const openNewChatModal = () => {
      searchUsername.value = ''
      searchResults.value = []
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      searchUsername.value = ''
      searchResults.value = []
    }

    // Следим за изменением активного чата для прокрутки
    watch(activeChat, () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    })

    onMounted(() => {
      // Если есть сохранённый активный чат, восстанавливаем (по желанию)
      if (chats.value.length > 0 && !activeChat.value) {
        activeChat.value = chats.value[0]
      }
    })

    return {
      chats,
      activeChat,
      newMessageText,
      activeMessages,
      messagesContainer,
      selectChat,
      sendMessage,
      formatTime,
      deleteChat,
      showModal,
      searchUsername,
      searchResults,
      searchUsers,
      createChatWithUser,
      openNewChatModal,
      closeModal
    }
  }
}
</script>

<style scoped>
/* все предыдущие стили остаются, добавим стили для модального окна и поиска */
.chats-container {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: var(--bg-color);
  color: var(--text-color);
}

/* ... остальные стили как в предыдущем ответе ... */

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--card-bg);
  border-radius: 20px;
  padding: 1.5rem;
  width: 400px;
  max-width: 90%;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.6rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  color: var(--text-color);
  margin-bottom: 1rem;
}

.users-list-modal {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem;
  cursor: pointer;
  border-radius: 12px;
  transition: background-color 0.2s;
}

.user-item:hover {
  background-color: var(--hover-bg);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  text-transform: uppercase;
}

.user-info .user-username {
  font-weight: 500;
  font-size: 0.9rem;
}

.user-info .user-name {
  font-size: 0.8rem;
  opacity: 0.7;
}

.no-results {
  text-align: center;
  padding: 1rem;
  opacity: 0.6;
}

.close-modal-btn {
  width: 100%;
  padding: 0.5rem;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  color: var(--text-color);
}
    .chats-container {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: var(--bg-color);
  color: var(--text-color);
}

/* Боковая панель со списком чатов */
.chats-sidebar {
  width: 320px;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  background-color: var(--card-bg);
}

.chats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.chats-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.add-chat-btn {
  background-color: var(--accent-color, #42b983);
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.add-chat-btn:hover {
  opacity: 0.8;
}

.chats-list {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--border-color);
}

.chat-item:hover {
  background-color: var(--hover-bg);
}

.chat-item.active {
  background-color: var(--hover-bg);
  border-left: 3px solid var(--accent-color, #42b983);
}

.chat-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--accent-color, #42b983);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  flex-shrink: 0;
  overflow: hidden;
}

.avatar-placeholder {
  font-weight: bold;
  font-size: 1.2rem;
  color: white;
  text-transform: uppercase;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.chat-last-message {
  font-size: 0.85rem;
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-chat-btn {
  background: none;
  border: none;
  color: var(--text-color);
  opacity: 0.5;
  cursor: pointer;
  font-size: 0.8rem;
  margin-left: 0.5rem;
  transition: opacity 0.2s, color 0.2s;
}

.delete-chat-btn:hover {
  opacity: 1;
  color: #e74c3c;
}

/* Окно чата */
.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--card-bg);
}

.chat-avatar.small {
  width: 36px;
  height: 36px;
  margin-right: 0.75rem;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message {
  display: flex;
  width: 100%;
}

.message-in {
  justify-content: flex-start;
}

.message-out {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 0.5rem 0.75rem;
  border-radius: 1rem;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
}

.message-out .message-bubble {
  background-color: var(--accent-color, #42b983);
  color: white;
}

.message-text {
  word-wrap: break-word;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.7;
  text-align: right;
  margin-top: 0.25rem;
}

.message-input-area {
  display: flex;
  padding: 0.75rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--card-bg);
  gap: 0.5rem;
}

.message-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 1.5rem;
  background-color: var(--bg-color);
  color: var(--text-color);
  outline: none;
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: var(--accent-color, #42b983);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-chat-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}
</style>