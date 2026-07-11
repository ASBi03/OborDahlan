import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ditemukan' })
  }

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Token tidak valid' })
  }
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, nim: user.nim },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )
}