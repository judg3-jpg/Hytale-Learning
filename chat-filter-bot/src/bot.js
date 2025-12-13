/**
 * Discord Bot Client Setup
 * Initializes the Discord client and registers events
 */

const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { config } = require('./config');
const logger = require('./utils/logger');

// Create Discord client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,              // For guild/server info
        GatewayIntentBits.GuildMessages,       // For reading messages
        GatewayIntentBits.MessageContent,      // For reading message content (privileged)
        GatewayIntentBits.GuildMembers,        // For member info (timeout, kick, ban)
        GatewayIntentBits.GuildModeration,     // For moderation actions
    ],
    partials: [
        Partials.Message,                      // For partial message objects
        Partials.Channel,                      // For DM channels
    ]
});

// Collection to store commands
client.commands = new Collection();

// Store the log channel reference
client.logChannel = null;

/**
 * Set up the log channel
 */
async function setupLogChannel() {
    if (config.logChannelId) {
        try {
            client.logChannel = await client.channels.fetch(config.logChannelId);
            logger.success(`Log channel set to #${client.logChannel.name}`);
        } catch (error) {
            logger.warn(`Could not find log channel with ID ${config.logChannelId}`);
        }
    }
}

/**
 * Send a message to the log channel
 */
async function sendToLogChannel(content) {
    if (client.logChannel) {
        try {
            if (typeof content === 'string') {
                await client.logChannel.send(content);
            } else {
                await client.logChannel.send({ embeds: [content] });
            }
        } catch (error) {
            logger.error('Failed to send to log channel:', error.message);
        }
    }
}

module.exports = {
    client,
    setupLogChannel,
    sendToLogChannel
};
