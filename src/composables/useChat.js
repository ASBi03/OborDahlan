import { ref } from 'vue'
import { supabase } from '@/utils/supabase'

export function useChat() {
  const conversations = ref([])
  const messages = ref([])
  const loading = ref(false)

  async function fetchConversations(userId) {
    loading.value = true
    const { data: memberships, error } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', userId)

    if (error) throw error

    if (!memberships || memberships.length === 0) {
      conversations.value = []
      loading.value = false
      return
    }

    const convIds = memberships.map((m) => m.conversation_id)

    const { data: allMembers } = await supabase
      .from('conversation_members')
      .select('conversation_id, user_id')
      .in('conversation_id', convIds)

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, initials')

    const profileMap = {}
    for (const p of profiles || []) {
      profileMap[p.id] = p
    }

    const otherUserMap = {}
    for (const m of allMembers || []) {
      if (m.user_id !== userId) {
        otherUserMap[m.conversation_id] = profileMap[m.user_id] || null
      }
    }

    const { data: lastMessages } = await supabase
      .from('messages')
      .select('conversation_id, text, created_at')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: false })

    const lastMsgMap = {}
    for (const lm of lastMessages || []) {
      if (!lastMsgMap[lm.conversation_id]) {
        lastMsgMap[lm.conversation_id] = lm
      }
    }

    conversations.value = convIds
      .map((cid) => ({
        id: cid,
        otherUser: otherUserMap[cid] || null,
        lastMessage: lastMsgMap[cid]?.text || '',
        lastMessageAt: lastMsgMap[cid]?.created_at || '',
      }))
      .filter((c) => c.otherUser)
      .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))

    loading.value = false
  }

  async function fetchConversationOtherUser(conversationId, currentUserId) {
    const { data } = await supabase
      .from('conversation_members')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .neq('user_id', currentUserId)
      .limit(1)

    if (!data || data.length === 0) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, initials')
      .eq('id', data[0].user_id)
      .single()

    return profile || null
  }

  async function fetchMessages(conversationId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error

    if (!data || data.length === 0) {
      messages.value = []
      return
    }

    const senderIds = [...new Set(data.map((m) => m.sender_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, initials')
      .in('id', senderIds)

    const profileMap = {}
    for (const p of profiles || []) {
      profileMap[p.id] = p
    }

    messages.value = data.map((m) => ({
      ...m,
      senderName: profileMap[m.sender_id]?.name || '',
      senderInitials: profileMap[m.sender_id]?.initials || '',
    }))
  }

  async function sendMessage(conversationId, senderId, text) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        text,
      })
      .select('*')
      .single()

    if (error) throw error

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, initials')
      .eq('id', senderId)
      .single()

    return {
      ...data,
      senderName: profile?.name || '',
      senderInitials: profile?.initials || '',
    }
  }

  async function findOrCreateConversation(userId, recipientId) {
    const { data: userMemberships } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', userId)

    if (userMemberships && userMemberships.length > 0) {
      const convIds = userMemberships.map((e) => e.conversation_id)

      const { data: mutual } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .in('conversation_id', convIds)
        .eq('user_id', recipientId)
        .limit(1)

      if (mutual && mutual.length > 0) return mutual[0].conversation_id
    }

    const { data: newConv } = await supabase
      .from('conversations')
      .insert({})
      .select('id')
      .single()

    await supabase.from('conversation_members').insert([
      { conversation_id: newConv.id, user_id: userId },
      { conversation_id: newConv.id, user_id: recipientId },
    ])

    return newConv.id
  }

  async function searchUsers(query, currentUserId) {
    if (!query || query.trim().length === 0) return []

    const { data } = await supabase
      .from('profiles')
      .select('id, name, nim, initials')
      .neq('id', currentUserId)
      .or(`name.ilike.%${query}%,nim.ilike.%${query}%`)
      .limit(10)

    return data || []
  }

  function subscribeToMessages(conversationId, callback) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, initials')
            .eq('id', payload.new.sender_id)
            .single()

          callback({
            ...payload,
            new: {
              ...payload.new,
              senderName: profile?.name || '',
              senderInitials: profile?.initials || '',
            },
          })
        }
      )
      .subscribe()
  }

  return {
    conversations,
    messages,
    loading,
    fetchConversations,
    fetchConversationOtherUser,
    fetchMessages,
    sendMessage,
    findOrCreateConversation,
    searchUsers,
    subscribeToMessages,
  }
}
