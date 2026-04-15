<template>
  <div class="right-area" :class="{ 'full-width': isChatsPage }">
      <AppHeader v-if="!isChatsPage" />
  <div class="app-layout">
    <Sidebar v-if="!isChatsPage" />
      <main class="content" :class="{ 'no-header': isChatsPage }">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import AppHeader from './components/Header.vue'

export default {
  components: { Sidebar, AppHeader },
  setup() {
    const route = useRoute()
    const isChatsPage = computed(() => route.path === '/chats')
    return { isChatsPage }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

.right-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.right-area.full-width {
  width: 100%;
  margin-left: 0;
}

.content {
  flex: 1;
  padding: 1rem;
}

.content.no-header {
  padding-top: 0;
}
</style>