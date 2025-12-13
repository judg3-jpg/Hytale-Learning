/**
 * API Routes for Dashboard
 * RESTful endpoints for managing filters, logs, and settings
 */

const express = require('express');
const router = express.Router();
const path = require('path');

// Import database functions (we'll use the same db as the bot)
const db = require('../../src/database/db');
const FilterEngine = require('../../src/filters/FilterEngine');
const { getAllToxicPresets } = require('../../src/filters/toxic-presets');
const { getAllPresets } = require('../../src/filters/presets');

// ============================================
// FILTER ENDPOINTS
// ============================================

// Get all filters
router.get('/filters', (req, res) => {
    try {
        const filters = db.getAllFilters();
        res.json({ success: true, data: filters });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single filter
router.get('/filters/:id', (req, res) => {
    try {
        const filter = db.getFilterById(parseInt(req.params.id));
        if (!filter) {
            return res.status(404).json({ success: false, error: 'Filter not found' });
        }
        res.json({ success: true, data: filter });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create filter
router.post('/filters', (req, res) => {
    try {
        const { name, pattern, action = 'delete', caseSensitive = false } = req.body;
        
        if (!name || !pattern) {
            return res.status(400).json({ success: false, error: 'Name and pattern are required' });
        }

        // Validate regex pattern
        try {
            new RegExp(pattern);
        } catch (e) {
            return res.status(400).json({ success: false, error: `Invalid regex pattern: ${e.message}` });
        }

        const id = db.addFilter(name, pattern, action, caseSensitive);
        FilterEngine.loadFilters(); // Reload filters in bot
        
        res.json({ success: true, data: { id, name, pattern, action, caseSensitive } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update filter
router.put('/filters/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updates = req.body;

        // Validate regex pattern if provided
        if (updates.pattern) {
            try {
                new RegExp(updates.pattern);
            } catch (e) {
                return res.status(400).json({ success: false, error: `Invalid regex pattern: ${e.message}` });
            }
        }

        const success = db.updateFilter(id, updates);
        if (!success) {
            return res.status(404).json({ success: false, error: 'Filter not found' });
        }

        FilterEngine.loadFilters(); // Reload filters in bot
        res.json({ success: true, message: 'Filter updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Toggle filter
router.post('/filters/:id/toggle', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        db.toggleFilter(id);
        FilterEngine.loadFilters(); // Reload filters in bot
        
        const filter = db.getFilterById(id);
        res.json({ success: true, data: { enabled: filter?.enabled } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete filter
router.delete('/filters/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        db.deleteFilter(id);
        FilterEngine.loadFilters(); // Reload filters in bot
        
        res.json({ success: true, message: 'Filter deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Bulk delete filters
router.post('/filters/bulk-delete', (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ success: false, error: 'ids must be an array' });
        }

        let deleted = 0;
        for (const id of ids) {
            db.deleteFilter(parseInt(id));
            deleted++;
        }

        FilterEngine.loadFilters();
        res.json({ success: true, message: `Deleted ${deleted} filters` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Bulk import filters
router.post('/filters/bulk-import', (req, res) => {
    try {
        const { filters, action = 'delete' } = req.body;
        
        if (!Array.isArray(filters)) {
            return res.status(400).json({ success: false, error: 'filters must be an array' });
        }

        let added = 0;
        let failed = 0;
        const errors = [];

        for (const filter of filters) {
            try {
                const name = filter.name || filter.word || filter;
                const pattern = filter.pattern || escapeRegex(filter.word || filter);
                
                // Validate regex
                new RegExp(pattern);
                
                db.addFilter(name, pattern, filter.action || action, false);
                added++;
            } catch (e) {
                failed++;
                errors.push(`${filter.name || filter}: ${e.message}`);
            }
        }

        FilterEngine.loadFilters();
        res.json({ 
            success: true, 
            data: { added, failed, errors: errors.slice(0, 10) } 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Load toxic presets
router.post('/filters/load-toxic', (req, res) => {
    try {
        const { action = 'delete' } = req.body;
        const presets = getAllToxicPresets();
        
        let added = 0;
        let failed = 0;

        for (const preset of presets) {
            try {
                new RegExp(preset.pattern);
                db.addFilter(preset.name, preset.pattern, action, false);
                added++;
            } catch (e) {
                failed++;
            }
        }

        FilterEngine.loadFilters();
        res.json({ success: true, data: { added, failed, total: presets.length } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// LOG ENDPOINTS
// ============================================

// Get recent logs
router.get('/logs', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const logs = db.getRecentLogs(limit);
        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get logs by user
router.get('/logs/user/:userId', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const logs = db.getLogsByUser(req.params.userId, limit);
        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// STATS ENDPOINTS
// ============================================

// Get statistics
router.get('/stats', (req, res) => {
    try {
        const filters = db.getAllFilters();
        const enabledFilters = filters.filter(f => f.enabled);
        const logs = db.getRecentLogs(1000);
        const filterStats = db.getFilterStats();
        
        res.json({ 
            success: true, 
            data: {
                totalFilters: filters.length,
                enabledFilters: enabledFilters.length,
                disabledFilters: filters.length - enabledFilters.length,
                totalViolations: logs.length,
                topFilters: filterStats.slice(0, 10),
                recentViolations: logs.slice(0, 10)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// WHITELIST ENDPOINTS
// ============================================

// Get whitelist roles
router.get('/whitelist/roles', (req, res) => {
    try {
        const roles = db.getWhitelistRoles();
        res.json({ success: true, data: roles });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add whitelist role
router.post('/whitelist/roles', (req, res) => {
    try {
        const { roleId, roleName } = req.body;
        db.addWhitelistRole(roleId, roleName);
        res.json({ success: true, message: 'Role whitelisted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Remove whitelist role
router.delete('/whitelist/roles/:roleId', (req, res) => {
    try {
        db.removeWhitelistRole(req.params.roleId);
        res.json({ success: true, message: 'Role removed from whitelist' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get whitelist channels
router.get('/whitelist/channels', (req, res) => {
    try {
        const channels = db.getWhitelistChannels();
        res.json({ success: true, data: channels });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add whitelist channel
router.post('/whitelist/channels', (req, res) => {
    try {
        const { channelId, channelName } = req.body;
        db.addWhitelistChannel(channelId, channelName);
        res.json({ success: true, message: 'Channel whitelisted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Remove whitelist channel
router.delete('/whitelist/channels/:channelId', (req, res) => {
    try {
        db.removeWhitelistChannel(req.params.channelId);
        res.json({ success: true, message: 'Channel removed from whitelist' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// BOT CONTROL ENDPOINTS
// ============================================

// Reload filters in bot
router.post('/bot/reload', (req, res) => {
    try {
        FilterEngine.loadFilters();
        res.json({ 
            success: true, 
            message: 'Filters reloaded',
            data: { activeFilters: FilterEngine.count }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get presets list
router.get('/presets', (req, res) => {
    try {
        const basic = getAllPresets();
        const toxic = getAllToxicPresets();
        res.json({ 
            success: true, 
            data: { 
                basic: basic.length,
                toxic: toxic.length,
                basicPresets: basic,
                toxicPresets: toxic
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Helper: Escape string for use in regex
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = router;
