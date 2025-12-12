import { initializeDatabase, run, exec, all, get, lastInsertRowId } from './db.js'
import { v4 as uuidv4 } from 'uuid'

// Initialize database first
await initializeDatabase()

console.log('🌱 Seeding database...')

// Clear existing data
exec('DELETE FROM activity_log')
exec('DELETE FROM notes')
exec('DELETE FROM punishments')
exec('DELETE FROM players')

// Sample players
const players = [
  {
    player_name: 'PlayerOne',
    player_uuid: uuidv4(),
    ip_address: '192.168.1.100',
    hardware_id: 'HW-ABCD-1234',
    first_join: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_seen: new Date().toISOString(),
    total_playtime: 8640,
    status: 'online',
  },
  {
    player_name: 'ToxicGamer',
    player_uuid: uuidv4(),
    ip_address: '192.168.1.101',
    hardware_id: 'HW-EFGH-5678',
    first_join: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    last_seen: new Date(Date.now() - 3600000).toISOString(),
    total_playtime: 5340,
    status: 'muted',
  },
  {
    player_name: 'Cheater123',
    player_uuid: uuidv4(),
    ip_address: '192.168.1.102',
    hardware_id: 'HW-IJKL-9012',
    first_join: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    last_seen: new Date(Date.now() - 86400000).toISOString(),
    total_playtime: 1200,
    status: 'banned',
  },
  {
    player_name: 'CasualPlayer',
    player_uuid: uuidv4(),
    ip_address: '192.168.1.103',
    hardware_id: 'HW-MNOP-3456',
    first_join: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    last_seen: new Date(Date.now() - 172800000).toISOString(),
    total_playtime: 12500,
    status: 'offline',
  },
  {
    player_name: 'ProGamer99',
    player_uuid: uuidv4(),
    ip_address: '192.168.1.104',
    hardware_id: 'HW-QRST-7890',
    first_join: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    last_seen: new Date().toISOString(),
    total_playtime: 24000,
    status: 'online',
  },
  {
    player_name: 'NewPlayer123',
    player_uuid: uuidv4(),
    ip_address: '192.168.1.105',
    hardware_id: 'HW-UVWX-1234',
    first_join: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    last_seen: new Date(Date.now() - 7200000).toISOString(),
    total_playtime: 180,
    status: 'offline',
  },
  {
    player_name: 'Spammer99',
    player_uuid: uuidv4(),
    ip_address: '192.168.1.106',
    hardware_id: 'HW-YZAB-5678',
    first_join: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    last_seen: new Date(Date.now() - 43200000).toISOString(),
    total_playtime: 960,
    status: 'offline',
  },
  {
    player_name: 'SuspiciousPlayer',
    player_uuid: uuidv4(),
    ip_address: '192.168.1.107',
    hardware_id: 'HW-CDEF-9012',
    first_join: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    last_seen: new Date(Date.now() - 1800000).toISOString(),
    total_playtime: 420,
    status: 'away',
  },
]

// Insert players
for (const player of players) {
  run(
    `INSERT INTO players (player_name, player_uuid, ip_address, hardware_id, first_join, last_seen, total_playtime, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [player.player_name, player.player_uuid, player.ip_address, player.hardware_id, player.first_join, player.last_seen, player.total_playtime, player.status]
  )
}
console.log(`✅ Inserted ${players.length} players`)

// Get player IDs for punishments
const playerIds = all('SELECT id, player_name FROM players')
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
for (const punishment of punishments) {
  if (punishment.player_id) {
    run(
      `INSERT INTO punishments (player_id, type, reason, duration, expires_at, is_active, issued_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [punishment.player_id, punishment.type, punishment.reason, punishment.duration, punishment.expires_at, punishment.is_active, punishment.issued_at]
    )
  }
}
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
for (const note of notes) {
  if (note.player_id) {
    run(
      `INSERT INTO notes (player_id, content, is_important)
       VALUES (?, ?, ?)`,
      [note.player_id, note.content, note.is_important]
    )
  }
}
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
for (const activity of activities) {
  if (activity.player_id) {
    run(
      `INSERT INTO activity_log (player_id, action_type, details, timestamp)
       VALUES (?, ?, ?, ?)`,
      [activity.player_id, activity.action_type, activity.details, activity.timestamp]
    )
  }
}
console.log(`✅ Inserted ${activities.length} activity logs`)

console.log('🎉 Database seeding completed!')
console.log('')
console.log('Summary:')
console.log(`  - Players: ${players.length}`)
console.log(`  - Punishments: ${punishments.length}`)
console.log(`  - Notes: ${notes.length}`)
console.log(`  - Activity Logs: ${activities.length}`)
