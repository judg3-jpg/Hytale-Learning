/**
 * Database module for Moderator Statistics Dashboard
 * Handles SQLite connection using sql.js
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let db = null;
let SQL = null;
const DB_PATH = path.join(__dirname, 'moderator_stats.db');

/**
 * Initialize the database connection and create tables
 */
async function initDatabase() {
    // Initialize SQL.js
    SQL = await initSqlJs();
    
    // Load existing database or create new one
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema statements one by one
    const statements = schema.split(';').filter(s => s.trim().length > 0);
    statements.forEach(statement => {
        if (statement.trim()) {
            db.run(statement);
        }
    });
    
    // Save the database
    saveDatabase();
    
    console.log('✅ Database initialized');
    return db;
}

/**
 * Save database to file
 */
function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    }
}

/**
 * Reload database from file (useful when database is updated externally)
 */
function reloadDatabase() {
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
        console.log('🔄 Database reloaded from file');
        return true;
    }
    return false;
}

/**
 * Get the database instance
 */
function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
}

// ============================================
// MODERATOR OPERATIONS
// ============================================

/**
 * Get all moderators
 */
function getAllModerators() {
    const results = getDb().exec('SELECT * FROM moderators ORDER BY name');
    return rowsToObjects(results, ['id', 'name', 'discord_id', 'rank', 'status', 'join_date', 'avatar_url', 'notes', 'created_at']);
}

/**
 * Get moderator by ID
 */
function getModeratorById(id) {
    const stmt = getDb().prepare('SELECT * FROM moderators WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
    }
    stmt.free();
    return null;
}

/**
 * Create a new moderator
 */
