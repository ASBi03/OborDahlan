import { Router } from 'express'
import dbQuery from '../db.js'
import { auth } from '../middleware/auth.js'

const router = Router()

router.get('/', (req, res) => {
  try {
    const posts = dbQuery.all(`
      SELECT 
        p.id, p.content, p.image, p.likes, p.created_at AS createdAt, p.user_id AS userId,
        u.name AS userName, u.initials AS userInitials, u.nim AS userNim,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS likeCount,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS commentCount
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `)
    res.json(posts)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', auth, (req, res) => {
  try {
    const post = dbQuery.get(
      `SELECT 
        p.id, p.content, p.image, p.likes, p.created_at AS createdAt, p.user_id AS userId,
        u.name AS userName, u.initials AS userInitials, u.nim AS userNim
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?`,
      [req.params.id]
    )

    if (!post) return res.status(404).json({ error: 'Postingan tidak ditemukan' })

    const comments = dbQuery.all(
      `SELECT c.id, c.text, c.created_at AS createdAt, u.name AS userName, u.initials AS userInitials
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC`,
      [req.params.id]
    )

    const likeCount = dbQuery.get('SELECT COUNT(*) AS count FROM post_likes WHERE post_id = ?', [req.params.id])
    const liked = dbQuery.get('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?', [req.params.id, req.user.id])

    res.json({ ...post, comments, likeCount: likeCount.count, liked: !!liked })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', auth, (req, res) => {
  try {
    const { content, image } = req.body
    if (!content || !content.trim()) return res.status(400).json({ error: 'Content wajib diisi' })

    const result = dbQuery.run('INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)', [req.user.id, content, image || null])

    const post = dbQuery.get(
      `SELECT p.id, p.content, p.image, p.likes, p.created_at AS createdAt, p.user_id AS userId,
       u.name AS userName, u.initials AS userInitials, u.nim AS userNim
      FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?`,
      [result.lastInsertRowid]
    )

    res.status(201).json({ ...post, likeCount: 0, commentCount: 0 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', auth, (req, res) => {
  try {
    const post = dbQuery.get('SELECT * FROM posts WHERE id = ?', [req.params.id])
    if (!post) return res.status(404).json({ error: 'Postingan tidak ditemukan' })
    if (post.user_id !== req.user.id) return res.status(403).json({ error: 'Tidak punya akses' })

    dbQuery.run('DELETE FROM posts WHERE id = ?', [req.params.id])
    res.json({ message: 'Postingan dihapus' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/:id/like', auth, (req, res) => {
  try {
    const post = dbQuery.get('SELECT * FROM posts WHERE id = ?', [req.params.id])
    if (!post) return res.status(404).json({ error: 'Postingan tidak ditemukan' })

    const existing = dbQuery.get('SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?', [req.params.id, req.user.id])

    if (existing) {
      dbQuery.run('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [req.params.id, req.user.id])
      res.json({ liked: false })
    } else {
      dbQuery.run('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)', [req.params.id, req.user.id])
      res.json({ liked: true })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/:id/comment', auth, (req, res) => {
  try {
    const { text } = req.body
    if (!text || !text.trim()) return res.status(400).json({ error: 'Komentar wajib diisi' })

    const post = dbQuery.get('SELECT * FROM posts WHERE id = ?', [req.params.id])
    if (!post) return res.status(404).json({ error: 'Postingan tidak ditemukan' })

    const result = dbQuery.run('INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)', [req.params.id, req.user.id, text])

    const comment = dbQuery.get(
      `SELECT c.id, c.text, c.created_at AS createdAt, u.name AS userName, u.initials AS userInitials
      FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?`,
      [result.lastInsertRowid]
    )

    res.status(201).json(comment)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router