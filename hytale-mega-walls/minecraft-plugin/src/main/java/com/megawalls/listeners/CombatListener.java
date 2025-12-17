package com.megawalls.listeners;

import com.megawalls.MegaWalls;
import com.megawalls.boss.MegaWallsDragon;
import com.megawalls.classes.MarksmanClass;
import com.megawalls.classes.MWClass;
import com.megawalls.game.GameManager;
import com.megawalls.game.GamePhase;
import com.megawalls.game.Team;
import com.megawalls.utils.MessageUtils;
import org.bukkit.entity.EnderDragon;
import org.bukkit.entity.Entity;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.EntityDamageByEntityEvent;
import org.bukkit.event.entity.EntityDamageEvent;
import org.bukkit.event.entity.EntityDeathEvent;

public class CombatListener implements Listener {

    private final MegaWalls plugin;
    private final GameManager gameManager;

    public CombatListener(MegaWalls plugin) {
        this.plugin = plugin;
        this.gameManager = plugin.getGameManager();
    }

    @EventHandler(priority = EventPriority.HIGH)
    public void onEntityDamageByEntity(EntityDamageByEntityEvent event) {
        Entity damager = event.getDamager();
        Entity victim = event.getEntity();
        
        // Handle player vs player
        if (damager instanceof Player && victim instanceof Player) {
            handlePvP((Player) damager, (Player) victim, event);
            return;
        }
        
        // Handle player vs dragon
        if (damager instanceof Player && victim instanceof EnderDragon) {
            handleDragonDamage((Player) damager, (EnderDragon) victim, event);
            return;
        }
        
        // Handle player attacking any entity (for ability triggers)
        if (damager instanceof Player && victim instanceof org.bukkit.entity.LivingEntity) {
            handlePlayerAttack((Player) damager, event);
        }
    }

    private void handlePvP(Player attacker, Player victim, EntityDamageByEntityEvent event) {
        // Check if both are in game
        if (!gameManager.isInGame(attacker) || !gameManager.isInGame(victim)) {
            return;
        }
        
        // Check if PvP is enabled
        if (!gameManager.isPvPEnabled()) {
            event.setCancelled(true);
            return;
        }
        
        // Check if same team (friendly fire disabled)
        Team attackerTeam = gameManager.getPlayerTeam(attacker);
        Team victimTeam = gameManager.getPlayerTeam(victim);
        
        if (attackerTeam != null && attackerTeam.equals(victimTeam)) {
            event.setCancelled(true);
            return;
        }
        
        // Apply class damage modifiers
        MWClass attackerClass = gameManager.getClassManager().getPlayerClass(attacker);
        MWClass victimClass = gameManager.getClassManager().getPlayerClass(victim);
        
        double damage = event.getDamage();
        
        // Eagle Eye (Marksman headshot bonus)
        if (attackerClass instanceof MarksmanClass) {
            // Check for headshot (rough approximation - victim looking down at attacker)
            if (isHeadshot(attacker, victim)) {
                damage *= ((MarksmanClass) attackerClass).getEagleEyeMultiplier();
                MessageUtils.sendMessage(attacker, "&b&lHEADSHOT!");
                victim.getWorld().spawnParticle(org.bukkit.Particle.CRIT, 
                    victim.getLocation().add(0, 1.8, 0), 10);
            }
        }
        
        event.setDamage(damage);
        
        // Trigger class callbacks
        if (attackerClass != null) {
            attackerClass.onDealDamage(attacker, damage, victim);
        }
        if (victimClass != null) {
            victimClass.onTakeDamage(victim, damage, attacker);
        }
    }

    private void handleDragonDamage(Player attacker, EnderDragon dragonEntity, EntityDamageByEntityEvent event) {
        // Find which team's dragon this is
        for (Team team : gameManager.getTeams()) {
            MegaWallsDragon dragon = gameManager.getDragon(team);
            if (dragon != null && dragon.getEntity() != null && dragon.getEntity().equals(dragonEntity)) {
                // Check if attacker is on same team (can't damage own dragon)
                if (team.hasPlayer(attacker)) {
                    event.setCancelled(true);
                    return;
                }
                
                // Apply dragon armor
                double reducedDamage = dragon.handleDamage(event.getDamage(), attacker);
                event.setDamage(reducedDamage);
                
                // Trigger attacker's class callback
                MWClass attackerClass = gameManager.getClassManager().getPlayerClass(attacker);
                if (attackerClass != null) {
                    attackerClass.onDealDamage(attacker, reducedDamage, dragonEntity);
                }
                
                return;
            }
        }
    }

    private void handlePlayerAttack(Player attacker, EntityDamageByEntityEvent event) {
        // Trigger class damage callback for non-player targets
        MWClass attackerClass = gameManager.getClassManager().getPlayerClass(attacker);
        if (attackerClass != null && !(event.getEntity() instanceof Player)) {
            attackerClass.onDealDamage(attacker, event.getDamage(), event.getEntity());
        }
    }

    @EventHandler
    public void onEntityDamage(EntityDamageEvent event) {
        // Prevent damage during prep phase
        if (event.getEntity() instanceof Player) {
            Player player = (Player) event.getEntity();
            
            if (gameManager.isInGame(player)) {
                GamePhase phase = gameManager.getPhase();
                
                // No PvP damage during prep (but allow fall damage etc.)
                if (phase == GamePhase.PREPARATION && event.getCause() == EntityDamageEvent.DamageCause.ENTITY_ATTACK) {
                    event.setCancelled(true);
                }
            }
        }
    }

    @EventHandler
    public void onEntityDeath(EntityDeathEvent event) {
        Entity entity = event.getEntity();
        
        // Handle dragon death
        if (entity instanceof EnderDragon) {
            for (Team team : gameManager.getTeams()) {
                MegaWallsDragon dragon = gameManager.getDragon(team);
                if (dragon != null && dragon.getEntity() != null && dragon.getEntity().equals(entity)) {
                    gameManager.onDragonDeath(team);
                    return;
                }
            }
        }
        
        // Handle player death
        if (entity instanceof Player) {
            Player player = (Player) entity;
            
            if (gameManager.isInGame(player)) {
                // Find killer
                Player killer = player.getKiller();
                
                if (killer != null) {
                    Team killerTeam = gameManager.getPlayerTeam(killer);
                    Team victimTeam = gameManager.getPlayerTeam(player);
                    
                    if (killerTeam != null && victimTeam != null) {
                        gameManager.broadcastToAll(killerTeam.getColor() + killer.getName() + 
                            " &7killed " + victimTeam.getColor() + player.getName());
                    }
                }
            }
        }
    }

    /**
     * Rough headshot detection
     */
    private boolean isHeadshot(Player attacker, Player victim) {
        // Check if arrow/attack hit near head level
        double attackerY = attacker.getEyeLocation().getY();
        double victimHeadY = victim.getLocation().getY() + 1.5;
        
        // If attacker is aiming at head level
        org.bukkit.util.Vector lookDir = attacker.getEyeLocation().getDirection();
        double targetY = attacker.getEyeLocation().getY() + 
            lookDir.getY() * attacker.getLocation().distance(victim.getLocation());
        
        return Math.abs(targetY - victimHeadY) < 0.5;
    }
}
