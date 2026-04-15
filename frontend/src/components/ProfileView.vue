<template>
  <div class="profile-view">
    <div class="profile-header">
      <h2><i class="bi bi-person-circle"></i> Профиль</h2>
    </div>

    <div class="profile-content">
      <div class="avatar-section">
        <div class="avatar-wrapper" @click="triggerFileInput">
          <img v-if="authStore.user?.avatar_url" :src="authStore.user.avatar_url" alt="Avatar" />
          <div v-else class="avatar-placeholder">
            {{ authStore.user?.username?.charAt(0).toUpperCase() }}
          </div>
          <div class="avatar-overlay">
            <i class="bi bi-camera-fill"></i>
          </div>
        </div>
        <input type="file" ref="fileInput" @change="handleAvatarUpload" accept="image/*" style="display: none" />
        <p class="avatar-hint">Нажмите, чтобы изменить аватар</p>
      </div>

      <form @submit.prevent="saveProfile" class="profile-form">
        <div class="form-group">
          <label><i class="bi bi-at"></i> Имя пользователя</label>
          <input v-model="form.username" disabled />
        </div>
        <div class="form-group">
          <label><i class="bi bi-person-fill"></i> Полное имя</label>
          <input v-model="form.full_name" placeholder="Введите полное имя" />
        </div>
        <div class="form-group">
          <label><i class="bi bi-pencil-fill"></i> О себе</label>
          <textarea v-model="form.bio" placeholder="Расскажите о себе" rows="3"></textarea>
        </div>
        <button type="submit" class="save-btn" :disabled="saving">
          <i class="bi bi-check-lg"></i> {{ saving ? 'Сохранение...' : 'Сохранить изменения' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const fileInput = ref(null)
const saving = ref(false)

const form = reactive({
  username: '',
  full_name: '',
  bio: ''
})

watch(() => authStore.user, (user) => {
  if (user) {
    form.username = user.username
    form.full_name = user.full_name || ''
    form.bio = user.bio || ''
  }
}, { immediate: true })

const triggerFileInput = () => fileInput.value.click()

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  try {
    await authStore.uploadAvatar(file)
  } catch (e) {
    alert('Ошибка загрузки аватара')
  }
}

const saveProfile = async () => {
  saving.value = true
  try {
    await authStore.updateProfile({ full_name: form.full_name, bio: form.bio })
    alert('Профиль обновлён')
  } catch (e) {
    alert('Ошибка сохранения')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.profile-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
}
.profile-header {
  flex-shrink: 0;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-light);
}
.profile-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
}
.profile-header i {
  color: var(--accent);
  font-size: 26px;
}
.profile-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}
.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid var(--accent);
  transition: transform 0.2s;
}
.avatar-wrapper:hover {
  transform: scale(1.02);
}
.avatar-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
}
.avatar-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.5);
  color: white;
  text-align: center;
  padding: 6px;
  font-size: 16px;
  opacity: 0;
  transition: opacity 0.2s;
}
.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}
.avatar-hint {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: var(--text-primary);
}
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}
.form-group input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.save-btn {
  background: var(--accent);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>