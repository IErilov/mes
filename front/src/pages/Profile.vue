<template>
  <div class="profile-page">
    <!-- Кнопка назад (если нужно) -->
    <div class="profile-header">
      <h1>Мой профиль</h1>
      <button class="edit-btn" @click="openEditModal">✎ Редактировать</button>
    </div>

    <div class="profile-content">
      <!-- Аватар -->
      <div class="avatar-card">
        <div class="avatar-wrapper">
          <img :src="avatarUrl" alt="Avatar" class="avatar-img" />
          <span class="status-indicator" :class="user.status"></span>
        </div>
      </div>

      <!-- Информация -->
      <div class="info-card">
        <div class="info-row">
          <label>Имя:</label>
          <span>{{ user.name }}</span>
        </div>
        <div class="info-row">
          <label>Username:</label>
          <span>@{{ user.username }}</span>
        </div>
        <div class="info-row">
          <label>Статус:</label>
          <span class="status-text" :class="user.status">
            {{ statusText }}
          </span>
        </div>
        <div class="info-row">
          <label>О себе:</label>
          <p class="description">{{ user.description || 'Не указано' }}</p>
        </div>
        <div class="info-row">
          <label>ID пользователя:</label>
          <span class="user-id">{{ user.id }}</span>
        </div>
      </div>

      <!-- Блок статистики (опционально) -->
      <div class="stats-card" v-if="stats">
        <h3>Статистика</h3>
        <div class="stats-row">
          <span>📝 Сообщений отправлено:</span>
          <strong>{{ stats.messagesSent || 0 }}</strong>
        </div>
        <div class="stats-row">
          <span>💬 Чатов создано:</span>
          <strong>{{ stats.chatsCreated || 0 }}</strong>
        </div>
        <div class="stats-row">
          <span>📅 Дата регистрации:</span>
          <strong>{{ stats.registeredAt || '—' }}</strong>
        </div>
      </div>
    </div>

    <!-- Модалка редактирования -->
    <EditProfileModal 
      v-if="showEditModal" 
      @close="showEditModal = false" 
      @saved="onProfileSaved" 
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useUser } from '../composables/useUser'
import EditProfileModal from '../components/EditProfileModal.vue'

export default {
  components: { EditProfileModal },
  setup() {
    const { user, avatarUrl, statusText } = useUser()
    const showEditModal = ref(false)
    const stats = ref(null)

    const openEditModal = () => {
      showEditModal.value = true
    }

    const onProfileSaved = () => {
      // Можно обновить локальную статистику или просто закрыть
      console.log('Профиль обновлён')
    }

    // Загрузка статистики (пример – можно собрать из localStorage)
    const loadStats = () => {
      const chats = JSON.parse(localStorage.getItem('simple_chats_v2') || '[]')
      let messagesCount = 0
      chats.forEach(chat => {
        messagesCount += (chat.messages?.length || 0)
      })
      stats.value = {
        messagesSent: messagesCount,
        chatsCreated: chats.length,
        registeredAt: localStorage.getItem('user_registered_at') || '—'
      }
      // Если даты регистрации нет – установим сегодняшнюю
      if (!localStorage.getItem('user_registered_at')) {
        const now = new Date().toLocaleDateString()
        localStorage.setItem('user_registered_at', now)
        stats.value.registeredAt = now
      }
    }

    onMounted(() => {
      loadStats()
    })

    return {
      user,
      avatarUrl,
      statusText,
      showEditModal,
      openEditModal,
      onProfileSaved,
      stats
    }
  }
}
</script>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
  animation: fadeIn 0.3s ease;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.profile-header h1 {
  margin: 0;
  font-size: 1.8rem;
  background: linear-gradient(135deg, var(--accent-color, #42b983), #2c6e49);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.edit-btn {
  background: var(--button-bg, #1a1a1a);
  color: var(--button-text, white);
  border: 1px solid var(--border-color, #2c2c2c);
  padding: 0.5rem 1.2rem;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: var(--accent-color, #42b983);
  color: white;
  border-color: var(--accent-color);
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.avatar-card {
  display: flex;
  justify-content: center;
}

.avatar-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--accent-color, #42b983);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.status-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid var(--card-bg, #1e1e1e);
  background: #44b700;
}

.status-indicator.online { background: #44b700; }
.status-indicator.away { background: #ffaa33; }
.status-indicator.offline { background: #888; }

.info-card, .stats-card {
  background: var(--card-bg, #1e1e1e);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid var(--border-color, #2c2c2c);
}

.info-row {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.info-row label {
  width: 100px;
  font-weight: 600;
  color: var(--accent-color, #42b983);
}

.info-row span, .info-row p {
  flex: 1;
  word-break: break-word;
}

.status-text {
  display: inline-block;
  padding: 0.2rem 0.8rem;
  border-radius: 30px;
  background: rgba(68, 183, 0, 0.1);
  color: #44b700;
}
.status-text.away { background: rgba(255, 170, 51, 0.1); color: #ffaa33; }
.status-text.offline { background: rgba(136, 136, 136, 0.1); color: #888; }

.description {
  margin: 0;
  line-height: 1.4;
  font-style: italic;
}

.user-id {
  font-family: monospace;
  font-size: 0.85rem;
  opacity: 0.7;
}

.stats-card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed var(--border-color);
}

.stats-row:last-child {
  border-bottom: none;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Адаптив */
@media (max-width: 600px) {
  .profile-page {
    padding: 1rem;
  }
  .info-row {
    flex-direction: column;
    gap: 0.3rem;
  }
  .info-row label {
    width: auto;
  }
}
</style>