package com.megawalls.listeners;

import com.megawalls.MegaWalls;
import com.megawalls.game.GameManager;
import com.megawalls.game.GamePhase;
import com.megawalls.game.Team;
import com.megawalls.utils.MessageUtils;
import org.bukkit.GameMode;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.event.player.PlayerRespawnEvent;

public class PlayerListener implements Listener {

    private final MegaWalls plugin;
    private final GameManager gameManager;

    public PlayerListener(MegaWalls plugin) {
        this.plugin = plugin;
        this.gameManager = plugin.getGameManager();
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        
        // Welcome message
        MessageUtils.sendMessage(player, "&aWelcome to &6Mega Walls&a!");
        MessageUtils.sendMessage(player, "&7Use &e/mw join &7to join a game!");
    }

    @EventHandler
    public void onPlayerQuit(PlayerQuitEvent event) {
        Player player = event.getPlayer();
        
        // Remove from game if in one
        if (gameManager.isInGame(player)) {
            gameManager.leaveGame(player);
        }
    }

    @EventHandler
    public void onPlayerRespawn(PlayerRespawnEvent event) {
        Player player = event.getPlayer();
        
        if (!gameManager.isInGame(player)) return;
        
        Team team = gameManager.getPlayerTeam(player);
        GamePhase phase = gameManager.getPhase();
        
        // During deathmatch, set to spectator mode
        if (phase == GamePhase.DEATHMATCH) {
            // Delayed to ensure respawn completes
            plugin.getServer().getScheduler().runTaskLater(plugin, () -> {
                player.setGameMode(GameMode.SPECTATOR);
                MessageUtils.sendMessage(player, "&c&lYOU DIED! &7You are now spectating.");
                
                // Teleport to team dragon if exists
                var dragon = gameManager.getDragon(team);
                if (dragon != null && dragon.isAlive()) {
                    player.teleport(dragon.getHomeLocation());
                }
            }, 1L);
        } else if (phase == GamePhase.PREPARATION) {
            // Respawn at team spawn during prep
            if (team != null && team.getSpawnLocation() != null) {
                event.setRespawnLocation(team.getSpawnLocation());
            }
        }
    }
}
