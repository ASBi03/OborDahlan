<template>
  <div>
    <nav class="navbar">
      <div class="nav-left">
        <div class="nav-brand">Obor<span>Dahlan</span></div>
      </div>
      <div class="nav-right">
        <button class="nav-icon-btn" @click="goPesan" title="Pesan">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
        <button class="nav-icon-btn" @click="goLowongan" title="Lowongan">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        </button>
        <NotificationBell />
        <button class="nav-icon-btn" @click="goProfile" :style="user?.avatar_url ? { backgroundImage: `url(${user.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '50%', width: '32px', height: '32px' } : {}">
          <span v-if="!user?.avatar_url" style="font-size: 0.75rem; font-weight: 700">{{ user?.initials }}</span>
        </button>
      </div>
    </nav>

    <div class="home-wrap">
      <!-- KOLOM KIRI -->
      <div class="sidebar sidebar-left">
        <div class="sidebar-card">
          <div class="mini-avatar" :style="user?.avatar_url ? { backgroundImage: `url(${user.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}">
            <span v-if="!user?.avatar_url">{{ user?.initials }}</span>
          </div>
          <div class="mini-name">{{ user?.name }}</div>
          <div class="mini-nim">{{ user?.nim }}</div>
          <div class="mini-stats">
            <div>
              <div class="mini-stat-val">{{ userPostCount }}</div>
              <div class="mini-stat-lbl">Post</div>
            </div>
            <div>
              <div class="mini-stat-val">{{ followCounts.followers }}</div>
              <div class="mini-stat-lbl">Pengikut</div>
            </div>
            <div>
              <div class="mini-stat-val">{{ followCounts.following }}</div>
              <div class="mini-stat-lbl">Ikuti</div>
            </div>
          </div>
        </div>
        <div class="sidebar-card" style="padding: 0.6rem 0.5rem">
          <button class="sb-nav-btn active"><span class="sb-nav-icon">🏠</span> Beranda</button>
          <button class="sb-nav-btn" @click="goPesan"><span class="sb-nav-icon">💬</span> Pesan</button>
          <button class="sb-nav-btn" @click="goLowongan"><span class="sb-nav-icon">💼</span> Lowongan</button>
          <button class="sb-nav-btn" @click="goProfile"><span class="sb-nav-icon">👤</span> Profil Saya</button>
          <button class="sb-nav-btn"><span class="sb-nav-icon">🔔</span> Notifikasi</button>
          <button class="sb-nav-btn"><span class="sb-nav-icon">📌</span> Tersimpan</button>
        </div>
      </div>

      <!-- KOLOM TENGAH - FEED -->
      <div class="home-feed">
        <div class="create-post" @click="showModal = true">
          <div class="avatar" :style="user?.avatar_url ? { backgroundImage: `url(${user.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}">
            <span v-if="!user?.avatar_url">{{ user?.initials }}</span>
          </div>
          <input class="create-post-input" placeholder="Bagikan sesuatu ke komunitas..." readonly />
          <button class="create-post-cam">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
        </div>

        <div v-if="loading" style="text-align: center; padding: 2rem; color: var(--gray-muted)">
          Memuat postingan...
        </div>

        <div
          v-for="post in posts"
          :key="post.id"
          class="post-card clickable"
          @click="goDetail(post.id)"
        >
          <div class="post-header">
            <div class="avatar clickable" @click.stop="goUser(post.user_id)" :style="post.userAvatarUrl ? { backgroundImage: `url(${post.userAvatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}">
              <span v-if="!post.userAvatarUrl">{{ post.userInitials }}</span>
            </div>
            <div class="post-meta">
              <div class="post-username clickable" @click.stop="goUser(post.user_id)">{{ post.userName }}</div>
              <div class="post-time">{{ formatTime(post.created_at) }} · {{ post.userNim }}</div>
            </div>
            <button class="post-more" @click.stop>⋯</button>
          </div>
          <div class="post-divider"></div>
          <p class="post-content">{{ post.content }}</p>
          <div v-if="post.image" class="post-image"><img :src="post.image" alt="Foto postingan" /></div>
          <div class="post-actions">
            <button
              class="action-btn"
              :class="{ liked: post.liked }"
              @click.stop="handleLike(post)"
            >
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
            <button class="action-btn btn-share" @click.stop>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span class="btn-text">Bagikan</span>
            </button>
            <button
              v-if="post.user_id !== user?.id"
              class="action-btn btn-msg"
              @click.stop="startChat(post.user_id)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              <span class="btn-text">Kirim Pesan</span>
            </button>
          </div>
        </div>
      </div>

      <!-- KOLOM KANAN -->
      <div class="sidebar sidebar-right">
        <!-- CUACA -->
        <div class="weather-widget">
          <div class="weather-row1">
            <div>
              <div class="weather-city">📍 {{ weather.city || WEATHER_CITY }}</div>
              <div v-if="weather.loading" class="weather-loading">Memuat cuaca...</div>
              <div v-else-if="weather.error" class="weather-loading" style="color: #fde87d">
                {{ weather.error }}
              </div>
              <div v-else>
                <div class="weather-temp">{{ weather.temp }}°C</div>
                <div class="weather-desc">{{ weather.desc }}</div>
              </div>
            </div>
            <div class="weather-icon" v-if="!weather.loading">{{ weather.icon }}</div>
          </div>
          <div class="weather-extra" v-if="!weather.loading && !weather.error">
            <span>💧 {{ weather.humidity }}%</span>
            <span>🌬️ {{ weather.wind }} m/s</span>
          </div>
        </div>

        <!-- TRENDING -->
        <div class="sidebar-card">
          <h4>🔥 Trending di Kampus</h4>
          <div v-for="t in trending" :key="t.tag" class="trend-item">
            <div>
              <div class="trend-tag">#{{ t.tag }}</div>
              <div class="trend-count">{{ t.count }} postingan</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Buat Postingan</h3>
          <button class="modal-close" @click="showModal = false">✕</button>
        </div>
        <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1rem">
          <div class="avatar" :style="user?.avatar_url ? { backgroundImage: `url(${user.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}">
            <span v-if="!user?.avatar_url">{{ user?.initials }}</span>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.88rem">{{ user?.name }}</div>
            <div style="font-size: 0.75rem; color: var(--gray-muted)">{{ user?.nim }}</div>
          </div>
        </div>
        <textarea
          class="modal-textarea"
          v-model="newPost"
          placeholder="Apa yang ingin kamu bagikan?"
          rows="4"
        ></textarea>
        <div v-if="postImagePreview" class="post-image-preview">
          <img :src="postImagePreview" alt="Preview" />
          <button class="post-image-remove" @click="removePostImage">✕</button>
        </div>
        <div class="modal-footer">
          <button class="btn-upload-photo" @click="$refs.postImageInput.click()" title="Tambah Foto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </button>
          <input ref="postImageInput" type="file" accept="image/*" style="display:none" @change="handlePostImage" />
          <button class="btn-cancel" @click="showModal = false">Batal</button>
          <button class="btn-post" @click="submitPost" :disabled="postUploading">
            {{ postUploading ? 'Mengunggah...' : 'Posting' }}
          </button>
        </div>
      </div>
    </div>
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { usePosts } from '@/composables/usePosts'
import { useChat } from '@/composables/useChat'
import { useNotifications } from '@/composables/useNotifications'
import { useUpload } from '@/composables/useUpload'
import BottomNav from '@/components/BottomNav.vue'
import NotificationBell from '@/components/NotificationBell.vue'
import { WEATHER_API_KEY, WEATHER_CITY } from '@/data/store'

