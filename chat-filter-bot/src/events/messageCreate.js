/**
 * Message Create Event
 * Fires when a new message is sent - main filter logic here
 */

const logger = require('../utils/logger');
const filterEngine = require('../filters/FilterEngine');
const db = require('../database/db');
const embeds = require('../utils/embeds');
const { sendToLogChannel } = require('../bot');
const { config } = require('../config');

module.exports = {
    name: 'messageCreate',
    once: false,

    async execute(message) {
        // Ignore bot messages
        if (message.author.bot) return;

        // Ignore DMs
        if (!message.guild) return;

        // Check if channel is whitelisted
        if (db.isChannelWhitelisted(message.channel.id)) return;

        // Check if user has a whitelisted role
        const memberRoles = message.member?.roles?.cache;
        if (memberRoles) {
            const whitelistRoles = db.getWhitelistRoles();
            for (const wlRole of whitelistRoles) {
                if (memberRoles.has(wlRole.role_id)) {
                    return; // User has bypass role
                }
            }
        }

        // Check message against filters
        const match = filterEngine.check(message.content);

        if (match) {
            await handleFilterMatch(match, message);
        }
    }
};

/**
 * Handle a filter match - execute the appropriate action
 */
async function handleFilterMatch(match, message) {
    const actionTaken = match.action;
    
    logger.filter(
        `Filter triggered: "${match.name}" | User: ${message.author.tag} | Action: ${actionTaken}`
    );

    try {
        // Execute the action
        switch (actionTaken) {
            case 'delete':
                await executeDelete(message);
                break;
            case 'warn':
                await executeDelete(message);
                await executeWarn(message, match);
                break;
            case 'timeout':
                await executeDelete(message);
                await executeTimeout(message, match);
                break;
            case 'kick':
                await executeDelete(message);
                await executeKick(message, match);
                break;
            case 'ban':
                await executeDelete(message);
                await executeBan(message, match);
                break;
            default:
                await executeDelete(message);
        }

        // Log to database
        db.addLog(match, message, actionTaken);

        // Send to log channel
        const logEmbed = embeds.filterLog(match, message, actionTaken);
        await sendToLogChannel(logEmbed);

    } catch (error) {
        logger.error(`Failed to execute action "${actionTaken}":`, error.message);
    }
}

/**
 * Delete the message
 */
async function executeDelete(message) {
    try {
        if (message.deletable) {
            await message.delete();
        }
    } catch (error) {
        logger.error('Failed to delete message:', error.message);
    }
}

/**
 * Warn the user via DM
 */
async function executeWarn(message, match) {
    try {
        const warnEmbed = embeds.userWarning(match.name, message.guild.name);
        await message.author.send({ embeds: [warnEmbed] });
    } catch (error) {
        // User might have DMs disabled
        logger.warn(`Could not DM user ${message.author.tag}: ${error.message}`);
    }
}

/**
 * Timeout the user
 */
async function executeTimeout(message, match) {
    try {
        const duration = config.timeoutDuration * 1000; // Convert to milliseconds
        await message.member.timeout(duration, `Filter: ${match.name}`);
        logger.info(`Timed out ${message.author.tag} for ${config.timeoutDuration}s`);
    } catch (error) {
        logger.error(`Failed to timeout ${message.author.tag}:`, error.message);
    }
}

/**
 * Kick the user
 */
async function executeKick(message, match) {
    try {
        if (message.member.kickable) {
            await message.member.kick(`Filter: ${match.name}`);
            logger.info(`Kicked ${message.author.tag}`);
        } else {
            logger.warn(`Cannot kick ${message.author.tag} - insufficient permissions`);
        }
    } catch (error) {
        logger.error(`Failed to kick ${message.author.tag}:`, error.message);
    }
}

/**
 * Ban the user
 */
async function executeBan(message, match) {
    try {
        if (message.member.bannable) {
            await message.member.ban({ reason: `Filter: ${match.name}` });
            logger.info(`Banned ${message.author.tag}`);
        } else {
            logger.warn(`Cannot ban ${message.author.tag} - insufficient permissions`);
        }
    } catch (error) {
        logger.error(`Failed to ban ${message.author.tag}:`, error.message);
    }
}
