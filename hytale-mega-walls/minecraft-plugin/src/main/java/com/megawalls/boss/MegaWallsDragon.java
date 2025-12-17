package com.megawalls.boss;

import com.megawalls.MegaWalls;
import com.megawalls.game.Team;
import com.megawalls.utils.MessageUtils;
import com.megawalls.utils.ParticleUtils;
import org.bukkit.*;
import org.bukkit.attribute.Attribute;
import org.bukkit.entity.*;
import org.bukkit.potion.PotionEffect;
import org.bukkit.potion.PotionEffectType;
import org.bukkit.scheduler.BukkitRunnable;
import org.bukkit.util.Vector;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class MegaWallsDragon {

    private final Team team;
    private EnderDragon dragon;
    private Location homeLocation;
    private boolean alive = true;
    
    // Stats from config
    private final double maxHealth;
    private final double armor;
    private final double regenPerSecond;
    
    // Ability cooldowns
    private long lastFireBreath = 0;
    private long lastWingGust = 0;
    private long lastTailSwipe = 0;
    private long lastDragonRoar = 0;
    private long lastDamageTaken = 0;
    
    // Ability settings
    private final double fireBreathDamage;
    private final int fireBreathCooldown;
    private final double wingGustKnockback;
    private final int wingGustCooldown;
    private final double tailSwipeDamage;
    private final int tailSwipeCooldown;
    private final int dragonRoarCooldown;
    private final int dragonRoarBuffDuration;

    public MegaWallsDragon(Team team, Location spawnLocation) {
        this.team = team;
        this.homeLocation = spawnLocation;
        
        var config = MegaWalls.getInstance().getConfig();
        this.maxHealth = config.getDouble("dragon.health", 500);
        this.armor = config.getDouble("dragon.armor", 0.20);
        this.regenPerSecond = config.getDouble("dragon.regen-per-second", 2);
        
        this.fireBreathDamage = config.getDouble("dragon.fire-breath-damage", 6);
        this.fireBreathCooldown = config.getInt("dragon.fire-breath-cooldown", 8);
        this.wingGustKnockback = config.getDouble("dragon.wing-gust-knockback", 2.0);
        this.wingGustCooldown = config.getInt("dragon.wing-gust-cooldown", 15);
        this.tailSwipeDamage = config.getDouble("dragon.tail-swipe-damage", 10);
        this.tailSwipeCooldown = config.getInt("dragon.tail-swipe-cooldown", 5);
        this.dragonRoarCooldown = config.getInt("dragon.dragon-roar-cooldown", 60);
        this.dragonRoarBuffDuration = config.getInt("dragon.dragon-roar-buff-duration", 10);
    }

    /**
     * Spawn the dragon
     */
    public void spawn() {
        World world = homeLocation.getWorld();
        if (world == null) return;
        
        dragon = (EnderDragon) world.spawnEntity(homeLocation, EntityType.ENDER_DRAGON);
        
        // Set custom name
        dragon.setCustomName(MessageUtils.colorize(team.getColor() + team.getName() + "'s Dragon"));
        dragon.setCustomNameVisible(true);
        
        // Set health
        dragon.getAttribute(Attribute.GENERIC_MAX_HEALTH).setBaseValue(maxHealth);
        dragon.setHealth(maxHealth);
        
        // Make it not go to the end portal
        dragon.setPhase(EnderDragon.Phase.CIRCLING);
        
        // Start AI task
        startAI();
        
        // Announce
        for (Player player : team.getPlayers()) {
            MessageUtils.sendMessage(player, "&5&lYour Dragon has spawned!");
            player.playSound(player.getLocation(), Sound.ENTITY_ENDER_DRAGON_GROWL, 1.0f, 1.0f);
        }
    }

    /**
     * Start the dragon AI
     */
    private void startAI() {
        new BukkitRunnable() {
            int tick = 0;
            
            @Override
            public void run() {
                if (!alive || dragon == null || dragon.isDead()) {
                    alive = false;
                    this.cancel();
                    return;
                }
                
                // Every second
                if (tick % 20 == 0) {
                    // Regenerate health if not in combat (5 seconds since last damage)
                    if (System.currentTimeMillis() - lastDamageTaken > 5000) {
                        double newHealth = Math.min(maxHealth, dragon.getHealth() + regenPerSecond);
                        dragon.setHealth(newHealth);
                    }
                    
                    // Find nearby enemies and use abilities
                    handleCombat();
                }
                
                // Keep dragon near home
                if (tick % 100 == 0) {
                    if (dragon.getLocation().distance(homeLocation) > 50) {
                        // Teleport back if too far
                        dragon.teleport(homeLocation);
                    }
                }
                
                tick++;
            }
        }.runTaskTimer(MegaWalls.getInstance(), 20L, 1L);
    }

    /**
     * Handle combat AI
     */
    private void handleCombat() {
        if (dragon == null || !alive) return;
        
        Location dragonLoc = dragon.getLocation();
        long now = System.currentTimeMillis();
        
        // Find enemies
        Player closestEnemy = null;
        double closestDist = 30;
        
        for (Entity entity : dragon.getNearbyEntities(30, 20, 30)) {
            if (entity instanceof Player) {
                Player player = (Player) entity;
                if (isEnemy(player)) {
                    double dist = player.getLocation().distance(dragonLoc);
                    if (dist < closestDist) {
                        closestEnemy = player;
                        closestDist = dist;
                    }
                }
            }
        }
        
        if (closestEnemy == null) return;
        
        // Priority: Fire Breath > Tail Swipe > Wing Gust > Dragon Roar
        
        // Fire Breath - cone attack in front
        if (closestDist < 15 && now - lastFireBreath > fireBreathCooldown * 1000) {
            useFireBreath(closestEnemy);
            lastFireBreath = now;
            return;
        }
        
        // Tail Swipe - enemies behind
        if (now - lastTailSwipe > tailSwipeCooldown * 1000) {
            for (Entity entity : dragon.getNearbyEntities(8, 4, 8)) {
                if (entity instanceof Player && isEnemy((Player) entity)) {
                    // Check if behind dragon
                    Vector toDragon = dragonLoc.toVector().subtract(entity.getLocation().toVector());
                    Vector dragonFacing = dragonLoc.getDirection();
                    if (toDragon.dot(dragonFacing) > 0) {
                        useTailSwipe();
                        lastTailSwipe = now;
                        return;
                    }
                }
            }
        }
        
        // Wing Gust - knockback when surrounded
        int nearbyEnemies = 0;
        for (Entity entity : dragon.getNearbyEntities(10, 5, 10)) {
            if (entity instanceof Player && isEnemy((Player) entity)) {
                nearbyEnemies++;
            }
        }
        if (nearbyEnemies >= 2 && now - lastWingGust > wingGustCooldown * 1000) {
            useWingGust();
            lastWingGust = now;
            return;
        }
        
        // Dragon Roar - buff allies when health is below 50%
        if (dragon.getHealth() < maxHealth * 0.5 && now - lastDragonRoar > dragonRoarCooldown * 1000) {
            useDragonRoar();
            lastDragonRoar = now;
        }
    }

    /**
     * Fire Breath ability - cone of fire damage
     */
    private void useFireBreath(Player target) {
        if (dragon == null) return;
        
        Location start = dragon.getLocation().add(0, 2, 0);
        Vector direction = target.getLocation().subtract(start).toVector().normalize();
        
        // Play effects
        dragon.getWorld().playSound(start, Sound.ENTITY_ENDER_DRAGON_GROWL, 2.0f, 0.5f);
        
        // Fire breath over 3 seconds
        new BukkitRunnable() {
            int ticks = 0;
            
            @Override
            public void run() {
                if (ticks >= 60 || dragon == null || !alive) {
                    this.cancel();
                    return;
                }
                
                // Spawn fire particles
                for (int i = 0; i < 15; i++) {
                    double dist = 1 + (ticks / 20.0) * 5;
                    double spread = dist * 0.3;
                    Location particleLoc = start.clone().add(
                        direction.clone().multiply(dist).add(new Vector(
                            (Math.random() - 0.5) * spread,
                            (Math.random() - 0.5) * spread,
                            (Math.random() - 0.5) * spread
                        ))
                    );
                    dragon.getWorld().spawnParticle(Particle.FLAME, particleLoc, 1, 0, 0, 0, 0.02);
                }
                
                // Damage every 10 ticks
                if (ticks % 10 == 0) {
                    for (Entity entity : dragon.getNearbyEntities(15, 10, 15)) {
                        if (entity instanceof Player && isEnemy((Player) entity)) {
                            Player player = (Player) entity;
                            
                            // Check if in cone
                            Vector toPlayer = player.getLocation().subtract(start).toVector().normalize();
                            if (direction.dot(toPlayer) > 0.7) {
                                player.damage(fireBreathDamage, dragon);
                                player.setFireTicks(40);
                            }
                        }
                    }
                }
                
                ticks++;
            }
        }.runTaskTimer(MegaWalls.getInstance(), 0L, 1L);
    }

    /**
     * Wing Gust ability - knockback all nearby enemies
     */
    private void useWingGust() {
        if (dragon == null) return;
        
        Location center = dragon.getLocation();
        
        // Effects
        dragon.getWorld().playSound(center, Sound.ENTITY_ENDER_DRAGON_FLAP, 2.0f, 0.5f);
        ParticleUtils.spawnCircle(center, Particle.CLOUD, 10, 30);
        
        // Knockback enemies
        for (Entity entity : dragon.getNearbyEntities(10, 5, 10)) {
            if (entity instanceof Player && isEnemy((Player) entity)) {
                Player player = (Player) entity;
                Vector knockback = player.getLocation().subtract(center).toVector().normalize()
                    .multiply(wingGustKnockback).setY(0.8);
                player.setVelocity(knockback);
                MessageUtils.sendMessage(player, "&7You were knocked back by the Dragon's wings!");
            }
        }
    }

    /**
     * Tail Swipe ability - damage enemies behind
     */
    private void useTailSwipe() {
        if (dragon == null) return;
        
        Location center = dragon.getLocation();
        Vector facing = center.getDirection();
        
        // Effects
        dragon.getWorld().playSound(center, Sound.ENTITY_PLAYER_ATTACK_SWEEP, 2.0f, 0.5f);
        
        // Damage enemies behind
        for (Entity entity : dragon.getNearbyEntities(8, 4, 8)) {
            if (entity instanceof Player && isEnemy((Player) entity)) {
                Player player = (Player) entity;
                Vector toPlayer = player.getLocation().subtract(center).toVector().normalize();
                
                // Check if behind dragon
                if (facing.dot(toPlayer) < -0.3) {
                    player.damage(tailSwipeDamage, dragon);
                    player.setVelocity(toPlayer.multiply(0.8).setY(0.4));
                    player.getWorld().spawnParticle(Particle.SWEEP_ATTACK, player.getLocation().add(0, 1, 0), 5);
                }
            }
        }
    }

    /**
     * Dragon Roar ability - buff allies, debuff enemies
     */
    private void useDragonRoar() {
        if (dragon == null) return;
        
        Location center = dragon.getLocation();
        
        // Effects
        dragon.getWorld().playSound(center, Sound.ENTITY_ENDER_DRAGON_GROWL, 3.0f, 0.3f);
        dragon.getWorld().playSound(center, Sound.ENTITY_ENDER_DRAGON_GROWL, 3.0f, 0.6f);
        
        // Buff allies
        for (Player player : team.getPlayers()) {
            if (player.getLocation().distance(center) < 50) {
                player.addPotionEffect(new PotionEffect(PotionEffectType.INCREASE_DAMAGE, 
                    dragonRoarBuffDuration * 20, 1));
                player.addPotionEffect(new PotionEffect(PotionEffectType.DAMAGE_RESISTANCE, 
                    dragonRoarBuffDuration * 20, 0));
                MessageUtils.sendMessage(player, "&5&lDragon Roar! &7+20% damage for " + dragonRoarBuffDuration + "s");
            }
        }
        
        // Slow enemies
        for (Entity entity : dragon.getNearbyEntities(30, 15, 30)) {
            if (entity instanceof Player && isEnemy((Player) entity)) {
                Player player = (Player) entity;
                player.addPotionEffect(new PotionEffect(PotionEffectType.SLOW, dragonRoarBuffDuration * 20, 0));
                MessageUtils.sendMessage(player, "&5The Dragon's roar slows you!");
            }
        }
    }

    /**
     * Handle damage taken by dragon
     */
    public double handleDamage(double damage, Entity damager) {
        lastDamageTaken = System.currentTimeMillis();
        
        // Apply armor
        double reducedDamage = damage * (1 - armor);
        
        // Notify team
        for (Player player : team.getPlayers()) {
            if (Math.random() < 0.3) { // Don't spam
                double healthPercent = (dragon.getHealth() - reducedDamage) / maxHealth * 100;
                MessageUtils.sendMessage(player, "&c⚠ Your Dragon is under attack! &7(" + 
                    String.format("%.0f", healthPercent) + "% HP)");
            }
        }
        
        return reducedDamage;
    }

    /**
     * Kill the dragon
     */
    public void kill() {
        alive = false;
        if (dragon != null && !dragon.isDead()) {
            // Dramatic death
            dragon.getWorld().playSound(dragon.getLocation(), Sound.ENTITY_ENDER_DRAGON_DEATH, 3.0f, 1.0f);
            dragon.getWorld().spawnParticle(Particle.EXPLOSION_HUGE, dragon.getLocation(), 10);
            dragon.setHealth(0);
        }
    }

    /**
     * Remove the dragon without death animation
     */
    public void remove() {
        alive = false;
        if (dragon != null) {
            dragon.remove();
        }
    }

    /**
     * Check if a player is an enemy
     */
    private boolean isEnemy(Player player) {
        return !team.hasPlayer(player);
    }

    // Getters
    public Team getTeam() { return team; }
    public EnderDragon getEntity() { return dragon; }
    public boolean isAlive() { return alive && dragon != null && !dragon.isDead(); }
    public Location getHomeLocation() { return homeLocation; }
    public void setHomeLocation(Location loc) { this.homeLocation = loc; }
}
