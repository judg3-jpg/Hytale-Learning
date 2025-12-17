package com.megawalls.classes;

import com.megawalls.MegaWalls;
import com.megawalls.utils.MessageUtils;
import com.megawalls.utils.ParticleUtils;
import org.bukkit.*;
import org.bukkit.entity.*;
import org.bukkit.inventory.ItemStack;
import org.bukkit.metadata.FixedMetadataValue;
import org.bukkit.potion.PotionEffect;
import org.bukkit.potion.PotionEffectType;
import org.bukkit.util.Vector;

import java.util.HashSet;
import java.util.Set;

public class MarksmanClass extends MWClass {

    private final double piercingShotDamage;
    private final int piercingShotCooldown;
    private final double explosiveArrowDamage;
    private final int explosiveArrowCooldown;
    private final double eagleEyeMultiplier;

    public MarksmanClass() {
        super("Marksman", "Ranged DPS with piercing shots and explosive arrows", 18, Material.BOW);
        
        var config = MegaWalls.getInstance().getConfig();
        this.piercingShotDamage = config.getDouble("classes.marksman.piercing-shot-damage", 12);
        this.piercingShotCooldown = config.getInt("classes.marksman.piercing-shot-cooldown", 10);
        this.explosiveArrowDamage = config.getDouble("classes.marksman.explosive-arrow-damage", 10);
        this.explosiveArrowCooldown = config.getInt("classes.marksman.explosive-arrow-cooldown", 15);
        this.eagleEyeMultiplier = config.getDouble("classes.marksman.eagle-eye-multiplier", 1.5);
    }

    @Override
    protected void giveStartingItems(Player player) {
        player.getInventory().clear();
        
        // Bow
        ItemStack bow = new ItemStack(Material.BOW);
        var bowMeta = bow.getItemMeta();
        if (bowMeta != null) {
            bowMeta.setDisplayName(MessageUtils.colorize("&b&lMarksman's Bow"));
            bow.setItemMeta(bowMeta);
        }
        player.getInventory().addItem(bow);
        
        // Arrows
        player.getInventory().addItem(new ItemStack(Material.ARROW, 64));
        
        // Wooden sword (backup)
        player.getInventory().addItem(new ItemStack(Material.WOODEN_SWORD));
        
        // Ability items
        player.getInventory().setItem(3, createAbilityItem(Material.SPECTRAL_ARROW,
            "&b&lPiercing Shot &7[Q]",
            "&7Fire a piercing arrow that",
            "&7hits ALL enemies in its path",
            "&7Damage: " + (int)piercingShotDamage,
            "&8Cooldown: " + piercingShotCooldown + "s"));
        
        player.getInventory().setItem(4, createAbilityItem(Material.FIRE_CHARGE,
            "&c&lExplosive Arrow &7[E]",
            "&7Fire an explosive arrow",
            "&7" + (int)explosiveArrowDamage + " AoE damage + burning",
            "&8Cooldown: " + explosiveArrowCooldown + "s"));
        
        // Basic tools
        player.getInventory().addItem(new ItemStack(Material.WOODEN_PICKAXE));
        player.getInventory().addItem(new ItemStack(Material.WOODEN_AXE));
        
        // Food
        player.getInventory().addItem(new ItemStack(Material.COOKED_BEEF, 16));
    }

    @Override
    public void executePrimaryAbility(Player player) {
        // Piercing Shot - Arrow that pierces through all enemies
        if (isOnCooldown("piercing_shot", player, piercingShotCooldown)) {
            int remaining = getRemainingCooldown("piercing_shot", player, piercingShotCooldown);
            MessageUtils.sendMessage(player, "&cPiercing Shot is on cooldown! &7(" + remaining + "s)");
            return;
        }

        setCooldown("piercing_shot", player);
        
        // Play effects
        ParticleUtils.playAbilitySound(player, Sound.ENTITY_ARROW_SHOOT, 1.5f, 0.5f);
        
        // Create piercing projectile
        Location eyeLocation = player.getEyeLocation();
        Vector direction = eyeLocation.getDirection().normalize();
        
        Set<LivingEntity> hitEntities = new HashSet<>();
        
        // Trace the arrow path
        for (int i = 0; i < 50; i++) {
            Location checkLoc = eyeLocation.clone().add(direction.clone().multiply(i));
            
            // Spawn trail particle
            player.getWorld().spawnParticle(Particle.CRIT_MAGIC, checkLoc, 2, 0, 0, 0, 0);
            
            // Check for block collision
            if (checkLoc.getBlock().getType().isSolid()) {
                break;
            }
            
            // Check for entity collision
            for (Entity entity : player.getWorld().getNearbyEntities(checkLoc, 0.5, 0.5, 0.5)) {
                if (entity instanceof LivingEntity && entity != player && !hitEntities.contains(entity)) {
                    LivingEntity target = (LivingEntity) entity;
                    
                    if (isEnemy(player, target)) {
                        hitEntities.add(target);
                        target.damage(piercingShotDamage, player);
                        
                        // Visual
                        player.getWorld().spawnParticle(Particle.CRIT, target.getLocation().add(0, 1, 0), 20);
                        player.getWorld().playSound(target.getLocation(), Sound.ENTITY_ARROW_HIT_PLAYER, 1.0f, 1.0f);
                    }
                }
            }
        }

        MessageUtils.sendMessage(player, "&bPiercing Shot! &7Hit " + hitEntities.size() + " target(s)!");
    }

