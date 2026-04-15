<template>
  <div class="feed-container">
    <h2>Лента новостей</h2>

    <!-- Форма добавления поста -->
    <div class="create-post">
      <textarea v-model="newPostContent" placeholder="Что у вас нового?" rows="3"></textarea>
      <button @click="createPost" :disabled="!newPostContent.trim()">Опубликовать</button>
    </div>

    <!-- Список постов -->
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="posts.length === 0" class="empty">Пока нет постов. Будьте первым!</div>
    <div v-else class="posts-list">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-header">
          <img :src="post.authorAvatar || defaultAvatar" class="post-avatar" />
          <div class="post-author">
            <strong>{{ post.authorName }}</strong>
            <span class="post-date">{{ formatDate(post.createdAt) }}</span>
          </div>
          <button v-if="post.authorId === user.id" class="delete-post" @click="deletePost(post.id)">🗑️</button>
        </div>
        <div class="post-content">{{ post.content }}</div>
        <div class="post-actions">
          <button @click="toggleLike(post)" class="like-btn" :class="{ liked: isLikedByMe(post) }">
            ❤️ {{ post.likesCount }}
          </button>
          <button @click="toggleComments(post.id)" class="comment-btn">
            💬 {{ post.commentsCount }}
          </button>
        </div>

        <!-- Блок комментариев (раскрывающийся) -->
        <div v-if="openCommentsId === post.id" class="comments-section">
          <div class="comments-list">
            <div v-for="comment in comments[post.id]" :key="comment.id" class="comment">
              <img :src="comment.authorAvatar || defaultAvatar" class="comment-avatar" />
              <div class="comment-body">
                <strong>{{ comment.authorName }}</strong>
                <span>{{ comment.text }}</span>
                <small>{{ formatDate(comment.createdAt) }}</small>
              </div>
            </div>
          </div>
          <div class="add-comment">
            <input v-model="newCommentText[post.id]" @keyup.enter="addComment(post.id)" placeholder="Написать комментарий..." />
            <button @click="addComment(post.id)">Отправить</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useUser } from '../composables/useUser'
import axios from 'axios'

const API_BASE = 'http://localhost:3000/api'

