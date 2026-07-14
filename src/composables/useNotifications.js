import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

const notifications = ref([])
const unreadCount = ref(0)
let channel = null

export function useNotifications() {

  async function fetchNotifications(userId) {
    const { data } = await supabase
      .from('notifications')
      .select('*, actor:profiles!notifications_actor_id_fkey(name, initials)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)

    notifications.value = data || []
    unreadCount.value = notifications.value.filter((n) => !n.read).length
  }

  async function createNotification(userId, actorId, type, postId = null) {
    if (userId === actorId) return
    await supabase.from('notifications').insert({
      user_id: userId,
      actor_id: actorId,
      type,
      post_id: postId,
    })
  }

  async function markAsRead(userId) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    unreadCount.value = 0
    notifications.value.forEach((n) => { n.read = true })
  }

  function subscribeToNotifications(userId) {
    if (channel) channel.unsubscribe()
    channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const { data: actor } = await supabase
            .from('profiles')
            .select('name, initials')
            .eq('id', payload.new.actor_id)
            .single()

          notifications.value.unshift({ ...payload.new, actor })
          unreadCount.value++
        }
      )
      .subscribe()
  }

  function unsubscribe() {
    if (channel) {
      channel.unsubscribe()
      channel = null
    }
  }

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    createNotification,
    markAsRead,
    subscribeToNotifications,
    unsubscribe,
  }
}
