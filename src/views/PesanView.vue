<template>
  <div>
    <nav class="navbar">
      <div class="nav-left">
        <button class="nav-icon-btn" @click="goBack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div class="nav-brand" style="margin-left: 0.4rem">Pesan</div>
      </div>
      <div class="nav-right">
        <button class="nav-icon-btn" @click="showNewChat = true" title="Chat Baru">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </nav>
    <div class="page-content main-layout">
      <div v-if="loading" style="text-align: center; padding: 2rem; color: var(--gray-muted)">
        Memuat percakapan...
      </div>
      <div
        v-for="conv in conversations"
        :key="conv.id"
        class="chat-item"
        @click="goChat(conv.id)"
      >
        <div class="chat-avatar">{{ conv.otherUser?.initials }}</div>
        <div class="chat-info">
          <div class="chat-name">{{ conv.otherUser?.name }}</div>
          <div class="chat-preview">{{ conv.lastMessage || 'Mulai percakapan...' }}</div>
        </div>
        <div class="chat-meta">
          <div class="chat-time">{{ formatTime(conv.lastMessageAt) }}</div>
        </div>
      </div>
      <div
        v-if="!loading && conversations.length === 0"
        style="text-align: center; padding: 3rem; color: var(--gray-muted)"
      >
        <div style="font-size: 2rem; margin-bottom: 0.5rem">💬</div>
        <div>Belum ada percakapan.</div>
        <button class="btn-new-chat-empty" @click="showNewChat = true">Mulai Chat Baru</button>
      </div>
    </div>

    <!-- MODAL NEW CHAT -->
    <div v-if="showNewChat" class="modal-overlay" @click.self="closeNewChat">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Chat Baru</h3>
          <button class="modal-close" @click="closeNewChat">✕</button>
        </div>
        <div class="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            v-model="searchQuery"
            class="search-input"
            placeholder="Cari nama atau NIM..."
            @input="handleSearch"
          />
        </div>
        <div v-if="searchLoading" style="text-align: center; padding: 1rem; color: var(--gray-muted); font-size: 0.82rem">
          Mencari...
        </div>
        <div v-if="searchResults.length > 0" class="search-results">
          <div
            v-for="u in searchResults"
            :key="u.id"
            class="search-result-item"
            @click="startChat(u.id)"
          >
            <div class="chat-avatar" style="width: 38px; height: 38px; font-size: 0.78rem">{{ u.initials }}</div>
            <div class="chat-info">
              <div class="chat-name" style="font-size: 0.85rem">{{ u.name }}</div>
              <div class="chat-preview">{{ u.nim }}</div>
            </div>
          </div>
        </div>
        <div
          v-if="!searchLoading && searchQuery && searchResults.length === 0"
          style="text-align: center; padding: 1.5rem; color: var(--gray-muted); font-size: 0.82rem"
        >
          Tidak ditemukan.
        </div>
      </div>
    </div>
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useChat } from '@/composables/useChat'
import BottomNav from '@/components/BottomNav.vue'

const router = useRouter()
const { currentUser: user } = useAuth()
const { conversations, loading, fetchConversations, findOrCreateConversation, searchUsers } = useChat()

const showNewChat = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
let searchTimeout = null

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

onMounted(() => {
  if (user.value) {
    fetchConversations(user.value.id)
  }
})

function handleSearch() {
  clearTimeout(searchTimeout)
  searchLoading.value = true
  searchTimeout = setTimeout(async () => {
    searchResults.value = await searchUsers(searchQuery.value, user.value.id)
    searchLoading.value = false
  }, 300)
}

async function startChat(recipientId) {
  const convId = await findOrCreateConversation(user.value.id, recipientId)
  closeNewChat()
  router.push('/pesan/' + convId)
}

function closeNewChat() {
  showNewChat.value = false
  searchQuery.value = ''
  searchResults.value = []
}

function goBack() {
  router.push('/home')
}
function goChat(id) {
  router.push('/pesan/' + id)
}
</script>
