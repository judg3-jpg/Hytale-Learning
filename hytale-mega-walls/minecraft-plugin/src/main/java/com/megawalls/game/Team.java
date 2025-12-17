package com.megawalls.game;

import org.bukkit.ChatColor;
import org.bukkit.Location;
import org.bukkit.entity.Player;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

public class Team {

    private final String name;
    private final ChatColor color;
    private final Set<UUID> players = new HashSet<>();
    private Location spawnLocation;
    private Location dragonLocation;
    private boolean eliminated = false;

    public Team(String name, ChatColor color) {
        this.name = name;
        this.color = color;
    }

    public String getName() {
        return name;
    }

    public ChatColor getColor() {
        return color;
    }

    public String getColoredName() {
        return color + name;
    }

    public void addPlayer(Player player) {
        players.add(player.getUniqueId());
    }

    public void removePlayer(Player player) {
        players.remove(player.getUniqueId());
    }

    public boolean hasPlayer(Player player) {
        return players.contains(player.getUniqueId());
    }

    public boolean hasPlayer(UUID uuid) {
        return players.contains(uuid);
    }

    public Set<Player> getPlayers() {
        Set<Player> onlinePlayers = new HashSet<>();
        for (UUID uuid : players) {
            Player player = org.bukkit.Bukkit.getPlayer(uuid);
            if (player != null && player.isOnline()) {
                onlinePlayers.add(player);
            }
        }
        return onlinePlayers;
    }

    public Set<UUID> getPlayerUUIDs() {
        return new HashSet<>(players);
    }

    public int getPlayerCount() {
        return players.size();
    }

    public int getAlivePlayerCount() {
        int count = 0;
        for (UUID uuid : players) {
            Player player = org.bukkit.Bukkit.getPlayer(uuid);
            if (player != null && player.isOnline() && !player.isDead()) {
                count++;
            }
        }
        return count;
    }

    public Location getSpawnLocation() {
        return spawnLocation;
    }

    public void setSpawnLocation(Location spawnLocation) {
        this.spawnLocation = spawnLocation;
    }

    public Location getDragonLocation() {
        return dragonLocation;
    }

    public void setDragonLocation(Location dragonLocation) {
        this.dragonLocation = dragonLocation;
    }

    public boolean isEliminated() {
        return eliminated;
    }

    public void setEliminated(boolean eliminated) {
        this.eliminated = eliminated;
    }

    public void clear() {
        players.clear();
        eliminated = false;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Team)) return false;
        return name.equals(((Team) obj).name);
    }

    @Override
    public int hashCode() {
        return name.hashCode();
    }
}
