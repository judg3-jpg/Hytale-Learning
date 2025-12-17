package com.megawalls.classes;

import org.bukkit.Material;
import org.bukkit.entity.Player;
import org.bukkit.inventory.ItemStack;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public abstract class MWClass {

    protected String name;
    protected String description;
    protected double maxHealth;
    protected Material icon;
    
    // Cooldown tracking: ability name -> (player UUID -> last use time)
    protected Map<String, Map<UUID, Long>> cooldowns = new HashMap<>();

    public MWClass(String name, String description, double maxHealth, Material icon) {
        this.name = name;
        this.description = description;
        this.maxHealth = maxHealth;
        this.icon = icon;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public double getMaxHealth() {
        return maxHealth;
    }

    public Material getIcon() {
        return icon;
    }

    /**
     * Apply class to a player (set health, give items, etc.)
     */
    public void applyToPlayer(Player player) {
        player.setMaxHealth(maxHealth);
        player.setHealth(maxHealth);
        giveStartingItems(player);
    }

    /**
     * Give starting items to the player
     */
    protected abstract void giveStartingItems(Player player);

    /**
     * Execute the primary ability (Q key / Left click with ability item)
     */
    public abstract void executePrimaryAbility(Player player);

    /**
     * Execute the secondary ability (E key / Right click with ability item)
     */
    public abstract void executeSecondaryAbility(Player player);

    /**
     * Apply passive effects (called periodically)
     */
    public abstract void applyPassiveEffects(Player player);

    /**
     * Called when the player deals damage
     */
    public abstract void onDealDamage(Player player, double damage, org.bukkit.entity.Entity target);

    /**
     * Called when the player takes damage
     */
    public abstract void onTakeDamage(Player player, double damage, org.bukkit.entity.Entity attacker);

    /**
     * Check if an ability is on cooldown
     */
    protected boolean isOnCooldown(String ability, Player player, int cooldownSeconds) {
        Map<UUID, Long> abilityCooldowns = cooldowns.computeIfAbsent(ability, k -> new HashMap<>());
        Long lastUse = abilityCooldowns.get(player.getUniqueId());
        
        if (lastUse == null) return false;
        
        long elapsed = (System.currentTimeMillis() - lastUse) / 1000;
        return elapsed < cooldownSeconds;
    }

    /**
     * Get remaining cooldown in seconds
     */
    protected int getRemainingCooldown(String ability, Player player, int cooldownSeconds) {
        Map<UUID, Long> abilityCooldowns = cooldowns.computeIfAbsent(ability, k -> new HashMap<>());
        Long lastUse = abilityCooldowns.get(player.getUniqueId());
        
        if (lastUse == null) return 0;
        
        long elapsed = (System.currentTimeMillis() - lastUse) / 1000;
        return Math.max(0, cooldownSeconds - (int) elapsed);
    }

    /**
     * Set ability on cooldown
     */
    protected void setCooldown(String ability, Player player) {
        Map<UUID, Long> abilityCooldowns = cooldowns.computeIfAbsent(ability, k -> new HashMap<>());
        abilityCooldowns.put(player.getUniqueId(), System.currentTimeMillis());
    }

    /**
     * Create ability item
     */
    protected ItemStack createAbilityItem(Material material, String name, String... lore) {
        ItemStack item = new ItemStack(material);
        var meta = item.getItemMeta();
        if (meta != null) {
            meta.setDisplayName(com.megawalls.utils.MessageUtils.colorize(name));
            if (lore.length > 0) {
                java.util.List<String> loreList = new java.util.ArrayList<>();
                for (String line : lore) {
                    loreList.add(com.megawalls.utils.MessageUtils.colorize(line));
                }
                meta.setLore(loreList);
            }
            item.setItemMeta(meta);
        }
        return item;
    }
}
