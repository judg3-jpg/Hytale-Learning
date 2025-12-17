package com.megawalls.classes;

import org.bukkit.entity.Player;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class ClassManager {

    private final Map<ClassType, MWClass> classes = new HashMap<>();
    private final Map<UUID, ClassType> playerClasses = new HashMap<>();

    public ClassManager() {
        // Initialize all classes
        classes.put(ClassType.HERO, new HeroClass());
        classes.put(ClassType.MARKSMAN, new MarksmanClass());
        classes.put(ClassType.DUAL_WARRIOR, new DualWarriorClass());
    }

    /**
     * Get a class instance by type
     */
    public MWClass getClass(ClassType type) {
        return classes.get(type);
    }

    /**
     * Set a player's class
     */
    public void setPlayerClass(Player player, ClassType type) {
        playerClasses.put(player.getUniqueId(), type);
        MWClass mwClass = classes.get(type);
        if (mwClass != null) {
            mwClass.applyToPlayer(player);
        }
    }

    /**
     * Get a player's class type
     */
    public ClassType getPlayerClassType(Player player) {
        return playerClasses.get(player.getUniqueId());
    }

    /**
     * Get a player's class instance
     */
    public MWClass getPlayerClass(Player player) {
        ClassType type = playerClasses.get(player.getUniqueId());
        if (type == null) return null;
        return classes.get(type);
    }

    /**
     * Check if a player has a class
     */
    public boolean hasClass(Player player) {
        return playerClasses.containsKey(player.getUniqueId());
    }

    /**
     * Remove a player's class
     */
    public void removePlayerClass(Player player) {
        playerClasses.remove(player.getUniqueId());
    }

    /**
     * Clear all player classes
     */
    public void clearAll() {
        playerClasses.clear();
    }

    /**
     * Get all available class types
     */
    public ClassType[] getAvailableClasses() {
        return ClassType.values();
    }

    /**
     * Apply passive effects for all players with classes
     */
    public void tickPassives() {
        for (Map.Entry<UUID, ClassType> entry : playerClasses.entrySet()) {
            Player player = org.bukkit.Bukkit.getPlayer(entry.getKey());
            if (player != null && player.isOnline() && !player.isDead()) {
                MWClass mwClass = classes.get(entry.getValue());
                if (mwClass != null) {
                    mwClass.applyPassiveEffects(player);
                }
            }
        }
    }
}
