import { run, all, get, lastInsertRowId } from '../database/db.js'
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

    const activities = all(query, params)

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

    const countResult = get(countQuery, countParams)
    const total = countResult ? countResult.total : 0

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

    const player = get('SELECT id FROM players WHERE id = ?', [id])
    if (!player) {
      throw new NotFoundError('Player not found')
    }

    const offset = (parseInt(page) - 1) * parseInt(limit)

    const activities = all(`
      SELECT * FROM activity_log
      WHERE player_id = ?
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `, [id, parseInt(limit), offset])

    const countResult = get('SELECT COUNT(*) as total FROM activity_log WHERE player_id = ?', [id])
    const total = countResult ? countResult.total : 0

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
      const player = get('SELECT id FROM players WHERE id = ?', [player_id])
      if (!player) {
        throw new NotFoundError('Player not found')
      }
    }

    run(`
      INSERT INTO activity_log (player_id, action_type, details)
      VALUES (?, ?, ?)
    `, [player_id || null, action_type, details || null])

    const activityId = lastInsertRowId()

    const activity = get(`
      SELECT a.*, p.player_name, p.player_uuid
      FROM activity_log a
      LEFT JOIN players p ON a.player_id = p.id
      WHERE a.id = ?
    `, [activityId])

    res.status(201).json(activity)
  } catch (error) {
    next(error)
  }
}
