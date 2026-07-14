import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function usePosts() {
  const posts = ref([])
  const loading = ref(false)

  async function fetchPosts(userId) {
    loading.value = true
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) {
      posts.value = []
      loading.value = false
      return
    }

    const userIds = [...new Set(data.map((p) => p.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, initials, nim')
      .in('id', userIds)

    const profileMap = {}
    for (const p of profiles || []) {
      profileMap[p.id] = p
    }

    const postIds = data.map((p) => p.id)

    const { data: allLikes } = await supabase
      .from('post_likes')
      .select('post_id, user_id')
      .in('post_id', postIds)

    const likeMap = {}
    for (const l of allLikes || []) {
      if (!likeMap[l.post_id]) likeMap[l.post_id] = []
      likeMap[l.post_id].push(l.user_id)
    }

    const { data: allComments } = await supabase
      .from('comments')
      .select('post_id')
      .in('post_id', postIds)

    const commentCountMap = {}
    for (const c of allComments || []) {
      commentCountMap[c.post_id] = (commentCountMap[c.post_id] || 0) + 1
    }

    posts.value = data.map((post) => {
      const profile = profileMap[post.user_id] || {}
      const likes = likeMap[post.id] || []
      return {
        ...post,
        userName: profile.name || '',
        userInitials: profile.initials || '',
        userNim: profile.nim || '',
        likeCount: likes.length,
        commentCount: commentCountMap[post.id] || 0,
        liked: userId ? likes.includes(userId) : false,
      }
    })

    loading.value = false
  }

  async function fetchPost(id, userId) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, initials, nim')
      .eq('id', data.user_id)
      .maybeSingle()

    const { data: likes } = await supabase
      .from('post_likes')
      .select('user_id')
      .eq('post_id', id)

    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true })

    const commentUserIds = [...new Set((commentsData || []).map((c) => c.user_id))]
    let commentProfiles = []
    if (commentUserIds.length > 0) {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, initials')
        .in('id', commentUserIds)
      commentProfiles = data || []
    }

    const commentProfileMap = {}
    for (const p of commentProfiles) {
      commentProfileMap[p.id] = p
    }

    const likeUserIds = (likes || []).map((l) => l.user_id)

    return {
      ...data,
      userName: profile?.name || '',
      userInitials: profile?.initials || '',
      userNim: profile?.nim || '',
      likeCount: likes?.length || 0,
      commentCount: commentsData?.length || 0,
      liked: userId ? likeUserIds.includes(userId) : false,
      comments: (commentsData || []).map((c) => ({
        ...c,
        userName: commentProfileMap[c.user_id]?.name || '',
        userInitials: commentProfileMap[c.user_id]?.initials || '',
      })),
    }
  }

  async function createPost(userId, content, imageUrl = null) {
    const { data, error } = await supabase
      .from('posts')
      .insert({ user_id: userId, content, image: imageUrl })
      .select('*')
      .single()

    if (error) throw error

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, initials, nim')
      .eq('id', userId)
      .maybeSingle()

    return {
      ...data,
      userName: profile?.name || '',
      userInitials: profile?.initials || '',
      userNim: profile?.nim || '',
      likeCount: 0,
      commentCount: 0,
      liked: false,
    }
  }

  async function deletePost(id) {
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) throw error
  }

  async function toggleLike(postId, userId) {
    const { data: existing } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle()

    if (existing) {
      await supabase.from('post_likes').delete().eq('id', existing.id)
      return false
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: userId })
      return true
    }
  }

  async function addComment(postId, userId, text) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: userId, text })
      .select('*')
      .single()

    if (error) throw error

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, initials')
      .eq('id', userId)
      .maybeSingle()

    return {
      ...data,
      userName: profile?.name || '',
      userInitials: profile?.initials || '',
    }
  }

  async function deleteComment(commentId) {
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (error) throw error
  }

  return {
    posts,
    loading,
    fetchPosts,
    fetchPost,
    createPost,
    deletePost,
    toggleLike,
    addComment,
    deleteComment,
  }
}
