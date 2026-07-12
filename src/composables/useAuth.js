import { ref } from 'vue'
import { supabase } from '@/utils/supabase'

const currentUser = ref(null)
const loading = ref(true)

function getRoleFromEmail(email) {
  if (!email) return 'mahasiswa'
  return email.endsWith('@webmail.uad.ac.id') ? 'mahasiswa' : 'perusahaan'
}

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
      .maybeSingle()

    if (data) {
      currentUser.value = data
    } else {
      const name = user.user_metadata?.name || 'User'
      const email = user.email || ''
      const role = getRoleFromEmail(email)
      const initials = user.user_metadata?.initials || name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name,
          nim: '',
          email,
          initials,
          role,
        })

      if (!insertError) {
        currentUser.value = { id: user.id, name, nim: '', email, initials, jurusan: '', angkatan: '', role }
      }
    }
  }

  async function register(name, email, password) {
    const initials = name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    const role = getRoleFromEmail(email)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, initials, role },
      },
    })

    if (error) throw error

    if (data.user) {
      await new Promise((r) => setTimeout(r, 500))

      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle()

      if (!existing) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name,
            nim: '',
            email,
            initials,
            role,
          })
        if (profileError) throw profileError
      }
    }

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

  async function updateProfile(updates) {
    if (!currentUser.value) throw new Error('Login dulu')

    const initials = updates.name
      ? updates.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
      : currentUser.value.initials

    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: updates.name || currentUser.value.name,
        nim: updates.nim ?? currentUser.value.nim,
        jurusan: updates.jurusan ?? currentUser.value.jurusan,
        angkatan: updates.angkatan ?? currentUser.value.angkatan,
        initials,
      })
      .eq('id', currentUser.value.id)
      .select('*')
      .single()

    if (error) throw error

    currentUser.value = data
    return data
  }

  return {
    currentUser,
    loading,
    init,
    register,
    login,
    logout,
    updateProfile,
    fetchFollowCounts,
    isFollowing,
    toggleFollow,
    getRoleFromEmail,
  }
}
