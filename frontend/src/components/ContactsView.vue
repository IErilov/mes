<template>
  <div class="contacts-view">
    <div class="header">
      <h2>Контакты</h2>
    </div>
    <div class="contacts-content">
      <UserSearch />
      <UserList />
    </div>
  </div>
</template>

<script setup>
import UserSearch from './UserSearch.vue'
import UserList from './UserList.vue'
</script>

<style scoped>
.contacts-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
}

.header {
  flex-shrink: 0;
  padding: 20px;
  border-bottom: 1px solid var(--border-light);
}

.contacts-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* UserList и UserSearch должны сами управлять overflow-y: auto */
</style>