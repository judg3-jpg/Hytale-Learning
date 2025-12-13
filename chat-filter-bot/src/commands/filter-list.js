/**
 * /filter list command
 * List all configured filters
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database/db');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter-list')
        .setDescription('List all chat filters')
        .addBooleanOption(option =>
            option.setName('show_disabled')
                .setDescription('Include disabled filters in the list')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const showDisabled = interaction.options.getBoolean('show_disabled') ?? true;

        try {
            const filters = showDisabled ? db.getAllFilters() : db.getEnabledFilters();
            
            const listEmbed = embeds.filterList(filters);
            
            await interaction.reply({ embeds: [listEmbed] });

        } catch (error) {
            const errorEmbed = embeds.error(
                'Failed to List Filters',
                `An error occurred: ${error.message}`
            );
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
