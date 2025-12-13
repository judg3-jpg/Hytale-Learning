/**
 * Message Update Event
 * Fires when a message is edited - check edits for filter violations too
 */

const logger = require('../utils/logger');
const filterEngine = require('../filters/FilterEngine');
const db = require('../database/db');
const embeds = require('../utils/embeds');
const { sendToLogChannel } = require('../bot');
const { config } = require('../config');

module.exports = {
    name: 'messageUpdate',
    once: false,

    async execute(oldMessage, newMessage) {
        // Fetch partial messages if needed
        if (newMessage.partial) {
            try {
                await newMessage.fetch();
            } catch (error) {
                logger.error('Failed to fetch partial message:', error.message);
                return;
            }
        }

        // Ignore bot messages
        if (newMessage.author?.bot) return;

        // Ignore DMs
        if (!newMessage.guild) return;

        // Ignore if content hasn't changed
        if (oldMessage.content === newMessage.content) return;

        // Check if channel is whitelisted
        if (db.isChannelWhitelisted(newMessage.channel.id)) return;

        // Check if user has a whitelisted role
        const memberRoles = newMessage.member?.roles?.cache;
        if (memberRoles) {
            const whitelistRoles = db.getWhitelistRoles();
            for (const wlRole of whitelistRoles) {
                if (memberRoles.has(wlRole.role_id)) {
                    return; // User has bypass role
                }
            }
        }

        // Check edited message against filters
        const match = filterEngine.check(newMessage.content);

        if (match) {
            await handleFilterMatch(match, newMessage, true);
        }
    }
};

/**
 * Handle a filter match on an edited message
 */
async function handleFilterMatch(match, message, isEdit = false) {
    const actionTaken = match.action;
    
    logger.filter(
        `Filter triggered (edit): "${match.name}" | User: ${message.author.tag} | Action: ${actionTaken}`
    );

    try {
        // For edits, we mainly just delete - harsher actions might be too aggressive
        if (message.deletable) {
            await message.delete();
        }

        // Log to database
        db.addLog(match, message, actionTaken);

        // Send to log channel with edit note
        const logEmbed = embeds.filterLog(match, message, actionTaken)
            .setTitle('🛡️ Filter Triggered (Edited Message)');
        await sendToLogChannel(logEmbed);

    } catch (error) {
        logger.error(`Failed to handle edited message:`, error.message);
    }
}
