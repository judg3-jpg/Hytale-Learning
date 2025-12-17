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
import org.bukkit.util.Vector;

public class HeroClass extends MWClass {

    private final double valorStrikeDamage;
    private final int valorStrikeCooldown;
    private final double rallyCryHeal;
    private final int rallyCryCooldown;
    private final double heroicPresenceBonus;
    private final double lastStandThreshold;
    private final double lastStandBonus;

    public HeroClass() {
        super("Hero", "Support/Fighter with team healing and damage buffs", 22, Material.GOLDEN_SWORD);
        
        var config = MegaWalls.getInstance().getConfig();
        this.valorStrikeDamage = config.getDouble("classes.hero.valor-strike-damage", 8);
        this.valorStrikeCooldown = config.getInt("classes.hero.valor-strike-cooldown", 12);
        this.rallyCryHeal = config.getDouble("classes.hero.rally-cry-heal", 6);
        this.rallyCryCooldown = config.getInt("classes.hero.rally-cry-cooldown", 20);
        this.heroicPresenceBonus = config.getDouble("classes.hero.heroic-presence-bonus", 0.10);
        this.lastStandThreshold = config.getDouble("classes.hero.last-stand-threshold", 0.3);
        this.lastStandBonus = config.getDouble("classes.hero.last-stand-bonus", 0.15);
    }

    @Override
    protected void giveStartingItems(Player player) {
        player.getInventory().clear();
        
        // Wooden sword
        player.getInventory().addItem(new ItemStack(Material.WOODEN_SWORD));
        
        // Ability items
        player.getInventory().setItem(3, createAbilityItem(Material.BLAZE_POWDER, 
            "&6&lValor Strike &7[Q]",
            "&7Dash forward 8 blocks",
            "&7Deal " + (int)valorStrikeDamage + " damage and stun",
            "&8Cooldown: " + valorStrikeCooldown + "s"));
        
        player.getInventory().setItem(4, createAbilityItem(Material.GHAST_TEAR,
            "&e&lRally Cry &7[E]",
            "&7Heal nearby allies for " + (int)rallyCryHeal + " HP",
            "&7Cleanse all debuffs",
            "&8Cooldown: " + rallyCryCooldown + "s"));
        
        // Basic tools
        player.getInventory().addItem(new ItemStack(Material.WOODEN_PICKAXE));
        player.getInventory().addItem(new ItemStack(Material.WOODEN_AXE));
        
        // Food
        player.getInventory().addItem(new ItemStack(Material.COOKED_BEEF, 16));
    }

    @Override
    public void executePrimaryAbility(Player player) {
        // Valor Strike - Dash forward, deal damage, stun
        if (isOnCooldown("valor_strike", player, valorStrikeCooldown)) {
            int remaining = getRemainingCooldown("valor_strike", player, valorStrikeCooldown);
            MessageUtils.sendMessage(player, "&cValor Strike is on cooldown! &7(" + remaining + "s)");
            return;
        }

        setCooldown("valor_strike", player);
        
        // Dash forward
        Vector direction = player.getLocation().getDirection().normalize();
        player.setVelocity(direction.multiply(2.0));
        
        // Play effects
        ParticleUtils.playAbilitySound(player, Sound.ENTITY_PLAYER_ATTACK_SWEEP, 1.0f, 0.8f);
        player.getWorld().spawnParticle(Particle.SWEEP_ATTACK, player.getLocation(), 10);
        
        // Schedule damage check after dash
        Bukkit.getScheduler().runTaskLater(MegaWalls.getInstance(), () -> {
            Location loc = player.getLocation();
            for (Entity entity : player.getNearbyEntities(3, 2, 3)) {
                if (entity instanceof LivingEntity && entity != player) {
                    LivingEntity target = (LivingEntity) entity;
                    
                    // Check if enemy (different team or not in game)
                    if (isEnemy(player, target)) {
                        target.damage(valorStrikeDamage, player);
                        
                        // Stun effect (slowness + weakness)
                        if (target instanceof Player) {
                            ((Player) target).addPotionEffect(new PotionEffect(PotionEffectType.SLOW, 40, 3));
                            ((Player) target).addPotionEffect(new PotionEffect(PotionEffectType.WEAKNESS, 40, 1));
                        }
                        
                        // Visual feedback
                        player.getWorld().spawnParticle(Particle.CRIT, target.getLocation().add(0, 1, 0), 15);
                    }
                }
            }
        }, 5L);

        MessageUtils.sendMessage(player, "&6Valor Strike! &7Dashing forward!");
    }

