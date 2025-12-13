/**
 * /filter add command
 * Add a new regex filter
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database/db');
const filterEngine = require('../filters/FilterEngine');
const embeds = require('../utils/embeds');
const { config } = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter-add')
        .setDescription('Add a new chat filter')
        .addStringOption(option =>
            option.setName('pattern')
                .setDescription('The regex pattern to match')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('name')
                .setDescription('A friendly name for this filter')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Action to take when triggered')
                .setRequired(false)
                .addChoices(
                    { name: '🗑️ Delete', value: 'delete' },
                    { name: '⚠️ Warn (DM user)', value: 'warn' },
                    { name: '⏰ Timeout', value: 'timeout' },
                    { name: '👢 Kick', value: 'kick' },
                    { name: '🔨 Ban', value: 'ban' }
                ))
        .addBooleanOption(option =>
            option.setName('case_sensitive')
                .setDescription('Should the pattern be case sensitive?')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const pattern = interaction.options.getString('pattern');
        const name = interaction.options.getString('name');
        const action = interaction.options.getString('action') || config.defaultAction;
        const caseSensitive = interaction.options.getBoolean('case_sensitive') || false;

        // Validate the regex pattern
        const validation = filterEngine.constructor.validatePattern(pattern);
        if (!validation.valid) {
            const errorEmbed = embeds.error(
                'Invalid Regex Pattern',
                `The pattern you provided is not valid:\n\`\`\`${validation.error}\`\`\``
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            // Add to database
            const filterId = db.addFilter(name, pattern, action, caseSensitive);

            // Reload filters into memory
            filterEngine.loadFilters();

            const successEmbed = embeds.success(
                'Filter Added',
                `Filter **#${filterId}** has been created.`
            ).addFields(
                { name: 'Name', value: name, inline: true },
                { name: 'Action', value: action, inline: true },
                { name: 'Case Sensitive', value: caseSensitive ? 'Yes' : 'No', inline: true },
                { name: 'Pattern', value: `\`\`\`${pattern}\`\`\`` }
            );

            await interaction.reply({ embeds: [successEmbed] });

        } catch (error) {
            const errorEmbed = embeds.error(
                'Failed to Add Filter',
                `An error occurred: ${error.message}`
            );
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
