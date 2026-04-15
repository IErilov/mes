import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'        // ваша домашняя страница
import Profile from '../pages/Profile.vue'
import Feed from '../pages/Feed.vue'
import Products from '../pages/Products.vue'
import DevTeam from '../pages/DevTeam.vue'
import Settings from '@/pages/Settings.vue'
import Chats from '@/pages/Chats.vue'
import Users from '@/pages/Users.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/feed', name: 'Feed', component: Feed },
  { path: '/products', name: 'Products', component: Products },
  { path: '/dev-team', name: 'DEV team', component: DevTeam },
  { path: '/settings', name: 'Settings', component: Settings },
  { path: '/chats', name: 'Чаты', component: Chats },
  { path: '/users', name: 'Пользователи', component: Users }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router