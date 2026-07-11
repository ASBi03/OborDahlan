import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDatabase } from './database.js'
import authRoutes from './routes/auth.js'
import postRoutes from './routes/posts.js'
import conversationRoutes from './routes/conversations.js'
import userRoutes from './routes/users.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/users', userRoutes)

app.get('/api', (req, res) => {
  res.json({
    message: 'OborDahlan API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      conversations: '/api/conversations',
      users: '/api/users',
    },
  })
})

async function start() {
  await initDatabase()
  console.log('✅ Database initialized')

  app.listen(PORT, () => {
    console.log(`🚀 OborDahlan API running on http://localhost:${PORT}`)
  })
}

start()