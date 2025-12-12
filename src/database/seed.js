// Database Seeder for Hytale Moderation Tool
const initSqlJs = require('sql.js')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

async function seed() {
  console.log('🌱 Seeding database...')
  
  const SQL = await initSqlJs()
  const db = new SQL.Database()
  
  // Create tables
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
  
  // Sample players
  const players = [
    { name: 'Judg3', rank: 'ADMIN', level: 100, status: 'online', location: 'SPAWN', playtime: 50000 },
    { name: 'ToxicGamer', rank: 'MEMBER', level: 45, status: 'online', location: 'SKYWARS-1', playtime: 5340, warnings: 3 },
    { name: 'Cheater123', rank: 'MEMBER', level: 12, status: 'offline', location: 'LOBBY-1', playtime: 1200, is_banned: 1 },
    { name: 'ProPlayer99', rank: 'VIP', level: 78, status: 'online', location: 'BEDWARS-3', playtime: 24000 },
    { name: 'NewPlayer', rank: 'MEMBER', level: 3, status: 'offline', location: 'LOBBY-1', playtime: 180 },
    { name: 'SpeedRunner', rank: 'MEMBER', level: 56, status: 'away', location: 'PARKOUR-2', playtime: 8900 },
    { name: 'BuilderBob', rank: 'HELPER', level: 67, status: 'online', location: 'CREATIVE-1', playtime: 15600 },
    { name: 'Spammer99', rank: 'MEMBER', level: 8, status: 'offline', location: 'LOBBY-1', playtime: 960, warnings: 2, is_muted: 1 },
    { name: 'SuspiciousAlt', rank: 'MEMBER', level: 5, status: 'online', location: 'LOBBY-2', playtime: 420, warnings: 1 },
    { name: 'CoolDude', rank: 'MOD', level: 85, status: 'online', location: 'LOBBY-1', playtime: 32000 },
  ]
  
  players.forEach(p => {
    db.run(
      `INSERT INTO players (player_name, player_uuid, rank, location, client_info, level, status, total_playtime, warnings, is_muted, is_banned, first_join, last_seen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-${Math.floor(Math.random() * 90)} days'), datetime('now', '-${Math.floor(Math.random() * 24)} hours'))`,
      [p.name, uuidv4(), p.rank, p.location, 'Hytale 1.0 / Official', p.level, p.status, p.playtime, p.warnings || 0, p.is_muted || 0, p.is_banned || 0]
    )
  })
  
  console.log(`✅ Inserted ${players.length} players`)
  
  // Sample punishments
  const punishments = [
    { player: 'Cheater123', type: 'ban', reason: 'Using modified client / cheating', duration: null },
    { player: 'ToxicGamer', type: 'warn', reason: 'Harassment towards other players', duration: null },
    { player: 'ToxicGamer', type: 'warn', reason: 'Spam in chat', duration: null },
    { player: 'ToxicGamer', type: 'mute', reason: 'Continued toxic behavior', duration: 1440 },
    { player: 'Spammer99', type: 'warn', reason: 'Spam', duration: null },
    { player: 'Spammer99', type: 'mute', reason: 'Excessive spam after warning', duration: 60 },
    { player: 'SuspiciousAlt', type: 'warn', reason: 'Suspected alt account', duration: null },
  ]
  
  punishments.forEach(p => {
    const playerResult = db.exec(`SELECT id FROM players WHERE player_name = '${p.player}'`)
    if (playerResult.length > 0 && playerResult[0].values.length > 0) {
      const playerId = playerResult[0].values[0][0]
      db.run(
        `INSERT INTO punishments (player_id, type, reason, duration, issued_at)
         VALUES (?, ?, ?, ?, datetime('now', '-${Math.floor(Math.random() * 7)} days'))`,
        [playerId, p.type, p.reason, p.duration]
      )
    }
  })
  
  console.log(`✅ Inserted ${punishments.length} punishments`)
  
  // Sample notes
  const notes = [
    { player: 'ToxicGamer', content: 'Player has been warned multiple times. Consider escalating to temp ban.', important: 1 },
    { player: 'SuspiciousAlt', content: 'HWID matches banned player Cheater123. Possible ban evasion.', important: 1 },
    { player: 'ProPlayer99', content: 'Good player, very helpful to new players.', important: 0 },
    { player: 'Cheater123', content: 'Multiple reports from players. Confirmed via logs.', important: 1 },
  ]
  
  notes.forEach(n => {
    const playerResult = db.exec(`SELECT id FROM players WHERE player_name = '${n.player}'`)
    if (playerResult.length > 0 && playerResult[0].values.length > 0) {
      const playerId = playerResult[0].values[0][0]
      db.run(
        `INSERT INTO notes (player_id, content, is_important) VALUES (?, ?, ?)`,
        [playerId, n.content, n.important]
      )
    }
  })
  
  console.log(`✅ Inserted ${notes.length} notes`)
  
  // Sample activity
  const activities = [
    { player: 'Cheater123', type: 'punishment', details: 'Banned for: Using modified client' },
    { player: 'ProPlayer99', type: 'join', details: 'Player joined the server' },
    { player: 'ToxicGamer', type: 'punishment', details: 'Muted for: Toxic behavior' },
    { player: 'BuilderBob', type: 'command', details: 'Used /help' },
    { player: 'NewPlayer', type: 'join', details: 'Player joined the server' },
    { player: 'CoolDude', type: 'command', details: 'Teleported to ToxicGamer' },
  ]
  
  activities.forEach(a => {
    const playerResult = db.exec(`SELECT id FROM players WHERE player_name = '${a.player}'`)
    if (playerResult.length > 0 && playerResult[0].values.length > 0) {
      const playerId = playerResult[0].values[0][0]
      db.run(
        `INSERT INTO activity_log (player_id, action_type, details, timestamp)
         VALUES (?, ?, ?, datetime('now', '-${Math.floor(Math.random() * 48)} hours'))`,
        [playerId, a.type, a.details]
      )
    }
  })
  
  console.log(`✅ Inserted ${activities.length} activity logs`)
  
  // Save database
  const dataDir = path.join(__dirname, '../../data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(path.join(dataDir, 'moderation.db'), buffer)
  
  console.log('')
  console.log('🎉 Database seeding completed!')
  console.log('')
  console.log('Summary:')
  console.log(`  - Players: ${players.length}`)
  console.log(`  - Punishments: ${punishments.length}`)
  console.log(`  - Notes: ${notes.length}`)
  console.log(`  - Activity Logs: ${activities.length}`)
}

seed().catch(console.error)
