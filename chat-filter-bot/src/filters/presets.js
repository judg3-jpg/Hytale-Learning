/**
 * Pre-built filter presets
 * Common patterns that can be quickly added
 */

const presets = {
    // Discord invite links
    discordInvites: {
        name: 'Discord Invites',
        pattern: '(discord\\.gg|discord\\.com\\/invite|discordapp\\.com\\/invite)\\/[a-zA-Z0-9]+',
        description: 'Blocks Discord server invite links'
    },

    // General URLs/links
    links: {
        name: 'All Links',
        pattern: 'https?:\\/\\/[^\\s]+',
        description: 'Blocks all HTTP/HTTPS links'
    },

    // Mass mentions (@everyone, @here, or many user mentions)
    massMentions: {
        name: 'Mass Mentions',
        pattern: '(@everyone|@here|(<@!?\\d+>.*){5,})',
        description: 'Blocks @everyone, @here, and messages with 5+ user mentions'
    },

    // Excessive caps (more than 70% caps in messages with 10+ characters)
    excessiveCaps: {
        name: 'Excessive Caps',
        pattern: '^[^a-z]*[A-Z][^a-z]*[A-Z][^a-z]*[A-Z][^a-z]*[A-Z][^a-z]*[A-Z][^a-z]*[A-Z][^a-z]*[A-Z][^a-z]*[A-Z][^a-z]*$',
        description: 'Blocks messages that are mostly uppercase'
    },

    // Repeated characters (e.g., "hellooooooo" or "!!!!!!")
    repeatedChars: {
        name: 'Repeated Characters',
        pattern: '(.)\\1{7,}',
        description: 'Blocks messages with 8+ repeated characters in a row'
    },

    // Zalgo text (text with excessive combining characters)
    zalgo: {
        name: 'Zalgo Text',
        pattern: '[\\u0300-\\u036f\\u0489]{3,}',
        description: 'Blocks zalgo/glitch text with excessive diacritics'
    },

    // Scam patterns (common crypto/nitro scam keywords)
    scamLinks: {
        name: 'Scam Patterns',
        pattern: '(free\\s*nitro|steam\\s*gift|claim\\s*your|airdrop|cryptocurrency\\s*giveaway)',
        description: 'Blocks common scam/phishing phrases'
    },

    // IP addresses (prevent IP grabbing/doxxing)
    ipAddresses: {
        name: 'IP Addresses',
        pattern: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b',
        description: 'Blocks IP addresses'
    },

    // Phone numbers (basic US format)
    phoneNumbers: {
        name: 'Phone Numbers',
        pattern: '(\\+?1?[-.\\s]?)?(\\(?\\d{3}\\)?[-.\\s]?)?\\d{3}[-.\\s]?\\d{4}',
        description: 'Blocks phone number patterns'
    },

    // Slurs placeholder - you would customize this
    slurs: {
        name: 'Slurs Filter',
        pattern: '\\b(placeholder)\\b',
        description: 'Blocks offensive slurs (customize pattern as needed)'
    }
};

/**
 * Get a preset by name
 */
function getPreset(name) {
    return presets[name] || null;
}

/**
 * Get all preset names
 */
function getPresetNames() {
    return Object.keys(presets);
}

/**
 * Get all presets with descriptions
 */
function getAllPresets() {
    return Object.entries(presets).map(([key, preset]) => ({
        key,
        ...preset
    }));
}

module.exports = {
    presets,
    getPreset,
    getPresetNames,
    getAllPresets
};