function createModerator(moderator) {
    const stmt = getDb().prepare(`
        INSERT INTO moderators (name, discord_id, rank, status, join_date, avatar_url, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run([
        moderator.name,
        moderator.discord_id || null,
        moderator.rank || null,
        moderator.status || 'active',
        moderator.join_date || null,
        moderator.avatar_url || null,
        moderator.notes || null
    ]);
    stmt.free();
    
    const result = getDb().exec('SELECT last_insert_rowid() as id');
    const lastId = result[0]?.values[0]?.[0] || 0;
    
    saveDatabase();
    return lastId;
}

/**
 * Update a moderator
 */
function updateModerator(id, updates) {
    const allowedFields = ['name', 'discord_id', 'rank', 'status', 'join_date', 'avatar_url', 'notes'];
    const setClause = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
            setClause.push(`${key} = ?`);
            values.push(value);
        }
    }
    
    if (setClause.length === 0) return false;
    
    values.push(id);
    const sql = `UPDATE moderators SET ${setClause.join(', ')} WHERE id = ?`;
    getDb().run(sql, values);
    saveDatabase();
    return true;
}

/**
 * Delete a moderator
 */
function deleteModerator(id) {
    getDb().run('DELETE FROM moderators WHERE id = ?', [id]);
    saveDatabase();
    return true;
}

// ============================================
// STATISTICS OPERATIONS
// ============================================

/**
 * Get stats for a specific moderator
 */
function getModeratorStats(moderatorId, limit = 12) {
    const stmt = getDb().prepare(`
        SELECT * FROM moderator_stats 
        WHERE moderator_id = ? 
        ORDER BY year DESC, month DESC 
        LIMIT ?
    `);
    stmt.bind([moderatorId, limit]);
    
    const rows = [];
    while (stmt.step()) {
        rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
}

/**
 * Get stats by ID
 */
function getStatsById(id) {
    const stmt = getDb().prepare('SELECT * FROM moderator_stats WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
    }
    stmt.free();
    return null;
}

/**
 * Get stats for a specific month
 */
function getStatsByMonth(moderatorId, year, month) {
    const stmt = getDb().prepare(`
        SELECT * FROM moderator_stats 
        WHERE moderator_id = ? AND year = ? AND month = ?
    `);
    stmt.bind([moderatorId, year, month]);
    
    if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
    }
    stmt.free();
    return null;
}

/**
 * Create or update monthly stats
 */
function upsertStats(stats) {
    // Check if entry exists
    const existing = getStatsByMonth(stats.moderator_id, stats.year, stats.month);
    
    if (existing) {
        // Update existing entry
        const stmt = getDb().prepare(`
            UPDATE moderator_stats SET
                reports_handled = ?,
                hours_worked = ?,
                punishments_issued = ?,
                warnings_issued = ?,
                mutes_issued = ?,
                kicks_issued = ?,
                bans_issued = ?,
                appeals_reviewed = ?,
                tickets_resolved = ?,
                quality_score = ?,
                response_time_avg = ?,
                notes = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        stmt.run([
            stats.reports_handled || 0,
            stats.hours_worked || 0,
            stats.punishments_issued || 0,
            stats.warnings_issued || 0,
            stats.mutes_issued || 0,
            stats.kicks_issued || 0,
            stats.bans_issued || 0,
            stats.appeals_reviewed || 0,
            stats.tickets_resolved || 0,
            stats.quality_score || null,
            stats.response_time_avg || null,
            stats.notes || null,
            existing.id
        ]);
        stmt.free();
        saveDatabase();
        return existing.id;
    } else {
        // Create new entry
        const stmt = getDb().prepare(`
            INSERT INTO moderator_stats (
                moderator_id, year, month,
                reports_handled, hours_worked, punishments_issued,
                warnings_issued, mutes_issued, kicks_issued, bans_issued,
                appeals_reviewed, tickets_resolved, quality_score,
                response_time_avg, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run([
            stats.moderator_id,
            stats.year,
            stats.month,
            stats.reports_handled || 0,
            stats.hours_worked || 0,
            stats.punishments_issued || 0,
            stats.warnings_issued || 0,
            stats.mutes_issued || 0,
            stats.kicks_issued || 0,
            stats.bans_issued || 0,
            stats.appeals_reviewed || 0,
            stats.tickets_resolved || 0,
            stats.quality_score || null,
            stats.response_time_avg || null,
            stats.notes || null
        ]);
        stmt.free();
        
        const result = getDb().exec('SELECT last_insert_rowid() as id');
        const lastId = result[0]?.values[0]?.[0] || 0;
        saveDatabase();
        return lastId;
    }
}

/**
 * Delete a stats entry
 */
function deleteStats(id) {
    getDb().run('DELETE FROM moderator_stats WHERE id = ?', [id]);
    saveDatabase();
    return true;
}

/**
 * Get dashboard overview stats
 */
function getDashboardStats() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Get current month stats
    const stmt1 = getDb().prepare(`
        SELECT 
            COUNT(DISTINCT moderator_id) as active_moderators,
            SUM(reports_handled) as total_reports,
            SUM(hours_worked) as total_hours,
            AVG(quality_score) as avg_quality_score
        FROM moderator_stats
        WHERE year = ? AND month = ?
    `);
    stmt1.bind([currentYear, currentMonth]);
    const currentMonthRow = stmt1.step() ? stmt1.getAsObject() : {};
    stmt1.free();
    
    // Get total moderators
    const totalModeratorsResult = getDb().exec('SELECT COUNT(*) as total FROM moderators');
    const totalModerators = totalModeratorsResult[0]?.values[0]?.[0] || 0;
    
    // Get active moderators
    const activeModeratorsStmt = getDb().prepare(`SELECT COUNT(*) as active FROM moderators WHERE status = 'active'`);
    activeModeratorsStmt.step();
    const activeModerators = activeModeratorsStmt.getAsObject().active || 0;
    activeModeratorsStmt.free();
    
    return {
        total_moderators: totalModerators,
        active_moderators: activeModerators,
        current_month: {
            active_moderators: currentMonthRow.active_moderators || 0,
            total_reports: currentMonthRow.total_reports || 0,
            total_hours: currentMonthRow.total_hours || 0,
            avg_quality_score: currentMonthRow.avg_quality_score || 0
        }
    };
}

/**
 * Get team trends (12 months)
 */
function getTeamTrends() {
    const currentDate = new Date();
    const trends = [];
    
    for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        const stmt = getDb().prepare(`
            SELECT 
                SUM(reports_handled) as reports,
                SUM(hours_worked) as hours,
                AVG(quality_score) as quality
            FROM moderator_stats
            WHERE year = ? AND month = ?
        `);
        stmt.bind([year, month]);
        const row = stmt.step() ? stmt.getAsObject() : {};
        stmt.free();
        
        trends.push({
            year,
            month,
            reports: row.reports || 0,
            hours: row.hours || 0,
            quality: row.quality || 0
        });
    }
    
    return trends;
}

/**
 * Get top performers
 */
function getTopPerformers(metric = 'reports_handled', limit = 5) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Validate metric to prevent SQL injection
    const allowedMetrics = ['reports_handled', 'hours_worked', 'punishments_issued', 'tickets_resolved', 'quality_score'];
    if (!allowedMetrics.includes(metric)) {
        metric = 'reports_handled';
    }
    
    const stmt = getDb().prepare(`
        SELECT 
            m.id,
            m.name,
            m.rank,
            s.${metric} as value
        FROM moderator_stats s
        JOIN moderators m ON s.moderator_id = m.id
        WHERE s.year = ? AND s.month = ?
        ORDER BY s.${metric} DESC
        LIMIT ?
    `);
    stmt.bind([currentYear, currentMonth, limit]);
    
    const rows = [];
    while (stmt.step()) {
        rows.push(stmt.getAsObject());
    }
    stmt.free();
    
    return rows;
}

// ============================================
// ACTIVITY LOG OPERATIONS
// ============================================

/**
 * Add activity log entry
 */
function addActivityLog(moderatorId, actionType, details) {
    const stmt = getDb().prepare(`
        INSERT INTO activity_log (moderator_id, action_type, details)
        VALUES (?, ?, ?)
    `);
    stmt.run([moderatorId, actionType, details || null]);
    stmt.free();
    saveDatabase();
}

/**
 * Get activity log for a moderator
 */
function getActivityLog(moderatorId, limit = 50) {
    const stmt = getDb().prepare(`
        SELECT * FROM activity_log 
        WHERE moderator_id = ? 
        ORDER BY timestamp DESC 
        LIMIT ?
    `);
    stmt.bind([moderatorId, limit]);
    
    const rows = [];
    while (stmt.step()) {
        rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
}

/**
 * Close the database connection
 */
function closeDatabase() {
    if (db) {
        saveDatabase();
        db.close();
        db = null;
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert sql.js results to array of objects
 */
function rowsToObjects(results, columns) {
    if (!results || results.length === 0) return [];
    
    const rows = results[0].values;
    return rows.map(row => {
        const obj = {};
        columns.forEach((col, i) => {
            obj[col] = row[i];
        });
        return obj;
    });
}

module.exports = {
    initDatabase,
    getDb,
    reloadDatabase,
    closeDatabase,
    saveDatabase,
    // Moderators
    getAllModerators,
    getModeratorById,
    createModerator,
    updateModerator,
    deleteModerator,
    // Statistics
    getModeratorStats,
    getStatsById,
    getStatsByMonth,
    upsertStats,
    deleteStats,
    getDashboardStats,
    getTeamTrends,
    getTopPerformers,
    // Activity Log
    addActivityLog,
    getActivityLog
};

