package com.megawalls.utils;

import org.bukkit.Location;
import org.bukkit.Particle;
import org.bukkit.Sound;
import org.bukkit.World;
import org.bukkit.entity.Player;

public class ParticleUtils {

    public static void spawnCircle(Location center, Particle particle, double radius, int points) {
        World world = center.getWorld();
        if (world == null) return;
        
        for (int i = 0; i < points; i++) {
            double angle = 2 * Math.PI * i / points;
            double x = center.getX() + radius * Math.cos(angle);
            double z = center.getZ() + radius * Math.sin(angle);
            world.spawnParticle(particle, x, center.getY(), z, 1, 0, 0, 0, 0);
        }
    }

    public static void spawnLine(Location start, Location end, Particle particle, int points) {
        World world = start.getWorld();
        if (world == null) return;
        
        double dx = (end.getX() - start.getX()) / points;
        double dy = (end.getY() - start.getY()) / points;
        double dz = (end.getZ() - start.getZ()) / points;
        
        for (int i = 0; i <= points; i++) {
            double x = start.getX() + dx * i;
            double y = start.getY() + dy * i;
            double z = start.getZ() + dz * i;
            world.spawnParticle(particle, x, y, z, 1, 0, 0, 0, 0);
        }
    }

    public static void spawnCone(Location origin, Particle particle, double length, double angle, int density) {
        World world = origin.getWorld();
        if (world == null) return;
        
        double yaw = Math.toRadians(origin.getYaw() + 90);
        double pitch = Math.toRadians(-origin.getPitch());
        
        for (int i = 0; i < density; i++) {
            double randAngle = Math.random() * angle - angle / 2;
            double randDist = Math.random() * length;
            
            double x = origin.getX() + randDist * Math.cos(yaw + Math.toRadians(randAngle));
            double y = origin.getY() + randDist * Math.sin(pitch);
            double z = origin.getZ() + randDist * Math.sin(yaw + Math.toRadians(randAngle));
            
            world.spawnParticle(particle, x, y, z, 1, 0, 0, 0, 0);
        }
    }

    public static void playAbilitySound(Player player, Sound sound, float volume, float pitch) {
        player.getWorld().playSound(player.getLocation(), sound, volume, pitch);
    }

    public static void spawnExplosionEffect(Location loc) {
        World world = loc.getWorld();
        if (world == null) return;
        
        world.spawnParticle(Particle.EXPLOSION_LARGE, loc, 1);
        world.spawnParticle(Particle.FLAME, loc, 30, 1, 1, 1, 0.1);
        world.playSound(loc, Sound.ENTITY_GENERIC_EXPLODE, 1.0f, 1.0f);
    }
}
