/**
 * Interaction Create Event
 * Handles slash command interactions
 */

const logger = require('../utils/logger');
const embeds = require('../utils/embeds');

module.exports = {
    name: 'interactionCreate',
    once: false,

    async execute(interaction) {
        // Only handle slash commands
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            logger.warn(`Unknown command: ${interaction.commandName}`);
            return;
        }

        // Log command usage
        logger.command(`/${interaction.commandName} by ${interaction.user.tag}`);

        try {
            await command.execute(interaction);
        } catch (error) {
            logger.error(`Error executing /${interaction.commandName}:`, error);

            const errorEmbed = embeds.error(
                'Command Error',
                'There was an error executing this command.'
            );

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};