export default {
  setup() {
    const { user, avatarUrl } = useUser()
    const posts = ref([])
    const loading = ref(true)
    const newPostContent = ref('')
    const openCommentsId = ref(null)
    const comments = ref({})
    const newCommentText = ref({})
    const defaultAvatar = 'https://ui-avatars.com/api/?background=42b983&color=fff&bold=true&size=40'

    // Загрузка постов
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/posts`)
        posts.value = res.data
      } catch (err) {
        console.error('Ошибка загрузки постов', err)
      } finally {
        loading.value = false
      }
    }

    // Создать пост
    const createPost = async () => {
      if (!newPostContent.value.trim()) return
      try {
        const res = await axios.post(`${API_BASE}/posts`, {
          authorId: user.id,
          authorName: user.name,
          authorAvatar: avatarUrl.value,
          content: newPostContent.value
        })
        posts.value.unshift(res.data) // добавляем в начало списка
        newPostContent.value = ''
      } catch (err) {
        console.error('Ошибка создания поста', err)
      }
    }

    // Удалить пост
    const deletePost = async (postId) => {
      if (!confirm('Удалить пост?')) return
      try {
        await axios.delete(`${API_BASE}/posts/${postId}`)
        posts.value = posts.value.filter(p => p.id !== postId)
        // закрыть комментарии, если они были открыты
        if (openCommentsId.value === postId) openCommentsId.value = null
      } catch (err) {
        console.error('Ошибка удаления', err)
      }
    }

    // Лайк / дизлайк
    const isLikedByMe = (post) => {
      // Проверяем, есть ли уже лайк от текущего пользователя
      // Для простоты будем хранить локально в постах поле likedByMe (добавим при загрузке)
      return post.likedByMe === true
    }

    const toggleLike = async (post) => {
      try {
        const res = await axios.post(`${API_BASE}/likes`, {
          postId: post.id,
          userId: user.id
        })
        // обновить лайки на посту
        if (res.data.liked) {
          post.likesCount += 1
          post.likedByMe = true
        } else {
          post.likesCount -= 1
          post.likedByMe = false
        }
      } catch (err) {
        console.error('Ошибка лайка', err)
      }
    }

    // Комментарии
    const loadComments = async (postId) => {
      if (comments.value[postId]) return // уже загружены
      try {
        const res = await axios.get(`${API_BASE}/posts/${postId}/comments`)
        comments.value[postId] = res.data
      } catch (err) {
        console.error('Ошибка загрузки комментариев', err)
      }
    }

    const toggleComments = async (postId) => {
      if (openCommentsId.value === postId) {
        openCommentsId.value = null
      } else {
        openCommentsId.value = postId
        await loadComments(postId)
      }
    }

    const addComment = async (postId) => {
      const text = newCommentText.value[postId]
      if (!text || !text.trim()) return
      try {
        const res = await axios.post(`${API_BASE}/comments`, {
          postId,
          authorId: user.id,
          authorName: user.name,
          authorAvatar: avatarUrl.value,
          text: text.trim()
        })
        // добавляем комментарий в локальный массив
        if (!comments.value[postId]) comments.value[postId] = []
        comments.value[postId].push(res.data)
        // увеличиваем счётчик комментариев у поста
        const post = posts.value.find(p => p.id === postId)
        if (post) post.commentsCount += 1
        newCommentText.value[postId] = ''
      } catch (err) {
        console.error('Ошибка отправки комментария', err)
      }
    }

    // Форматирование даты
    const formatDate = (isoString) => {
      const date = new Date(isoString)
      const now = new Date()
      const diff = now - date
      if (diff < 60000) return 'только что'
      if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`
      return date.toLocaleDateString()
    }

    // Дополнительно: получить для каждого поста, лайкнул ли его текущий пользователь
    const enrichPostsWithLikeStatus = async () => {
      for (let post of posts.value) {
        try {
          const res = await axios.get(`${API_BASE}/posts/${post.id}/likes`)
          post.likedByMe = res.data.users.includes(user.id)
        } catch (err) {
          post.likedByMe = false
        }
      }
    }

    onMounted(async () => {
      await fetchPosts()
      await enrichPostsWithLikeStatus()
    })

    return {
      user,
      posts,
      loading,
      newPostContent,
      openCommentsId,
      comments,
      newCommentText,
      defaultAvatar,
      createPost,
      deletePost,
      toggleLike,
      isLikedByMe,
      toggleComments,
      addComment,
      formatDate
    }
  }
}
</script>

<style scoped>
.feed-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
}

.create-post {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 30px;
  border: 1px solid var(--border-color);
}

.create-post textarea {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 1rem;
  resize: vertical;
}

.create-post button {
  margin-top: 12px;
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 30px;
  cursor: pointer;
}

.post-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid var(--border-color);
  transition: transform 0.1s;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.post-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.post-author {
  flex: 1;
}

.post-author strong {
  display: block;
  font-size: 1rem;
}

.post-date {
  font-size: 0.7rem;
  opacity: 0.6;
}

.delete-post {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.5;
}

.delete-post:hover {
  opacity: 1;
}

.post-content {
  margin: 12px 0;
  font-size: 1rem;
  line-height: 1.4;
  white-space: pre-wrap;
}

.post-actions {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
}

.like-btn, .comment-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-color);
}

.like-btn.liked {
  color: #ff4d4d;
}

.comments-section {
  margin-top: 16px;
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
}

.comments-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 12px;
}

.comment {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.comment-body {
  flex: 1;
  background: var(--bg-color);
  padding: 8px 12px;
  border-radius: 16px;
}

.comment-body strong {
  font-size: 0.85rem;
  display: block;
}

.comment-body span {
  font-size: 0.9rem;
}

.comment-body small {
  font-size: 0.7rem;
  opacity: 0.6;
}

.add-comment {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.add-comment input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 30px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
}

.add-comment button {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 30px;
  cursor: pointer;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  opacity: 0.6;
}
</style>