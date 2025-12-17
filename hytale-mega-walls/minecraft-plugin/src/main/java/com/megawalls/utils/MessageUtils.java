package com.megawalls.utils;

import org.bukkit.ChatColor;
import org.bukkit.entity.Player;
import com.megawalls.MegaWalls;

public class MessageUtils {

    public static String colorize(String message) {
        return ChatColor.translateAlternateColorCodes('&', message);
    }

    public static void sendMessage(Player player, String message) {
        String prefix = MegaWalls.getInstance().getConfig().getString("messages.prefix", "&6[MegaWalls] &r");
        player.sendMessage(colorize(prefix + message));
    }

    public static void sendRawMessage(Player player, String message) {
        player.sendMessage(colorize(message));
    }

    public static String formatTime(int seconds) {
        int minutes = seconds / 60;
        int secs = seconds % 60;
        return String.format("%02d:%02d", minutes, secs);
    }
}
