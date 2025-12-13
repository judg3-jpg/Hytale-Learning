/**
 * /filter preset command
 * Add a pre-built filter preset
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database/db');
const filterEngine = require('../filters/FilterEngine');
const { presets, getPresetNames, getAllPresets } = require('../filters/presets');
const embeds = require('../utils/embeds');
const { config } = require('../config');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter-preset')
        .setDescription('Add a pre-built filter or list available presets')
        .addStringOption(option => {
            const opt = option.setName('preset')
                .setDescription('The preset to add (leave empty to list all)')
                .setRequired(false);
            
            // Add choices for each preset
            const presetNames = getPresetNames();
            for (const name of presetNames) {
                opt.addChoices({ name: presets[name].name, value: name });
            }
            return opt;
        })
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Override the default action')
                .setRequired(false)
                .addChoices(
                    { name: '🗑️ Delete', value: 'delete' },
                    { name: '⚠️ Warn (DM user)', value: 'warn' },
                    { name: '⏰ Timeout', value: 'timeout' },
                    { name: '👢 Kick', value: 'kick' },
                    { name: '🔨 Ban', value: 'ban' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const presetName = interaction.options.getString('preset');
        const actionOverride = interaction.options.getString('action');

        // If no preset specified, list all available presets
        if (!presetName) {
            const allPresets = getAllPresets();
            
            const listEmbed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('📦 Available Filter Presets')
                .setDescription('Use `/filter-preset preset:<name>` to add one.')
                .setTimestamp();

            for (const preset of allPresets) {
                listEmbed.addFields({
                    name: `${preset.name}`,
                    value: `${preset.description}\n\`${preset.pattern.substring(0, 50)}${preset.pattern.length > 50 ? '...' : ''}\``,
                    inline: false
                });
            }

            return interaction.reply({ embeds: [listEmbed] });
        }

        // Get the selected preset
        const preset = presets[presetName];
        if (!preset) {
            const errorEmbed = embeds.error(
                'Preset Not Found',
                `No preset named "${presetName}" exists.`
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            // Add the preset as a new filter
            const action = actionOverride || config.defaultAction;
            const filterId = db.addFilter(preset.name, preset.pattern, action, false);

            // Reload filters
            filterEngine.loadFilters();

            const successEmbed = embeds.success(
                'Preset Added',
                `Filter **#${filterId}** has been created from the **${preset.name}** preset.`
            ).addFields(
                { name: 'Description', value: preset.description },
                { name: 'Action', value: action, inline: true },
                { name: 'Pattern', value: `\`\`\`${preset.pattern}\`\`\`` }
            );

            await interaction.reply({ embeds: [successEmbed] });

        } catch (error) {
            const errorEmbed = embeds.error(
                'Failed to Add Preset',
                `An error occurred: ${error.message}`
            );
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
