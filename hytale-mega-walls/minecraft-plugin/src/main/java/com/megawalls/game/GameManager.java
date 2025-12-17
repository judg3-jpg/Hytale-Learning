package com.megawalls.game;

import com.megawalls.MegaWalls;
import com.megawalls.boss.MegaWallsDragon;
import com.megawalls.classes.ClassManager;
import com.megawalls.classes.ClassType;
import com.megawalls.utils.MessageUtils;
import org.bukkit.*;
import org.bukkit.boss.BarColor;
import org.bukkit.boss.BarStyle;
import org.bukkit.boss.BossBar;
import org.bukkit.entity.Player;
import org.bukkit.scheduler.BukkitRunnable;
import org.bukkit.scheduler.BukkitTask;

import java.util.*;

public class GameManager {

    private final MegaWalls plugin;
    private final ClassManager classManager;
    private final List<Team> teams = new ArrayList<>();
    private final Map<Team, MegaWallsDragon> dragons = new HashMap<>();
    
    private GamePhase phase = GamePhase.WAITING;
    private Location lobbyLocation;
    private int prepTime;
    private int timeRemaining;
    private BukkitTask gameTask;
    private BossBar bossBar;

    // Default teams
    private static final ChatColor[] TEAM_COLORS = {
        ChatColor.RED, ChatColor.BLUE, ChatColor.GREEN, ChatColor.YELLOW
    };
    private static final String[] TEAM_NAMES = {
        "Red", "Blue", "Green", "Yellow"
    };

    public GameManager(MegaWalls plugin) {
        this.plugin = plugin;
        this.classManager = new ClassManager();
        this.prepTime = plugin.getConfig().getInt("game.prep-time", 1200);
        
        // Initialize teams
        int teamCount = plugin.getConfig().getInt("game.team-count", 4);
        for (int i = 0; i < Math.min(teamCount, 4); i++) {
            teams.add(new Team(TEAM_NAMES[i], TEAM_COLORS[i]));
        }
        
        // Create boss bar
        bossBar = Bukkit.createBossBar(
            MessageUtils.colorize("&6&lMega Walls"),
            BarColor.YELLOW,
            BarStyle.SEGMENTED_10
        );
        
        // Start passive tick
        startPassiveTick();
    }

    /**
     * Start the passive ability tick (every second)
     */
    private void startPassiveTick() {
        new BukkitRunnable() {
            @Override
            public void run() {
                if (phase == GamePhase.PREPARATION || phase == GamePhase.DEATHMATCH) {
                    classManager.tickPassives();
                }
            }
        }.runTaskTimer(plugin, 20L, 20L);
    }

    /**
     * Join a player to the game
     */
    public boolean joinGame(Player player) {
        if (phase != GamePhase.WAITING && phase != GamePhase.STARTING) {
            MessageUtils.sendMessage(player, "&cCannot join - game in progress!");
            return false;
        }
        
        // Find team with fewest players
        Team smallestTeam = teams.stream()
            .min(Comparator.comparingInt(Team::getPlayerCount))
            .orElse(teams.get(0));
        
        smallestTeam.addPlayer(player);
        bossBar.addPlayer(player);
        
        MessageUtils.sendMessage(player, "&aYou joined " + smallestTeam.getColoredName() + "&a!");
        broadcastToAll("&e" + player.getName() + " joined " + smallestTeam.getColoredName() + "&e!");
        
        // Teleport to lobby
        if (lobbyLocation != null) {
            player.teleport(lobbyLocation);
        }
        
        return true;
    }

    /**
     * Leave the game
     */
    public void leaveGame(Player player) {
        Team team = getPlayerTeam(player);
        if (team != null) {
            team.removePlayer(player);
        }
        classManager.removePlayerClass(player);
        bossBar.removePlayer(player);
        
        MessageUtils.sendMessage(player, "&cYou left Mega Walls!");
    }

    /**
     * Select a class for a player
     */
    public void selectClass(Player player, ClassType classType) {
        if (!isInGame(player)) {
            MessageUtils.sendMessage(player, "&cYou must join the game first! Use /mw join");
            return;
        }
        
        classManager.setPlayerClass(player, classType);
        MessageUtils.sendMessage(player, "&aYou selected the " + classType.getDisplayName() + " class!");
    }

    /**
     * Start the game
     */
    public void startGame() {
        if (phase != GamePhase.WAITING) {
            return;
        }
        
        // Check minimum players
        int minPlayers = plugin.getConfig().getInt("game.min-players-per-team", 1);
        for (Team team : teams) {
            if (team.getPlayerCount() < minPlayers) {
                broadcastToAll("&cNot enough players! Need " + minPlayers + " per team.");
                return;
            }
        }
        
        phase = GamePhase.STARTING;
        broadcastToAll("&6&lGAME STARTING IN 10 SECONDS!");
        broadcastToAll("&7Select your class with &e/mw class <hero|marksman|warrior>");
        
        // Countdown
        new BukkitRunnable() {
            int countdown = 10;
            
            @Override
            public void run() {
                if (countdown <= 0) {
                    this.cancel();
                    startPreparationPhase();
                    return;
                }
                
                if (countdown <= 5 || countdown == 10) {
                    broadcastToAll("&eStarting in &c" + countdown + "&e...");
                    for (Team team : teams) {
                        for (Player player : team.getPlayers()) {
                            player.playSound(player.getLocation(), Sound.BLOCK_NOTE_BLOCK_PLING, 1.0f, 1.0f);
                        }
                    }
                }
                
                countdown--;
            }
        }.runTaskTimer(plugin, 0L, 20L);
    }

