/**
 * /filter stats command
 * View filter statistics
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database/db');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter-stats')
        .setDescription('View filter statistics and violations')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        try {
            const filterStats = db.getFilterStats();
            const allFilters = db.getAllFilters();
            const recentLogs = db.getRecentLogs(100);

            const statsEmbed = embeds.stats(filterStats, allFilters.length, recentLogs.length);
            
            await interaction.reply({ embeds: [statsEmbed] });

        } catch (error) {
            const errorEmbed = embeds.error(
                'Failed to Get Stats',
                `An error occurred: ${error.message}`
            );
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
