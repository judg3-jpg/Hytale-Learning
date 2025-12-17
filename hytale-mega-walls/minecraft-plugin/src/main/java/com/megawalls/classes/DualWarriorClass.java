package com.megawalls.classes;

import com.megawalls.MegaWalls;
import com.megawalls.utils.MessageUtils;
import com.megawalls.utils.ParticleUtils;
import org.bukkit.*;
import org.bukkit.entity.Entity;
import org.bukkit.entity.LivingEntity;
import org.bukkit.entity.Player;
import org.bukkit.inventory.ItemStack;
import org.bukkit.potion.PotionEffect;
import org.bukkit.potion.PotionEffectType;
import org.bukkit.scheduler.BukkitRunnable;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class DualWarriorClass extends MWClass {

    private final double bladeStormDamage;
    private final int bladeStormDuration;
    private final int bladeStormCooldown;
    private final double twinStrikeDamage;
    private final int twinStrikeCooldown;
    private final int bloodlustMaxStacks;
    private final double bloodlustAttackSpeed;
    private final double bloodlustLifesteal;

    // Bloodlust stacks per player
    private final Map<UUID, Integer> bloodlustStacks = new HashMap<>();
    private final Map<UUID, Long> lastHitTime = new HashMap<>();

    public DualWarriorClass() {
        super("Dual Warrior", "Melee berserker with lifesteal and devastating spin attacks", 20, Material.IRON_SWORD);
        
        var config = MegaWalls.getInstance().getConfig();
        this.bladeStormDamage = config.getDouble("classes.dual-warrior.blade-storm-damage", 4);
        this.bladeStormDuration = config.getInt("classes.dual-warrior.blade-storm-duration", 3);
        this.bladeStormCooldown = config.getInt("classes.dual-warrior.blade-storm-cooldown", 14);
        this.twinStrikeDamage = config.getDouble("classes.dual-warrior.twin-strike-damage", 14);
        this.twinStrikeCooldown = config.getInt("classes.dual-warrior.twin-strike-cooldown", 8);
        this.bloodlustMaxStacks = config.getInt("classes.dual-warrior.bloodlust-max-stacks", 5);
        this.bloodlustAttackSpeed = config.getDouble("classes.dual-warrior.bloodlust-attack-speed", 0.05);
        this.bloodlustLifesteal = config.getDouble("classes.dual-warrior.bloodlust-lifesteal", 0.02);
    }

    @Override
    protected void giveStartingItems(Player player) {
        player.getInventory().clear();
        
        // Dual swords (represented as two wooden swords)
        ItemStack mainSword = new ItemStack(Material.WOODEN_SWORD);
        var mainMeta = mainSword.getItemMeta();
        if (mainMeta != null) {
            mainMeta.setDisplayName(MessageUtils.colorize("&c&lBlade of Fury"));
            mainSword.setItemMeta(mainMeta);
        }
        player.getInventory().addItem(mainSword);
        
        ItemStack offSword = new ItemStack(Material.WOODEN_SWORD);
        var offMeta = offSword.getItemMeta();
        if (offMeta != null) {
            offMeta.setDisplayName(MessageUtils.colorize("&c&lBlade of Wrath"));
            offSword.setItemMeta(offMeta);
        }
        player.getInventory().setItemInOffHand(offSword);
        
        // Ability items
        player.getInventory().setItem(3, createAbilityItem(Material.NETHER_STAR,
            "&c&lBlade Storm &7[Q]",
            "&7Spin attack for " + bladeStormDuration + " seconds",
            "&7Deals " + (int)bladeStormDamage + " damage per hit",
            "&8Cooldown: " + bladeStormCooldown + "s"));
        
        player.getInventory().setItem(4, createAbilityItem(Material.REDSTONE,
            "&4&lTwin Strike &7[E]",
            "&7Devastating dual strike",
            "&7Deals " + (int)twinStrikeDamage + " damage",
            "&7x2 damage on low HP targets!",
            "&8Cooldown: " + twinStrikeCooldown + "s"));
        
        // Basic tools
        player.getInventory().addItem(new ItemStack(Material.WOODEN_PICKAXE));
        player.getInventory().addItem(new ItemStack(Material.WOODEN_AXE));
        
        // Food
        player.getInventory().addItem(new ItemStack(Material.COOKED_BEEF, 16));
        
        // Initialize bloodlust
        bloodlustStacks.put(player.getUniqueId(), 0);
    }

    @Override
    public void executePrimaryAbility(Player player) {
        // Blade Storm - Spin attack dealing damage over time
        if (isOnCooldown("blade_storm", player, bladeStormCooldown)) {
            int remaining = getRemainingCooldown("blade_storm", player, bladeStormCooldown);
            MessageUtils.sendMessage(player, "&cBlade Storm is on cooldown! &7(" + remaining + "s)");
            return;
        }

        setCooldown("blade_storm", player);
        
        MessageUtils.sendMessage(player, "&c&lBLADE STORM!");
        ParticleUtils.playAbilitySound(player, Sound.ENTITY_PLAYER_ATTACK_SWEEP, 1.5f, 0.6f);
        
        // Spin attack over duration
        new BukkitRunnable() {
            int ticks = 0;
            final int maxTicks = bladeStormDuration * 20;
            
            @Override
            public void run() {
                if (ticks >= maxTicks || !player.isOnline() || player.isDead()) {
                    this.cancel();
                    return;
                }
                
                // Every 10 ticks (0.5 seconds), deal damage
                if (ticks % 10 == 0) {
                    // Visual spin effect
                    ParticleUtils.spawnCircle(player.getLocation().add(0, 1, 0), Particle.SWEEP_ATTACK, 2.5, 12);
                    player.getWorld().playSound(player.getLocation(), Sound.ENTITY_PLAYER_ATTACK_SWEEP, 0.8f, 1.2f);
                    
                    // Damage nearby enemies
                    for (Entity entity : player.getNearbyEntities(2.5, 2, 2.5)) {
                        if (entity instanceof LivingEntity && entity != player) {
                            LivingEntity target = (LivingEntity) entity;
                            if (isEnemy(player, target)) {
                                target.damage(bladeStormDamage, player);
                                target.setVelocity(target.getLocation().toVector()
                                    .subtract(player.getLocation().toVector())
                                    .normalize().multiply(0.3).setY(0.2));
                            }
                        }
                    }
                }
                
                // Particle trail
                if (ticks % 2 == 0) {
                    double angle = (ticks * 18) % 360;
                    double x = player.getLocation().getX() + 1.5 * Math.cos(Math.toRadians(angle));
                    double z = player.getLocation().getZ() + 1.5 * Math.sin(Math.toRadians(angle));
                    player.getWorld().spawnParticle(Particle.FLAME, x, player.getLocation().getY() + 1, z, 1, 0, 0, 0, 0);
                }
                
                ticks++;
            }
        }.runTaskTimer(MegaWalls.getInstance(), 0L, 1L);
    }

    @Override
    public void executeSecondaryAbility(Player player) {
        // Twin Strike - High damage, double on low HP
        if (isOnCooldown("twin_strike", player, twinStrikeCooldown)) {
            int remaining = getRemainingCooldown("twin_strike", player, twinStrikeCooldown);
            MessageUtils.sendMessage(player, "&cTwin Strike is on cooldown! &7(" + remaining + "s)");
            return;
        }

        // Find target in front of player
        LivingEntity target = getTargetInFront(player, 4);
        
        if (target == null) {
            MessageUtils.sendMessage(player, "&cNo target in range!");
            return;
        }

        setCooldown("twin_strike", player);
        
        // Calculate damage (x2 if target is low HP)
        double damage = twinStrikeDamage;
        boolean execute = false;
        
        if (target instanceof LivingEntity) {
            double targetHealthPercent = target.getHealth() / target.getMaxHealth();
            if (targetHealthPercent <= 0.3) {
                damage *= 2;
                execute = true;
            }
        }
        
        // Apply damage
        target.damage(damage, player);
        
        // Effects
        ParticleUtils.playAbilitySound(player, Sound.ENTITY_PLAYER_ATTACK_CRIT, 1.5f, 0.8f);
        player.getWorld().spawnParticle(Particle.CRIT, target.getLocation().add(0, 1, 0), 30, 0.5, 0.5, 0.5, 0.1);
        
        if (execute) {
            player.getWorld().spawnParticle(Particle.DAMAGE_INDICATOR, target.getLocation().add(0, 1.5, 0), 20, 0.3, 0.3, 0.3, 0);
            MessageUtils.sendMessage(player, "&4&lTWIN STRIKE! &c&lEXECUTE! &7(" + (int)damage + " damage)");
            player.getWorld().playSound(player.getLocation(), Sound.ENTITY_WITHER_BREAK_BLOCK, 0.5f, 1.5f);
        } else {
            MessageUtils.sendMessage(player, "&4Twin Strike! &7(" + (int)damage + " damage)");
        }
    }

    @Override
    public void applyPassiveEffects(Player player) {
        UUID uuid = player.getUniqueId();
        
        // Bloodlust decay - lose stacks if not hitting for 5 seconds
        Long lastHit = lastHitTime.get(uuid);
        if (lastHit != null && System.currentTimeMillis() - lastHit > 5000) {
            int stacks = bloodlustStacks.getOrDefault(uuid, 0);
            if (stacks > 0) {
                bloodlustStacks.put(uuid, Math.max(0, stacks - 1));
            }
        }
        
        // Apply attack speed based on bloodlust stacks
        int stacks = bloodlustStacks.getOrDefault(uuid, 0);
        if (stacks > 0) {
            int amplifier = Math.min(stacks - 1, 2); // Haste level 1-3
            player.addPotionEffect(new PotionEffect(PotionEffectType.FAST_DIGGING, 40, amplifier, true, false));
            
            // Visual indicator for high stacks
            if (stacks >= 3) {
                player.getWorld().spawnParticle(Particle.REDSTONE, 
                    player.getLocation().add(0, 2.2, 0), 2, 0.2, 0, 0.2, 0,
                    new Particle.DustOptions(Color.RED, 1));
            }
        }
        
        // Battle Hardened - Slight speed boost in combat
        if (stacks > 0) {
            player.addPotionEffect(new PotionEffect(PotionEffectType.SPEED, 40, 0, true, false));
        }
    }

    @Override
    public void onDealDamage(Player player, double damage, Entity target) {
        UUID uuid = player.getUniqueId();
        
        // Bloodlust - Stack up on hits
        int currentStacks = bloodlustStacks.getOrDefault(uuid, 0);
        if (currentStacks < bloodlustMaxStacks) {
            bloodlustStacks.put(uuid, currentStacks + 1);
        }
        lastHitTime.put(uuid, System.currentTimeMillis());
        
        // Lifesteal
        int stacks = bloodlustStacks.get(uuid);
        double healAmount = damage * (bloodlustLifesteal * stacks);
        if (healAmount > 0) {
            double newHealth = Math.min(player.getMaxHealth(), player.getHealth() + healAmount);
            player.setHealth(newHealth);
            
            // Subtle heal particle
            if (healAmount >= 0.5) {
                player.getWorld().spawnParticle(Particle.HEART, player.getLocation().add(0, 2, 0), 1);
            }
        }
        
        // Show bloodlust stacks
        if (currentStacks < bloodlustMaxStacks) {
            player.sendActionBar(MessageUtils.colorize("&c&lBloodlust: " + 
                "❤".repeat(stacks) + "&8" + "❤".repeat(bloodlustMaxStacks - stacks)));
        }
    }

    @Override
    public void onTakeDamage(Player player, double damage, Entity attacker) {
        // Battle Hardened could add damage reduction here
    }

    private LivingEntity getTargetInFront(Player player, double range) {
        Location eyeLocation = player.getEyeLocation();
        org.bukkit.util.Vector direction = eyeLocation.getDirection().normalize();
        
        LivingEntity closest = null;
        double closestDist = range + 1;
        
        for (Entity entity : player.getNearbyEntities(range, range, range)) {
            if (entity instanceof LivingEntity && entity != player) {
                LivingEntity le = (LivingEntity) entity;
                
                // Check if entity is in front of player
                org.bukkit.util.Vector toEntity = le.getLocation().add(0, 1, 0).toVector()
                    .subtract(eyeLocation.toVector()).normalize();
                double dot = direction.dot(toEntity);
                
                if (dot > 0.7 && isEnemy(player, le)) { // Within ~45 degree cone
                    double dist = player.getLocation().distance(le.getLocation());
                    if (dist < closestDist) {
                        closest = le;
                        closestDist = dist;
                    }
                }
            }
        }
        
        return closest;
    }

    private boolean isEnemy(Player player, LivingEntity target) {
        if (!(target instanceof Player)) return true;
        
        var gameManager = MegaWalls.getInstance().getGameManager();
        var playerTeam = gameManager.getPlayerTeam(player);
        var targetTeam = gameManager.getPlayerTeam((Player) target);
        
        return playerTeam == null || targetTeam == null || !playerTeam.equals(targetTeam);
    }

    public void resetBloodlust(Player player) {
        bloodlustStacks.put(player.getUniqueId(), 0);
        lastHitTime.remove(player.getUniqueId());
    }
}
