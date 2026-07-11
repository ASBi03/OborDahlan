import bcrypt from 'bcryptjs'
import { initDatabase, getDb, saveDatabase } from './database.js'

async function seed() {
  await initDatabase()
  const db = getDb()

  console.log('🌱 Seeding database...')

  db.run('DELETE FROM messages')
  db.run('DELETE FROM conversation_members')
  db.run('DELETE FROM conversations')
  db.run('DELETE FROM post_likes')
  db.run('DELETE FROM comments')
  db.run('DELETE FROM posts')
  db.run('DELETE FROM users')

  const users = [
    { name: 'Gustagus', nim: '2300016092', email: '2300016092@webmail.uad.ac.id', password: 'password123', jurusan: 'Sistem Informasi', angkatan: '2023' },
    { name: 'Lily Putri', nim: '2300011001', email: '2300011001@webmail.uad.ac.id', password: 'password123', jurusan: 'Sistem Informasi', angkatan: '2023' },
    { name: 'NapNap', nim: '2300012042', email: '2300012042@webmail.uad.ac.id', password: 'password123', jurusan: 'Teknik Informatika', angkatan: '2023' },
    { name: 'Keysrut', nim: '2300013078', email: '2300013078@webmail.uad.ac.id', password: 'password123', jurusan: 'Sistem Informasi', angkatan: '2023' },
  ]

  const insertUserStmt = db.prepare(
    'INSERT INTO users (name, nim, email, password, initials, jurusan, angkatan) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )

  const userIds = []
  for (const u of users) {
    const initials = u.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    const hashed = bcrypt.hashSync(u.password, 10)
    insertUserStmt.run([u.name, u.nim, u.email, hashed, initials, u.jurusan, u.angkatan])
    const idResult = db.exec('SELECT last_insert_rowid() AS id')
    const id = idResult[0].values[0][0]
    userIds.push(id)
  }
  insertUserStmt.free()
  console.log(`✅ ${users.length} users created`)

  const posts = [
    { userId: userIds[1], content: 'Halo semua! Ada yang mau join kelompok belajar Pemrograman Web bareng nggak? Rencananya mau tiap Sabtu pagi di perpus lantai 2. DM yaa 🙌' },
    { userId: userIds[2], content: 'Tugas Basis Data semester ini susah banget parah 😭 ada yang udah selesai ERD-nya? Minta hint dong pleaseeee. Btw deadline-nya besok jam 8 pagi.' },
    { userId: userIds[3], content: 'Foto dari Seminar Nasional kemarin! Seru banget pembicaranya. Banyak insight tentang AI dan masa depan dunia kerja buat kita para mahasiswa IT.' },
    { userId: userIds[0], content: 'Baru selesai ngerjain tugas Pemweb, lumayan lancar sih cuma ada beberapa error yang bikin pusing 😅. Semoga hasilnya memuaskan!' },
    { userId: userIds[1], content: 'Tips buat yang mau mulai belajar Vue.js: mulai dari Composition API langsung, jangan Options API. Lebih clean dan modern! 💚' },
  ]

  const insertPostStmt = db.prepare('INSERT INTO posts (user_id, content) VALUES (?, ?)')
  const postIds = []
  for (const p of posts) {
    insertPostStmt.run([p.userId, p.content])
    const idResult = db.exec('SELECT last_insert_rowid() AS id')
    postIds.push(idResult[0].values[0][0])
  }
  insertPostStmt.free()
  console.log(`✅ ${posts.length} posts created`)

  const comments = [
    { postId: postIds[0], userId: userIds[2], text: 'Aku mau ikut! Sabtu jam berapa?' },
    { postId: postIds[0], userId: userIds[3], text: 'Count me in juga 🙋' },
    { postId: postIds[1], userId: userIds[1], text: 'Aku juga belum 😭 yuk kerjain bareng di Discord' },
    { postId: postIds[2], userId: userIds[0], text: 'Wah keren! Ada foto-fotonya nggak?' },
    { postId: postIds[2], userId: userIds[2], text: 'Aku juga mau liat fotonya!' },
  ]

  const insertCommentStmt = db.prepare('INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)')
  for (const c of comments) {
    insertCommentStmt.run([c.postId, c.userId, c.text])
  }
  insertCommentStmt.free()
  console.log(`✅ ${comments.length} comments created`)

  const insertLikeStmt = db.prepare('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)')
  const likes = [
    { postId: postIds[0], userId: userIds[2] },
    { postId: postIds[0], userId: userIds[3] },
    { postId: postIds[1], userId: userIds[1] },
    { postId: postIds[2], userId: userIds[0] },
    { postId: postIds[2], userId: userIds[2] },
    { postId: postIds[3], userId: userIds[1] },
  ]
  for (const l of likes) {
    insertLikeStmt.run([l.postId, l.userId])
  }
  insertLikeStmt.free()
  console.log(`✅ ${likes.length} likes created`)

  db.run('INSERT INTO conversations DEFAULT VALUES')
  let r = db.exec('SELECT last_insert_rowid() AS id')
  const convId = r[0].values[0][0]
  db.run(`INSERT INTO conversation_members (conversation_id, user_id) VALUES (${convId}, ${userIds[0]})`)
  db.run(`INSERT INTO conversation_members (conversation_id, user_id) VALUES (${convId}, ${userIds[1]})`)

  db.run('INSERT INTO conversations DEFAULT VALUES')
  r = db.exec('SELECT last_insert_rowid() AS id')
  const convId2 = r[0].values[0][0]
  db.run(`INSERT INTO conversation_members (conversation_id, user_id) VALUES (${convId2}, ${userIds[0]})`)
  db.run(`INSERT INTO conversation_members (conversation_id, user_id) VALUES (${convId2}, ${userIds[2]})`)

  db.run('INSERT INTO conversations DEFAULT VALUES')
  r = db.exec('SELECT last_insert_rowid() AS id')
  const convId3 = r[0].values[0][0]
  db.run(`INSERT INTO conversation_members (conversation_id, user_id) VALUES (${convId3}, ${userIds[0]})`)
  db.run(`INSERT INTO conversation_members (conversation_id, user_id) VALUES (${convId3}, ${userIds[3]})`)

  db.run(`INSERT INTO messages (conversation_id, sender_id, text) VALUES (${convId}, ${userIds[1]}, 'Hei Gustagus, soal kelompok belajar tadi...')`)
  db.run(`INSERT INTO messages (conversation_id, sender_id, text) VALUES (${convId}, ${userIds[1]}, 'Aku mau ikut! Sabtu jam berapa?')`)
  db.run(`INSERT INTO messages (conversation_id, sender_id, text) VALUES (${convId2}, ${userIds[0]}, 'Nap, ERD-mu udah sampai mana?')`)
  db.run(`INSERT INTO messages (conversation_id, sender_id, text) VALUES (${convId2}, ${userIds[2]}, 'Belum mulai 😭')`)
  db.run(`INSERT INTO messages (conversation_id, sender_id, text) VALUES (${convId2}, ${userIds[2]}, 'Yuk kerjain bareng di Discord malam ini')`)
  db.run(`INSERT INTO messages (conversation_id, sender_id, text) VALUES (${convId3}, ${userIds[0]}, 'Key, seminar kemarin seru banget ya!')`)
  db.run(`INSERT INTO messages (conversation_id, sender_id, text) VALUES (${convId3}, ${userIds[3]}, 'Iya dong! Pembicaranya keren banget')`)
  db.run(`INSERT INTO messages (conversation_id, sender_id, text) VALUES (${convId3}, ${userIds[3]}, 'Sip siap! Nanti aku share fotonya')`)

  saveDatabase()

  console.log('✅ Conversations & messages created')
  console.log('\n🎉 Seed completed!')
  console.log('\n📋 Akun login:')
  for (const u of users) {
    console.log(`   ${u.name} | NIM: ${u.nim} | Password: ${u.password}`)
  }
}

seed().catch(console.error)