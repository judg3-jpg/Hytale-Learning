/**
 * /filter reload command
 * Reload filters from database into memory
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const filterEngine = require('../filters/FilterEngine');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter-reload')
        .setDescription('Reload all filters from the database')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            // Reload filters
            filterEngine.loadFilters();

            const successEmbed = embeds.success(
                'Filters Reloaded',
                `Successfully loaded **${filterEngine.count}** active filter(s) into memory.`
            );

            await interaction.reply({ embeds: [successEmbed] });

        } catch (error) {
            const errorEmbed = embeds.error(
                'Failed to Reload Filters',
                `An error occurred: ${error.message}`
            );
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
