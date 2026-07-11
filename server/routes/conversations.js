import { Router } from 'express'
import dbQuery from '../db.js'
import { auth } from '../middleware/auth.js'

const router = Router()

router.get('/', auth, (req, res) => {
  try {
    const conversations = dbQuery.all(
      `SELECT 
        c.id,
        c.created_at AS createdAt,
        m.text AS lastMessage,
        m.created_at AS lastMessageAt,
        u.id AS otherUserId,
        u.name AS otherUserName,
        u.initials AS otherUserInitials,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ?) AS unreadCount
      FROM conversations c
      JOIN conversation_members cm1 ON c.id = cm1.conversation_id AND cm1.user_id = ?
      JOIN conversation_members cm2 ON c.id = cm2.conversation_id AND cm2.user_id != ?
      JOIN users u ON cm2.user_id = u.id
      LEFT JOIN messages m ON c.id = m.conversation_id
        AND m.id = (SELECT MAX(id) FROM messages WHERE conversation_id = c.id)
      ORDER BY COALESCE(m.created_at, c.created_at) DESC`,
      [req.user.id, req.user.id, req.user.id]
    )

    res.json(conversations)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', auth, (req, res) => {
  try {
    const member = dbQuery.get(
      'SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    )
    if (!member) return res.status(403).json({ error: 'Tidak punya akses' })

    const otherUser = dbQuery.get(
      `SELECT u.id, u.name, u.initials
      FROM conversation_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.conversation_id = ? AND cm.user_id != ?`,
      [req.params.id, req.user.id]
    )

    const messages = dbQuery.all(
      `SELECT m.id, m.text, m.sender_id AS senderId, m.created_at AS createdAt,
       u.name AS senderName, u.initials AS senderInitials
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC`,
      [req.params.id]
    )

    res.json({ otherUser, messages })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', auth, (req, res) => {
  try {
    const { recipientId, text } = req.body
    if (!recipientId || !text) return res.status(400).json({ error: 'Recipient dan text wajib diisi' })

    const existing = dbQuery.get(
      `SELECT c.id FROM conversations c
      JOIN conversation_members cm1 ON c.id = cm1.conversation_id AND cm1.user_id = ?
      JOIN conversation_members cm2 ON c.id = cm2.conversation_id AND cm2.user_id = ?`,
      [req.user.id, recipientId]
    )

    let conversationId

    if (existing) {
      conversationId = existing.id
    } else {
      const result = dbQuery.run('INSERT INTO conversations DEFAULT VALUES', [])
      conversationId = result.lastInsertRowid
      dbQuery.run('INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)', [conversationId, req.user.id])
      dbQuery.run('INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)', [conversationId, recipientId])
    }

    dbQuery.run('INSERT INTO messages (conversation_id, sender_id, text) VALUES (?, ?, ?)', [conversationId, req.user.id, text])

    res.status(201).json({ conversationId })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/:id/messages', auth, (req, res) => {
  try {
    const member = dbQuery.get(
      'SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    )
    if (!member) return res.status(403).json({ error: 'Tidak punya akses' })

    const { text } = req.body
    if (!text || !text.trim()) return res.status(400).json({ error: 'Pesan wajib diisi' })

    const result = dbQuery.run(
      'INSERT INTO messages (conversation_id, sender_id, text) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, text]
    )

    const message = dbQuery.get('SELECT * FROM messages WHERE id = ?', [result.lastInsertRowid])
    res.status(201).json(message)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router