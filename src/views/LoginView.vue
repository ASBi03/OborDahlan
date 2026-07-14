<template>
  <div class="auth-page">
    <div class="auth-left">
      <img src="/images/logo.png" alt="OborDahlan Logo" style="max-width: 470px; z-index: 1" />
    </div>
    <div class="auth-right">
      <div class="auth-form-wrap">
        <h2>Masuk ke OborDahlan</h2>
        <p class="auth-subtitle">Selamat datang kembali! Silakan masuk ke akun kamu.</p>

        <div class="role-toggle">
          <button
            class="role-btn"
            :class="{ active: role === 'mahasiswa' }"
            @click="role = 'mahasiswa'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 6 3 6 3s3 0 6-3v-5" />
            </svg>
            Mahasiswa
          </button>
          <button
            class="role-btn"
            :class="{ active: role === 'perusahaan' }"
            @click="role = 'perusahaan'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            Mitra
          </button>
        </div>

        <div v-if="error" class="auth-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label>{{ role === 'mahasiswa' ? 'Email UAD' : 'Email' }}</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                v-model="email"
                class="form-input"
                type="email"
                :placeholder="role === 'mahasiswa' ? 'nama@webmail.uad.ac.id' : 'email@perusahaan.com'"
                required
              />
            </div>
            <span v-if="role === 'mahasiswa'" class="form-hint">Gunakan email UAD (@webmail.uad.ac.id)</span>
            <span v-else class="form-hint">Gunakan email perusahaan (Gmail, Outlook, dll)</span>
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
                placeholder="Masukkan password"
                required
              />
            </div>
          </div>

          <button type="submit" class="btn-auth" :disabled="isLoading">
            <span v-if="isLoading" class="spinner"></span>
            {{ isLoading ? 'Memproses...' : 'Masuk' }}
          </button>
        </form>

        <div class="auth-divider">
          <span>atau</span>
        </div>

        <p class="auth-switch">
          Belum punya akun?
          <router-link to="/register">Daftar sekarang</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login, getRoleFromEmail } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)
const role = ref('mahasiswa')

async function handleLogin() {
  error.value = ''
  isLoading.value = true

  try {
    if (!email.value || !password.value) {
      throw new Error('Email dan password wajib diisi')
    }

    const emailRole = getRoleFromEmail(email.value)
    if (role.value === 'mahasiswa' && emailRole !== 'mahasiswa') {
      throw new Error('Email harus @webmail.uad.ac.id untuk login sebagai Mahasiswa')
    }
    if (role.value === 'perusahaan' && emailRole !== 'perusahaan') {
      throw new Error('Gunakan email selain @webmail.uad.ac.id untuk login sebagai Mitra')
    }

    await login(email.value, password.value)

    if (emailRole === 'perusahaan') {
      router.push('/dashboard-perusahaan')
    } else {
      router.push('/home')
    }
  } catch (err) {
    error.value = err.message || 'Terjadi kesalahan saat login'
  } finally {
    isLoading.value = false
  }
}
</script>
