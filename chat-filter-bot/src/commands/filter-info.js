/**
 * /filter info command
 * Get detailed information about a specific filter
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database/db');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter-info')
        .setDescription('Get detailed information about a filter')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('The ID of the filter')
                .setRequired(true)
                .setMinValue(1))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const filterId = interaction.options.getInteger('id');

        // Get the filter
        const filter = db.getFilterById(filterId);
        if (!filter) {
            const errorEmbed = embeds.error(
                'Filter Not Found',
                `No filter with ID **#${filterId}** exists.`
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            const detailsEmbed = embeds.filterDetails(filter);
            await interaction.reply({ embeds: [detailsEmbed] });

        } catch (error) {
            const errorEmbed = embeds.error(
                'Failed to Get Filter Info',
                `An error occurred: ${error.message}`
            );
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