const router = useRouter()
const { currentUser: user, fetchFollowCounts } = useAuth()
const { posts, loading, fetchPosts, createPost, toggleLike } = usePosts()
const { findOrCreateConversation } = useChat()
const { createNotification } = useNotifications()
const { uploadPostImage } = useUpload()

const showModal = ref(false)
const newPost = ref('')
const postImageFile = ref(null)
const postImagePreview = ref(null)
const postUploading = ref(false)
const followCounts = ref({ followers: 0, following: 0 })

const weather = ref({
  loading: true,
  error: null,
  temp: '',
  desc: '',
  humidity: '',
  wind: '',
  icon: '🌤️',
  city: '',
})

const trending = ref([
  { tag: 'PemrogramanWeb', count: 42 },
  { tag: 'KuliahIT', count: 38 },
  { tag: 'UAD2025', count: 31 },
  { tag: 'BasisData', count: 27 },
  { tag: 'SeminarNasional', count: 19 },
])

const userPostCount = computed(() =>
  posts.value.filter((p) => p.user_id === user.value?.id).length
)

function formatTime(dateStr) {
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
  await fetchPosts(user.value?.id)

  if (user.value?.id) {
    followCounts.value = await fetchFollowCounts(user.value.id)
  }

  if (!WEATHER_API_KEY) {
    weather.value = {
      loading: false,
      error: 'Masukkan API key',
      temp: '--',
      desc: '',
      humidity: '--',
      wind: '--',
      icon: '🌤️',
      city: WEATHER_CITY,
    }
  } else {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${WEATHER_CITY}&appid=${WEATHER_API_KEY}&units=metric&lang=id`
      )
      if (!res.ok) throw new Error()
      const d = await res.json()
      const im = {
        Clear: '☀️',
        Clouds: '⛅',
        Rain: '🌧️',
        Drizzle: '🌦️',
        Thunderstorm: '⛈️',
        Snow: '❄️',
        Mist: '🌫️',
        Haze: '🌫️',
      }
      weather.value = {
        loading: false,
        error: null,
        temp: Math.round(d.main.temp),
        desc: d.weather[0].description,
        humidity: d.main.humidity,
        wind: d.wind.speed,
        icon: im[d.weather[0].main] || '🌤️',
        city: d.name,
      }
    } catch {
      weather.value = {
        loading: false,
        error: 'Cuaca tidak tersedia',
        temp: '--',
        desc: '',
        humidity: '--',
        wind: '--',
        icon: '🌤️',
        city: WEATHER_CITY,
      }
    }
  }
})

async function handleLike(post) {
  if (!user.value) return
  const newLiked = await toggleLike(post.id, user.value.id)
  post.liked = newLiked
  post.likeCount += newLiked ? 1 : -1
  if (newLiked) {
    createNotification(post.user_id, user.value.id, 'like', post.id)
  }
}

async function submitPost() {
  if ((!newPost.value.trim() && !postImageFile.value) || !user.value) return
  postUploading.value = true
  try {
    let imageUrl = null
    if (postImageFile.value) {
      imageUrl = await uploadPostImage(user.value.id, postImageFile.value)
    }
    const post = await createPost(user.value.id, newPost.value, imageUrl)
    posts.value.unshift(post)
    newPost.value = ''
    postImageFile.value = null
    postImagePreview.value = null
    showModal.value = false
  } catch (err) {
    console.error('Gagal posting:', err)
  } finally {
    postUploading.value = false
  }
}

function handlePostImage(e) {
  const file = e.target.files?.[0]
  if (!file) return
  postImageFile.value = file
  postImagePreview.value = URL.createObjectURL(file)
  e.target.value = ''
}

function removePostImage() {
  postImageFile.value = null
  postImagePreview.value = null
}

function goProfile() {
  router.push('/profil')
}
function goUser(id) {
  if (id === user.value?.id) {
    router.push('/profil')
  } else {
    router.push('/user/' + id)
  }
}
function goPesan() {
  router.push('/pesan')
}
function goLowongan() {
  router.push('/lowongan')
}
function goDetail(id) {
  router.push('/post/' + id)
}
async function startChat(postUserId) {
  if (!user.value || postUserId === user.value.id) return
  const convId = await findOrCreateConversation(user.value.id, postUserId)
  router.push('/pesan/' + convId)
}
</script>