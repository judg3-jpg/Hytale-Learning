import initSqlJs from 'sql.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Ensure data directory exists
const dataDir = join(__dirname, '../../data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = process.env.DATABASE_PATH || join(dataDir, 'moderation.db')

let db = null

// Initialize SQL.js and load/create database
async function initDb() {
  const SQL = await initSqlJs()
  
  // Try to load existing database
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
  }
  
  return db
}

// Save database to file
function saveDb() {
  if (db) {
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(dbPath, buffer)
  }
}

// Get database instance
export async function getDb() {
  if (!db) {
    await initDb()
  }
  return db
}

// Helper to run a query and save
export function run(sql, params = []) {
  db.run(sql, params)
  saveDb()
}

// Helper to get all results
export function all(sql, params = []) {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const results = []
  while (stmt.step()) {
    results.push(stmt.getAsObject())
  }
  stmt.free()
  return results
}

// Helper to get single result
export function get(sql, params = []) {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  let result = null
  if (stmt.step()) {
    result = stmt.getAsObject()
  }
  stmt.free()
  return result
}

// Helper to execute multiple statements
export function exec(sql) {
  db.exec(sql)
  saveDb()
}

// Get last insert row id
export function lastInsertRowId() {
  const result = get('SELECT last_insert_rowid() as id')
  return result ? result.id : null
}

export async function initializeDatabase() {
  console.log('📦 Initializing database...')
  
  await getDb()
  
  // Create Players table
  exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      player_uuid TEXT UNIQUE NOT NULL,
      avatar_url TEXT,
      ip_address TEXT,
      hardware_id TEXT,
      first_join DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_playtime INTEGER DEFAULT 0,
      status TEXT DEFAULT 'offline' CHECK(status IN ('online', 'away', 'offline', 'banned', 'muted')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create Punishments table
  exec(`
    CREATE TABLE IF NOT EXISTS punishments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('warn', 'mute', 'kick', 'ban')),
      reason TEXT NOT NULL,
      duration INTEGER,
      expires_at DATETIME,
      is_active INTEGER DEFAULT 1,
      issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      revoked_at DATETIME,
      revoke_reason TEXT,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
    )
  `)

  // Create Notes table
  exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_important INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
    )
  `)

  // Create Activity Log table
  exec(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER,
      action_type TEXT NOT NULL CHECK(action_type IN ('join', 'leave', 'chat', 'command', 'punishment', 'note')),
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL
    )
  `)

  console.log('✅ Database initialized successfully')
}

export default { getDb, run, all, get, exec, lastInsertRowId, initializeDatabase }
