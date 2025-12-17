package com.megawalls.listeners;

import com.megawalls.MegaWalls;
import com.megawalls.game.GameManager;
import com.megawalls.game.GamePhase;
import com.megawalls.game.Team;
import com.megawalls.utils.MessageUtils;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.block.BlockBreakEvent;
import org.bukkit.event.block.BlockPlaceEvent;
import org.bukkit.event.entity.FoodLevelChangeEvent;
import org.bukkit.event.inventory.CraftItemEvent;
import org.bukkit.event.player.PlayerDropItemEvent;
import org.bukkit.event.player.PlayerMoveEvent;

public class GameListener implements Listener {

    private final MegaWalls plugin;
    private final GameManager gameManager;

    public GameListener(MegaWalls plugin) {
        this.plugin = plugin;
        this.gameManager = plugin.getGameManager();
    }

    @EventHandler
    public void onBlockBreak(BlockBreakEvent event) {
        Player player = event.getPlayer();
        
        if (!gameManager.isInGame(player)) return;
        
        GamePhase phase = gameManager.getPhase();
        
        // Allow block breaking during preparation and deathmatch
        if (phase == GamePhase.WAITING || phase == GamePhase.STARTING || phase == GamePhase.ENDING) {
            event.setCancelled(true);
        }
    }

    @EventHandler
    public void onBlockPlace(BlockPlaceEvent event) {
        Player player = event.getPlayer();
        
        if (!gameManager.isInGame(player)) return;
        
        GamePhase phase = gameManager.getPhase();
        
        // Allow block placing during preparation and deathmatch
        if (phase == GamePhase.WAITING || phase == GamePhase.STARTING || phase == GamePhase.ENDING) {
            event.setCancelled(true);
        }
    }

    @EventHandler
    public void onCraft(CraftItemEvent event) {
        if (!(event.getWhoClicked() instanceof Player)) return;
        
        Player player = (Player) event.getWhoClicked();
        
        if (!gameManager.isInGame(player)) return;
        
        GamePhase phase = gameManager.getPhase();
        
        // Only allow crafting during game phases
        if (phase == GamePhase.WAITING || phase == GamePhase.STARTING || phase == GamePhase.ENDING) {
            event.setCancelled(true);
        }
    }

    @EventHandler
    public void onFoodLevelChange(FoodLevelChangeEvent event) {
        if (!(event.getEntity() instanceof Player)) return;
        
        Player player = (Player) event.getEntity();
        
        if (!gameManager.isInGame(player)) return;
        
        GamePhase phase = gameManager.getPhase();
        
        // No hunger during waiting/starting
        if (phase == GamePhase.WAITING || phase == GamePhase.STARTING) {
            event.setCancelled(true);
        }
    }

    @EventHandler
    public void onItemDrop(PlayerDropItemEvent event) {
        Player player = event.getPlayer();
        
        if (!gameManager.isInGame(player)) return;
        
        // Prevent dropping ability items
        String itemName = event.getItemDrop().getItemStack().getItemMeta() != null ?
            event.getItemDrop().getItemStack().getItemMeta().getDisplayName() : "";
        
        if (itemName.contains("[Q]") || itemName.contains("[E]")) {
            event.setCancelled(true);
            MessageUtils.sendMessage(player, "&cYou cannot drop ability items!");
        }
    }

    @EventHandler
    public void onPlayerMove(PlayerMoveEvent event) {
        Player player = event.getPlayer();
        
        if (!gameManager.isInGame(player)) return;
        
        GamePhase phase = gameManager.getPhase();
        
        // During prep phase, prevent leaving team area (optional feature)
        // This could be implemented with WorldGuard regions or custom boundaries
        // For now, we just prevent going too far from spawn
        
        if (phase == GamePhase.PREPARATION) {
            Team team = gameManager.getPlayerTeam(player);
            if (team != null && team.getSpawnLocation() != null) {
                double distance = player.getLocation().distance(team.getSpawnLocation());
                
                // If player is very far from spawn (>100 blocks), warn them
                if (distance > 100) {
                    // Could teleport back or just warn
                    // For now, just a warning every 10 seconds
                    if (System.currentTimeMillis() % 10000 < 50) {
                        MessageUtils.sendMessage(player, "&eYou are far from your base! The walls will fall soon.");
                    }
                }
            }
        }
    }
}
