import { ref } from 'vue'
import { supabase } from '@/utils/supabase'

export function usePosts() {
  const posts = ref([])
  const loading = ref(false)

  async function fetchPosts() {
    loading.value = true
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (name, initials, nim),
        post_likes (id, user_id),
        comments (id)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    posts.value = data.map((post) => ({
      ...post,
      userName: post.profiles?.name,
      userInitials: post.profiles?.initials,
      userNim: post.profiles?.nim,
      likeCount: post.post_likes?.length || 0,
      commentCount: post.comments?.length || 0,
      liked: false,
    }))

    loading.value = false
  }

  async function fetchPost(id, userId) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (name, initials, nim),
        post_likes (id, user_id),
        comments (
          id,
          text,
          created_at,
          profiles:user_id (name, initials)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return {
      ...data,
      userName: data.profiles?.name,
      userInitials: data.profiles?.initials,
      userNim: data.profiles?.nim,
      likeCount: data.post_likes?.length || 0,
      commentCount: data.comments?.length || 0,
      liked: data.post_likes?.some((l) => l.user_id === userId) || false,
      comments: data.comments?.map((c) => ({
        ...c,
        userName: c.profiles?.name,
        userInitials: c.profiles?.initials,
      })) || [],
    }
  }

  async function createPost(userId, content) {
    const { data, error } = await supabase
      .from('posts')
      .insert({ user_id: userId, content })
      .select(`
        *,
        profiles:user_id (name, initials, nim)
      `)
      .single()

    if (error) throw error

    return {
      ...data,
      userName: data.profiles?.name,
      userInitials: data.profiles?.initials,
      userNim: data.profiles?.nim,
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
      .single()

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
      .select(`
        *,
        profiles:user_id (name, initials)
      `)
      .single()

    if (error) throw error

    return {
      ...data,
      userName: data.profiles?.name,
      userInitials: data.profiles?.initials,
    }
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
  }
}