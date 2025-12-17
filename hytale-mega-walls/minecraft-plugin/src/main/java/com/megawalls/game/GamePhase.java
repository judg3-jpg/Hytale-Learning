package com.megawalls.game;

public enum GamePhase {
    WAITING("Waiting for players"),
    STARTING("Game starting"),
    PREPARATION("Preparation Phase"),
    WALLS_FALLING("Walls are falling!"),
    DEATHMATCH("Deathmatch"),
    ENDING("Game ending");

    private final String displayName;

    GamePhase(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
