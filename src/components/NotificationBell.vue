<template>
  <div class="notif-bell-wrap" ref="bellWrap">
    <button class="nav-icon-btn" @click="togglePanel" title="Notifikasi">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
    </button>
    <NotificationPanel :show="showPanel" @close="showPanel = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'
import NotificationPanel from './NotificationPanel.vue'

const { currentUser: user } = useAuth()
const { unreadCount, fetchNotifications, subscribeToNotifications } = useNotifications()
const showPanel = ref(false)
const bellWrap = ref(null)

function togglePanel() {
  showPanel.value = !showPanel.value
}

function handleClickOutside(e) {
  if (bellWrap.value && !bellWrap.value.contains(e.target)) {
    showPanel.value = false
  }
}

onMounted(() => {
  if (user.value) {
    fetchNotifications(user.value.id)
    subscribeToNotifications(user.value.id)
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
