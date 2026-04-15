// composables/useUser.js (дополненный)
import { reactive, computed, onMounted } from 'vue'

const defaultAvatar = 'https://ui-avatars.com/api/?background=42b983&color=fff&bold=true&size=120&name=User'

const userState = reactive({
  id: null,
  name: 'Мой профиль',
  username: 'user_' + Math.floor(Math.random() * 10000),
  description: 'Расскажите о себе...',
  avatar: '',
  status: 'online'
})

const loadUser = () => {
  const saved = localStorage.getItem('messenger_user')
  if (saved) {
    const data = JSON.parse(saved)
    Object.assign(userState, data)
  } else {
    userState.id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)
    saveUser()
    // Устанавливаем дату регистрации, если её нет
    if (!localStorage.getItem('user_registered_at')) {
      localStorage.setItem('user_registered_at', new Date().toLocaleDateString())
    }
  }
}

const saveUser = () => {
  localStorage.setItem('messenger_user', JSON.stringify({
    id: userState.id,
    name: userState.name,
    username: userState.username,
    description: userState.description,
    avatar: userState.avatar,
    status: userState.status
  }))
}

const updateUser = (updates) => {
  Object.assign(userState, updates)
  saveUser()
}

export function useUser() {
  onMounted(() => loadUser())
  
  const avatarUrl = computed(() => userState.avatar || defaultAvatar)
  const statusText = computed(() => {
    if (userState.status === 'online') return 'В сети'
    if (userState.status === 'away') return 'Отошёл'
    return 'Не в сети'
  })
  
  return {
    user: userState,
    avatarUrl,
    statusText,
    updateUser
  }
}