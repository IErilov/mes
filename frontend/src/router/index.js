import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Main from '../views/Main.vue' 

const routes = [
  { path: '/login', component: Login, meta: { requiresGuest: true } },
  { path: '/register', component: Register, meta: { requiresGuest: true } },
  { path: '/', component: Main, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  // Восстановление пользователя при наличии токена
  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchUser()
    } catch (e) {
      authStore.logout()
    }
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router