    @Override
    public void executeSecondaryAbility(Player player) {
        // Rally Cry - Heal nearby allies and cleanse debuffs
        if (isOnCooldown("rally_cry", player, rallyCryCooldown)) {
            int remaining = getRemainingCooldown("rally_cry", player, rallyCryCooldown);
            MessageUtils.sendMessage(player, "&cRally Cry is on cooldown! &7(" + remaining + "s)");
            return;
        }

        setCooldown("rally_cry", player);
        
        // Play effects
        ParticleUtils.playAbilitySound(player, Sound.ENTITY_PLAYER_LEVELUP, 1.0f, 1.2f);
        ParticleUtils.spawnCircle(player.getLocation(), Particle.HEART, 5, 20);
        
        int healed = 0;
        
        // Heal self
        healAndCleanse(player);
        healed++;
        
        // Heal nearby allies
        for (Entity entity : player.getNearbyEntities(8, 4, 8)) {
            if (entity instanceof Player) {
                Player ally = (Player) entity;
                if (isAlly(player, ally)) {
                    healAndCleanse(ally);
                    MessageUtils.sendMessage(ally, "&e" + player.getName() + " used Rally Cry! &a+" + (int)rallyCryHeal + " HP");
                    healed++;
                }
            }
        }

        MessageUtils.sendMessage(player, "&eRally Cry! &7Healed " + healed + " player(s)!");
    }

    private void healAndCleanse(Player player) {
        // Heal
        double newHealth = Math.min(player.getMaxHealth(), player.getHealth() + rallyCryHeal);
        player.setHealth(newHealth);
        
        // Cleanse debuffs
        player.removePotionEffect(PotionEffectType.POISON);
        player.removePotionEffect(PotionEffectType.WITHER);
        player.removePotionEffect(PotionEffectType.SLOW);
        player.removePotionEffect(PotionEffectType.WEAKNESS);
        player.removePotionEffect(PotionEffectType.BLINDNESS);
        player.removePotionEffect(PotionEffectType.HUNGER);
        
        // Visual
        player.getWorld().spawnParticle(Particle.HEART, player.getLocation().add(0, 2, 0), 5);
    }

    @Override
    public void applyPassiveEffects(Player player) {
        // Heroic Presence - Buff nearby allies
        for (Entity entity : player.getNearbyEntities(10, 5, 10)) {
            if (entity instanceof Player) {
                Player ally = (Player) entity;
                if (isAlly(player, ally)) {
                    ally.addPotionEffect(new PotionEffect(PotionEffectType.INCREASE_DAMAGE, 40, 0, true, false));
                }
            }
        }
        
        // Last Stand check
        if (player.getHealth() / player.getMaxHealth() <= lastStandThreshold) {
            player.addPotionEffect(new PotionEffect(PotionEffectType.INCREASE_DAMAGE, 40, 1, true, false));
            // Visual indicator
            if (Math.random() < 0.1) {
                player.getWorld().spawnParticle(Particle.FLAME, player.getLocation().add(0, 1, 0), 3, 0.2, 0.2, 0.2, 0.01);
            }
        }
    }

    @Override
    public void onDealDamage(Player player, double damage, Entity target) {
        // Last Stand bonus damage is handled by potion effect
    }

    @Override
    public void onTakeDamage(Player player, double damage, Entity attacker) {
        // Could add damage reduction here if needed
    }

    private boolean isEnemy(Player player, LivingEntity target) {
        if (!(target instanceof Player)) return true; // Mobs are enemies
        
        var gameManager = MegaWalls.getInstance().getGameManager();
        var playerTeam = gameManager.getPlayerTeam(player);
        var targetTeam = gameManager.getPlayerTeam((Player) target);
        
        return playerTeam == null || targetTeam == null || !playerTeam.equals(targetTeam);
    }

    private boolean isAlly(Player player, Player target) {
        if (player.equals(target)) return true;
        
        var gameManager = MegaWalls.getInstance().getGameManager();
        var playerTeam = gameManager.getPlayerTeam(player);
        var targetTeam = gameManager.getPlayerTeam(target);
        
        return playerTeam != null && playerTeam.equals(targetTeam);
    }
}
