/**
 * /whitelist command
 * Manage roles and channels that bypass filters
 */

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../database/db');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Manage filter bypass whitelist')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add-role')
                .setDescription('Add a role to the whitelist')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to whitelist')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove-role')
                .setDescription('Remove a role from the whitelist')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to remove')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add-channel')
                .setDescription('Add a channel to the whitelist')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to whitelist')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove-channel')
                .setDescription('Remove a channel from the whitelist')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to remove')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all whitelisted roles and channels'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'add-role': {
                    const role = interaction.options.getRole('role');
                    db.addWhitelistRole(role.id, role.name);
                    
                    const successEmbed = embeds.success(
                        'Role Whitelisted',
                        `Members with <@&${role.id}> will now bypass all chat filters.`
                    );
                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                case 'remove-role': {
                    const role = interaction.options.getRole('role');
                    const removed = db.removeWhitelistRole(role.id);
                    
                    if (removed) {
                        const successEmbed = embeds.success(
                            'Role Removed',
                            `<@&${role.id}> has been removed from the whitelist.`
                        );
                        await interaction.reply({ embeds: [successEmbed] });
                    } else {
                        const errorEmbed = embeds.error(
                            'Not Found',
                            `<@&${role.id}> was not in the whitelist.`
                        );
                        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                    break;
                }

                case 'add-channel': {
                    const channel = interaction.options.getChannel('channel');
                    db.addWhitelistChannel(channel.id, channel.name);
                    
                    const successEmbed = embeds.success(
                        'Channel Whitelisted',
                        `<#${channel.id}> will now bypass all chat filters.`
                    );
                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                case 'remove-channel': {
                    const channel = interaction.options.getChannel('channel');
                    const removed = db.removeWhitelistChannel(channel.id);
                    
                    if (removed) {
                        const successEmbed = embeds.success(
                            'Channel Removed',
                            `<#${channel.id}> has been removed from the whitelist.`
                        );
                        await interaction.reply({ embeds: [successEmbed] });
                    } else {
                        const errorEmbed = embeds.error(
                            'Not Found',
                            `<#${channel.id}> was not in the whitelist.`
                        );
                        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    }
                    break;
                }

                case 'list': {
                    const roles = db.getWhitelistRoles();
                    const channels = db.getWhitelistChannels();

                    const listEmbed = new EmbedBuilder()
                        .setColor(0x5865F2)
                        .setTitle('📋 Whitelist')
                        .setTimestamp();

                    // Roles section
                    if (roles.length > 0) {
                        const roleList = roles.map(r => `• <@&${r.role_id}>`).join('\n');
                        listEmbed.addFields({ name: '👥 Whitelisted Roles', value: roleList });
                    } else {
                        listEmbed.addFields({ name: '👥 Whitelisted Roles', value: '*None*' });
                    }

                    // Channels section
                    if (channels.length > 0) {
                        const channelList = channels.map(c => `• <#${c.channel_id}>`).join('\n');
                        listEmbed.addFields({ name: '💬 Whitelisted Channels', value: channelList });
                    } else {
                        listEmbed.addFields({ name: '💬 Whitelisted Channels', value: '*None*' });
                    }

                    listEmbed.setFooter({ 
                        text: `${roles.length} role(s), ${channels.length} channel(s) whitelisted` 
                    });

                    await interaction.reply({ embeds: [listEmbed] });
                    break;
                }
            }
        } catch (error) {
            const errorEmbed = embeds.error(
                'Whitelist Error',
                `An error occurred: ${error.message}`
            );
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
