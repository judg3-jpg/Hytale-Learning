import Database from 'better-sqlite3'
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
const db = new Database(dbPath)

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL')

export function initializeDatabase() {
  console.log('📦 Initializing database...')
  
  // Create Players table
  db.exec(`
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
  db.exec(`
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
  db.exec(`
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
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER,
      action_type TEXT NOT NULL CHECK(action_type IN ('join', 'leave', 'chat', 'command', 'punishment', 'note')),
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL
    )
  `)

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_players_name ON players(player_name);
    CREATE INDEX IF NOT EXISTS idx_players_uuid ON players(player_uuid);
    CREATE INDEX IF NOT EXISTS idx_players_status ON players(status);
    CREATE INDEX IF NOT EXISTS idx_punishments_player ON punishments(player_id);
    CREATE INDEX IF NOT EXISTS idx_punishments_active ON punishments(is_active);
    CREATE INDEX IF NOT EXISTS idx_punishments_type ON punishments(type);
    CREATE INDEX IF NOT EXISTS idx_notes_player ON notes(player_id);
    CREATE INDEX IF NOT EXISTS idx_activity_player ON activity_log(player_id);
    CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_log(action_type);
    CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_log(timestamp);
  `)

  console.log('✅ Database initialized successfully')
}

export default db
