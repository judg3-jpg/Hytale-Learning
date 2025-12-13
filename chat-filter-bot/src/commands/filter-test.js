/**
 * /filter test command
 * Test a message against all active filters
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const filterEngine = require('../filters/FilterEngine');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter-test')
        .setDescription('Test a message against all active filters')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to test')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const testMessage = interaction.options.getString('message');

        try {
            // Test against all filters
            const matches = filterEngine.testAll(testMessage);
            
            const resultEmbed = embeds.filterTestResults(testMessage, matches);
            
            // Reply ephemeral so the test message isn't visible to everyone
            await interaction.reply({ embeds: [resultEmbed], ephemeral: true });

        } catch (error) {
            const errorEmbed = embeds.error(
                'Test Failed',
                `An error occurred: ${error.message}`
            );
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
