package com.megawalls.commands;

import com.megawalls.MegaWalls;
import com.megawalls.classes.ClassType;
import com.megawalls.game.GameManager;
import com.megawalls.game.GamePhase;
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

public class MegaWallsCommand implements CommandExecutor, TabCompleter {

    private final MegaWalls plugin;
    private final GameManager gameManager;

    public MegaWallsCommand(MegaWalls plugin) {
        this.plugin = plugin;
        this.gameManager = plugin.getGameManager();
        plugin.getCommand("megawalls").setTabCompleter(this);
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("This command can only be used by players!");
            return true;
        }

        Player player = (Player) sender;

        if (args.length == 0) {
            sendHelp(player);
            return true;
        }

        String subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case "join":
                gameManager.joinGame(player);
                break;
                
            case "leave":
                gameManager.leaveGame(player);
                break;
                
            case "start":
                if (!player.hasPermission("megawalls.admin")) {
                    MessageUtils.sendMessage(player, "&cYou don't have permission to start the game!");
                    return true;
                }
                gameManager.startGame();
                break;
                
            case "stop":
                if (!player.hasPermission("megawalls.admin")) {
                    MessageUtils.sendMessage(player, "&cYou don't have permission to stop the game!");
                    return true;
                }
                gameManager.resetGame();
                MessageUtils.sendMessage(player, "&cGame stopped and reset!");
                break;
                
            case "class":
                if (args.length < 2) {
                    sendClassList(player);
                    return true;
                }
                String className = args[1];
                ClassType classType = ClassType.fromString(className);
                if (classType == null) {
                    MessageUtils.sendMessage(player, "&cUnknown class! Available: hero, marksman, warrior");
                    return true;
                }
                gameManager.selectClass(player, classType);
                break;
                
            case "classes":
                sendClassList(player);
                break;
                
            case "stats":
                sendStats(player);
                break;
                
            case "team":
                sendTeamInfo(player);
                break;
                
