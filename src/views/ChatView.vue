<template>
  <div>
    <nav class="navbar">
      <div class="nav-left">
        <button class="nav-icon-btn" @click="goBack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div
          class="chat-avatar"
          style="width: 32px; height: 32px; font-size: 0.78rem; margin-left: 0.4rem"
          v-if="otherUser"
        >
          {{ otherUser.initials }}
        </div>
        <div class="nav-brand" style="margin-left: 0.5rem" v-if="otherUser">
          {{ otherUser.name }}
        </div>
      </div>
    </nav>
    <div class="chat-room">
      <div v-if="chatLoading" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--gray-muted)">
        Memuat percakapan...
      </div>
      <template v-else>
        <div class="chat-messages" ref="msgBox">
          <div v-if="messages.length === 0" style="text-align: center; padding: 3rem; color: var(--gray-muted); font-size: 0.85rem">
            <div style="font-size: 2rem; margin-bottom: 0.5rem">👋</div>
            Mulai percakapan dengan {{ otherUser?.name || '...' }}
          </div>
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="bubble-wrap"
            :class="{ mine: msg.sender_id === user?.id }"
          >
            <div class="bubble" :class="msg.sender_id === user?.id ? 'mine' : 'theirs'">
              {{ msg.text }}
              <div class="bubble-time">{{ formatTime(msg.created_at) }}</div>
            </div>
          </div>
        </div>
        <div class="chat-input-bar">
          <input v-model="newMsg" placeholder="Ketik pesan..." @keyup.enter="sendMsg" />
          <button class="btn-send" @click="sendMsg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useChat } from '@/composables/useChat'

const router = useRouter()
const route = useRoute()
const { currentUser: user } = useAuth()
const { messages, fetchMessages, fetchConversationOtherUser, sendMessage, subscribeToMessages } = useChat()

const otherUser = ref(null)
const newMsg = ref('')
const msgBox = ref(null)
const chatLoading = ref(true)
let channel = null

function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(diff / 86400000)
  return `${days} hari lalu`
}

function scrollToBottom() {
  nextTick(() => {
    if (msgBox.value) msgBox.value.scrollTop = msgBox.value.scrollHeight
  })
}

onMounted(async () => {
  const convId = route.params.id

  otherUser.value = await fetchConversationOtherUser(convId, user.value.id)

  await fetchMessages(convId)
  chatLoading.value = false
  scrollToBottom()

  channel = subscribeToMessages(convId, (payload) => {
    messages.value.push(payload.new)
    scrollToBottom()
  })
})

onUnmounted(() => {
  if (channel) channel.unsubscribe()
})

async function sendMsg() {
  if (!newMsg.value.trim() || !user.value) return
  const msg = await sendMessage(route.params.id, user.value.id, newMsg.value)
  messages.value.push(msg)
  newMsg.value = ''
  scrollToBottom()
}

function goBack() {
  router.push('/pesan')
}
</script>
