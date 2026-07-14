<template>
  <div v-if="show" class="notif-panel" @click.stop>
    <div class="notif-header">
      <h4>Notifikasi</h4>
      <button v-if="unreadCount > 0" class="notif-mark-all" @click="handleMarkAll">Tandai semua dibaca</button>
    </div>
    <div v-if="notifications.length === 0" class="notif-empty">
      Belum ada notifikasi.
    </div>
    <div v-else class="notif-list">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="notif-item"
        :class="{ unread: !n.read }"
        @click="handleClick(n)"
      >
        <div class="notif-avatar">{{ n.actor?.initials }}</div>
        <div class="notif-body">
          <div class="notif-text" v-html="formatNotif(n)"></div>
          <div class="notif-time">{{ formatTime(n.created_at) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const router = useRouter()
const { currentUser: user } = useAuth()
const { notifications, unreadCount, markAsRead } = useNotifications()

function formatNotif(n) {
  const name = n.actor?.name || 'Seseorang'
  switch (n.type) {
    case 'like': return `<strong>${name}</strong> menyukai postinganmu`
    case 'comment': return `<strong>${name}</strong> berkomentar di postinganmu`
    case 'follow': return `<strong>${name}</strong> mulai mengikutimu`
    case 'message': return `<strong>${name}</strong> mengirim pesan`
    default: return `<strong>${name}</strong> berinteraksi denganmu`
  }
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

function handleClick(n) {
  if (!n.read) {
    markAsRead(user.value.id)
  }
  if (n.type === 'follow') {
    router.push('/user/' + n.actor_id)
  } else if (n.post_id) {
    router.push('/post/' + n.post_id)
  } else if (n.type === 'message') {
    router.push('/pesan')
  }
  emit('close')
}

function handleMarkAll() {
  markAsRead(user.value.id)
}
</script>
