<template>
  <div class="main-layout">
    <Sidebar :active-view="activeView" @change-view="activeView = $event" />
    <div class="content-area">
      <ChatView v-if="activeView === 'chats'" />
      <ContactsView v-else-if="activeView === 'contacts'" />
      <ProfileView v-else-if="activeView === 'profile'" />
      <SettingsView v-else-if="activeView === 'settings'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import ChatView from '../components/ChatView.vue'
import ContactsView from '../components/ContactsView.vue'
import SettingsView from '../components/SettingsView.vue'
import ProfileView from '../components/ProfileView.vue'

const activeView = ref('chats')
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100%;
  width: 100%;
  background: var(--bg-primary);
}

.content-area {
  flex: 1;
  min-width: 0;      /* чтобы flex не вылезал */
  height: 100%;
  overflow: hidden;
}
</style>