    /**
     * Start preparation phase
     */
    private void startPreparationPhase() {
        phase = GamePhase.PREPARATION;
        timeRemaining = prepTime;
        
        broadcastToAll("&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬");
        broadcastToAll("&6&lMEGA WALLS");
        broadcastToAll("");
        broadcastToAll("&7Gather resources and prepare your base!");
        broadcastToAll("&7The walls will fall in &e" + MessageUtils.formatTime(prepTime) + "&7!");
        broadcastToAll("&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬");
        
        // Teleport players to team spawns and give default class if not selected
        for (Team team : teams) {
            for (Player player : team.getPlayers()) {
                // Default to Hero if no class selected
                if (!classManager.hasClass(player)) {
                    classManager.setPlayerClass(player, ClassType.HERO);
                    MessageUtils.sendMessage(player, "&7You were assigned the &6Hero &7class by default.");
                }
                
                // Teleport to spawn
                if (team.getSpawnLocation() != null) {
                    player.teleport(team.getSpawnLocation());
                }
                
                // Clear and setup
                player.setGameMode(GameMode.SURVIVAL);
                player.setHealth(player.getMaxHealth());
                player.setFoodLevel(20);
            }
        }
        
        // Start game timer
        startGameTimer();
    }

    /**
     * Start the game timer
     */
    private void startGameTimer() {
        gameTask = new BukkitRunnable() {
            @Override
            public void run() {
                if (phase == GamePhase.ENDING || phase == GamePhase.WAITING) {
                    this.cancel();
                    return;
                }
                
                timeRemaining--;
                
                // Update boss bar
                updateBossBar();
                
                // Phase transitions
                if (phase == GamePhase.PREPARATION) {
                    // Warnings
                    if (timeRemaining == 300 || timeRemaining == 60 || timeRemaining == 30 || 
                        timeRemaining == 10 || timeRemaining <= 5 && timeRemaining > 0) {
                        broadcastToAll("&eWalls fall in &c" + MessageUtils.formatTime(timeRemaining) + "&e!");
                        playCountdownSound();
                    }
                    
                    if (timeRemaining <= 0) {
                        startWallsFalling();
                    }
                }
            }
        }.runTaskTimer(plugin, 20L, 20L);
    }

    /**
     * Walls fall - transition to deathmatch
     */
    private void startWallsFalling() {
        phase = GamePhase.WALLS_FALLING;
        
        broadcastToAll("");
        broadcastToAll("&c&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬");
        broadcastToAll("&c&lTHE WALLS HAVE FALLEN!");
        broadcastToAll("");
        broadcastToAll("&7Dragons spawning... &e10 second grace period!");
        broadcastToAll("&c&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬");
        
        // Play dramatic sound
        for (Team team : teams) {
            for (Player player : team.getPlayers()) {
                player.playSound(player.getLocation(), Sound.ENTITY_ENDER_DRAGON_GROWL, 1.0f, 1.0f);
                player.playSound(player.getLocation(), Sound.ENTITY_WITHER_SPAWN, 0.5f, 1.0f);
            }
        }
        
        // Spawn dragons
        spawnDragons();
        
        // Grace period then deathmatch
        int gracePeriod = plugin.getConfig().getInt("game.grace-period", 10);
        Bukkit.getScheduler().runTaskLater(plugin, () -> {
            phase = GamePhase.DEATHMATCH;
            broadcastToAll("&c&lPVP IS NOW ENABLED! FIGHT!");
            
            for (Team team : teams) {
                for (Player player : team.getPlayers()) {
                    player.playSound(player.getLocation(), Sound.ENTITY_WITHER_AMBIENT, 0.5f, 0.5f);
                }
            }
        }, gracePeriod * 20L);
    }

    /**
     * Spawn dragons for each team
     */
    private void spawnDragons() {
        for (Team team : teams) {
            Location dragonLoc = team.getDragonLocation();
            if (dragonLoc == null) {
                // Default to spawn location + 10 blocks up
                dragonLoc = team.getSpawnLocation();
                if (dragonLoc != null) {
                    dragonLoc = dragonLoc.clone().add(0, 10, 0);
                }
            }
            
            if (dragonLoc != null) {
                MegaWallsDragon dragon = new MegaWallsDragon(team, dragonLoc);
                dragon.spawn();
                dragons.put(team, dragon);
            }
        }
    }

    /**
     * Handle dragon death
     */
    public void onDragonDeath(Team team) {
        team.setEliminated(true);
        dragons.remove(team);
        
        broadcastToAll("&c&l" + team.getColoredName() + "&c&l's DRAGON HAS BEEN SLAIN!");
        broadcastToAll("&7" + team.getName() + " team has been eliminated!");
        
        // Check for winner
        checkForWinner();
    }

