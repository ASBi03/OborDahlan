<template>
  <div>
    <nav class="navbar">
      <div class="nav-left">
        <button class="nav-icon-btn" @click="goBack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div class="nav-brand" style="margin-left: 0.4rem">Postingan</div>
      </div>
    </nav>

    <div v-if="loading" class="main-layout" style="text-align: center; padding: 3rem; color: var(--gray-muted)">
      Memuat postingan...
    </div>

    <div class="page-content main-layout" v-else-if="post">
      <div class="post-card">
        <div class="post-header">
          <div class="avatar">{{ post.userInitials }}</div>
          <div class="post-meta">
            <div class="post-username">{{ post.userName }}</div>
            <div class="post-time">{{ formatTime(post.created_at) }} · {{ post.userNim }}</div>
          </div>
          <button
            v-if="post.user_id !== user?.id"
            class="action-btn"
            @click="startChat"
            style="margin-left: auto"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Kirim Pesan
          </button>
        </div>
        <div class="post-divider"></div>
        <p class="post-content">{{ post.content }}</p>
        <div v-if="post.image" class="post-image"><span>📷 Foto</span></div>
        <div class="post-actions">
          <button class="action-btn" :class="{ liked: post.liked }" @click="handleLike">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {{ post.likeCount }}
          </button>
          <button class="action-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {{ post.commentCount }}
          </button>
        </div>
      </div>

      <div
        style="
          background: white;
          border-radius: var(--radius-lg);
          padding: 1.2rem;
          box-shadow: var(--shadow);
          border: 1.5px solid var(--yellow);
        "
      >
        <div
          style="
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            font-size: 0.95rem;
            margin-bottom: 1rem;
          "
        >
          Komentar ({{ post.comments?.length || 0 }})
        </div>
        <div
          v-if="!post.comments?.length"
          style="text-align: center; padding: 1.5rem; color: var(--gray-muted); font-size: 0.85rem"
        >
          Belum ada komentar. Jadilah yang pertama! 💬
        </div>
        <div v-for="c in post.comments" :key="c.id" class="comment-item">
          <div class="avatar" style="width: 32px; height: 32px; font-size: 0.75rem; flex-shrink: 0">
            {{ c.userInitials }}
          </div>
          <div class="comment-bubble">
            <div class="comment-name">
              {{ c.userName }}
              <button
                v-if="c.user_id === user?.id"
                class="comment-delete"
                @click="handleDeleteComment(c.id)"
                title="Hapus komentar"
              >✕</button>
            </div>
            <div class="comment-text">{{ c.text }}</div>
            <div class="comment-time">{{ formatTime(c.created_at) }}</div>
          </div>
        </div>
        <div class="comment-input-wrap">
          <div class="avatar" style="width: 32px; height: 32px; font-size: 0.75rem; flex-shrink: 0">
            {{ user?.initials }}
          </div>
          <input
            class="comment-input"
            v-model="newComment"
            placeholder="Tulis komentar..."
            @keyup.enter="submitComment"
          />
          <button class="btn-send" @click="submitComment">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="main-layout" style="text-align: center; padding: 3rem; color: var(--gray-muted)">
      Postingan tidak ditemukan.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { usePosts } from '@/composables/usePosts'
import { useChat } from '@/composables/useChat'

const router = useRouter()
const route = useRoute()
const { currentUser: user } = useAuth()
const { fetchPost, toggleLike, addComment, deleteComment } = usePosts()
const { findOrCreateConversation } = useChat()

const post = ref(null)
const loading = ref(true)
const newComment = ref('')

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

onMounted(async () => {
  try {
    post.value = await fetchPost(route.params.id, user.value?.id)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

async function handleLike() {
  if (!user.value || !post.value) return
  const newLiked = await toggleLike(post.value.id, user.value.id)
  post.value.liked = newLiked
  post.value.likeCount += newLiked ? 1 : -1
}

async function submitComment() {
  if (!newComment.value.trim() || !user.value || !post.value) return
  const comment = await addComment(post.value.id, user.value.id, newComment.value)
  post.value.comments.push(comment)
  post.value.commentCount++
  newComment.value = ''
}

function goBack() {
  router.push('/home')
}
async function handleDeleteComment(commentId) {
  await deleteComment(commentId)
  post.value.comments = post.value.comments.filter((c) => c.id !== commentId)
  post.value.commentCount--
}
async function startChat() {
  if (!user.value || !post.value || post.value.user_id === user.value.id) return
  const convId = await findOrCreateConversation(user.value.id, post.value.user_id)
  router.push('/pesan/' + convId)
}
</script>