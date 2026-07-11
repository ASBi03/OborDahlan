<template>
  <div class="auth-page">
    <div class="auth-left">
      <div class="auth-brand">Obor<span>Dahlan</span></div>
      <div class="auth-tagline">Platform komunitas mahasiswa Universitas Ahmad Dahlan</div>
      <div class="auth-images">
        <img src="https://i.ibb.co.com/jcpp6T8/Obor-Dahlan.png" alt="Obor-Dahlan" />
      </div>
    </div>
    <div class="auth-right">
      <div class="auth-form-wrap">
        <h2>Daftar ke OborDahlan</h2>
        <p class="auth-subtitle">Buat akun baru untuk bergabung dengan komunitas.</p>

        <div v-if="error" class="auth-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {{ error }}
        </div>

        <div v-if="success" class="auth-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {{ success }}
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label>Nama Lengkap</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                v-model="name"
                class="form-input"
                type="text"
                placeholder="Gustagus"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label>Email UAD</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                v-model="email"
                class="form-input"
                type="email"
                placeholder="2300016092@webmail.uad.ac.id"
                required
              />
            </div>
            <span class="form-hint">NIM akan otomatis diambil dari email</span>
          </div>

          <div v-if="extractedNim" class="nim-preview">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            NIM kamu: <strong>{{ extractedNim }}</strong>
          </div>

          <div class="form-group">
            <label>Password</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                v-model="password"
                class="form-input"
                type="password"
                placeholder="Minimal 6 karakter"
                minlength="6"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label>Konfirmasi Password</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                v-model="confirmPassword"
                class="form-input"
                type="password"
                placeholder="Ulangi password"
                required
              />
            </div>
          </div>

          <button type="submit" class="btn-auth" :disabled="isLoading">
            <span v-if="isLoading" class="spinner"></span>
            {{ isLoading ? 'Memproses...' : 'Daftar' }}
          </button>
        </form>

        <div class="auth-divider">
          <span>atau</span>
        </div>

        <p class="auth-switch">
          Sudah punya akun?
          <router-link to="/login">Masuk di sini</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { register } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const isLoading = ref(false)

const extractedNim = computed(() => {
  if (!email.value) return ''
  const localPart = email.value.split('@')[0]
  if (/^\d{10}$/.test(localPart)) return localPart
  return ''
})

async function handleRegister() {
  error.value = ''
  success.value = ''
  isLoading.value = true

  try {
    if (!name.value || !email.value || !password.value) {
      throw new Error('Semua field wajib diisi')
    }
    if (!extractedNim.value) {
      throw new Error('Email harus format NIM@webmail.uad.ac.id (NIM 10 digit)')
    }
    if (password.value !== confirmPassword.value) {
      throw new Error('Password tidak cocok')
    }
    if (password.value.length < 6) {
      throw new Error('Password minimal 6 karakter')
    }

    await register(name.value, extractedNim.value, email.value, password.value)

    success.value = 'Registrasi berhasil! Silakan masuk.'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err) {
    if (err.message.includes('already registered')) {
      error.value = 'Email sudah terdaftar'
    } else {
      error.value = err.message || 'Terjadi kesalahan saat registrasi'
    }
  } finally {
    isLoading.value = false
  }
}
</script>