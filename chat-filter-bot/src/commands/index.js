/**
 * Command Loader
 * Loads all commands and registers them with Discord
 */

const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const { config } = require('../config');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

/**
 * Load all command files into the client
 */
function loadCommands(client) {
    const commandsPath = __dirname;
    const commandFiles = fs.readdirSync(commandsPath).filter(file => 
        file.endsWith('.js') && file !== 'index.js'
    );

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            logger.info(`Loaded command: /${command.data.name}`);
        } else {
            logger.warn(`Command ${file} is missing required "data" or "execute" property`);
        }
    }
}

/**
 * Register slash commands with Discord API
 */
async function registerCommands(client) {
    const commands = [];
    
    client.commands.forEach(command => {
        commands.push(command.data.toJSON());
    });

    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
        logger.info(`Registering ${commands.length} slash command(s)...`);

        // Register commands to the specific guild (faster for development)
        if (config.guildId) {
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, config.guildId),
                { body: commands }
            );
            logger.success(`Registered ${commands.length} commands to guild ${config.guildId}`);
        } else {
            // Global registration (takes up to 1 hour to propagate)
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands }
            );
            logger.success(`Registered ${commands.length} global commands`);
        }
    } catch (error) {
        logger.error('Failed to register commands:', error.message);
        if (error.rawError) {
            console.error('Details:', JSON.stringify(error.rawError, null, 2));
        }
    }
}

module.exports = { loadCommands, registerCommands };
