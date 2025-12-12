import db from '../database/db.js'
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js'

// Get all activity
export function getAllActivity(req, res, next) {
  try {
    const { 
      page = 1, 
      limit = 50, 
      action_type,
      player_id,
      from,
      to
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)
    
    let query = `
      SELECT 
        a.*,
        p.player_name,
        p.player_uuid
      FROM activity_log a
      LEFT JOIN players p ON a.player_id = p.id
      WHERE 1=1
    `
    const params = []

    if (action_type) {
      query += ` AND a.action_type = ?`
      params.push(action_type)
    }

    if (player_id) {
      query += ` AND a.player_id = ?`
      params.push(player_id)
    }

    if (from) {
      query += ` AND a.timestamp >= ?`
      params.push(from)
    }

    if (to) {
      query += ` AND a.timestamp <= ?`
      params.push(to)
    }

    query += ` ORDER BY a.timestamp DESC LIMIT ? OFFSET ?`
    params.push(parseInt(limit), offset)

    const activities = db.prepare(query).all(...params)

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM activity_log a WHERE 1=1`
    const countParams = []
    
    if (action_type) {
      countQuery += ` AND a.action_type = ?`
      countParams.push(action_type)
    }
    if (player_id) {
      countQuery += ` AND a.player_id = ?`
      countParams.push(player_id)
    }
    if (from) {
      countQuery += ` AND a.timestamp >= ?`
      countParams.push(from)
    }
    if (to) {
      countQuery += ` AND a.timestamp <= ?`
      countParams.push(to)
    }

    const { total } = db.prepare(countQuery).get(...countParams)

    res.json({
      activities,
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

// Get activity by player
export function getActivityByPlayer(req, res, next) {
  try {
    const { id } = req.params
    const { page = 1, limit = 50 } = req.query

    const player = db.prepare('SELECT id FROM players WHERE id = ?').get(id)
    if (!player) {
      throw new NotFoundError('Player not found')
    }

    const offset = (parseInt(page) - 1) * parseInt(limit)

    const activities = db.prepare(`
      SELECT * FROM activity_log
      WHERE player_id = ?
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `).all(id, parseInt(limit), offset)

    const { total } = db.prepare('SELECT COUNT(*) as total FROM activity_log WHERE player_id = ?').get(id)

    res.json({
      activities,
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

// Create activity log entry
export function createActivity(req, res, next) {
  try {
    const { player_id, action_type, details } = req.body

    if (!action_type) {
      throw new ValidationError('Action type is required')
    }

    const validTypes = ['join', 'leave', 'chat', 'command', 'punishment', 'note']
    if (!validTypes.includes(action_type)) {
      throw new ValidationError('Invalid action type')
    }

    // If player_id provided, verify player exists
    if (player_id) {
      const player = db.prepare('SELECT id FROM players WHERE id = ?').get(player_id)
      if (!player) {
        throw new NotFoundError('Player not found')
      }
    }

    const result = db.prepare(`
      INSERT INTO activity_log (player_id, action_type, details)
      VALUES (?, ?, ?)
    `).run(player_id || null, action_type, details || null)

    const activity = db.prepare(`
      SELECT a.*, p.player_name, p.player_uuid
      FROM activity_log a
      LEFT JOIN players p ON a.player_id = p.id
      WHERE a.id = ?
    `).get(result.lastInsertRowid)

    res.status(201).json(activity)
  } catch (error) {
    next(error)
  }
}
