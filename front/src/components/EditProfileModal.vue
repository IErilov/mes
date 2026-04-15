<!-- src/components/EditProfileModal.vue -->
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container" :data-theme="currentTheme">
      <div class="modal-header">
        <h3>Редактировать профиль</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- Аватар -->
        <div class="avatar-section">
          <div class="avatar-wrapper" @click="triggerFileInput">
            <img :src="localAvatarUrl" class="avatar-img" />
            <div class="avatar-overlay">📷</div>
          </div>
          <input type="file" ref="fileInput" accept="image/*" style="display:none" @change="onAvatarChange" />
          <button class="reset-avatar" @click="resetAvatar">Сбросить аватар</button>
        </div>

        <!-- Поля -->
        <div class="form-group">
          <label>Имя</label>
          <input v-model="form.name" type="text" placeholder="Ваше имя" maxlength="50" />
        </div>

        <div class="form-group">
          <label>Username (уникальный)</label>
          <input v-model="form.username" type="text" placeholder="username" maxlength="30" />
          <small>Только латиница, цифры и _</small>
        </div>

        <div class="form-group">
          <label>Описание / О себе</label>
          <textarea v-model="form.description" rows="3" placeholder="Расскажите о себе..." maxlength="200"></textarea>
        </div>

        <div class="form-group">
          <label>Статус</label>
          <select v-model="form.status">
            <option value="online">🟢 В сети</option>
            <option value="away">🌙 Отошёл</option>
            <option value="offline">⚫ Не в сети</option>
          </select>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">Отмена</button>
        <button class="save-btn" @click="saveProfile">Сохранить</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useUser } from '../composables/useUser'

export default {
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const { user, updateUser } = useUser()
    const fileInput = ref(null)
    
    const form = ref({
      name: user.name,
      username: user.username,
      description: user.description,
      status: user.status,
      avatar: user.avatar
    })

    const localAvatarUrl = computed(() => 
      form.value.avatar || `https://ui-avatars.com/api/?background=42b983&color=fff&bold=true&size=120&name=${encodeURIComponent(form.value.name)}`
    )

    const triggerFileInput = () => fileInput.value.click()
    const onAvatarChange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        form.value.avatar = ev.target.result
      }
      reader.readAsDataURL(file)
    }
    const resetAvatar = () => { form.value.avatar = '' }

    const saveProfile = () => {
      let username = form.value.username.trim()
      if (!username) username = 'user_' + Date.now()
      username = username.replace(/[^a-zA-Z0-9_]/g, '_')
      
      updateUser({
        name: form.value.name.trim() || 'Гость',
        username,
        description: form.value.description.trim(),
        status: form.value.status,
        avatar: form.value.avatar
      })
      emit('saved')
      emit('close')
    }

    const currentTheme = computed(() => {
      const saved = localStorage.getItem('messenger_theme') || 'auto'
      if (saved === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return saved
    })

    return { form, localAvatarUrl, fileInput, triggerFileInput, onAvatarChange, resetAvatar, saveProfile, currentTheme }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}
.modal-container {
  background: var(--modal-bg, #1e1e1e);
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 35px rgba(0,0,0,0.3);
  border: 1px solid var(--border-color);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}
.modal-header h3 { margin: 0; }
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-color);
  opacity: 0.7;
}
.close-btn:hover { opacity: 1; }
.modal-body { padding: 20px; }
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}
.avatar-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid #42b983;
  margin-bottom: 12px;
  position: relative;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.6);
  text-align: center;
  padding: 6px;
  font-size: 18px;
  opacity: 0;
  transition: opacity 0.2s;
  color: white;
}
.avatar-wrapper:hover .avatar-overlay { opacity: 1; }
.reset-avatar {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 0.8rem;
}
.form-group {
  margin-bottom: 18px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}
.form-group input, .form-group textarea, .form-group select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 1rem;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}
.cancel-btn, .save-btn {
  padding: 8px 20px;
  border-radius: 30px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}
.cancel-btn {
  background: var(--button-bg);
  color: var(--button-text);
  border: 1px solid var(--border-color);
}
.save-btn {
  background: #42b983;
  color: white;
}
</style>