import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useLowongan() {
  const lowongan = ref([])
  const loading = ref(false)

  async function fetchLowongan() {
    loading.value = true
    const { data, error } = await supabase
      .from('lowongan')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) {
      lowongan.value = []
      loading.value = false
      return
    }

    const userIds = [...new Set(data.map((l) => l.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, initials')
      .in('id', userIds)

    const profileMap = {}
    for (const p of profiles || []) {
      profileMap[p.id] = p
    }

    lowongan.value = data.map((l) => ({
      ...l,
      posterName: profileMap[l.user_id]?.name || '',
      posterInitials: profileMap[l.user_id]?.initials || '',
    }))

    loading.value = false
  }

  async function createLowongan(userId, data) {
    const { data: result, error } = await supabase
      .from('lowongan')
      .insert({
        user_id: userId,
        company: data.company,
        position: data.position,
        description: data.description,
        salary: data.salary || '',
        location: data.location || '',
        type: data.type || 'Full-time',
      })
      .select('*')
      .single()

    if (error) throw error

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, initials')
      .eq('id', userId)
      .single()

    return {
      ...result,
      posterName: profile?.name || '',
      posterInitials: profile?.initials || '',
    }
  }

  return {
    lowongan,
    loading,
    fetchLowongan,
    createLowongan,
  }
}
