import { get, all } from '../database/db.js'

// Get dashboard stats
export function getDashboardStats(req, res, next) {
  try {
    // Player stats
    const playerStats = get(`
      SELECT 
        COUNT(*) as total_players,
        SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online_now,
        SUM(CASE WHEN status = 'away' THEN 1 ELSE 0 END) as away,
        SUM(CASE WHEN status = 'offline' THEN 1 ELSE 0 END) as offline,
        SUM(CASE WHEN status = 'banned' THEN 1 ELSE 0 END) as banned,
        SUM(CASE WHEN status = 'muted' THEN 1 ELSE 0 END) as muted
      FROM players
    `)

    // Punishment stats
    const punishmentStats = get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 1 AND type = 'ban' THEN 1 ELSE 0 END) as active_bans,
        SUM(CASE WHEN is_active = 1 AND type = 'mute' THEN 1 ELSE 0 END) as active_mutes,
        SUM(CASE WHEN issued_at >= datetime('now', '-1 day') THEN 1 ELSE 0 END) as today,
        SUM(CASE WHEN issued_at >= datetime('now', '-1 day') AND type = 'warn' THEN 1 ELSE 0 END) as warned_today
      FROM punishments
    `)

    // Activity stats (last 24 hours)
    const activityStats = get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN action_type = 'join' THEN 1 ELSE 0 END) as joins,
        SUM(CASE WHEN action_type = 'leave' THEN 1 ELSE 0 END) as leaves,
        SUM(CASE WHEN action_type = 'punishment' THEN 1 ELSE 0 END) as punishments
      FROM activity_log
      WHERE timestamp >= datetime('now', '-1 day')
    `)

    res.json({
      players: playerStats,
      punishments: punishmentStats,
      activity: activityStats,
    })
  } catch (error) {
    next(error)
  }
}

// Get recent activity for dashboard
export function getRecentActivity(req, res, next) {
  try {
    const { limit = 10 } = req.query

    // Recent punishments
    const recentPunishments = all(`
      SELECT 
        pun.id,
        pun.type,
        pun.reason,
        pun.issued_at as timestamp,
        p.player_name,
        p.id as player_id
      FROM punishments pun
      JOIN players p ON pun.player_id = p.id
      ORDER BY pun.issued_at DESC
      LIMIT ?
    `, [parseInt(limit)])

    // Recent activity
    const recentActivity = all(`
      SELECT 
        a.id,
        a.action_type,
        a.details,
        a.timestamp,
        p.player_name,
        p.id as player_id
      FROM activity_log a
      LEFT JOIN players p ON a.player_id = p.id
      ORDER BY a.timestamp DESC
      LIMIT ?
    `, [parseInt(limit)])

    // Players needing attention (multiple warnings in short time, or approaching thresholds)
    const playersNeedingAttention = all(`
      SELECT 
        p.id,
        p.player_name,
        p.status,
        COUNT(pun.id) as recent_punishments,
        MAX(pun.issued_at) as last_punishment
      FROM players p
      JOIN punishments pun ON p.id = pun.player_id
      WHERE pun.issued_at >= datetime('now', '-7 days')
      GROUP BY p.id
      HAVING recent_punishments >= 3
      ORDER BY recent_punishments DESC
      LIMIT 5
    `)

    // Expiring punishments (within next hour)
    const expiringPunishments = all(`
      SELECT 
        pun.id,
        pun.type,
        pun.expires_at,
        p.player_name,
        p.id as player_id
      FROM punishments pun
      JOIN players p ON pun.player_id = p.id
      WHERE pun.is_active = 1 
      AND pun.expires_at IS NOT NULL
      AND pun.expires_at <= datetime('now', '+1 hour')
      AND pun.expires_at > datetime('now')
      ORDER BY pun.expires_at ASC
      LIMIT 5
    `)

    res.json({
      recentPunishments,
      recentActivity,
      playersNeedingAttention,
      expiringPunishments,
    })
  } catch (error) {
    next(error)
  }
}