    @Override
    public void executeSecondaryAbility(Player player) {
        // Explosive Arrow - AoE damage + fire
        if (isOnCooldown("explosive_arrow", player, explosiveArrowCooldown)) {
            int remaining = getRemainingCooldown("explosive_arrow", player, explosiveArrowCooldown);
            MessageUtils.sendMessage(player, "&cExplosive Arrow is on cooldown! &7(" + remaining + "s)");
            return;
        }

        setCooldown("explosive_arrow", player);
        
        // Shoot an arrow with metadata
        Arrow arrow = player.launchProjectile(Arrow.class);
        arrow.setVelocity(player.getLocation().getDirection().multiply(2.5));
        arrow.setMetadata("explosive_arrow", new FixedMetadataValue(MegaWalls.getInstance(), true));
        arrow.setMetadata("explosive_damage", new FixedMetadataValue(MegaWalls.getInstance(), explosiveArrowDamage));
        arrow.setMetadata("shooter", new FixedMetadataValue(MegaWalls.getInstance(), player.getUniqueId().toString()));
        arrow.setFireTicks(100);
        
        // Visual
        ParticleUtils.playAbilitySound(player, Sound.ENTITY_FIREWORK_ROCKET_LAUNCH, 1.0f, 0.8f);
        
        MessageUtils.sendMessage(player, "&cExplosive Arrow launched!");
    }

    @Override
    public void applyPassiveEffects(Player player) {
        // Eagle Eye - Handled in damage calculation
        // Hunter's Instinct - Show nearby enemies (glowing)
        for (Entity entity : player.getNearbyEntities(30, 15, 30)) {
            if (entity instanceof Player) {
                Player target = (Player) entity;
                if (isEnemy(player, target)) {
                    // Make enemy glow for the marksman (client-side would need packets)
                    // For simplicity, we'll add a subtle indicator
                    if (target.isSneaking()) {
                        // Can detect sneaking players
                        player.spawnParticle(Particle.VILLAGER_ANGRY, target.getLocation().add(0, 2.2, 0), 1);
                    }
                }
            }
        }
    }

    @Override
    public void onDealDamage(Player player, double damage, Entity target) {
        // Eagle Eye - Bonus headshot damage is handled in CombatListener
    }

    @Override
    public void onTakeDamage(Player player, double damage, Entity attacker) {
        // Could add evasion mechanic here
    }

    /**
     * Handle explosive arrow hit
     */
    public static void handleExplosiveArrowHit(Arrow arrow, Location hitLocation) {
        if (!arrow.hasMetadata("explosive_arrow")) return;
        
        double damage = arrow.getMetadata("explosive_damage").get(0).asDouble();
        String shooterUUID = arrow.getMetadata("shooter").get(0).asString();
        
        Player shooter = Bukkit.getPlayer(java.util.UUID.fromString(shooterUUID));
        
        // Create explosion effect
        ParticleUtils.spawnExplosionEffect(hitLocation);
        
        // Damage nearby entities
        for (Entity entity : hitLocation.getWorld().getNearbyEntities(hitLocation, 4, 4, 4)) {
            if (entity instanceof LivingEntity) {
                LivingEntity target = (LivingEntity) entity;
                
                // Don't damage shooter
                if (shooter != null && target.equals(shooter)) continue;
                
                // Calculate damage falloff based on distance
                double distance = target.getLocation().distance(hitLocation);
                double finalDamage = damage * (1 - (distance / 5));
                
                if (finalDamage > 0) {
                    target.damage(finalDamage, shooter);
                    target.setFireTicks(60); // Set on fire for 3 seconds
                }
            }
        }
        
        arrow.remove();
    }

    public double getEagleEyeMultiplier() {
        return eagleEyeMultiplier;
    }

    private boolean isEnemy(Player player, LivingEntity target) {
        if (!(target instanceof Player)) return true;
        
        var gameManager = MegaWalls.getInstance().getGameManager();
        var playerTeam = gameManager.getPlayerTeam(player);
        var targetTeam = gameManager.getPlayerTeam((Player) target);
        
        return playerTeam == null || targetTeam == null || !playerTeam.equals(targetTeam);
    }
}
