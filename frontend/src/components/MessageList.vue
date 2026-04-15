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
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: var(--bg-tertiary);
  background-image: url('data:image/svg+xml;utf8,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M10 10 L90 90 M90 10 L10 90" stroke="%23ddd" stroke-width="0.5" opacity="0.3"/></svg>');
}

.message {
  max-width: 70%;
  padding: 0.6rem 0.8rem;
  border-radius: 0.75rem;
  position: relative;
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.message.own {
  align-self: flex-end;
  background: var(--message-own);
  border-bottom-right-radius: 0.25rem;
}

.message.other {
  align-self: flex-start;
  background: var(--message-other);
  border-bottom-left-radius: 0.25rem;
}

.content {
  font-size: 0.95rem;
  line-height: 1.4;
  color: var(--text-primary);
}

.time {
  font-size: 0.7rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  text-align: right;
}

.no-messages {
  text-align: center;
  color: var(--text-secondary);
  margin-top: 2rem;
  font-size: 0.9rem;
}
</style>