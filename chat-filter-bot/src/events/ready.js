/**
 * Ready Event
 * Fires when the bot successfully connects to Discord
 */

const { ActivityType } = require('discord.js');
const logger = require('../utils/logger');
const { setupLogChannel } = require('../bot');
const filterEngine = require('../filters/FilterEngine');

module.exports = {
    name: 'ready',
    once: true, // Only fire once
    
    async execute(client) {
        logger.success(`Logged in as ${client.user.tag}`);
        logger.info(`Serving ${client.guilds.cache.size} server(s)`);
        
        // Set bot status
        client.user.setActivity('for rule breakers', { type: ActivityType.Watching });
        
        // Load filters into memory
        filterEngine.loadFilters();
        
        // Set up log channel
        await setupLogChannel();
        
        logger.success('Bot is ready!');
    }
};
