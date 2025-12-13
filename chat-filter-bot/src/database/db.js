/**
 * Database module
 * Handles SQLite connection using sql.js (pure JavaScript, no build tools needed)
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const { config } = require('../config');

let db = null;
let SQL = null;

/**
 * Initialize the database connection and create tables
 */
async function initDatabase() {
    // Ensure data directory exists
    const dataDir = path.dirname(config.dbPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Initialize SQL.js
    SQL = await initSqlJs();
    
    // Load existing database or create new one
    if (fs.existsSync(config.dbPath)) {
        const fileBuffer = fs.readFileSync(config.dbPath);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.run(schema);
    
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
        fs.writeFileSync(config.dbPath, buffer);
    }
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
// FILTER OPERATIONS
// ============================================

/**
 * Add a new filter
 */
function addFilter(name, pattern, action = 'delete', caseSensitive = false) {
    const stmt = getDb().prepare(`
        INSERT INTO filters (name, pattern, action, case_sensitive)
        VALUES (?, ?, ?, ?)
    `);
    stmt.run([name, pattern, action, caseSensitive ? 1 : 0]);
    stmt.free();
    
    // Get the last inserted ID
    const result = getDb().exec('SELECT last_insert_rowid() as id');
    const lastId = result[0]?.values[0]?.[0] || 0;
    
    saveDatabase();
    return lastId;
}

/**
 * Get all filters
 */
function getAllFilters() {
    const results = getDb().exec('SELECT * FROM filters ORDER BY id');
    return rowsToObjects(results, ['id', 'name', 'pattern', 'action', 'enabled', 'case_sensitive', 'created_at', 'updated_at']);
}

/**
 * Get all enabled filters
 */
function getEnabledFilters() {
    const results = getDb().exec('SELECT * FROM filters WHERE enabled = 1 ORDER BY id');
    return rowsToObjects(results, ['id', 'name', 'pattern', 'action', 'enabled', 'case_sensitive', 'created_at', 'updated_at']);
}

/**
 * Get a filter by ID
 */
function getFilterById(id) {
    const stmt = getDb().prepare('SELECT * FROM filters WHERE id = ?');
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
 * Update a filter
 */
function updateFilter(id, updates) {
    const allowedFields = ['name', 'pattern', 'action', 'enabled', 'case_sensitive'];
    const setClause = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
            setClause.push(`${key} = ?`);
            values.push(key === 'enabled' || key === 'case_sensitive' ? (value ? 1 : 0) : value);
        }
    }
    
    if (setClause.length === 0) return false;
    
    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const sql = `UPDATE filters SET ${setClause.join(', ')} WHERE id = ?`;
    getDb().run(sql, values);
    saveDatabase();
    return true;
}

/**
 * Toggle a filter's enabled status
 */
function toggleFilter(id) {
    getDb().run(`
        UPDATE filters 
        SET enabled = CASE WHEN enabled = 1 THEN 0 ELSE 1 END, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    `, [id]);
    saveDatabase();
    return true;
}

/**
 * Delete a filter
 */
function deleteFilter(id) {
    getDb().run('DELETE FROM filters WHERE id = ?', [id]);
    saveDatabase();
    return true;
}

// ============================================
// LOG OPERATIONS
// ============================================

/**
 * Add a log entry
 */
function addLog(filterMatch, message, actionTaken) {
    const stmt = getDb().prepare(`
        INSERT INTO logs (filter_id, filter_name, user_id, username, message_content, channel_id, channel_name, action_taken)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run([
        filterMatch.id,
        filterMatch.name,
        message.author.id,
        message.author.tag,
        message.content,
        message.channel.id,
        message.channel.name,
        actionTaken
    ]);
    stmt.free();
    saveDatabase();
}

/**
 * Get recent logs
 */
function getRecentLogs(limit = 50) {
    const results = getDb().exec(`SELECT * FROM logs ORDER BY timestamp DESC LIMIT ${limit}`);
    return rowsToObjects(results, ['id', 'filter_id', 'filter_name', 'user_id', 'username', 'message_content', 'channel_id', 'channel_name', 'action_taken', 'timestamp']);
}

/**
 * Get logs by user
 */
function getLogsByUser(userId, limit = 50) {
    const stmt = getDb().prepare(`SELECT * FROM logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?`);
    stmt.bind([userId, limit]);
    
    const rows = [];
    while (stmt.step()) {
        rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
}

/**
 * Get filter statistics
 */
function getFilterStats() {
    const results = getDb().exec(`
        SELECT 
            filter_id,
            filter_name,
            COUNT(*) as hit_count,
            MAX(timestamp) as last_triggered
        FROM logs 
        WHERE filter_id IS NOT NULL
        GROUP BY filter_id 
        ORDER BY hit_count DESC
    `);
    return rowsToObjects(results, ['filter_id', 'filter_name', 'hit_count', 'last_triggered']);
}

// ============================================
// WHITELIST OPERATIONS
// ============================================

/**
 * Add a role to whitelist
 */
function addWhitelistRole(roleId, roleName) {
    getDb().run(`INSERT OR REPLACE INTO whitelist_roles (role_id, role_name) VALUES (?, ?)`, [roleId, roleName]);
    saveDatabase();
}

/**
 * Remove a role from whitelist
 */
function removeWhitelistRole(roleId) {
    getDb().run('DELETE FROM whitelist_roles WHERE role_id = ?', [roleId]);
    saveDatabase();
    return true;
}

/**
 * Get all whitelisted roles
 */
function getWhitelistRoles() {
    const results = getDb().exec('SELECT * FROM whitelist_roles');
    return rowsToObjects(results, ['role_id', 'role_name', 'added_at']);
}

/**
 * Check if a role is whitelisted
 */
function isRoleWhitelisted(roleId) {
    const stmt = getDb().prepare('SELECT 1 FROM whitelist_roles WHERE role_id = ?');
    stmt.bind([roleId]);
    const exists = stmt.step();
    stmt.free();
    return exists;
}

/**
 * Add a channel to whitelist
 */
function addWhitelistChannel(channelId, channelName) {
    getDb().run(`INSERT OR REPLACE INTO whitelist_channels (channel_id, channel_name) VALUES (?, ?)`, [channelId, channelName]);
    saveDatabase();
}

/**
 * Remove a channel from whitelist
 */
function removeWhitelistChannel(channelId) {
    getDb().run('DELETE FROM whitelist_channels WHERE channel_id = ?', [channelId]);
    saveDatabase();
    return true;
}

/**
 * Get all whitelisted channels
 */
function getWhitelistChannels() {
    const results = getDb().exec('SELECT * FROM whitelist_channels');
    return rowsToObjects(results, ['channel_id', 'channel_name', 'added_at']);
}

/**
 * Check if a channel is whitelisted
 */
function isChannelWhitelisted(channelId) {
    const stmt = getDb().prepare('SELECT 1 FROM whitelist_channels WHERE channel_id = ?');
    stmt.bind([channelId]);
    const exists = stmt.step();
    stmt.free();
    return exists;
}

// ============================================
// SETTINGS OPERATIONS
// ============================================

/**
 * Get a setting
 */
function getSetting(key) {
    const stmt = getDb().prepare('SELECT value FROM settings WHERE key = ?');
    stmt.bind([key]);
    
    if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row.value;
    }
    stmt.free();
    return null;
}

/**
 * Set a setting
 */
function setSetting(key, value) {
    getDb().run(`INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)`, [key, value]);
    saveDatabase();
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
    closeDatabase,
    saveDatabase,
    // Filters
    addFilter,
    getAllFilters,
    getEnabledFilters,
    getFilterById,
    updateFilter,
    toggleFilter,
    deleteFilter,
    // Logs
    addLog,
    getRecentLogs,
    getLogsByUser,
    getFilterStats,
    // Whitelist
    addWhitelistRole,
    removeWhitelistRole,
    getWhitelistRoles,
    isRoleWhitelisted,
    addWhitelistChannel,
    removeWhitelistChannel,
    getWhitelistChannels,
    isChannelWhitelisted,
    // Settings
    getSetting,
    setSetting,
};
