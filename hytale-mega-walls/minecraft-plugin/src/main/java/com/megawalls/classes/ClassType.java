package com.megawalls.classes;

public enum ClassType {
    HERO("Hero", "Support/Fighter with healing and team buffs"),
    MARKSMAN("Marksman", "Ranged DPS with piercing and explosive arrows"),
    DUAL_WARRIOR("Dual Warrior", "Melee berserker with lifesteal and spin attacks");

    private final String displayName;
    private final String description;

    ClassType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public static ClassType fromString(String name) {
        for (ClassType type : values()) {
            if (type.name().equalsIgnoreCase(name) || 
                type.displayName.equalsIgnoreCase(name) ||
                type.name().replace("_", "").equalsIgnoreCase(name.replace(" ", ""))) {
                return type;
            }
        }
        return null;
    }
}
