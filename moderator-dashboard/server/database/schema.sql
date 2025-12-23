-- Moderator Statistics Dashboard Database Schema

-- Moderators table
CREATE TABLE IF NOT EXISTS moderators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    discord_id TEXT UNIQUE,
    rank TEXT,
    status TEXT DEFAULT 'active',
    join_date DATETIME,
    avatar_url TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Monthly statistics table
CREATE TABLE IF NOT EXISTS moderator_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    moderator_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK(month >= 1 AND month <= 12),
    reports_handled INTEGER DEFAULT 0,
    hours_worked DECIMAL(5,2) DEFAULT 0,
    punishments_issued INTEGER DEFAULT 0,
    warnings_issued INTEGER DEFAULT 0,
    mutes_issued INTEGER DEFAULT 0,
    kicks_issued INTEGER DEFAULT 0,
    bans_issued INTEGER DEFAULT 0,
    appeals_reviewed INTEGER DEFAULT 0,
    tickets_resolved INTEGER DEFAULT 0,
    quality_score DECIMAL(3,2) CHECK(quality_score >= 0.00 AND quality_score <= 5.00),
    response_time_avg INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (moderator_id) REFERENCES moderators(id) ON DELETE CASCADE,
    UNIQUE(moderator_id, year, month)
);

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    moderator_id INTEGER NOT NULL,
    action_type TEXT NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (moderator_id) REFERENCES moderators(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_moderator_stats_moderator ON moderator_stats(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderator_stats_date ON moderator_stats(year, month);
CREATE INDEX IF NOT EXISTS idx_activity_log_moderator ON activity_log(moderator_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_moderators_status ON moderators(status);
CREATE INDEX IF NOT EXISTS idx_moderators_rank ON moderators(rank);



