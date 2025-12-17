package com.megawalls.listeners;

import com.megawalls.MegaWalls;
import com.megawalls.classes.MarksmanClass;
import com.megawalls.classes.MWClass;
import com.megawalls.game.GameManager;
import com.megawalls.game.GamePhase;
import com.megawalls.utils.MessageUtils;
import org.bukkit.Material;
import org.bukkit.entity.Arrow;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.block.Action;
import org.bukkit.event.entity.ProjectileHitEvent;
import org.bukkit.event.player.PlayerInteractEvent;
import org.bukkit.inventory.ItemStack;

public class AbilityListener implements Listener {

    private final MegaWalls plugin;
    private final GameManager gameManager;

    public AbilityListener(MegaWalls plugin) {
        this.plugin = plugin;
        this.gameManager = plugin.getGameManager();
    }

    @EventHandler
    public void onPlayerInteract(PlayerInteractEvent event) {
        Player player = event.getPlayer();
        
        // Must be in game
        if (!gameManager.isInGame(player)) return;
        
        // Must be in active game phase
        GamePhase phase = gameManager.getPhase();
        if (phase != GamePhase.PREPARATION && phase != GamePhase.DEATHMATCH) return;
        
        // Check for ability items
        ItemStack item = event.getItem();
        if (item == null) return;
        
        MWClass playerClass = gameManager.getClassManager().getPlayerClass(player);
        if (playerClass == null) return;
        
        Action action = event.getAction();
        
        // Primary ability (left click or right click on specific items)
        if (isPrimaryAbilityItem(item, playerClass)) {
            if (action == Action.LEFT_CLICK_AIR || action == Action.LEFT_CLICK_BLOCK) {
                event.setCancelled(true);
                playerClass.executePrimaryAbility(player);
            }
        }
        
        // Secondary ability
        if (isSecondaryAbilityItem(item, playerClass)) {
            if (action == Action.RIGHT_CLICK_AIR || action == Action.RIGHT_CLICK_BLOCK) {
                event.setCancelled(true);
                playerClass.executeSecondaryAbility(player);
            }
        }
    }

    @EventHandler
    public void onProjectileHit(ProjectileHitEvent event) {
        // Handle explosive arrow
        if (event.getEntity() instanceof Arrow) {
            Arrow arrow = (Arrow) event.getEntity();
            
            if (arrow.hasMetadata("explosive_arrow")) {
                MarksmanClass.handleExplosiveArrowHit(arrow, arrow.getLocation());
            }
        }
    }

    /**
     * Check if item is the primary ability item for the class
     */
    private boolean isPrimaryAbilityItem(ItemStack item, MWClass playerClass) {
        if (item == null || !item.hasItemMeta() || !item.getItemMeta().hasDisplayName()) return false;
        
        String displayName = item.getItemMeta().getDisplayName();
        
        // Check by material and name pattern
        switch (playerClass.getName()) {
            case "Hero":
                return item.getType() == Material.BLAZE_POWDER && displayName.contains("Valor Strike");
            case "Marksman":
                return item.getType() == Material.SPECTRAL_ARROW && displayName.contains("Piercing Shot");
            case "Dual Warrior":
                return item.getType() == Material.NETHER_STAR && displayName.contains("Blade Storm");
            default:
                return false;
        }
    }

    /**
     * Check if item is the secondary ability item for the class
     */
    private boolean isSecondaryAbilityItem(ItemStack item, MWClass playerClass) {
        if (item == null || !item.hasItemMeta() || !item.getItemMeta().hasDisplayName()) return false;
        
        String displayName = item.getItemMeta().getDisplayName();
        
        switch (playerClass.getName()) {
            case "Hero":
                return item.getType() == Material.GHAST_TEAR && displayName.contains("Rally Cry");
            case "Marksman":
                return item.getType() == Material.FIRE_CHARGE && displayName.contains("Explosive Arrow");
            case "Dual Warrior":
                return item.getType() == Material.REDSTONE && displayName.contains("Twin Strike");
            default:
                return false;
        }
    }
}
