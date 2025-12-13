/**
 * Discord embed builders
 * Creates consistent, pretty embeds for bot responses
 */

const { EmbedBuilder } = require('discord.js');

// Color palette
const colors = {
    primary: 0x5865F2,    // Discord blurple
    success: 0x57F287,    // Green
    warning: 0xFEE75C,    // Yellow
    error: 0xED4245,      // Red
    info: 0x5865F2,       // Blue
    filter: 0xEB459E,     // Pink/fuchsia
};

/**
 * Success embed
 */
function success(title, description) {
    return new EmbedBuilder()
        .setColor(colors.success)
        .setTitle(`✅ ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Error embed
 */
function error(title, description) {
    return new EmbedBuilder()
        .setColor(colors.error)
        .setTitle(`❌ ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Warning embed
 */
function warning(title, description) {
    return new EmbedBuilder()
        .setColor(colors.warning)
        .setTitle(`⚠️ ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Info embed
 */
function info(title, description) {
    return new EmbedBuilder()
        .setColor(colors.info)
        .setTitle(`ℹ️ ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Filter list embed
 */
function filterList(filters) {
    const embed = new EmbedBuilder()
        .setColor(colors.primary)
        .setTitle('📋 Chat Filters')
        .setTimestamp();

    if (filters.length === 0) {
        embed.setDescription('No filters configured yet.\nUse `/filter add` to create one.');
    } else {
        const description = filters.map(f => {
            const status = f.enabled ? '🟢' : '🔴';
            const actionEmoji = getActionEmoji(f.action);
            return `${status} **#${f.id}** - ${f.name}\n` +
                   `   Pattern: \`${truncate(f.pattern, 30)}\`\n` +
                   `   Action: ${actionEmoji} ${f.action}`;
        }).join('\n\n');
        
        embed.setDescription(description);
        embed.setFooter({ text: `${filters.length} filter(s) total` });
    }

    return embed;
}

/**
 * Filter details embed
 */
function filterDetails(filter) {
    const status = filter.enabled ? '🟢 Enabled' : '🔴 Disabled';
    const actionEmoji = getActionEmoji(filter.action);
    
    return new EmbedBuilder()
        .setColor(filter.enabled ? colors.success : colors.error)
        .setTitle(`Filter #${filter.id}: ${filter.name}`)
        .addFields(
            { name: 'Status', value: status, inline: true },
            { name: 'Action', value: `${actionEmoji} ${filter.action}`, inline: true },
            { name: 'Case Sensitive', value: filter.case_sensitive ? 'Yes' : 'No', inline: true },
            { name: 'Pattern', value: `\`\`\`${filter.pattern}\`\`\`` },
            { name: 'Created', value: filter.created_at, inline: true }
        )
        .setTimestamp();
}

/**
 * Filter triggered log embed (for log channel)
 */
function filterLog(filterMatch, message, actionTaken) {
    return new EmbedBuilder()
        .setColor(colors.filter)
        .setTitle('🛡️ Filter Triggered')
        .setThumbnail(message.author.displayAvatarURL())
        .addFields(
            { name: 'User', value: `${message.author.tag} (<@${message.author.id}>)`, inline: true },
            { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
            { name: 'Action Taken', value: `${getActionEmoji(actionTaken)} ${actionTaken}`, inline: true },
            { name: 'Filter', value: `#${filterMatch.id} - ${filterMatch.name}`, inline: true },
            { name: 'Pattern', value: `\`${truncate(filterMatch.pattern, 50)}\``, inline: true },
            { name: 'Matched', value: `\`${truncate(filterMatch.matchedContent, 50)}\``, inline: true },
            { name: 'Original Message', value: truncate(message.content, 1000) || '*Empty*' }
        )
        .setFooter({ text: `User ID: ${message.author.id}` })
        .setTimestamp();
}

/**
 * Filter test results embed
 */
function filterTestResults(content, matches) {
    const embed = new EmbedBuilder()
        .setColor(matches.length > 0 ? colors.error : colors.success)
        .setTitle(matches.length > 0 ? '🚨 Message Would Be Filtered' : '✅ Message Passed All Filters')
        .addFields({ name: 'Tested Message', value: `\`\`\`${truncate(content, 500)}\`\`\`` })
        .setTimestamp();

    if (matches.length > 0) {
        const matchList = matches.map(m => 
            `• **${m.name}** (ID: ${m.id})\n  Pattern: \`${truncate(m.pattern, 40)}\`\n  Matched: \`${truncate(m.matchedText, 40)}\`\n  Action: ${getActionEmoji(m.action)} ${m.action}`
        ).join('\n\n');
        
        embed.addFields({ name: `Matched ${matches.length} Filter(s)`, value: matchList });
    } else {
        embed.setDescription('The message does not match any active filters.');
    }

    return embed;
}

/**
 * User warning DM embed
 */
function userWarning(filterName, guildName) {
    return new EmbedBuilder()
        .setColor(colors.warning)
        .setTitle('⚠️ Message Removed')
        .setDescription(`Your message in **${guildName}** was removed because it violated the chat filter.`)
        .addFields({ name: 'Filter', value: filterName })
        .setFooter({ text: 'Please follow the server rules.' })
        .setTimestamp();
}

/**
 * Statistics embed
 */
function stats(filterStats, totalFilters, totalLogs) {
    const embed = new EmbedBuilder()
        .setColor(colors.primary)
        .setTitle('📊 Filter Statistics')
        .addFields(
            { name: 'Total Filters', value: `${totalFilters}`, inline: true },
            { name: 'Total Violations', value: `${totalLogs}`, inline: true }
        )
        .setTimestamp();

    if (filterStats.length > 0) {
        const topFilters = filterStats.slice(0, 5).map((s, i) => 
            `${i + 1}. **${s.filter_name || 'Unknown'}** - ${s.hit_count} hits`
        ).join('\n');
        
        embed.addFields({ name: 'Top Triggered Filters', value: topFilters });
    }

    return embed;
}

// Helper functions
function getActionEmoji(action) {
    const emojis = {
        delete: '🗑️',
        warn: '⚠️',
        timeout: '⏰',
        kick: '👢',
        ban: '🔨'
    };
    return emojis[action] || '❓';
}

function truncate(str, length) {
    if (!str) return '';
    return str.length > length ? str.substring(0, length - 3) + '...' : str;
}

module.exports = {
    colors,
    success,
    error,
    warning,
    info,
    filterList,
    filterDetails,
    filterLog,
    filterTestResults,
    userWarning,
    stats
};
