import db, { initializeDatabase } from './db.js'
import { v4 as uuidv4 } from 'uuid'

// Initialize database first
initializeDatabase()

console.log('🌱 Seeding database...')

// Clear existing data
db.exec('DELETE FROM activity_log')
db.exec('DELETE FROM notes')
db.exec('DELETE FROM punishments')
db.exec('DELETE FROM players')

// Reset auto-increment
db.exec('DELETE FROM sqlite_sequence')

// Sample players
const players = [
  {
    player_name: 'PlayerOne',
    player_uuid: uuidv4(),
    ip_address: '192.168.1.100',
    hardware_id: 'HW-ABCD-1234',
    first_join: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    last_seen: new Date().toISOString(),
    total_playtime: 8640, // 144 hours
    status: 'online',
  },
  {
    player_name: 'ToxicGamer',
    player_uuid: uuidv4(),
    ip_address: '192.168.1.101',
    hardware_id: 'HW-EFGH-5678',
    first_join: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    last_seen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    total_playtime: 5340, // 89 hours
    status: 'muted',
  },
  {
    player_name: 'Cheater123',
    player_uuid: uuidv4(),
    ip_address: '192.168.1.102',
    hardware_id: 'HW-IJKL-9012',
    first_join: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    last_seen: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    total_playtime: 1200, // 20 hours
    status: 'banned',
  },
  {
    player_name: 'CasualPlayer',
    player_uuid: uuidv4(),
    ip_address: '192.168.1.103',
    hardware_id: 'HW-MNOP-3456',
    first_join: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
    last_seen: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    total_playtime: 12500, // 208 hours
    status: 'offline',
  },
  {
    player_name: 'ProGamer99',
    player_uuid: uuidv4(),
    ip_address: '192.168.1.104',
    hardware_id: 'HW-QRST-7890',
    first_join: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
    last_seen: new Date().toISOString(),
    total_playtime: 24000, // 400 hours
    status: 'online',
  },
  {
    player_name: 'NewPlayer123',
    player_uuid: uuidv4(),
    ip_address: '192.168.1.105',
    hardware_id: 'HW-UVWX-1234',
    first_join: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    last_seen: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    total_playtime: 180, // 3 hours
    status: 'offline',
  },
  {
    player_name: 'Spammer99',
    player_uuid: uuidv4(),
    ip_address: '192.168.1.106',
    hardware_id: 'HW-YZAB-5678',
    first_join: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    last_seen: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    total_playtime: 960, // 16 hours
    status: 'offline',
  },
  {
    player_name: 'SuspiciousPlayer',
    player_uuid: uuidv4(),
    ip_address: '192.168.1.107',
    hardware_id: 'HW-CDEF-9012',
    first_join: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    last_seen: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    total_playtime: 420, // 7 hours
    status: 'away',
  },
]

// Insert players
const insertPlayer = db.prepare(`
  INSERT INTO players (player_name, player_uuid, ip_address, hardware_id, first_join, last_seen, total_playtime, status)
  VALUES (@player_name, @player_uuid, @ip_address, @hardware_id, @first_join, @last_seen, @total_playtime, @status)
`)

const insertManyPlayers = db.transaction((players) => {
  for (const player of players) {
    insertPlayer.run(player)
  }
})

insertManyPlayers(players)
console.log(`✅ Inserted ${players.length} players`)

// Get player IDs for punishments
const playerIds = db.prepare('SELECT id, player_name FROM players').all()
const getPlayerId = (name) => playerIds.find(p => p.player_name === name)?.id

// Sample punishments
const punishments = [
  {
    player_id: getPlayerId('Cheater123'),
    type: 'ban',
    reason: 'Using modified client / cheating',
    duration: null,
    expires_at: null,
    is_active: 1,
    issued_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    player_id: getPlayerId('ToxicGamer'),
    type: 'mute',
    reason: 'Excessive toxicity in chat',
    duration: 1440,
    expires_at: new Date(Date.now() + 79200000).toISOString(),
    is_active: 1,
    issued_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    player_id: getPlayerId('ToxicGamer'),
    type: 'warn',
    reason: 'Harassment towards other players',
    duration: null,
    expires_at: null,
    is_active: 0,
    issued_at: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    player_id: getPlayerId('ToxicGamer'),
    type: 'warn',
    reason: 'Spam in chat',
    duration: null,
    expires_at: null,
    is_active: 0,
    issued_at: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    player_id: getPlayerId('PlayerOne'),
    type: 'warn',
    reason: 'Minor spam',
    duration: null,
    expires_at: null,
    is_active: 0,
    issued_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    player_id: getPlayerId('Spammer99'),
    type: 'mute',
    reason: 'Spam',
    duration: 60,
    expires_at: new Date(Date.now() - 255600000).toISOString(),
    is_active: 0,
    issued_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    player_id: getPlayerId('ProGamer99'),
    type: 'warn',
    reason: 'Minor rule violation',
    duration: null,
    expires_at: null,
    is_active: 0,
    issued_at: new Date(Date.now() - 1209600000).toISOString(),
  },
]

