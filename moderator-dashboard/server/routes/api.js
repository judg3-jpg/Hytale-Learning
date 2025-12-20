/**
 * API Routes for Moderator Statistics Dashboard
 */

const express = require('express');
const router = express.Router();
const db = require('../database/db');

// ============================================
// MODERATOR ENDPOINTS
// ============================================

/**
 * GET /api/moderators
 * Get all moderators
 */
router.get('/moderators', (req, res) => {
    try {
        // Reload database to get latest data
        db.reloadDatabase();
        const moderators = db.getAllModerators();
        res.json(moderators);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/moderators/:id
 * Get moderator by ID
 */
router.get('/moderators/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const moderator = db.getModeratorById(id);
        
        if (!moderator) {
            return res.status(404).json({ error: 'Moderator not found' });
        }
        
        // Get stats for this moderator
        const stats = db.getModeratorStats(id, 12);
        const activityLog = db.getActivityLog(id, 20);
        
        res.json({
            ...moderator,
            stats,
            activity_log: activityLog
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/moderators
 * Create new moderator
 */
router.post('/moderators', (req, res) => {
    try {
        const { name, discord_id, rank, status, join_date, avatar_url, notes } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        
        const id = db.createModerator({
            name,
            discord_id,
            rank,
            status,
            join_date,
            avatar_url,
            notes
        });
        
        db.addActivityLog(id, 'created', `Moderator ${name} was created`);
        
        res.status(201).json({ id, message: 'Moderator created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/moderators/:id
 * Update moderator
 */
router.put('/moderators/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const moderator = db.getModeratorById(id);
        
        if (!moderator) {
            return res.status(404).json({ error: 'Moderator not found' });
        }
        
        const updated = db.updateModerator(id, req.body);
        
        if (updated) {
            db.addActivityLog(id, 'updated', 'Moderator information was updated');
            res.json({ message: 'Moderator updated successfully' });
        } else {
            res.status(400).json({ error: 'No valid fields to update' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/moderators/:id
 * Delete moderator
 */
router.delete('/moderators/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const moderator = db.getModeratorById(id);
        
        if (!moderator) {
            return res.status(404).json({ error: 'Moderator not found' });
        }
        
        db.deleteModerator(id);
        res.json({ message: 'Moderator deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// STATISTICS ENDPOINTS
// ============================================

/**
 * GET /api/stats
 * Get dashboard overview stats
 */
router.get('/stats', (req, res) => {
    try {
        const stats = db.getDashboardStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/stats/moderator/:id
 * Get stats for specific moderator
 */
router.get('/stats/moderator/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const limit = parseInt(req.query.limit) || 12;
        const stats = db.getModeratorStats(id, limit);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/stats/moderator/:id/:year/:month
 * Get specific month stats
 */
router.get('/stats/moderator/:id/:year/:month', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month);
        
        if (month < 1 || month > 12) {
            return res.status(400).json({ error: 'Month must be between 1 and 12' });
        }
        
        const stats = db.getStatsByMonth(id, year, month);
        
        if (!stats) {
            return res.status(404).json({ error: 'Stats not found for this month' });
        }
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/stats
 * Create or update monthly stats
 */
router.post('/stats', (req, res) => {
    try {
        const {
            moderator_id,
            year,
            month,
            reports_handled,
            hours_worked,
            punishments_issued,
            warnings_issued,
            mutes_issued,
            kicks_issued,
            bans_issued,
            appeals_reviewed,
            tickets_resolved,
            quality_score,
            response_time_avg,
            notes
        } = req.body;
        
        // Validation
        if (!moderator_id || !year || !month) {
            return res.status(400).json({ error: 'moderator_id, year, and month are required' });
        }
        
        if (month < 1 || month > 12) {
            return res.status(400).json({ error: 'Month must be between 1 and 12' });
        }
        
        if (hours_worked && (hours_worked < 0 || hours_worked > 744)) {
            return res.status(400).json({ error: 'Hours worked must be between 0 and 744' });
        }
        
        if (quality_score && (quality_score < 0 || quality_score > 5)) {
            return res.status(400).json({ error: 'Quality score must be between 0 and 5' });
        }
        
        const statsId = db.upsertStats({
            moderator_id: parseInt(moderator_id),
            year: parseInt(year),
            month: parseInt(month),
            reports_handled: parseInt(reports_handled) || 0,
            hours_worked: parseFloat(hours_worked) || 0,
            punishments_issued: parseInt(punishments_issued) || 0,
            warnings_issued: parseInt(warnings_issued) || 0,
            mutes_issued: parseInt(mutes_issued) || 0,
            kicks_issued: parseInt(kicks_issued) || 0,
            bans_issued: parseInt(bans_issued) || 0,
            appeals_reviewed: parseInt(appeals_reviewed) || 0,
            tickets_resolved: parseInt(tickets_resolved) || 0,
            quality_score: quality_score ? parseFloat(quality_score) : null,
            response_time_avg: response_time_avg ? parseInt(response_time_avg) : null,
            notes
        });
        
        db.addActivityLog(
            parseInt(moderator_id),
            'stats_updated',
            `Stats updated for ${year}-${month.toString().padStart(2, '0')}`
        );
        
        res.status(201).json({ id: statsId, message: 'Stats saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/stats/:id
 * Update existing stats entry
 */
router.put('/stats/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = db.getStatsById(id);
        
        if (!existing) {
            return res.status(404).json({ error: 'Stats entry not found' });
        }
        
        // Use upsertStats with the existing entry's moderator_id, year, month
        const updatedId = db.upsertStats({
            moderator_id: existing.moderator_id,
            year: existing.year,
            month: existing.month,
            ...req.body
        });
        
        db.addActivityLog(existing.moderator_id, 'stats_updated', 'Stats entry was updated');
        res.json({ id: updatedId, message: 'Stats updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/stats/:id
 * Delete stats entry
 */
router.delete('/stats/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        db.deleteStats(id);
        res.json({ message: 'Stats entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/stats/export/:moderatorId?
 * Export stats (CSV format)
 */
router.get('/stats/export/:moderatorId?', (req, res) => {
    try {
        const moderatorId = req.params.moderatorId ? parseInt(req.params.moderatorId) : null;
        
        if (moderatorId) {
            // Export single moderator stats
            const stats = db.getModeratorStats(moderatorId, 1000);
            const moderator = db.getModeratorById(moderatorId);
            
            // Convert to CSV
            const headers = ['Year', 'Month', 'Reports Handled', 'Hours Worked', 'Punishments', 'Warnings', 'Mutes', 'Kicks', 'Bans', 'Appeals Reviewed', 'SkyBlock Reports', 'Quality Score', 'Avg Response Time'];
            const rows = stats.map(s => [
                s.year, s.month, s.reports_handled, s.hours_worked,
                s.punishments_issued, s.warnings_issued, s.mutes_issued,
                s.kicks_issued, s.bans_issued, s.appeals_reviewed,
                s.tickets_resolved, s.quality_score || '', s.response_time_avg || ''
            ]);
            
            const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${moderator.name}_stats.csv"`);
            res.send(csv);
        } else {
            // Export all moderators stats
            const moderators = db.getAllModerators();
            const allStats = [];
            
            moderators.forEach(mod => {
                const stats = db.getModeratorStats(mod.id, 1000);
                stats.forEach(s => {
                    allStats.push({
                        moderator: mod.name,
                        year: s.year,
                        month: s.month,
                        ...s
                    });
                });
            });
            
            const headers = ['Moderator', 'Year', 'Month', 'Reports Handled', 'Hours Worked', 'Punishments', 'Warnings', 'Mutes', 'Kicks', 'Bans', 'Appeals Reviewed', 'SkyBlock Reports', 'Quality Score', 'Avg Response Time'];
            const rows = allStats.map(s => [
                s.moderator, s.year, s.month, s.reports_handled, s.hours_worked,
                s.punishments_issued, s.warnings_issued, s.mutes_issued,
                s.kicks_issued, s.bans_issued, s.appeals_reviewed,
                s.tickets_resolved, s.quality_score || '', s.response_time_avg || ''
            ]);
            
            const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="all_moderators_stats.csv"');
            res.send(csv);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

/**
 * GET /api/analytics/trends
 * Get team trends over 12 months
 */
router.get('/analytics/trends', (req, res) => {
    try {
        const trends = db.getTeamTrends();
        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/analytics/comparison
 * Compare moderators
 */
router.get('/analytics/comparison', (req, res) => {
    try {
        const moderatorIds = req.query.ids ? req.query.ids.split(',').map(id => parseInt(id)) : [];
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        if (moderatorIds.length === 0) {
            return res.status(400).json({ error: 'At least one moderator ID is required' });
        }
        
        const comparison = moderatorIds.map(id => {
            const moderator = db.getModeratorById(id);
            const stats = db.getModeratorStats(id, 12);
            const currentMonthStats = db.getStatsByMonth(id, currentYear, currentMonth);
            
            return {
                moderator,
                stats,
                current_month: currentMonthStats
            };
        });
        
        res.json(comparison);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/analytics/top-performers
 * Get leaderboards
 */
router.get('/analytics/top-performers', (req, res) => {
    try {
        const metric = req.query.metric || 'reports_handled';
        const limit = parseInt(req.query.limit) || 5;
        
        const allowedMetrics = ['reports_handled', 'hours_worked', 'punishments_issued', 'tickets_resolved', 'quality_score'];
        if (!allowedMetrics.includes(metric)) {
            return res.status(400).json({ error: 'Invalid metric' });
        }
        
        const topPerformers = db.getTopPerformers(metric, limit);
        res.json(topPerformers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

