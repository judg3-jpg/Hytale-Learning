package com.megawalls.commands;

import com.megawalls.MegaWalls;
import com.megawalls.game.GameManager;
import com.megawalls.game.Team;
import com.megawalls.utils.MessageUtils;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MWAdminCommand implements CommandExecutor, TabCompleter {

    private final MegaWalls plugin;
    private final GameManager gameManager;

    public MWAdminCommand(MegaWalls plugin) {
        this.plugin = plugin;
        this.gameManager = plugin.getGameManager();
        plugin.getCommand("mwadmin").setTabCompleter(this);
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("This command can only be used by players!");
            return true;
        }

        Player player = (Player) sender;

        if (!player.hasPermission("megawalls.admin")) {
            MessageUtils.sendMessage(player, "&cYou don't have permission to use admin commands!");
            return true;
        }

        if (args.length == 0) {
            sendAdminHelp(player);
            return true;
        }

        String subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case "setlobby":
                gameManager.setLobbyLocation(player.getLocation());
                MessageUtils.sendMessage(player, "&aLobby location set!");
                break;
                
            case "setspawn":
                if (args.length < 2) {
                    MessageUtils.sendMessage(player, "&cUsage: /mwadmin setspawn <team>");
                    MessageUtils.sendMessage(player, "&7Teams: red, blue, green, yellow");
                    return true;
                }
                setTeamSpawn(player, args[1]);
                break;
                
            case "setdragon":
                if (args.length < 2) {
                    MessageUtils.sendMessage(player, "&cUsage: /mwadmin setdragon <team>");
                    MessageUtils.sendMessage(player, "&7Teams: red, blue, green, yellow");
                    return true;
                }
                setDragonSpawn(player, args[1]);
                break;
                
            case "reload":
                plugin.reloadConfig();
                MessageUtils.sendMessage(player, "&aConfig reloaded!");
                break;
                
            case "setup":
                sendSetupGuide(player);
                break;
                
            case "quicksetup":
                quickSetup(player);
                break;
                
            default:
                sendAdminHelp(player);
                break;
        }

        return true;
    }

    private void sendAdminHelp(Player player) {
        MessageUtils.sendRawMessage(player, "&c&l▬▬▬▬▬▬▬▬ ADMIN COMMANDS ▬▬▬▬▬▬▬▬");
        MessageUtils.sendRawMessage(player, "");
        MessageUtils.sendRawMessage(player, "&c/mwadmin setlobby &7- Set lobby spawn");
        MessageUtils.sendRawMessage(player, "&c/mwadmin setspawn <team> &7- Set team spawn");
        MessageUtils.sendRawMessage(player, "&c/mwadmin setdragon <team> &7- Set dragon spawn");
        MessageUtils.sendRawMessage(player, "&c/mwadmin reload &7- Reload config");
        MessageUtils.sendRawMessage(player, "&c/mwadmin setup &7- Setup guide");
        MessageUtils.sendRawMessage(player, "&c/mwadmin quicksetup &7- Quick setup at current location");
        MessageUtils.sendRawMessage(player, "");
    }

    private void setTeamSpawn(Player player, String teamName) {
        Team team = gameManager.getTeamByName(teamName);
        if (team == null) {
            MessageUtils.sendMessage(player, "&cUnknown team! Available: red, blue, green, yellow");
            return;
        }
        
        team.setSpawnLocation(player.getLocation());
        MessageUtils.sendMessage(player, "&aSpawn location set for " + team.getColoredName() + "&a!");
    }

    private void setDragonSpawn(Player player, String teamName) {
        Team team = gameManager.getTeamByName(teamName);
        if (team == null) {
            MessageUtils.sendMessage(player, "&cUnknown team! Available: red, blue, green, yellow");
            return;
        }
        
        team.setDragonLocation(player.getLocation());
        MessageUtils.sendMessage(player, "&aDragon spawn location set for " + team.getColoredName() + "&a!");
    }

    private void sendSetupGuide(Player player) {
        MessageUtils.sendRawMessage(player, "&6&l▬▬▬▬▬▬▬▬ SETUP GUIDE ▬▬▬▬▬▬▬▬");
        MessageUtils.sendRawMessage(player, "");
        MessageUtils.sendRawMessage(player, "&e1. &7Set lobby: &f/mwadmin setlobby");
        MessageUtils.sendRawMessage(player, "&e2. &7Set team spawns:");
        MessageUtils.sendRawMessage(player, "   &f/mwadmin setspawn red");
        MessageUtils.sendRawMessage(player, "   &f/mwadmin setspawn blue");
        MessageUtils.sendRawMessage(player, "   &f/mwadmin setspawn green");
        MessageUtils.sendRawMessage(player, "   &f/mwadmin setspawn yellow");
        MessageUtils.sendRawMessage(player, "&e3. &7Set dragon spawns (optional):");
        MessageUtils.sendRawMessage(player, "   &f/mwadmin setdragon red");
        MessageUtils.sendRawMessage(player, "   &f(etc... defaults to 10 blocks above spawn)");
        MessageUtils.sendRawMessage(player, "&e4. &7Edit config.yml for timings");
        MessageUtils.sendRawMessage(player, "&e5. &7Start game: &f/mw start");
        MessageUtils.sendRawMessage(player, "");
        MessageUtils.sendRawMessage(player, "&aTip: Use &f/mwadmin quicksetup &afor testing!");
    }

    private void quickSetup(Player player) {
        // Quick setup for testing - places all spawns around player
        gameManager.setLobbyLocation(player.getLocation());
        
        List<Team> teams = gameManager.getTeams();
        double radius = 50; // 50 blocks apart
        
        for (int i = 0; i < teams.size(); i++) {
            double angle = (2 * Math.PI * i) / teams.size();
            double x = player.getLocation().getX() + radius * Math.cos(angle);
            double z = player.getLocation().getZ() + radius * Math.sin(angle);
            
            org.bukkit.Location spawnLoc = new org.bukkit.Location(
                player.getWorld(),
                x,
                player.getLocation().getY(),
                z,
                (float) Math.toDegrees(angle + Math.PI), // Face center
                0
            );
            
            teams.get(i).setSpawnLocation(spawnLoc);
        }
        
        MessageUtils.sendMessage(player, "&a&lQuick setup complete!");
        MessageUtils.sendMessage(player, "&7Lobby set at your location");
        MessageUtils.sendMessage(player, "&7Team spawns placed " + (int)radius + " blocks apart in a circle");
        MessageUtils.sendMessage(player, "&7Use &e/mw start &7to begin!");
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        List<String> completions = new ArrayList<>();
        
        if (args.length == 1) {
            List<String> subCommands = Arrays.asList("setlobby", "setspawn", "setdragon", "reload", "setup", "quicksetup");
            for (String sub : subCommands) {
                if (sub.startsWith(args[0].toLowerCase())) {
                    completions.add(sub);
                }
            }
        } else if (args.length == 2 && (args[0].equalsIgnoreCase("setspawn") || args[0].equalsIgnoreCase("setdragon"))) {
            for (String team : Arrays.asList("red", "blue", "green", "yellow")) {
                if (team.startsWith(args[1].toLowerCase())) {
                    completions.add(team);
                }
            }
        }
        
        return completions;
    }
}