// Insert punishments
const insertPunishment = db.prepare(`
  INSERT INTO punishments (player_id, type, reason, duration, expires_at, is_active, issued_at)
  VALUES (@player_id, @type, @reason, @duration, @expires_at, @is_active, @issued_at)
`)

const insertManyPunishments = db.transaction((punishments) => {
  for (const punishment of punishments) {
    if (punishment.player_id) {
      insertPunishment.run(punishment)
    }
  }
})

insertManyPunishments(punishments)
console.log(`✅ Inserted ${punishments.length} punishments`)

// Sample notes
const notes = [
  {
    player_id: getPlayerId('ToxicGamer'),
    content: 'Player has been warned multiple times. Consider escalating to temp ban on next offense.',
    is_important: 1,
  },
  {
    player_id: getPlayerId('ToxicGamer'),
    content: 'Claims they were "just joking" - not buying it.',
    is_important: 0,
  },
  {
    player_id: getPlayerId('SuspiciousPlayer'),
    content: 'Possible alt account. HWID similar to banned player BanEvader99.',
    is_important: 1,
  },
  {
    player_id: getPlayerId('PlayerOne'),
    content: 'Good player overall, first offense was minor.',
    is_important: 0,
  },
  {
    player_id: getPlayerId('Cheater123'),
    content: 'Multiple reports from players. Confirmed cheating via logs.',
    is_important: 1,
  },
]

// Insert notes
const insertNote = db.prepare(`
  INSERT INTO notes (player_id, content, is_important)
  VALUES (@player_id, @content, @is_important)
`)

const insertManyNotes = db.transaction((notes) => {
  for (const note of notes) {
    if (note.player_id) {
      insertNote.run(note)
    }
  }
})

insertManyNotes(notes)
console.log(`✅ Inserted ${notes.length} notes`)

// Sample activity logs
const activities = [
  { player_id: getPlayerId('Cheater123'), action_type: 'punishment', details: 'Banned for: Using modified client', timestamp: new Date(Date.now() - 120000).toISOString() },
  { player_id: getPlayerId('ProGamer99'), action_type: 'join', details: null, timestamp: new Date(Date.now() - 300000).toISOString() },
  { player_id: getPlayerId('PlayerOne'), action_type: 'chat', details: 'Hello everyone!', timestamp: new Date(Date.now() - 600000).toISOString() },
  { player_id: getPlayerId('ToxicGamer'), action_type: 'punishment', details: 'Muted for: Excessive toxicity', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { player_id: getPlayerId('CasualPlayer'), action_type: 'leave', details: null, timestamp: new Date(Date.now() - 3600000).toISOString() },
  { player_id: getPlayerId('ProGamer99'), action_type: 'command', details: '/help', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { player_id: getPlayerId('SuspiciousPlayer'), action_type: 'note', details: 'Possible alt account', timestamp: new Date(Date.now() - 10800000).toISOString() },
  { player_id: getPlayerId('NewPlayer123'), action_type: 'join', details: null, timestamp: new Date(Date.now() - 86400000).toISOString() },
  { player_id: getPlayerId('Spammer99'), action_type: 'punishment', details: 'Warned for: Spam', timestamp: new Date(Date.now() - 90000000).toISOString() },
  { player_id: getPlayerId('NewPlayer123'), action_type: 'leave', details: null, timestamp: new Date(Date.now() - 172800000).toISOString() },
]

// Insert activities
const insertActivity = db.prepare(`
  INSERT INTO activity_log (player_id, action_type, details, timestamp)
  VALUES (@player_id, @action_type, @details, @timestamp)
`)

const insertManyActivities = db.transaction((activities) => {
  for (const activity of activities) {
    if (activity.player_id) {
      insertActivity.run(activity)
    }
  }
})

insertManyActivities(activities)
console.log(`✅ Inserted ${activities.length} activity logs`)

console.log('🎉 Database seeding completed!')
console.log('')
console.log('Summary:')
console.log(`  - Players: ${players.length}`)
console.log(`  - Punishments: ${punishments.length}`)
console.log(`  - Notes: ${notes.length}`)
console.log(`  - Activity Logs: ${activities.length}`)
