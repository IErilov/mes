<template>
  <div class="sidebar">
    <div class="app-name">
      <h2>Sparkly</h2>
    </div>
    <nav class="nav-menu">
      <button
        class="nav-item"
        :class="{ active: activeView === 'chats' }"
        @click="$emit('change-view', 'chats')"
      >
        <i class="bi bi-chat-fill"></i>
        <span>Чаты</span>
      </button>
      <button
        class="nav-item"
        :class="{ active: activeView === 'contacts' }"
        @click="$emit('change-view', 'contacts')"
      >
        <i class="bi bi-people-fill"></i>
        <span>Контакты</span>
      </button>
      <button
        class="nav-item"
        :class="{ active: activeView === 'profile' }"
        @click="$emit('change-view', 'profile')"
      >
        <i class="bi bi-person-circle"></i>
        <span>Профиль</span>
      </button>
      <button
        class="nav-item"
        :class="{ active: activeView === 'settings' }"
        @click="$emit('change-view', 'settings')"
      >
        <i class="bi bi-sliders"></i>
        <span>Настройки</span>
      </button>
    </nav>
    <div class="user-mini" @click="$emit('change-view', 'profile')">
      <div class="avatar-mini">
        <img v-if="authStore.user?.avatar_url" :src="authStore.user.avatar_url" alt="avatar" />
        <div v-else class="avatar-placeholder">{{ authStore.user?.username?.charAt(0).toUpperCase() }}</div>
      </div>
      <div class="user-info">
        <div class="name">{{ authStore.user?.full_name || authStore.user?.username }}</div>
        <div class="username">@{{ authStore.user?.username }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

defineProps(['activeView'])
defineEmits(['change-view'])

const authStore = useAuthStore()
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100%;
  background-color: var(--sidebar-bg);
  /* Частые диагональные полоски от края до края */
  background-image: repeating-linear-gradient(
    45deg,
    color-mix(in srgb, var(--accent) 10%, transparent) 0px,
    color-mix(in srgb, var(--accent) 10%, transparent) 2px,
    transparent 2px,
    transparent 8px
  );
  /* background-size не задаём, чтобы узор не повторялся в "квадратах" */
  animation: slideStripes 10s linear infinite;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-light);
  position: relative;
  overflow: hidden;
}

/* Мягкое свечение поверх полосок */
.sidebar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 30% 40%,
    color-mix(in srgb, var(--accent-light) 12%, transparent) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
}

/* Бегущий блик */
.sidebar::after {
  content: '';
  position: absolute;
  top: -10%;
  left: -30%;
  width: 60%;
  height: 120%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transform: skewX(-15deg);
  animation: lightSweep 8s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes slideStripes {
  0% { background-position: 0 0; }
  100% { background-position: 20px 20px; } /* Двигаем на расстояние, кратное периоду */
}
@keyframes lightSweep {
  0% { left: -30%; opacity: 0.15; }
  50% { left: 70%; opacity: 0.35; }
  100% { left: 130%; opacity: 0.15; }
}

/* Контент поверх эффектов */
.app-name,
.nav-menu,
.user-mini {
  position: relative;
  z-index: 2;
}

/* Ваши стили для элементов (оставьте как есть) */

/* === Ваши hover-приколы (без изменений) === */
.app-name {
  padding: 20px 16px;
  border-bottom: 1px solid var(--border-light);
  transition: all 0.3s ease;
}
.app-name h2 {
  font-weight: 700;
  color: var(--accent);
  text-shadow: 0 0 8px color-mix(in srgb, var(--accent) 40%, transparent);
  letter-spacing: -0.5px;
  transition: transform 0.2s, text-shadow 0.2s;
}
.app-name:hover h2 {
  transform: scale(1.02) translateX(2px);
  text-shadow: 0 0 15px color-mix(in srgb, var(--accent) 70%, transparent);
}

.nav-menu {
  flex: 1;
  padding: 8px 8px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1);
  margin-bottom: 4px;
  position: relative;
  overflow: hidden;
}
.nav-item::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: color-mix(in srgb, var(--accent) 20%, transparent);
  transform: translate(-50%, -50%);
  transition: width 0.4s, height 0.4s;
  z-index: -1;
}
.nav-item:hover::before {
  width: 300px;
  height: 300px;
}
.nav-item:hover {
  background: var(--hover-bg);
  transform: translateX(4px);
  box-shadow: -4px 4px 8px rgba(0,0,0,0.05);
}
.nav-item.active {
  background: var(--accent);
  color: white;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent) 40%, transparent);
}
.nav-item.active:hover {
  transform: translateX(4px) scale(1.02);
}
.nav-item svg {
  transition: transform 0.2s;
}
.nav-item:hover svg {
  transform: rotate(5deg) scale(1.1);
}
.nav-item.active svg {
  color: white;
}

.user-mini {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid var(--border-light);
  cursor: pointer;
  transition: all 0.25s;
  position: relative;
}
.user-mini:hover {
  background: var(--hover-bg);
  padding-left: 20px;
}
.user-mini::after {
  content: '⚡';
  position: absolute;
  right: 16px;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
}
.user-mini:hover::after {
  opacity: 0.7;
  transform: translateX(-4px);
}
.avatar-mini {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: box-shadow 0.2s, transform 0.2s;
  border: 2px solid transparent;
}
.user-mini:hover .avatar-mini {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 30%, transparent);
  transform: scale(1.05);
}
.avatar-mini img {
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
}
.user-info {
  flex: 1;
  overflow: hidden;
}
.name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.username {
  font-size: 13px;
  color: var(--text-secondary);
}

/* Пример изменений в Sidebar.vue */
.app-name h2 {
  font-size: 24px; /* фиксированный */
  /* ... */
}

.nav-item span {
  font-size: 1rem; /* масштабируется */
}

.user-info .name {
  font-size: 0.95rem;
}
.user-info .username {
  font-size: 0.85rem;
}
</style>