<template>
  <div class="team-page">
    <h1>Наша команда</h1>
    <div class="team-members">
      <div class="member-card" v-for="member in team" :key="member.id">
        <h3>{{ member.name }}</h3>
        <p class="role">{{ member.role }}</p>
        <p class="bio">{{ member.bio }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      team: [
        { id: 1, name: 'Иван Иванов', role: 'Team Lead', bio: 'Любит Vue и порядок' },
        { id: 2, name: 'Мария Петрова', role: 'Frontend', bio: 'Создаёт красивый интерфейс' },
        { id: 3, name: 'Алексей Смирнов', role: 'Backend', bio: 'Магия серверов' }
      ]
    }
  }
}
</script>

<style scoped>
.team-page {
  padding: 1rem;
}

.team-members {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.member-card {
  background-color: var(--card-bg);      
  color: var(--text-color);               
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  width: 260px;
  transition: transform 0.2s, background-color 0.3s, border-color 0.3s;
}

.member-card:hover {
  transform: translateY(-5px);
  border-color: #42b983;
}

.role {
  color: #42b983;                      
  font-weight: 500;
  margin: 0.5rem 0;
}

.bio {
  font-size: 0.9rem;
  line-height: 1.4;
  opacity: 0.8;
}
</style>