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
    </nav>
    <div class="page-content">
      <div class="profile-cover"></div>
      <div class="profile-info-wrap main-layout" style="padding-top: 0">
        <div v-if="loading" style="text-align: center; padding: 2rem; color: var(--gray-muted)">
          Memuat profil...
        </div>
        <template v-else-if="profileUser">
          <div class="profile-avatar-lg">{{ profileUser.initials }}</div>
          <div class="profile-name">{{ profileUser.name }}</div>
          <div class="profile-nim">
            <span v-if="profileUser.nim">NIM: {{ profileUser.nim }}</span>
            <span v-if="profileUser.nim && profileUser.jurusan"> · </span>
            <span v-if="profileUser.jurusan">{{ profileUser.jurusan }}</span>
            <span v-if="!profileUser.nim && !profileUser.jurusan" style="color: var(--gray-muted)">Belum ada data diri</span>
          </div>
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
          <div class="profile-actions">
            <button
              class="btn-follow"
              :class="{ 'btn-following': isFollowingUser }"
              @click="handleFollow"
              :disabled="followLoading"
            >
              <svg v-if="!isFollowingUser" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              {{ isFollowingUser ? 'Mengikuti' : 'Ikuti' }}
            </button>
            <button class="btn-msg-profile" @click="startChat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Kirim Pesan
            </button>
          </div>
        </template>
      </div>
      <div class="main-layout" v-if="!loading">
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {{ post.likeCount }}
            </button>
            <button class="action-btn" @click.stop="goDetail(post.id)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {{ post.commentCount }}
            </button>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/composables/useAuth'
import { usePosts } from '@/composables/usePosts'
import { useChat } from '@/composables/useChat'

const router = useRouter()
const route = useRoute()
const { currentUser: user, fetchFollowCounts, isFollowing, toggleFollow } = useAuth()
const { posts, toggleLike, fetchPosts } = usePosts()
const { findOrCreateConversation } = useChat()

const profileUser = ref(null)
const loading = ref(true)
const followCounts = ref({ followers: 0, following: 0 })
const isFollowingUser = ref(false)
const followLoading = ref(false)

const userPosts = computed(() =>
  posts.value.filter((p) => p.user_id === route.params.id)
)
const userPostCount = computed(() => userPosts.value.length)

onMounted(async () => {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', route.params.id)
      .single()
    profileUser.value = data

    if (data) {
      followCounts.value = await fetchFollowCounts(data.id)
      if (user.value && user.value.id !== data.id) {
        isFollowingUser.value = await isFollowing(data.id)
      }
      await fetchPosts(user.value?.id)
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

async function handleFollow() {
  if (!user.value) return
  followLoading.value = true
  try {
    const result = await toggleFollow(route.params.id)
    isFollowingUser.value = result
    followCounts.value.followers += result ? 1 : -1
  } catch (err) {
    console.error(err)
  } finally {
    followLoading.value = false
  }
}

async function startChat() {
  if (!user.value || !profileUser.value) return
  const convId = await findOrCreateConversation(user.value.id, profileUser.value.id)
  router.push('/pesan/' + convId)
}

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

function goBack() {
  router.back()
}
function goDetail(id) {
  router.push('/post/' + id)
}
</script>
