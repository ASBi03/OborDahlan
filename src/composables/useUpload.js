import imageCompression from 'browser-image-compression'
import { supabase } from '@/lib/supabase'

const BUCKET_AVATARS = 'avatars'
const BUCKET_POSTS = 'posts'

function getExtension(filename) {
  return filename.split('.').pop() || 'jpg'
}

async function compressForAvatar(file) {
  return imageCompression(file, {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 200,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.7,
  })
}

async function compressForPost(file) {
  return imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.75,
  })
}

export function useUpload() {

  async function uploadAvatar(userId, file) {
    const compressed = await compressForAvatar(file)
    const ext = 'jpg'
    const path = `${userId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_AVATARS)
      .upload(path, compressed, { upsert: true })

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from(BUCKET_AVATARS)
      .getPublicUrl(path)

    const publicUrl = data.publicUrl

    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    return publicUrl
  }

  async function uploadPostImage(userId, file) {
    const compressed = await compressForPost(file)
    const ext = 'jpg'
    const path = `${userId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_POSTS)
      .upload(path, compressed)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from(BUCKET_POSTS)
      .getPublicUrl(path)

    return data.publicUrl
  }

  function getAvatarUrl(userId) {
    const { data } = supabase.storage
      .from(BUCKET_AVATARS)
      .getPublicUrl(`${userId}/avatar.jpg`)
    return data?.publicUrl || null
  }

  return {
    uploadAvatar,
    uploadPostImage,
    getAvatarUrl,
  }
}
