-- Chat Filter Bot Database Schema

-- Filters table: stores all regex filter rules
CREATE TABLE IF NOT EXISTS filters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                          -- Human-readable name
    pattern TEXT NOT NULL,                       -- Regex pattern
    action TEXT DEFAULT 'delete',                -- Action: delete, warn, timeout, kick, ban
    enabled INTEGER DEFAULT 1,                   -- 1 = enabled, 0 = disabled
    case_sensitive INTEGER DEFAULT 0,            -- 1 = case sensitive, 0 = case insensitive
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Settings table: key-value store for bot settings
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Logs table: stores filter violation logs
CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filter_id INTEGER,
    filter_name TEXT,
    user_id TEXT NOT NULL,
    username TEXT,
    message_content TEXT,
    channel_id TEXT,
    channel_name TEXT,
    action_taken TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (filter_id) REFERENCES filters(id) ON DELETE SET NULL
);

-- Whitelist roles table: roles that bypass filters
CREATE TABLE IF NOT EXISTS whitelist_roles (
    role_id TEXT PRIMARY KEY,
    role_name TEXT,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Whitelist channels table: channels where filters don't apply
CREATE TABLE IF NOT EXISTS whitelist_channels (
    channel_id TEXT PRIMARY KEY,
    channel_name TEXT,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_filters_enabled ON filters(enabled);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
