<template>
  <div class="settings-view">
    <div class="settings-header">
      <h2><i class="bi bi-sliders"></i> Настройки</h2>
    </div>

    <div class="settings-content">
      <div class="theme-card">
        <h3><i class="bi bi-palette-fill"></i> Тема оформления</h3>
        <div class="theme-options">
          <label class="theme-option" :class="{ active: themeStore.currentTheme === 'light' }">
            <input type="radio" v-model="themeStore.currentTheme" value="light" @change="themeStore.setTheme('light')" />
            <i class="bi bi-sun-fill"></i>
            <span>Светлая</span>
          </label>
          <label class="theme-option" :class="{ active: themeStore.currentTheme === 'dark' }">
            <input type="radio" v-model="themeStore.currentTheme" value="dark" @change="themeStore.setTheme('dark')" />
            <i class="bi bi-moon-fill"></i>
            <span>Тёмная</span>
          </label>
          <label class="theme-option" :class="{ active: themeStore.currentTheme === 'system' }">
            <input type="radio" v-model="themeStore.currentTheme" value="system" @change="themeStore.setTheme('system')" />
            <i class="bi bi-laptop"></i>
            <span>Как в системе</span>
          </label>
        </div>
      </div>

      <div class="font-card">
        <h3><i class="bi bi-fonts"></i> Размер шрифта</h3>
        <div class="font-control">
          <i class="bi bi-fonts small"></i>
          <input
            type="range"
            min="12"
            max="24"
            step="1"
            v-model.number="themeStore.fontSize"
            @input="themeStore.setFontSize(themeStore.fontSize)"
          />
          <i class="bi bi-fonts large"></i>
        </div>
        <div class="font-preview" :style="{ fontSize: themeStore.fontSize + 'px' }">
          Пример текста
        </div>
      </div>

      <button @click="logout" class="logout-btn">
        <i class="bi bi-box-arrow-right"></i> Выйти из аккаунта
      </button>
    </div>
  </div>
</template>

<script setup>
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.settings-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
}
.settings-header {
  flex-shrink: 0;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-light);
}
.settings-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
}
.settings-header i {
  color: var(--accent);
  font-size: 26px;
}
.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.theme-card {
  background: var(--bg-secondary);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-light);
}
.theme-card h3 {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
}
.theme-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.theme-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
  background: var(--bg-primary);
}
.theme-option:hover {
  background: var(--hover-bg);
}
.theme-option.active {
  background: var(--accent);
  color: white;
}
.theme-option input {
  display: none;
}
.theme-option i {
  font-size: 20px;
}
.logout-btn {
  background: none;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
  padding: 14px;
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
}
.logout-btn:hover {
  background: #ff4d4f10;
}

.font-card {
  background: var(--bg-secondary);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-light);
}
.font-card h3 {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
}
.font-control {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}
.font-control i {
  font-size: 1.2em;
  color: var(--text-secondary);
}
.font-control i.large {
  font-size: 1.8em;
}
.font-control input {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--border-light);
  -webkit-appearance: none;
  appearance: none;
}
.font-control input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
}
.font-preview {
  margin-top: 16px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 8px;
  text-align: center;
  color: var(--text-primary);
  transition: font-size 0.1s;
}
</style>