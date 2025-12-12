import db from '../database/db.js'
import { v4 as uuidv4 } from 'uuid'
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js'

// Get all players with optional filtering and pagination
export function getAllPlayers(req, res, next) {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status, 
      search,
      sortBy = 'last_seen',
      sortOrder = 'DESC'
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)
    
    let query = `
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM punishments WHERE player_id = p.id) as punishment_count,
        (SELECT COUNT(*) FROM punishments WHERE player_id = p.id AND type = 'warn') as warn_count,
        (SELECT COUNT(*) FROM punishments WHERE player_id = p.id AND type = 'ban') as ban_count,
        (SELECT COUNT(*) FROM notes WHERE player_id = p.id) as note_count
      FROM players p
      WHERE 1=1
    `
    const params = []

    if (status) {
      query += ` AND p.status = ?`
      params.push(status)
    }

    if (search) {
      query += ` AND (p.player_name LIKE ? OR p.player_uuid LIKE ?)`
      params.push(`%${search}%`, `%${search}%`)
    }

    // Validate sort column
    const validSortColumns = ['player_name', 'last_seen', 'first_join', 'total_playtime', 'status']
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'last_seen'
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

    query += ` ORDER BY p.${sortColumn} ${order} LIMIT ? OFFSET ?`
    params.push(parseInt(limit), offset)

    const players = db.prepare(query).all(...params)

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM players p WHERE 1=1`
    const countParams = []
    
    if (status) {
      countQuery += ` AND p.status = ?`
      countParams.push(status)
    }
    if (search) {
      countQuery += ` AND (p.player_name LIKE ? OR p.player_uuid LIKE ?)`
      countParams.push(`%${search}%`, `%${search}%`)
    }

    const { total } = db.prepare(countQuery).get(...countParams)

    res.json({
      players,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get single player by ID
export function getPlayerById(req, res, next) {
  try {
    const { id } = req.params

    const player = db.prepare(`
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM punishments WHERE player_id = p.id) as punishment_count,
        (SELECT COUNT(*) FROM punishments WHERE player_id = p.id AND type = 'warn') as warn_count,
        (SELECT COUNT(*) FROM punishments WHERE player_id = p.id AND type = 'mute') as mute_count,
        (SELECT COUNT(*) FROM punishments WHERE player_id = p.id AND type = 'kick') as kick_count,
        (SELECT COUNT(*) FROM punishments WHERE player_id = p.id AND type = 'ban') as ban_count,
        (SELECT COUNT(*) FROM notes WHERE player_id = p.id) as note_count
      FROM players p
      WHERE p.id = ?
    `).get(id)

    if (!player) {
      throw new NotFoundError('Player not found')
    }

    res.json(player)
  } catch (error) {
    next(error)
  }
}

// Search players
export function searchPlayers(req, res, next) {
  try {
    const { q } = req.query

    if (!q || q.length < 2) {
      return res.json([])
    }

    const players = db.prepare(`
      SELECT id, player_name, player_uuid, status, last_seen
      FROM players
      WHERE player_name LIKE ? OR player_uuid LIKE ?
      ORDER BY player_name ASC
      LIMIT 10
    `).all(`%${q}%`, `%${q}%`)

    res.json(players)
  } catch (error) {
    next(error)
  }
}

// Create new player
export function createPlayer(req, res, next) {
  try {
    const { 
      player_name, 
      player_uuid,
      ip_address, 
      hardware_id,
      status = 'offline'
    } = req.body

    if (!player_name) {
      throw new ValidationError('Player name is required')
    }

    const uuid = player_uuid || uuidv4()

    // Check if player already exists
    const existing = db.prepare('SELECT id FROM players WHERE player_uuid = ?').get(uuid)
    if (existing) {
      throw new ValidationError('Player with this UUID already exists')
    }

    const result = db.prepare(`
      INSERT INTO players (player_name, player_uuid, ip_address, hardware_id, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(player_name, uuid, ip_address, hardware_id, status)

    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(result.lastInsertRowid)

    // Log activity
    db.prepare(`
      INSERT INTO activity_log (player_id, action_type, details)
      VALUES (?, 'join', 'Player created')
    `).run(player.id)

    res.status(201).json(player)
  } catch (error) {
    next(error)
  }
}

// Update player
export function updatePlayer(req, res, next) {
  try {
    const { id } = req.params
    const updates = req.body

    // Check if player exists
    const existing = db.prepare('SELECT id FROM players WHERE id = ?').get(id)
    if (!existing) {
      throw new NotFoundError('Player not found')
    }

    // Build dynamic update query
    const allowedFields = ['player_name', 'ip_address', 'hardware_id', 'status', 'total_playtime', 'last_seen']
    const setClause = []
    const values = []

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = ?`)
        values.push(value)
      }
    }

    if (setClause.length === 0) {
      throw new ValidationError('No valid fields to update')
    }

    setClause.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    db.prepare(`
      UPDATE players 
      SET ${setClause.join(', ')}
      WHERE id = ?
    `).run(...values)

    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(id)

    res.json(player)
  } catch (error) {
    next(error)
  }
}

// Delete player
export function deletePlayer(req, res, next) {
  try {
    const { id } = req.params

    const existing = db.prepare('SELECT id FROM players WHERE id = ?').get(id)
    if (!existing) {
      throw new NotFoundError('Player not found')
    }

    db.prepare('DELETE FROM players WHERE id = ?').run(id)

    res.json({ message: 'Player deleted successfully' })
  } catch (error) {
    next(error)
  }
}

// Get player stats
export function getPlayerStats(req, res, next) {
  try {
    const { id } = req.params

    const player = db.prepare('SELECT id FROM players WHERE id = ?').get(id)
    if (!player) {
      throw new NotFoundError('Player not found')
    }

    const stats = {
      punishments: db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN type = 'warn' THEN 1 ELSE 0 END) as warns,
          SUM(CASE WHEN type = 'mute' THEN 1 ELSE 0 END) as mutes,
          SUM(CASE WHEN type = 'kick' THEN 1 ELSE 0 END) as kicks,
          SUM(CASE WHEN type = 'ban' THEN 1 ELSE 0 END) as bans,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
        FROM punishments WHERE player_id = ?
      `).get(id),
      notes: db.prepare('SELECT COUNT(*) as total FROM notes WHERE player_id = ?').get(id),
      activity: db.prepare('SELECT COUNT(*) as total FROM activity_log WHERE player_id = ?').get(id),
    }

    res.json(stats)
  } catch (error) {
    next(error)
  }
}
