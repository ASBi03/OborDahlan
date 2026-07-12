import { ref } from 'vue'
import { supabase } from '@/utils/supabase'

const currentUser = ref(null)
const loading = ref(true)

export function useAuth() {
  async function init() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await fetchProfile(session.user)
    }
    loading.value = false

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user)
      } else {
        currentUser.value = null
      }
    })
  }

  async function fetchProfile(user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      currentUser.value = data
    } else {
      currentUser.value = {
        id: user.id,
        name: user.user_metadata?.name || 'User',
        nim: user.user_metadata?.nim || '',
        email: user.email || '',
        initials: user.user_metadata?.name
          ?.split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'U',
        jurusan: 'Sistem Informasi',
        angkatan: '2023',
      }
    }
  }

  async function register(name, nim, email, password) {
    const initials = name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, nim, initials },
      },
    })

    if (error) throw error

    return data
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.includes('Invalid login')) {
        throw new Error('Email atau password salah')
      }
      throw error
    }

    return data
  }

  async function logout() {
    await supabase.auth.signOut()
    currentUser.value = null
  }

  async function fetchFollowCounts(userId) {
    const { count: followers } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)

    const { count: following } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)

    return { followers: followers || 0, following: following || 0 }
  }

  async function isFollowing(targetUserId) {
    if (!currentUser.value) return false
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUser.value.id)
      .eq('following_id', targetUserId)
      .maybeSingle()
    return !!data
  }

  async function toggleFollow(targetUserId) {
    if (!currentUser.value) throw new Error('Login dulu')

    const { data: existing } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUser.value.id)
      .eq('following_id', targetUserId)
      .maybeSingle()

    if (existing) {
      await supabase.from('follows').delete().eq('id', existing.id)
      return false
    } else {
      await supabase.from('follows').insert({
        follower_id: currentUser.value.id,
        following_id: targetUserId,
      })
      return true
    }
  }

  return {
    currentUser,
    loading,
    init,
    register,
    login,
    logout,
    fetchFollowCounts,
    isFollowing,
    toggleFollow,
  }
}