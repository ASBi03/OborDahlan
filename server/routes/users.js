import { Router } from 'express'
import dbQuery from '../db.js'
import { auth } from '../middleware/auth.js'

const router = Router()

router.get('/me', auth, (req, res) => {
  try {
    const user = dbQuery.get('SELECT id, name, nim, email, initials, jurusan, angkatan FROM users WHERE id = ?', [req.user.id])
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' })

    const postCount = dbQuery.get('SELECT COUNT(*) AS count FROM posts WHERE user_id = ?', [user.id])
    const followerCount = dbQuery.get('SELECT COUNT(*) AS count FROM conversation_members WHERE user_id = ?', [user.id])

    res.json({ ...user, postCount: postCount.count, followerCount: followerCount.count })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', (req, res) => {
  try {
    const user = dbQuery.get('SELECT id, name, nim, initials, jurusan, angkatan FROM users WHERE id = ?', [req.params.id])
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' })

    const postCount = dbQuery.get('SELECT COUNT(*) AS count FROM posts WHERE user_id = ?', [user.id])

    const posts = dbQuery.all(
      `SELECT p.id, p.content, p.image, p.likes, p.created_at AS createdAt,
       u.name AS userName, u.initials AS userInitials, u.nim AS userNim,
       (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS likeCount,
       (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS commentCount
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC`,
      [user.id]
    )

    res.json({ ...user, postCount: postCount.count, posts })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/', (req, res) => {
  try {
    const users = dbQuery.all('SELECT id, name, nim, initials, jurusan FROM users')
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router