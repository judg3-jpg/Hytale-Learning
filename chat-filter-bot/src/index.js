/**
 * Chat Filter Bot - Entry Point
 * A Discord bot with regex-based chat filtering
 */

const { config, validateConfig } = require('./config');
const { client } = require('./bot');
const db = require('./database/db');
const { loadCommands, registerCommands } = require('./commands');
const logger = require('./utils/logger');
const { startDashboard } = require('../dashboard/server');
const fs = require('fs');
const path = require('path');

// ASCII art banner
const banner = `
╔═══════════════════════════════════════════╗
║                                           ║
║        🛡️  CHAT FILTER BOT  🛡️            ║
║                                           ║
║   Discord Regex Chat Filter               ║
║   Version 1.0.0                           ║
║                                           ║
╚═══════════════════════════════════════════╝
`;

async function main() {
    console.log(banner);

    // Validate configuration
    logger.info('Validating configuration...');
    validateConfig();
    logger.success('Configuration valid');

    // Initialize database (async for sql.js)
    logger.info('Initializing database...');
    await db.initDatabase();

    // Load event handlers
    logger.info('Loading event handlers...');
    loadEvents();

    // Load commands
    logger.info('Loading commands...');
    loadCommands(client);

    // Login to Discord
    logger.info('Connecting to Discord...');
    
    try {
        await client.login(config.token);
        
        // Register slash commands after login
        await registerCommands(client);
        
        // Start dashboard
        await startDashboard();
        
    } catch (error) {
        logger.error('Failed to connect to Discord:', error.message);
        
        if (error.code === 'TokenInvalid') {
            logger.error('Your bot token is invalid. Please check your .env file.');
        }
        
        process.exit(1);
    }
}

/**
 * Load all event handlers from the events directory
 */
function loadEvents() {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }

        logger.info(`Loaded event: ${event.name}`);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    logger.info('Shutting down...');
    db.closeDatabase();
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Shutting down...');
    db.closeDatabase();
    client.destroy();
    process.exit(0);
});

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
    logger.error('Unhandled promise rejection:', error);
});

// Start the bot
main();
