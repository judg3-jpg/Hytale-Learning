/**
 * Configuration loader
 * Loads environment variables and provides defaults
 */

require('dotenv').config();

const config = {
    // Discord bot token (required)
    token: process.env.DISCORD_TOKEN,
    
    // Your server's ID (required for slash commands)
    guildId: process.env.GUILD_ID,
    
    // Channel to send filter logs to (optional)
    logChannelId: process.env.LOG_CHANNEL_ID || null,
    
    // Bot owner's ID for admin commands (optional)
    ownerId: process.env.OWNER_ID || null,
    
    // Database path
    dbPath: './data/filters.db',
    
    // Default action for new filters
    defaultAction: 'delete',
    
    // Available actions
    actions: ['delete', 'warn', 'timeout', 'kick', 'ban'],
    
    // Timeout duration in seconds (for timeout action)
    timeoutDuration: 60,
};

// Validate required config
function validateConfig() {
    const errors = [];
    
    if (!config.token || config.token === 'PASTE_YOUR_NEW_TOKEN_HERE') {
        errors.push('DISCORD_TOKEN is required in .env file');
    }
    
    if (!config.guildId) {
        errors.push('GUILD_ID is required in .env file');
    }
    
    if (errors.length > 0) {
        console.error('\n❌ Configuration Errors:');
        errors.forEach(err => console.error(`   - ${err}`));
        console.error('\nPlease check your .env file and try again.\n');
        process.exit(1);
    }
}

module.exports = { config, validateConfig };
