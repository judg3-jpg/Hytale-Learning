const { contextBridge, ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')

// Database setup
let db = null
let SQL = null

// Initialize SQL.js
async function initDatabase() {
  if (db) return db
  
  const initSqlJs = require('sql.js')
  SQL = await initSqlJs()
  
  const dbDir = path.join(__dirname, 'data')
  const dbPath = path.join(dbDir, 'moderation.db')
  
  // Ensure data directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }
  
  // Load or create database
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
    initializeTables()
  }
  
  return db
}

function saveDatabase() {
  if (db) {
    const dbDir = path.join(__dirname, 'data')
    const dbPath = path.join(dbDir, 'moderation.db')
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(dbPath, buffer)
  }
}

function initializeTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      player_uuid TEXT UNIQUE NOT NULL,
      rank TEXT DEFAULT 'MEMBER',
      location TEXT DEFAULT 'LOBBY-1',
      client_info TEXT DEFAULT 'Hytale 1.0',
      level INTEGER DEFAULT 1,
      first_join DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_playtime INTEGER DEFAULT 0,
      status TEXT DEFAULT 'offline',
      warnings INTEGER DEFAULT 0,
      is_muted INTEGER DEFAULT 0,
      is_banned INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS punishments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      reason TEXT NOT NULL,
      duration INTEGER,
      expires_at DATETIME,
      is_active INTEGER DEFAULT 1,
      issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_important INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER,
      action_type TEXT NOT NULL,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id)
    )
  `)
  
  saveDatabase()
}

// Expose API to renderer
contextBridge.exposeInMainWorld('api', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),

  // Database operations
  initDatabase: async () => {
    await initDatabase()
    return true
  },

  // Players
  getPlayers: () => {
    if (!db) return []
    const results = db.exec('SELECT * FROM players ORDER BY last_seen DESC')
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  getPlayerById: (id) => {
    if (!db) return null
    const stmt = db.prepare('SELECT * FROM players WHERE id = ?')
    stmt.bind([id])
    if (stmt.step()) {
      const row = stmt.getAsObject()
      stmt.free()
      return row
    }
    stmt.free()
    return null
  },

  searchPlayers: (query) => {
    if (!db || !query) return []
    const results = db.exec(`SELECT * FROM players WHERE player_name LIKE '%${query}%' ORDER BY player_name LIMIT 20`)
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  createPlayer: (data) => {
    if (!db) return null
    const { v4: uuidv4 } = require('uuid')
    const uuid = data.player_uuid || uuidv4()
    db.run(
      `INSERT INTO players (player_name, player_uuid, rank, location, client_info, level, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.player_name, uuid, data.rank || 'MEMBER', data.location || 'LOBBY-1', data.client_info || 'Hytale 1.0', data.level || 1, data.status || 'online']
    )
    saveDatabase()
    const results = db.exec('SELECT * FROM players WHERE id = last_insert_rowid()')
    if (results.length === 0) return null
    const columns = results[0].columns
    const row = results[0].values[0]
    const obj = {}
    columns.forEach((col, i) => obj[col] = row[i])
    return obj
  },

  updatePlayer: (id, data) => {
    if (!db) return false
    const sets = []
    const values = []
    for (const [key, value] of Object.entries(data)) {
      sets.push(`${key} = ?`)
      values.push(value)
    }
    values.push(id)
    db.run(`UPDATE players SET ${sets.join(', ')} WHERE id = ?`, values)
    saveDatabase()
    return true
  },

  // Punishments
  getPunishments: (playerId) => {
    if (!db) return []
    const query = playerId 
      ? `SELECT * FROM punishments WHERE player_id = ${playerId} ORDER BY issued_at DESC`
      : 'SELECT p.*, pl.player_name FROM punishments p JOIN players pl ON p.player_id = pl.id ORDER BY issued_at DESC'
    const results = db.exec(query)
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  createPunishment: (data) => {
    if (!db) return null
    let expires_at = null
    if (data.duration && data.duration > 0) {
      const exp = new Date(Date.now() + data.duration * 60 * 1000)
      expires_at = exp.toISOString()
    }
    db.run(
      `INSERT INTO punishments (player_id, type, reason, duration, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [data.player_id, data.type, data.reason, data.duration, expires_at]
    )
    
    // Update player status
    if (data.type === 'ban') {
      db.run('UPDATE players SET is_banned = 1, status = ? WHERE id = ?', ['banned', data.player_id])
    } else if (data.type === 'mute') {
      db.run('UPDATE players SET is_muted = 1 WHERE id = ?', [data.player_id])
    } else if (data.type === 'warn') {
      db.run('UPDATE players SET warnings = warnings + 1 WHERE id = ?', [data.player_id])
    }
    
    // Log activity
    db.run(
      `INSERT INTO activity_log (player_id, action_type, details) VALUES (?, ?, ?)`,
      [data.player_id, 'punishment', `${data.type}: ${data.reason}`]
    )
    
    saveDatabase()
    return true
  },

  // Notes
  getNotes: (playerId) => {
    if (!db) return []
    const results = db.exec(`SELECT * FROM notes WHERE player_id = ${playerId} ORDER BY created_at DESC`)
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  createNote: (playerId, content, isImportant = false) => {
    if (!db) return null
    db.run(
      `INSERT INTO notes (player_id, content, is_important) VALUES (?, ?, ?)`,
      [playerId, content, isImportant ? 1 : 0]
    )
    saveDatabase()
    return true
  },

  // Activity Log
  getActivityLog: (playerId = null) => {
    if (!db) return []
    const query = playerId
      ? `SELECT * FROM activity_log WHERE player_id = ${playerId} ORDER BY timestamp DESC LIMIT 50`
      : 'SELECT a.*, p.player_name FROM activity_log a LEFT JOIN players p ON a.player_id = p.id ORDER BY timestamp DESC LIMIT 50'
    const results = db.exec(query)
    if (results.length === 0) return []
    const columns = results[0].columns
    return results[0].values.map(row => {
      const obj = {}
      columns.forEach((col, i) => obj[col] = row[i])
      return obj
    })
  },

  logActivity: (playerId, actionType, details) => {
    if (!db) return false
    db.run(
      `INSERT INTO activity_log (player_id, action_type, details) VALUES (?, ?, ?)`,
      [playerId, actionType, details]
    )
    saveDatabase()
    return true
  }
})
