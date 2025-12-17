package com.megawalls;

import com.megawalls.commands.MegaWallsCommand;
import com.megawalls.commands.MWAdminCommand;
import com.megawalls.game.GameManager;
import com.megawalls.listeners.*;
import org.bukkit.plugin.java.JavaPlugin;

public class MegaWalls extends JavaPlugin {

    private static MegaWalls instance;
    private GameManager gameManager;

    @Override
    public void onEnable() {
        instance = this;
        
        // Save default config
        saveDefaultConfig();
        
        // Initialize game manager
        gameManager = new GameManager(this);
        
        // Register commands
        getCommand("megawalls").setExecutor(new MegaWallsCommand(this));
        getCommand("mwadmin").setExecutor(new MWAdminCommand(this));
        
        // Register listeners
        getServer().getPluginManager().registerEvents(new PlayerListener(this), this);
        getServer().getPluginManager().registerEvents(new CombatListener(this), this);
        getServer().getPluginManager().registerEvents(new AbilityListener(this), this);
        getServer().getPluginManager().registerEvents(new GameListener(this), this);
        
        getLogger().info("MegaWalls has been enabled!");
        getLogger().info("Use /megawalls setup to configure the arena");
    }

    @Override
    public void onDisable() {
        if (gameManager != null) {
            gameManager.forceStop();
        }
        getLogger().info("MegaWalls has been disabled!");
    }

    public static MegaWalls getInstance() {
        return instance;
    }

    public GameManager getGameManager() {
        return gameManager;
    }
}
