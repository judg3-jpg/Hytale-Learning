/**
 * /filter remove command
 * Remove an existing filter
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database/db');
const filterEngine = require('../filters/FilterEngine');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter-remove')
        .setDescription('Remove a chat filter')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('The ID of the filter to remove')
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
            // Delete from database
            db.deleteFilter(filterId);

            // Reload filters into memory
            filterEngine.loadFilters();

            const successEmbed = embeds.success(
                'Filter Removed',
                `Filter **#${filterId}** (${filter.name}) has been deleted.`
            );

            await interaction.reply({ embeds: [successEmbed] });

        } catch (error) {
            const errorEmbed = embeds.error(
                'Failed to Remove Filter',
                `An error occurred: ${error.message}`
            );
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
