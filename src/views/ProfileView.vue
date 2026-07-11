<template>
  <div>
    <nav class="navbar">
      <div class="nav-left">
        <button class="nav-icon-btn" @click="goBack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div class="nav-brand" style="margin-left: 0.4rem">Profil</div>
      </div>
      <div class="nav-right">
        <button class="nav-icon-btn" @click="handleLogout" title="Logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </nav>
    <div class="page-content">
      <div class="profile-cover"></div>
      <div class="profile-info-wrap main-layout" style="padding-top: 0">
        <div class="profile-avatar-lg">{{ user?.initials }}</div>
        <div class="profile-name">{{ user?.name }}</div>
        <div class="profile-nim">NIM: {{ user?.nim }} · {{ user?.jurusan }}</div>
        <div class="profile-stats">
          <div class="stat-item">
            <div class="stat-val">{{ userPostCount }}</div>
            <div class="stat-lbl">Postingan</div>
          </div>
          <div class="stat-item">
            <div class="stat-val">{{ followCounts.followers }}</div>
            <div class="stat-lbl">Pengikut</div>
          </div>
          <div class="stat-item">
            <div class="stat-val">{{ followCounts.following }}</div>
            <div class="stat-lbl">Mengikuti</div>
          </div>
        </div>
      </div>
      <div class="main-layout">
        <div
          v-for="post in userPosts"
          :key="post.id"
          class="post-card clickable"
          @click="goDetail(post.id)"
        >
          <div class="post-header">
            <div class="avatar">{{ post.userInitials }}</div>
            <div class="post-meta">
              <div class="post-username">{{ post.userName }}</div>
              <div class="post-time">{{ formatTime(post.created_at) }}</div>
            </div>
          </div>
          <div class="post-divider"></div>
          <p class="post-content">{{ post.content }}</p>
          <div class="post-actions">
            <button class="action-btn" :class="{ liked: post.liked }" @click.stop="handleLike(post)">
              ❤️ {{ post.likeCount }}
            </button>
            <button class="action-btn" @click.stop="goDetail(post.id)">💬 {{ post.commentCount }}</button>
          </div>
        </div>
        <div
          v-if="userPosts.length === 0"
          style="text-align: center; padding: 3rem; color: var(--gray-muted); font-size: 0.88rem"
        >
          Belum ada postingan.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { usePosts } from '@/composables/usePosts'

const router = useRouter()
const { currentUser: user, logout, fetchFollowCounts } = useAuth()
const { posts, toggleLike, fetchPosts } = usePosts()

const followCounts = ref({ followers: 0, following: 0 })

const userPosts = computed(() =>
  posts.value.filter((p) => p.user_id === user.value?.id)
)
const userPostCount = computed(() => userPosts.value.length)

async function loadFollowCounts() {
  if (user.value?.id) {
    followCounts.value = await fetchFollowCounts(user.value.id)
  }
}

onMounted(async () => {
  await fetchPosts()
  await loadFollowCounts()
})

watch(user, async () => {
  await loadFollowCounts()
})

function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  return `${days} hari lalu`
}

async function handleLike(post) {
  if (!user.value) return
  const newLiked = await toggleLike(post.id, user.value.id)
  post.liked = newLiked
  post.likeCount += newLiked ? 1 : -1
}

async function handleLogout() {
  await logout()
  router.push('/login')
}

function goBack() {
  router.push('/home')
}
function goDetail(id) {
  router.push('/post/' + id)
}
</script>