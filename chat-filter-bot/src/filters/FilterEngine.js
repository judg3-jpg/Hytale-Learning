/**
 * Filter Engine
 * Core regex matching logic for chat filtering
 */

const db = require('../database/db');

class FilterEngine {
    constructor() {
        this.filters = [];
        this.compiledPatterns = new Map(); // Cache compiled regex patterns
    }

    /**
     * Load/reload filters from database
     */
    loadFilters() {
        this.filters = db.getEnabledFilters();
        this.compiledPatterns.clear();
        
        // Pre-compile regex patterns for better performance
        for (const filter of this.filters) {
            try {
                const flags = filter.case_sensitive ? 'g' : 'gi';
                this.compiledPatterns.set(filter.id, new RegExp(filter.pattern, flags));
            } catch (error) {
                console.error(`⚠️  Invalid regex pattern in filter "${filter.name}" (ID: ${filter.id}): ${error.message}`);
            }
        }
        
        console.log(`📋 Loaded ${this.filters.length} active filter(s)`);
    }

    /**
     * Check a message against all filters
     * @param {string} content - The message content to check
     * @returns {Object|null} - The matching filter or null
     */
    check(content) {
        if (!content || content.trim() === '') {
            return null;
        }

        for (const filter of this.filters) {
            const pattern = this.compiledPatterns.get(filter.id);
            if (!pattern) continue;

            try {
                // Reset regex lastIndex for global patterns
                pattern.lastIndex = 0;
                
                if (pattern.test(content)) {
                    return {
                        id: filter.id,
                        name: filter.name,
                        pattern: filter.pattern,
                        action: filter.action,
                        matchedContent: content.match(pattern)?.[0] || content
                    };
                }
            } catch (error) {
                console.error(`Error testing filter "${filter.name}": ${error.message}`);
            }
        }

        return null;
    }

    /**
     * Test a message against all filters (returns all matches)
     * Used for the /filter test command
     * @param {string} content - The message content to test
     * @returns {Array} - Array of all matching filters
     */
    testAll(content) {
        const matches = [];

        if (!content || content.trim() === '') {
            return matches;
        }

        for (const filter of this.filters) {
            const pattern = this.compiledPatterns.get(filter.id);
            if (!pattern) continue;

            try {
                pattern.lastIndex = 0;
                const match = content.match(pattern);
                
                if (match) {
                    matches.push({
                        id: filter.id,
                        name: filter.name,
                        pattern: filter.pattern,
                        action: filter.action,
                        matchedText: match[0],
                        allMatches: match
                    });
                }
            } catch (error) {
                console.error(`Error testing filter "${filter.name}": ${error.message}`);
            }
        }

        return matches;
    }

    /**
     * Validate a regex pattern
     * @param {string} pattern - The regex pattern to validate
     * @returns {Object} - { valid: boolean, error?: string }
     */
    static validatePattern(pattern) {
        try {
            new RegExp(pattern);
            return { valid: true };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    /**
     * Get filter count
     */
    get count() {
        return this.filters.length;
    }

    /**
     * Get all loaded filters
     */
    getFilters() {
        return this.filters;
    }
}

// Export singleton instance
module.exports = new FilterEngine();
