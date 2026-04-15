<template>
  <div class="message-list" ref="messageListRef">
    <div
      v-for="msg in chatStore.messages"
      :key="msg.id"
      :class="['message', msg.sender_id === authStore.user?.id ? 'own' : 'other']"
    >
      <div class="content">{{ msg.content }}</div>
      <div class="time">{{ formatTime(msg.timestamp) }}</div>
    </div>
    <div v-if="chatStore.messages.length === 0" class="no-messages">
      Нет сообщений. Начните общение!
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useChatStore } from '../stores/chat'
import { useAuthStore } from '../stores/auth'

const chatStore = useChatStore()
const authStore = useAuthStore()
const messageListRef = ref(null)

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Автопрокрутка вниз при новых сообщениях
watch(() => chatStore.messages.length, async () => {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
})
</script>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: transparent; /* фон задаётся в ChatView */
}

.message {
  max-width: 75%;
  padding: 0.7rem 1rem;
  border-radius: 1.1rem;
  position: relative;
  word-wrap: break-word;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  transition: transform 0.1s ease;
  line-height: 1.4;
}

.message:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
}

.message.own {
  align-self: flex-end;
  background: var(--message-own);
  border-bottom-right-radius: 0.3rem;
  margin-left: auto;
}

.message.other {
  align-self: flex-start;
  background: var(--message-other);
  border-bottom-left-radius: 0.3rem;
  margin-right: auto;
}

.content {
  font-size: 0.95rem;
  color: var(--text-primary);
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

.time {
  font-size: 0.7rem;
  color: var(--text-secondary);
  margin-top: 0.35rem;
  text-align: right;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.message:hover .time {
  opacity: 1;
}

/* Стили для случая, когда сообщений нет */
.no-messages {
  text-align: center;
  color: var(--text-secondary);
  margin-top: 2.5rem;
  font-size: 1rem;
  padding: 1rem;
  background: color-mix(in srgb, var(--bg-primary) 80%, transparent);
  border-radius: 2rem;
  backdrop-filter: blur(4px);
  align-self: center;
}

/* Скроллбар */
.message-list::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: transparent;
}

.message-list::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}
/* В MessageList.vue после основных стилей */
[data-theme='dark'] .message {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

[data-theme='dark'] .message.own {
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
}
</style>