    /**
     * Check if there's a winner
     */
    private void checkForWinner() {
        List<Team> aliveTeams = new ArrayList<>();
        for (Team team : teams) {
            if (!team.isEliminated() && dragons.containsKey(team)) {
                aliveTeams.add(team);
            }
        }
        
        if (aliveTeams.size() == 1) {
            endGame(aliveTeams.get(0));
        } else if (aliveTeams.isEmpty()) {
            endGame(null); // Draw
        }
    }

    /**
     * End the game
     */
    private void endGame(Team winner) {
        phase = GamePhase.ENDING;
        
        if (winner != null) {
            broadcastToAll("");
            broadcastToAll("&6&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬");
            broadcastToAll("&6&lVICTORY!");
            broadcastToAll("");
            broadcastToAll(winner.getColoredName() + " &6&lWINS THE GAME!");
            broadcastToAll("&6&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬");
            
            // Fireworks for winners
            for (Player player : winner.getPlayers()) {
                player.playSound(player.getLocation(), Sound.UI_TOAST_CHALLENGE_COMPLETE, 1.0f, 1.0f);
            }
        } else {
            broadcastToAll("&7&lGAME ENDED IN A DRAW!");
        }
        
        // Reset after 10 seconds
        Bukkit.getScheduler().runTaskLater(plugin, this::resetGame, 200L);
    }

    /**
     * Reset the game
     */
    public void resetGame() {
        phase = GamePhase.WAITING;
        timeRemaining = 0;
        
        if (gameTask != null) {
            gameTask.cancel();
        }
        
        // Remove dragons
        for (MegaWallsDragon dragon : dragons.values()) {
            dragon.remove();
        }
        dragons.clear();
        
        // Clear teams
        for (Team team : teams) {
            for (Player player : team.getPlayers()) {
                player.getInventory().clear();
                player.setMaxHealth(20);
                player.setHealth(20);
                if (lobbyLocation != null) {
                    player.teleport(lobbyLocation);
                }
            }
            team.clear();
        }
        
        // Clear classes
        classManager.clearAll();
        
        // Update boss bar
        bossBar.setTitle(MessageUtils.colorize("&6&lMega Walls - Waiting for players"));
        bossBar.setProgress(1.0);
        
        broadcastToAll("&aGame reset! Use &e/mw join &ato play again!");
    }

    /**
     * Force stop the game (for plugin disable)
     */
    public void forceStop() {
        if (gameTask != null) {
            gameTask.cancel();
        }
        for (MegaWallsDragon dragon : dragons.values()) {
            dragon.remove();
        }
        bossBar.removeAll();
    }

    /**
     * Update the boss bar
     */
    private void updateBossBar() {
        if (phase == GamePhase.PREPARATION) {
            bossBar.setTitle(MessageUtils.colorize("&6&lPreparation &7- &e" + MessageUtils.formatTime(timeRemaining)));
            bossBar.setProgress(Math.max(0, (double) timeRemaining / prepTime));
            bossBar.setColor(BarColor.GREEN);
        } else if (phase == GamePhase.DEATHMATCH) {
            int aliveTeams = (int) teams.stream().filter(t -> !t.isEliminated()).count();
            bossBar.setTitle(MessageUtils.colorize("&c&lDeathmatch &7- &e" + aliveTeams + " teams remaining"));
            bossBar.setProgress(1.0);
            bossBar.setColor(BarColor.RED);
        }
    }

    /**
     * Play countdown sound to all players
     */
    private void playCountdownSound() {
        for (Team team : teams) {
            for (Player player : team.getPlayers()) {
                player.playSound(player.getLocation(), Sound.BLOCK_NOTE_BLOCK_PLING, 1.0f, 1.0f);
            }
        }
    }

    /**
     * Broadcast to all players in game
     */
    public void broadcastToAll(String message) {
        for (Team team : teams) {
            for (Player player : team.getPlayers()) {
                MessageUtils.sendRawMessage(player, message);
            }
        }
    }

    // Getters and utility methods
    public GamePhase getPhase() { return phase; }
    public ClassManager getClassManager() { return classManager; }
    public List<Team> getTeams() { return teams; }
    public Location getLobbyLocation() { return lobbyLocation; }
    public void setLobbyLocation(Location loc) { this.lobbyLocation = loc; }
    
    public Team getPlayerTeam(Player player) {
        for (Team team : teams) {
            if (team.hasPlayer(player)) {
                return team;
            }
        }
        return null;
    }
    
    public boolean isInGame(Player player) {
        return getPlayerTeam(player) != null;
    }
    
    public boolean isPvPEnabled() {
        return phase == GamePhase.DEATHMATCH;
    }
    
    public MegaWallsDragon getDragon(Team team) {
        return dragons.get(team);
    }
    
    public Team getTeamByName(String name) {
        for (Team team : teams) {
            if (team.getName().equalsIgnoreCase(name)) {
                return team;
            }
        }
        return null;
    }
}
