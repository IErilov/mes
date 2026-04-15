<template>
  <div class="d-flex flex-column flex-shrink-0 p-3" style="width: 280px; height: 100vh;">
    <a href="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none">
    </a>
    <ul class="nav nav-pills flex-column mb-auto">
      <li class="nav-item" v-for="item in menuItems" :key="item.path">
        <a
          href="#"
          class="nav-link-custom"
          :class="{ active: isActive(item.path) }"
          @click.prevent="navigate(item.path)"
        >
          {{ item.name }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import { useRoute, useRouter } from 'vue-router'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()

    const menuItems = [
      { path: '/profile', name: 'Profile' },
      { path: '/feed', name: 'Feed' },
      { path: '/products', name: 'Products' },
      { path: '/dev-team', name: 'DEV team' },
      { path: '/settings', name: 'Settings' },
      { path: '/chats', name: 'chats' },
      { path: '/users', name: 'Users' }
    ]

    const isActive = (path) => route.path === path

    const navigate = (path) => {
      router.push(path)
    }

    return { menuItems, isActive, navigate }
  }
}
</script>

<style scoped>
.nav-link-custom {
  display: block;
  padding: 0.5rem 1rem;
  color: r#42b983(255, 255, 255, 0.87);
  text-decoration: none;
  transition: color 0.3s ease;
  border-radius: 0.375rem;
  cursor: pointer;
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  font-weight: 400;
  line-height: 1.5;
}

.nav-link-custom:hover {
  color: #42b983;
}

.nav-link-custom.active {
  color: #42b983;
  background-color: rgba(66, 185, 131, 0.1);
}

@media (prefers-color-scheme: light) {
  .nav-link-custom {
    color: #213547;
  }
  .nav-link-custom.active {
    color: #2c6e49;
    background-color: rgba(44, 110, 73, 0.1);
  }
}
</style>