<template>
  <div class="settings-page">
    <h1>Настройки</h1>

    <!-- Секция: Тема -->
    <section class="settings-section">
      <h2>Оформление</h2>
      <div class="setting-item">
        <label>Тема</label>
        <div class="theme-buttons">
          <button 
            :class="{ active: theme === 'light' }" 
            @click="setTheme('light')"
          >Светлая</button>
          <button 
            :class="{ active: theme === 'dark' }" 
            @click="setTheme('dark')"
          >Тёмная</button>
          <button 
            :class="{ active: theme === 'auto' }" 
            @click="setTheme('auto')"
          >Системная</button>
        </div>
      </div>

      <div class="setting-item">
        <label>Размер шрифта</label>
        <input 
          type="range" 
          v-model.number="fontSize" 
          min="12" 
          max="24" 
          step="1"
        />
        <span>{{ fontSize }}px</span>
      </div>
    </section>

    <!-- Секция: Чат / интерфейс -->
    <section class="settings-section">
      <h2>Интерфейс чата</h2>
      <div class="setting-item">
        <label>Режим сообщений</label>
        <select v-model="chatMode">
          <option value="compact">Компактный</option>
          <option value="comfortable">Комфортный</option>
        </select>
      </div>

      <div class="setting-item">
        <label>Анимация сообщений</label>
        <input type="checkbox" v-model="messageAnimations" />
        <span>Плавное появление</span>
      </div>

      <div class="setting-item">
        <label>Звук уведомлений</label>
        <input type="checkbox" v-model="notificationSound" />
        <span>Включить звук</span>
      </div>
    </section>

    <!-- Секция: Дополнительно -->
    <section class="settings-section">
      <h2>Дополнительно</h2>
      <div class="setting-item">
        <label>Автосохранение черновиков</label>
        <input type="checkbox" v-model="autoSaveDrafts" />
      </div>
      <button class="reset-btn" @click="resetSettings">Сбросить настройки</button>
    </section>
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue'

export default {
  name: 'SettingsPage',
  setup() {
    // Состояния настроек
    const theme = ref('auto')
    const fontSize = ref(16)
    const chatMode = ref('comfortable')
    const messageAnimations = ref(true)
    const notificationSound = ref(false)
    const autoSaveDrafts = ref(true)

    // Функция применения темы к документу
    const applyTheme = (newTheme) => {
      if (newTheme === 'auto') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
      } else {
        document.documentElement.setAttribute('data-theme', newTheme)
      }
    }

    // Установка темы с сохранением
    const setTheme = (newTheme) => {
      theme.value = newTheme
      applyTheme(newTheme)
      localStorage.setItem('settings_theme', newTheme)
    }

    // Применение размера шрифта к корню
    const applyFontSize = (size) => {
      document.documentElement.style.fontSize = `${size}px`
      localStorage.setItem('settings_fontSize', size)
    }

    // Сохранение остальных настроек в localStorage
    const saveOtherSettings = () => {
      localStorage.setItem('settings_chatMode', chatMode.value)
      localStorage.setItem('settings_messageAnimations', messageAnimations.value)
      localStorage.setItem('settings_notificationSound', notificationSound.value)
      localStorage.setItem('settings_autoSaveDrafts', autoSaveDrafts.value)
    }

    // Загрузка настроек из localStorage
    const loadSettings = () => {
      const savedTheme = localStorage.getItem('settings_theme')
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        theme.value = savedTheme
        applyTheme(savedTheme)
      } else {
        applyTheme('auto')
      }

      const savedFontSize = localStorage.getItem('settings_fontSize')
      if (savedFontSize) {
        fontSize.value = parseInt(savedFontSize)
        applyFontSize(fontSize.value)
      } else {
        applyFontSize(16)
      }

      const savedChatMode = localStorage.getItem('settings_chatMode')
      if (savedChatMode) chatMode.value = savedChatMode

      const savedMessageAnimations = localStorage.getItem('settings_messageAnimations')
      if (savedMessageAnimations !== null) messageAnimations.value = savedMessageAnimations === 'true'

      const savedNotificationSound = localStorage.getItem('settings_notificationSound')
      if (savedNotificationSound !== null) notificationSound.value = savedNotificationSound === 'true'

      const savedAutoSaveDrafts = localStorage.getItem('settings_autoSaveDrafts')
      if (savedAutoSaveDrafts !== null) autoSaveDrafts.value = savedAutoSaveDrafts === 'true'
    }

    // Сброс настроек
    const resetSettings = () => {
      theme.value = 'auto'
      fontSize.value = 16
      chatMode.value = 'comfortable'
      messageAnimations.value = true
      notificationSound.value = false
      autoSaveDrafts.value = true

      applyTheme('auto')
      applyFontSize(16)
      saveOtherSettings()
      localStorage.removeItem('settings_theme')
      localStorage.removeItem('settings_fontSize')
      // остальные уже сохранены через saveOtherSettings, но перезапишем
      saveOtherSettings()
    }

    // Следим за изменениями и сохраняем
    watch(fontSize, (newSize) => applyFontSize(newSize))
    watch([chatMode, messageAnimations, notificationSound, autoSaveDrafts], () => saveOtherSettings())

    onMounted(() => {
      loadSettings()
      // Слушаем системные изменения темы, если выбран режим auto
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (theme.value === 'auto') {
          applyTheme('auto')
        }
      })
    })

    return {
      theme,
      fontSize,
      chatMode,
      messageAnimations,
      notificationSound,
      autoSaveDrafts,
      setTheme,
      resetSettings
    }
  }
}
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.settings-section {
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}

.setting-item {
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.setting-item label {
  width: 150px;
  font-weight: 500;
  color: var(--text-color);
}

.theme-buttons {
  display: flex;
  gap: 0.5rem;
}

.theme-buttons button {
  padding: 0.3rem 1rem;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: var(--button-bg);
  color: var(--button-text);
  border-radius: 4px;
  transition: all 0.2s;
}

.theme-buttons button:hover {
  opacity: 0.8;
}

.theme-buttons button.active {
  background: var(--accent-color, #42b983);
  color: white;
  border-color: var(--accent-color, #42b983);
}

input[type="range"] {
  width: 200px;
  background: var(--card-bg);
}

.reset-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.reset-btn:hover {
  background: #c0392b;
}

select, input[type="checkbox"] {
  accent-color: var(--accent-color, #42b983);
}
</style>