import { run, all, get, lastInsertRowId } from '../database/db.js'
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js'

// Get all punishments
export function getAllPunishments(req, res, next) {
  try {
    const { 
      page = 1, 
      limit = 50, 
      type,
      is_active,
      player_id,
      sortBy = 'issued_at',
      sortOrder = 'DESC'
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)
    
    let query = `
      SELECT 
        pun.*,
        p.player_name,
        p.player_uuid
      FROM punishments pun
      JOIN players p ON pun.player_id = p.id
      WHERE 1=1
    `
    const params = []

    if (type) {
      query += ` AND pun.type = ?`
      params.push(type)
    }

    if (is_active !== undefined) {
      query += ` AND pun.is_active = ?`
      params.push(is_active === 'true' ? 1 : 0)
    }

    if (player_id) {
      query += ` AND pun.player_id = ?`
      params.push(player_id)
    }

    const validSortColumns = ['issued_at', 'type', 'is_active', 'expires_at']
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'issued_at'
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

    query += ` ORDER BY pun.${sortColumn} ${order} LIMIT ? OFFSET ?`
    params.push(parseInt(limit), offset)

    const punishments = all(query, params)

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM punishments pun WHERE 1=1`
    const countParams = []
    
    if (type) {
      countQuery += ` AND pun.type = ?`
      countParams.push(type)
    }
    if (is_active !== undefined) {
      countQuery += ` AND pun.is_active = ?`
      countParams.push(is_active === 'true' ? 1 : 0)
    }
    if (player_id) {
      countQuery += ` AND pun.player_id = ?`
      countParams.push(player_id)
    }

    const countResult = get(countQuery, countParams)
    const total = countResult ? countResult.total : 0

    res.json({
      punishments,
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

// Get active punishments
export function getActivePunishments(req, res, next) {
  try {
    // First, expire any punishments that have passed their expiration
    run(`
      UPDATE punishments 
      SET is_active = 0 
      WHERE is_active = 1 
      AND expires_at IS NOT NULL 
      AND expires_at < datetime('now')
    `)

    const punishments = all(`
      SELECT 
        pun.*,
        p.player_name,
        p.player_uuid
      FROM punishments pun
      JOIN players p ON pun.player_id = p.id
      WHERE pun.is_active = 1
      ORDER BY pun.issued_at DESC
    `)

    res.json(punishments)
  } catch (error) {
    next(error)
  }
}

// Get punishments by player
export function getPunishmentsByPlayer(req, res, next) {
  try {
    const { id } = req.params

    const player = get('SELECT id FROM players WHERE id = ?', [id])
    if (!player) {
      throw new NotFoundError('Player not found')
    }

    const punishments = all(`
      SELECT * FROM punishments
      WHERE player_id = ?
      ORDER BY issued_at DESC
    `, [id])

    res.json(punishments)
  } catch (error) {
    next(error)
  }
}

// Create punishment
export function createPunishment(req, res, next) {
  try {
    const { player_id, type, reason, duration } = req.body

    if (!player_id || !type || !reason) {
      throw new ValidationError('Player ID, type, and reason are required')
    }

    const validTypes = ['warn', 'mute', 'kick', 'ban']
    if (!validTypes.includes(type)) {
      throw new ValidationError('Invalid punishment type')
    }

    // Check if player exists
    const player = get('SELECT id, player_name FROM players WHERE id = ?', [player_id])
    if (!player) {
      throw new NotFoundError('Player not found')
    }

    // Calculate expiration
    let expires_at = null
    if (duration && duration > 0) {
      const expirationDate = new Date(Date.now() + duration * 60 * 1000)
      expires_at = expirationDate.toISOString()
    }

    // For mutes and bans, deactivate previous active ones of same type
    if (type === 'mute' || type === 'ban') {
      run(`
        UPDATE punishments 
        SET is_active = 0 
        WHERE player_id = ? AND type = ? AND is_active = 1
      `, [player_id, type])
    }

    run(`
      INSERT INTO punishments (player_id, type, reason, duration, expires_at, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `, [player_id, type, reason, duration, expires_at])

    const punishmentId = lastInsertRowId()

    // Update player status if needed
    if (type === 'ban') {
      run('UPDATE players SET status = ? WHERE id = ?', ['banned', player_id])
    } else if (type === 'mute') {
      run('UPDATE players SET status = ? WHERE id = ?', ['muted', player_id])
    }

    // Log activity
    run(`
      INSERT INTO activity_log (player_id, action_type, details)
      VALUES (?, 'punishment', ?)
    `, [player_id, `${type.charAt(0).toUpperCase() + type.slice(1)}ed for: ${reason}`])

    const punishment = get(`
      SELECT pun.*, p.player_name, p.player_uuid
      FROM punishments pun
      JOIN players p ON pun.player_id = p.id
      WHERE pun.id = ?
    `, [punishmentId])

    res.status(201).json(punishment)
  } catch (error) {
    next(error)
  }
}

// Revoke punishment
export function revokePunishment(req, res, next) {
  try {
    const { id } = req.params
    const { reason } = req.body

    const punishment = get(`
      SELECT pun.*, p.player_name 
      FROM punishments pun
      JOIN players p ON pun.player_id = p.id
      WHERE pun.id = ?
    `, [id])

    if (!punishment) {
      throw new NotFoundError('Punishment not found')
    }

    if (!punishment.is_active) {
      throw new ValidationError('Punishment is already inactive')
    }

    run(`
      UPDATE punishments 
      SET is_active = 0, revoked_at = datetime('now'), revoke_reason = ?
      WHERE id = ?
    `, [reason || 'No reason provided', id])

    // Update player status if needed
    if (punishment.type === 'ban' || punishment.type === 'mute') {
      // Check if there are other active punishments of the same type
      const otherActive = get(`
        SELECT id FROM punishments 
        WHERE player_id = ? AND type = ? AND is_active = 1 AND id != ?
      `, [punishment.player_id, punishment.type, id])

      if (!otherActive) {
        run('UPDATE players SET status = ? WHERE id = ?', ['offline', punishment.player_id])
      }
    }

    // Log activity
    run(`
      INSERT INTO activity_log (player_id, action_type, details)
      VALUES (?, 'punishment', ?)
    `, [punishment.player_id, `${punishment.type} revoked: ${reason || 'No reason'}`])

    res.json({ message: 'Punishment revoked successfully' })
  } catch (error) {
    next(error)
  }
}

// Get punishment stats
export function getPunishmentStats(req, res, next) {
  try {
    const stats = get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN type = 'warn' THEN 1 ELSE 0 END) as total_warns,
        SUM(CASE WHEN type = 'mute' THEN 1 ELSE 0 END) as total_mutes,
        SUM(CASE WHEN type = 'kick' THEN 1 ELSE 0 END) as total_kicks,
        SUM(CASE WHEN type = 'ban' THEN 1 ELSE 0 END) as total_bans,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 1 AND type = 'warn' THEN 1 ELSE 0 END) as active_warns,
        SUM(CASE WHEN is_active = 1 AND type = 'mute' THEN 1 ELSE 0 END) as active_mutes,
        SUM(CASE WHEN is_active = 1 AND type = 'ban' THEN 1 ELSE 0 END) as active_bans,
        SUM(CASE WHEN issued_at >= datetime('now', '-1 day') THEN 1 ELSE 0 END) as last_24h,
        SUM(CASE WHEN issued_at >= datetime('now', '-7 days') THEN 1 ELSE 0 END) as last_7d
      FROM punishments
    `)

    res.json(stats)
  } catch (error) {
    next(error)
  }
}
