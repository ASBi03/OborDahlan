import { Router } from 'express'
import bcrypt from 'bcryptjs'
import dbQuery from '../db.js'
import { generateToken } from '../middleware/auth.js'

const router = Router()

router.post('/register', (req, res) => {
  try {
    const { name, nim, email, password, jurusan, angkatan } = req.body

    if (!name || !nim || !email || !password) {
      return res.status(400).json({ error: 'Semua field wajib diisi' })
    }

    const existing = dbQuery.get('SELECT id FROM users WHERE nim = ? OR email = ?', [nim, email])
    if (existing) {
      return res.status(400).json({ error: 'NIM atau email sudah terdaftar' })
    }

    const initials = name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    const hashedPassword = bcrypt.hashSync(password, 10)

    const result = dbQuery.run(
      'INSERT INTO users (name, nim, email, password, initials, jurusan, angkatan) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, nim, email, hashedPassword, initials, jurusan || 'Sistem Informasi', angkatan || '2023']
    )

    const user = dbQuery.get('SELECT id, name, nim, email, initials, jurusan, angkatan FROM users WHERE id = ?', [result.lastInsertRowid])
    const token = generateToken(user)

    res.status(201).json({ user, token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/login', (req, res) => {
  try {
    const { nim, password } = req.body

    if (!nim || !password) {
      return res.status(400).json({ error: 'NIM dan password wajib diisi' })
    }

    const user = dbQuery.get('SELECT * FROM users WHERE nim = ?', [nim])
    if (!user) {
      return res.status(401).json({ error: 'NIM atau password salah' })
    }

    const valid = bcrypt.compareSync(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'NIM atau password salah' })
    }

    const { password: _, ...userWithoutPassword } = user
    const token = generateToken(userWithoutPassword)

    res.json({ user: userWithoutPassword, token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router