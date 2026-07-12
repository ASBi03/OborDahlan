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
        <button class="nav-icon-btn" @click="showEdit = true" title="Edit Profil">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
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
        <div class="profile-nim">
          <span v-if="user?.nim">NIM: {{ user.nim }}</span>
          <span v-if="user?.nim && user?.jurusan"> · </span>
          <span v-if="user?.jurusan">{{ user.jurusan }}</span>
          <span v-if="!user?.nim && !user?.jurusan" style="color: var(--gray-muted)">Belum ada data diri</span>
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
        <button class="btn-edit-profile" @click="showEdit = true">Edit Profil</button>
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

    <!-- MODAL EDIT PROFIL -->
    <div v-if="showEdit" class="modal-overlay" @click.self="showEdit = false">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Edit Profil</h3>
          <button class="modal-close" @click="showEdit = false">✕</button>
        </div>
        <div v-if="editSuccess" class="auth-success">Profil berhasil disimpan!</div>
        <div v-if="editError" class="auth-error">{{ editError }}</div>
        <form @submit.prevent="handleSave" class="auth-form">
          <div class="form-group">
            <label>Nama Lengkap</label>
            <input v-model="editForm.name" class="form-input" placeholder="Nama kamu" required />
          </div>
          <div class="form-group">
            <label>NIM</label>
            <input v-model="editForm.nim" class="form-input" placeholder="2300016092" maxlength="20" />
            <span class="form-hint">Isi NIM kamu (bisa diisi nanti)</span>
          </div>
          <div class="form-group">
            <label>Jurusan</label>
            <select v-model="editForm.jurusan" class="form-input">
              <option value="">-- Pilih Jurusan --</option>
              <option value="Sistem Informasi">Sistem Informasi</option>
              <option value="Teknik Informatika">Teknik Informatika</option>
              <option value="Teknologi Informasi">Teknologi Informasi</option>
              <option value="Ilmu Komputer">Ilmu Komputer</option>
              <option value="Manajemen Informatika">Manajemen Informatika</option>
              <option value="Komputerisasi Akuntansi">Komputerisasi Akuntansi</option>
              <option value="Bisnis Digital">Bisnis Digital</option>
              <option value="Desain Komunikasi Visual">Desain Komunikasi Visual</option>
            </select>
          </div>
          <div class="form-group">
            <label>Angkatan</label>
            <select v-model="editForm.angkatan" class="form-input">
              <option value="">-- Pilih Angkatan --</option>
              <option v-for="year in angkatanOptions" :key="year" :value="String(year)">{{ year }}</option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="showEdit = false">Batal</button>
            <button type="submit" class="btn-post" :disabled="editSaving">
              {{ editSaving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { usePosts } from '@/composables/usePosts'
import BottomNav from '@/components/BottomNav.vue'

const router = useRouter()
const { currentUser: user, logout, fetchFollowCounts, updateProfile } = useAuth()
const { posts, toggleLike, fetchPosts } = usePosts()

const followCounts = ref({ followers: 0, following: 0 })
const showEdit = ref(false)
const editSaving = ref(false)
const editError = ref('')
const editSuccess = ref(false)

const editForm = ref({ name: '', nim: '', jurusan: '', angkatan: '' })

const angkatanOptions = computed(() => {
  const current = new Date().getFullYear()
  const years = []
  for (let y = current; y >= 2015; y--) years.push(y)
  return years
})

watch(showEdit, (val) => {
  if (val && user.value) {
    editForm.value = {
      name: user.value.name || '',
      nim: user.value.nim || '',
      jurusan: user.value.jurusan || '',
      angkatan: user.value.angkatan || '',
    }
    editError.value = ''
    editSuccess.value = false
  }
})

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
  await fetchPosts(user.value?.id)
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

async function handleSave() {
  editError.value = ''
  editSuccess.value = false
  editSaving.value = true

  try {
    if (!editForm.value.name.trim()) {
      throw new Error('Nama wajib diisi')
    }
    await updateProfile(editForm.value)
    editSuccess.value = true
    setTimeout(() => {
      showEdit.value = false
    }, 1000)
  } catch (err) {
    editError.value = err.message || 'Gagal menyimpan'
  } finally {
    editSaving.value = false
  }
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
