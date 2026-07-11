import { getDb, saveDatabase } from './database.js'

function all(sql, params = []) {
  const db = getDb()
  const stmt = db.prepare(sql)
  if (params.length > 0) stmt.bind(params)
  const rows = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject())
  }
  stmt.free()
  return rows
}

function get(sql, params = []) {
  const db = getDb()
  const stmt = db.prepare(sql)
  if (params.length > 0) stmt.bind(params)
  let row = null
  if (stmt.step()) {
    row = stmt.getAsObject()
  }
  stmt.free()
  return row
}

function run(sql, params = []) {
  const db = getDb()
  db.run(sql, params)
  saveDatabase()
  const idResult = all('SELECT last_insert_rowid() AS id')
  const changesResult = all('SELECT changes() AS changes')
  return {
    lastInsertRowid: idResult[0]?.id || 0,
    changes: changesResult[0]?.changes || 0,
  }
}

function exec(sql) {
  const db = getDb()
  db.exec(sql)
  saveDatabase()
}

const dbQuery = { all, get, run, exec }
export default dbQuery