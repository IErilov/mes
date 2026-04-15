<template>
  <div class="auth-container">
    <h2>Регистрация</h2>
    <form @submit.prevent="handleRegister">
      <input v-model="username" type="text" placeholder="Имя пользователя" required />
      <input v-model="fullName" type="text" placeholder="Полное имя (необязательно)" />
      <input v-model="password" type="password" placeholder="Пароль" required />
      <button type="submit">Зарегистрироваться</button>
    </form>
    <p>Уже есть аккаунт? <router-link to="/login">Войти</router-link></p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const username = ref('')
const fullName = ref('')
const password = ref('')
const error = ref('')

const handleRegister = async () => {
  try {
    await authStore.register(username.value, password.value, fullName.value)
    router.push('/login')
  } catch (e) {
    error.value = e.response?.data?.detail || 'Ошибка регистрации'
  }
}
</script>

<style scoped>
/* Те же стили, что и у Login */
.auth-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #075e54;
}
input {
  display: block;
  width: 100%;
  margin: 16px 0;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}
button {
  width: 100%;
  padding: 12px;
  background: #075e54;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}
button:hover {
  background: #064940;
}
p {
  text-align: center;
  margin-top: 20px;
}
.error {
  color: #d32f2f;
  margin-top: 10px;
}
</style>