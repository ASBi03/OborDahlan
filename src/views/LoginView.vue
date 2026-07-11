<template>
  <div class="auth-page">
    <div class="auth-left">
      <img src="/images/logo.png" alt="OborDahlan Logo" style="max-width: 470px; z-index: 1" />
    </div>
    <div class="auth-right">
      <div class="auth-form-wrap">
        <h2>Masuk ke OborDahlan</h2>
        <p class="auth-subtitle">Selamat datang kembali! Silakan masuk ke akun kamu.</p>

        <div v-if="error" class="auth-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label>Email</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                v-model="email"
                class="form-input"
                type="email"
                placeholder="nama@webmail.uad.ac.id"
                required
              />
            </div>
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
const { login } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

async function handleLogin() {
  error.value = ''
  isLoading.value = true

  try {
    if (!email.value || !password.value) {
      throw new Error('Email dan password wajib diisi')
    }
    await login(email.value, password.value)
    router.push('/home')
  } catch (err) {
    error.value = err.message || 'Terjadi kesalahan saat login'
  } finally {
    isLoading.value = false
  }
}
</script>