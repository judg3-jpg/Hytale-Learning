/**
 * Database module
 * Handles SQLite connection and provides CRUD operations
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { config } = require('../config');

let db = null;

/**
 * Initialize the database connection and create tables
 */
function initDatabase() {
    // Ensure data directory exists
    const dataDir = path.dirname(config.dbPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Create/open database
    db = new Database(config.dbPath);
    db.pragma('journal_mode = WAL'); // Better performance
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    
    console.log('✅ Database initialized');
    return db;
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
    const result = stmt.run(name, pattern, action, caseSensitive ? 1 : 0);
    return result.lastInsertRowid;
}

/**
 * Get all filters
 */
function getAllFilters() {
    const stmt = getDb().prepare('SELECT * FROM filters ORDER BY id');
    return stmt.all();
}

/**
 * Get all enabled filters
 */
function getEnabledFilters() {
    const stmt = getDb().prepare('SELECT * FROM filters WHERE enabled = 1 ORDER BY id');
    return stmt.all();
}

/**
 * Get a filter by ID
 */
function getFilterById(id) {
    const stmt = getDb().prepare('SELECT * FROM filters WHERE id = ?');
    return stmt.get(id);
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
    
    const stmt = getDb().prepare(`
        UPDATE filters SET ${setClause.join(', ')} WHERE id = ?
    `);
    const result = stmt.run(...values);
    return result.changes > 0;
}

/**
 * Toggle a filter's enabled status
 */
function toggleFilter(id) {
    const stmt = getDb().prepare(`
        UPDATE filters 
        SET enabled = NOT enabled, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    `);
    const result = stmt.run(id);
    return result.changes > 0;
}

/**
 * Delete a filter
 */
function deleteFilter(id) {
    const stmt = getDb().prepare('DELETE FROM filters WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
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
    stmt.run(
        filterMatch.id,
        filterMatch.name,
        message.author.id,
        message.author.tag,
        message.content,
        message.channel.id,
        message.channel.name,
        actionTaken
    );
}

/**
 * Get recent logs
 */
function getRecentLogs(limit = 50) {
    const stmt = getDb().prepare(`
        SELECT * FROM logs ORDER BY timestamp DESC LIMIT ?
    `);
    return stmt.all(limit);
}

/**
 * Get logs by user
 */
function getLogsByUser(userId, limit = 50) {
    const stmt = getDb().prepare(`
        SELECT * FROM logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?
    `);
    return stmt.all(userId, limit);
}

/**
 * Get filter statistics
 */
function getFilterStats() {
    const stmt = getDb().prepare(`
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
    return stmt.all();
}

// ============================================
// WHITELIST OPERATIONS
// ============================================

/**
 * Add a role to whitelist
 */
function addWhitelistRole(roleId, roleName) {
    const stmt = getDb().prepare(`
        INSERT OR REPLACE INTO whitelist_roles (role_id, role_name) VALUES (?, ?)
    `);
    stmt.run(roleId, roleName);
}

/**
 * Remove a role from whitelist
 */
function removeWhitelistRole(roleId) {
    const stmt = getDb().prepare('DELETE FROM whitelist_roles WHERE role_id = ?');
    return stmt.run(roleId).changes > 0;
}

/**
 * Get all whitelisted roles
 */
function getWhitelistRoles() {
    const stmt = getDb().prepare('SELECT * FROM whitelist_roles');
    return stmt.all();
}

/**
 * Check if a role is whitelisted
 */
function isRoleWhitelisted(roleId) {
    const stmt = getDb().prepare('SELECT 1 FROM whitelist_roles WHERE role_id = ?');
    return stmt.get(roleId) !== undefined;
}

/**
 * Add a channel to whitelist
 */
function addWhitelistChannel(channelId, channelName) {
    const stmt = getDb().prepare(`
        INSERT OR REPLACE INTO whitelist_channels (channel_id, channel_name) VALUES (?, ?)
    `);
    stmt.run(channelId, channelName);
}

/**
 * Remove a channel from whitelist
 */
function removeWhitelistChannel(channelId) {
    const stmt = getDb().prepare('DELETE FROM whitelist_channels WHERE channel_id = ?');
    return stmt.run(channelId).changes > 0;
}

/**
 * Get all whitelisted channels
 */
function getWhitelistChannels() {
    const stmt = getDb().prepare('SELECT * FROM whitelist_channels');
    return stmt.all();
}

/**
 * Check if a channel is whitelisted
 */
function isChannelWhitelisted(channelId) {
    const stmt = getDb().prepare('SELECT 1 FROM whitelist_channels WHERE channel_id = ?');
    return stmt.get(channelId) !== undefined;
}

// ============================================
// SETTINGS OPERATIONS
// ============================================

/**
 * Get a setting
 */
function getSetting(key) {
    const stmt = getDb().prepare('SELECT value FROM settings WHERE key = ?');
    const row = stmt.get(key);
    return row ? row.value : null;
}

/**
 * Set a setting
 */
function setSetting(key, value) {
    const stmt = getDb().prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(key, value);
}

/**
 * Close the database connection
 */
function closeDatabase() {
    if (db) {
        db.close();
        db = null;
    }
}

module.exports = {
    initDatabase,
    getDb,
    closeDatabase,
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
