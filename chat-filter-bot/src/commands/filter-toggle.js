/**
 * /filter toggle command
 * Enable or disable a filter
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database/db');
const filterEngine = require('../filters/FilterEngine');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter-toggle')
        .setDescription('Enable or disable a chat filter')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('The ID of the filter to toggle')
                .setRequired(true)
                .setMinValue(1))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const filterId = interaction.options.getInteger('id');

        // Check if filter exists
        const filter = db.getFilterById(filterId);
        if (!filter) {
            const errorEmbed = embeds.error(
                'Filter Not Found',
                `No filter with ID **#${filterId}** exists.`
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            // Toggle the filter
            db.toggleFilter(filterId);

            // Reload filters into memory
            filterEngine.loadFilters();

            // Get updated filter state
            const updatedFilter = db.getFilterById(filterId);
            const newState = updatedFilter.enabled ? '🟢 Enabled' : '🔴 Disabled';

            const successEmbed = embeds.success(
                'Filter Toggled',
                `Filter **#${filterId}** (${filter.name}) is now **${newState}**`
            );

            await interaction.reply({ embeds: [successEmbed] });

        } catch (error) {
            const errorEmbed = embeds.error(
                'Failed to Toggle Filter',
                `An error occurred: ${error.message}`
            );
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
