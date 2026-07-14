<template>
  <div>
    <nav class="navbar">
      <div class="nav-left">
        <button class="nav-icon-btn" @click="$router.push('/home')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div class="nav-brand" style="margin-left: 0.4rem">Lowongan</div>
      </div>
    </nav>

    <div class="home-wrap">
      <div class="sidebar sidebar-left">
        <div class="sidebar-card">
          <h4>Lowongan Kerja</h4>
          <p style="font-size: 0.78rem; color: var(--gray-muted); line-height: 1.5">
            Temukan peluang karir dari perusahaan terpercaya. Perusahaan harus membayar untuk memasang iklan lowongan.
          </p>
        </div>
        <div class="sidebar-card" style="padding: 0.6rem 0.5rem">
          <button class="sb-nav-btn active"><span class="sb-nav-icon">💼</span> Semua Lowongan</button>
          <button class="sb-nav-btn"><span class="sb-nav-icon">🔥</span> Populer</button>
          <button class="sb-nav-btn"><span class="sb-nav-icon">🆕</span> Terbaru</button>
        </div>
      </div>

      <div class="home-feed">
        <div v-if="loading" style="text-align: center; padding: 2rem; color: var(--gray-muted)">
          Memuat lowongan...
        </div>

        <div v-if="!loading && lowongan.length === 0" style="text-align: center; padding: 3rem; color: var(--gray-muted)">
          <div style="font-size: 2rem; margin-bottom: 0.5rem">💼</div>
          Belum ada lowongan tersedia.
        </div>

        <div
          v-for="item in lowongan"
          :key="item.id"
          class="lowongan-card"
        >
          <div class="lowongan-header">
            <div class="avatar" :style="item.posterAvatarUrl ? { backgroundImage: `url(${item.posterAvatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}">
              <span v-if="!item.posterAvatarUrl">{{ item.posterInitials }}</span>
            </div>
            <div class="post-meta">
              <div class="post-username">{{ item.company }}</div>
              <div class="post-time">Diposting oleh {{ item.posterName }} · {{ formatTime(item.created_at) }}</div>
            </div>
            <span class="lowongan-type" :class="item.type?.toLowerCase().replace('-', '')">{{ item.type }}</span>
          </div>
          <div class="lowongan-body">
            <div class="lowongan-position">{{ item.position }}</div>
            <p class="lowongan-desc">{{ item.description }}</p>
            <div class="lowongan-meta">
              <span v-if="item.location" class="lowongan-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {{ item.location }}
              </span>
              <span v-if="item.salary" class="lowongan-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                {{ item.salary }}
              </span>
            </div>
          </div>
          <div class="lowongan-footer">
            <button class="btn-apply">Lamar Sekarang</button>
          </div>
        </div>
      </div>

      <div class="sidebar sidebar-right">
        <div class="sidebar-card">
          <h4>Statistik</h4>
          <div style="font-size: 0.82rem; color: var(--gray-muted)">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem">
              <span>Total Lowongan</span>
              <strong style="color: var(--green-dark)">{{ lowongan.length }}</strong>
            </div>
          </div>
        </div>
        <div class="sidebar-card">
          <h4>Info</h4>
          <p style="font-size: 0.78rem; color: var(--gray-muted); line-height: 1.5">
            Untuk perusahaan yang ingin memasang lowongan, silakan hubungi admin.
          </p>
        </div>
      </div>
    </div>
    <BottomNav />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useLowongan } from '@/composables/useLowongan'
import BottomNav from '@/components/BottomNav.vue'

const { lowongan, loading, fetchLowongan } = useLowongan()

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
  fetchLowongan()
})
</script>
