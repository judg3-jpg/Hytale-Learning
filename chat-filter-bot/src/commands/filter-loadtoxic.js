/**
 * /filter-loadtoxic command
 * Load all toxic/harmful content filters at once
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database/db');
const filterEngine = require('../filters/FilterEngine');
const { getAllToxicPresets } = require('../filters/toxic-presets');
const embeds = require('../utils/embeds');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter-loadtoxic')
        .setDescription('Load all toxic/harmful content filters (slurs, self-harm, hate speech)')
        .addBooleanOption(option =>
            option.setName('confirm')
                .setDescription('Confirm loading all filters (set to true)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Action to take when triggered')
                .setRequired(false)
                .addChoices(
                    { name: 'Delete', value: 'delete' },
                    { name: 'Warn (DM user)', value: 'warn' },
                    { name: 'Timeout', value: 'timeout' },
                    { name: 'Kick', value: 'kick' },
                    { name: 'Ban', value: 'ban' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const confirm = interaction.options.getBoolean('confirm');
        const action = interaction.options.getString('action') || 'delete';

        if (!confirm) {
            const infoEmbed = new EmbedBuilder()
                .setColor(0xFEE75C)
                .setTitle('⚠️ Confirmation Required')
                .setDescription(
                    'This command will add **50+ filters** for toxic content including:\n\n' +
                    '• Self-harm / suicide references\n' +
                    '• Racial slurs (n-word, etc.)\n' +
                    '• Homophobic slurs\n' +
                    '• Ableist slurs\n' +
                    '• Nazi / hate symbols\n' +
                    '• Death wishes\n' +
                    '• Other harmful content\n\n' +
                    'Run the command again with `confirm: True` to proceed.'
                )
                .setTimestamp();
            
            return interaction.reply({ embeds: [infoEmbed], ephemeral: true });
        }

        await interaction.deferReply();

        try {
            const presets = getAllToxicPresets();
            let added = 0;
            let failed = 0;
            const errors = [];

            for (const preset of presets) {
                try {
                    // Validate the pattern first
                    const validation = filterEngine.constructor.validatePattern(preset.pattern);
                    if (!validation.valid) {
                        failed++;
                        errors.push(`${preset.name}: Invalid regex`);
                        continue;
                    }

                    // Add to database
                    db.addFilter(preset.name, preset.pattern, action, false);
                    added++;
                } catch (error) {
                    failed++;
                    errors.push(`${preset.name}: ${error.message}`);
                }
            }

            // Reload filters into memory
            filterEngine.loadFilters();

            const resultEmbed = new EmbedBuilder()
                .setColor(failed === 0 ? 0x57F287 : 0xFEE75C)
                .setTitle('🛡️ Toxic Content Filters Loaded')
                .setDescription(
                    `Successfully loaded **${added}** filter(s).\n` +
                    (failed > 0 ? `Failed to load **${failed}** filter(s).` : '')
                )
                .addFields(
                    { name: 'Action', value: `All filters set to: **${action}**`, inline: true },
                    { name: 'Total Active', value: `${filterEngine.count} filters`, inline: true }
                )
                .setTimestamp();

            if (errors.length > 0 && errors.length <= 10) {
                resultEmbed.addFields({
                    name: 'Errors',
                    value: errors.slice(0, 10).join('\n')
                });
            }

            await interaction.editReply({ embeds: [resultEmbed] });

        } catch (error) {
            const errorEmbed = embeds.error(
                'Failed to Load Filters',
                `An error occurred: ${error.message}`
            );
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