            case "help":
            default:
                sendHelp(player);
                break;
        }

        return true;
    }

    private void sendHelp(Player player) {
        MessageUtils.sendRawMessage(player, "&6&l▬▬▬▬▬▬▬▬ MEGA WALLS HELP ▬▬▬▬▬▬▬▬");
        MessageUtils.sendRawMessage(player, "");
        MessageUtils.sendRawMessage(player, "&e/mw join &7- Join the game");
        MessageUtils.sendRawMessage(player, "&e/mw leave &7- Leave the game");
        MessageUtils.sendRawMessage(player, "&e/mw class <name> &7- Select your class");
        MessageUtils.sendRawMessage(player, "&e/mw classes &7- View all classes");
        MessageUtils.sendRawMessage(player, "&e/mw team &7- View your team info");
        MessageUtils.sendRawMessage(player, "&e/mw stats &7- View game stats");
        
        if (player.hasPermission("megawalls.admin")) {
            MessageUtils.sendRawMessage(player, "");
            MessageUtils.sendRawMessage(player, "&c&lAdmin Commands:");
            MessageUtils.sendRawMessage(player, "&c/mw start &7- Start the game");
            MessageUtils.sendRawMessage(player, "&c/mw stop &7- Stop and reset the game");
            MessageUtils.sendRawMessage(player, "&c/mwadmin &7- Admin setup commands");
        }
        MessageUtils.sendRawMessage(player, "");
    }

    private void sendClassList(Player player) {
        MessageUtils.sendRawMessage(player, "&6&l▬▬▬▬▬▬▬▬ CLASSES ▬▬▬▬▬▬▬▬");
        MessageUtils.sendRawMessage(player, "");
        
        MessageUtils.sendRawMessage(player, "&6&l⚔ HERO &7(Support/Fighter)");
        MessageUtils.sendRawMessage(player, "  &7Health: &c22 HP");
        MessageUtils.sendRawMessage(player, "  &eQ: Valor Strike &7- Dash + stun");
        MessageUtils.sendRawMessage(player, "  &eE: Rally Cry &7- Heal allies");
        MessageUtils.sendRawMessage(player, "  &8Passive: Heroic Presence, Last Stand");
        MessageUtils.sendRawMessage(player, "");
        
        MessageUtils.sendRawMessage(player, "&b&l🏹 MARKSMAN &7(Ranged DPS)");
        MessageUtils.sendRawMessage(player, "  &7Health: &c18 HP");
        MessageUtils.sendRawMessage(player, "  &eQ: Piercing Shot &7- Hits all enemies in line");
        MessageUtils.sendRawMessage(player, "  &eE: Explosive Arrow &7- AoE + fire");
        MessageUtils.sendRawMessage(player, "  &8Passive: Eagle Eye (headshot bonus)");
        MessageUtils.sendRawMessage(player, "");
        
        MessageUtils.sendRawMessage(player, "&c&l⚔ DUAL WARRIOR &7(Melee DPS)");
        MessageUtils.sendRawMessage(player, "  &7Health: &c20 HP");
        MessageUtils.sendRawMessage(player, "  &eQ: Blade Storm &7- Spin attack");
        MessageUtils.sendRawMessage(player, "  &eE: Twin Strike &7- High damage, execute");
        MessageUtils.sendRawMessage(player, "  &8Passive: Bloodlust (lifesteal + speed)");
        MessageUtils.sendRawMessage(player, "");
        
        MessageUtils.sendRawMessage(player, "&7Use: &e/mw class <hero|marksman|warrior>");
    }

    private void sendStats(Player player) {
        GamePhase phase = gameManager.getPhase();
        
        MessageUtils.sendRawMessage(player, "&6&l▬▬▬▬▬▬▬▬ GAME STATUS ▬▬▬▬▬▬▬▬");
        MessageUtils.sendRawMessage(player, "");
        MessageUtils.sendRawMessage(player, "&7Phase: &e" + phase.getDisplayName());
        
        for (Team team : gameManager.getTeams()) {
            String status = team.isEliminated() ? "&c☠ ELIMINATED" : "&a✔ Alive";
            MessageUtils.sendRawMessage(player, team.getColoredName() + "&7: " + 
                team.getAlivePlayerCount() + "/" + team.getPlayerCount() + " players " + status);
        }
    }

    private void sendTeamInfo(Player player) {
        Team team = gameManager.getPlayerTeam(player);
        
        if (team == null) {
            MessageUtils.sendMessage(player, "&cYou are not in a team! Use /mw join");
            return;
        }
        
        MessageUtils.sendRawMessage(player, "&6&l▬▬▬▬▬▬▬▬ YOUR TEAM ▬▬▬▬▬▬▬▬");
        MessageUtils.sendRawMessage(player, "");
        MessageUtils.sendRawMessage(player, "&7Team: " + team.getColoredName());
        MessageUtils.sendRawMessage(player, "&7Players:");
        
        for (Player teammate : team.getPlayers()) {
            ClassType classType = gameManager.getClassManager().getPlayerClassType(teammate);
            String className = classType != null ? classType.getDisplayName() : "None";
            String health = String.format("%.1f", teammate.getHealth());
            MessageUtils.sendRawMessage(player, "  &7- &f" + teammate.getName() + 
                " &7(" + className + ") &c" + health + "❤");
        }
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        List<String> completions = new ArrayList<>();
        
        if (args.length == 1) {
            List<String> subCommands = Arrays.asList("join", "leave", "class", "classes", "team", "stats", "help");
            if (sender.hasPermission("megawalls.admin")) {
                subCommands = new ArrayList<>(subCommands);
                subCommands.add("start");
                subCommands.add("stop");
            }
            
            for (String sub : subCommands) {
                if (sub.startsWith(args[0].toLowerCase())) {
                    completions.add(sub);
                }
            }
        } else if (args.length == 2 && args[0].equalsIgnoreCase("class")) {
            for (String className : Arrays.asList("hero", "marksman", "warrior")) {
                if (className.startsWith(args[1].toLowerCase())) {
                    completions.add(className);
                }
            }
        }
        
        return completions;
    }
}
