# 🎮 Mega Walls - Minecraft Plugin

A complete Mega Walls minigame plugin for Spigot/Paper 1.20+ with 3 unique classes and Dragon bosses!

---

## 📋 Table of Contents

1. [Requirements](#-requirements)
2. [Installation](#-installation)
3. [Quick Start](#-quick-start)
4. [Commands](#-commands)
5. [Classes](#-classes)
6. [Configuration](#️-configuration)
7. [How to Play](#-how-to-play)

---

## 📦 Requirements

- **Minecraft Server**: Spigot or Paper 1.20.4+
- **Java**: 17 or higher
- **Maven**: For building (or use pre-built JAR)

---

## 🔧 Installation

### Option 1: Build from Source

```bash
# Navigate to the plugin folder
cd minecraft-plugin

# Build with Maven
mvn clean package

# The JAR will be in target/MegaWalls-1.0.0.jar
```

### Option 2: Download Pre-built
*(If you have a pre-built JAR)*

### Install the Plugin

1. Copy `MegaWalls-1.0.0.jar` to your server's `plugins/` folder
2. Start/restart your server
3. The plugin will create a `config.yml` in `plugins/MegaWalls/`

---

## 🚀 Quick Start

### Step 1: Quick Setup (For Testing)

```
/mwadmin quicksetup
```

This automatically sets up:
- Lobby at your current location
- 4 team spawns in a circle around you (50 blocks apart)

### Step 2: Join the Game

```
/mw join
```

### Step 3: Select a Class

```
/mw class hero
/mw class marksman
/mw class warrior
```

### Step 4: Start the Game (Admin)

```
/mw start
```

That's it! The game will begin with a preparation phase, then walls fall and PvP + Dragons begin!

---

## 📜 Commands

### Player Commands (`/megawalls` or `/mw`)

| Command | Description |
|---------|-------------|
| `/mw join` | Join the game |
| `/mw leave` | Leave the game |
| `/mw class <name>` | Select your class (hero/marksman/warrior) |
| `/mw classes` | View all available classes |
| `/mw team` | View your team info |
| `/mw stats` | View game status |
| `/mw help` | Show help |

### Admin Commands (`/mwadmin`)

| Command | Description |
|---------|-------------|
| `/mw start` | Start the game |
| `/mw stop` | Stop and reset the game |
| `/mwadmin setlobby` | Set lobby spawn point |
| `/mwadmin setspawn <team>` | Set team spawn (red/blue/green/yellow) |
| `/mwadmin setdragon <team>` | Set dragon spawn location |
| `/mwadmin quicksetup` | Auto-setup for testing |
| `/mwadmin reload` | Reload configuration |
| `/mwadmin setup` | View setup guide |

---

## ⚔️ Classes

### 🦸 Hero (Support/Fighter)
**Health: 22 HP**

| Ability | Key | Description |
|---------|-----|-------------|
| **Valor Strike** | Q (Left Click) | Dash 8 blocks forward, deal 8 damage, stun enemies |
| **Rally Cry** | E (Right Click) | Heal nearby allies for 6 HP, cleanse debuffs |
| **Heroic Presence** | Passive | Nearby allies deal +10% damage |
| **Last Stand** | Passive | +15% damage when below 30% HP |

---

### 🏹 Marksman (Ranged DPS)
**Health: 18 HP**

| Ability | Key | Description |
|---------|-----|-------------|
| **Piercing Shot** | Q (Left Click) | Fire arrow that pierces all enemies, 12 damage each |
| **Explosive Arrow** | E (Right Click) | Explosive arrow with 10 AoE damage + burning |
| **Eagle Eye** | Passive | +50% headshot damage |
| **Hunter's Instinct** | Passive | Track nearby enemies |

---

### ⚔️ Dual Warrior (Melee DPS)
**Health: 20 HP**

| Ability | Key | Description |
|---------|-----|-------------|
| **Blade Storm** | Q (Left Click) | Spin attack for 3 seconds, 4 damage per hit |
| **Twin Strike** | E (Right Click) | 14 damage strike, x2 on low HP targets! |
| **Bloodlust** | Passive | Stack attack speed + lifesteal on hits |
| **Battle Hardened** | Passive | Speed boost in combat |

---

## 🐉 Dragon Boss

Each team has a Dragon that spawns when walls fall:

| Stat | Value |
|------|-------|
| Health | 500 HP |
| Armor | 20% damage reduction |
| Regeneration | 2 HP/sec out of combat |

### Dragon Abilities

| Ability | Cooldown | Effect |
|---------|----------|--------|
| **Fire Breath** | 8s | Cone of fire, 6 damage/tick for 3s |
| **Wing Gust** | 15s | Knockback all enemies |
| **Tail Swipe** | 5s | 10 damage to enemies behind |
| **Dragon Roar** | 60s | Buff allies, slow enemies |

---

## ⚙️ Configuration

Edit `plugins/MegaWalls/config.yml`:

```yaml
# Game Settings
game:
  prep-time: 1200        # Preparation phase (seconds) - default 20 min
  min-players-per-team: 1
  max-players-per-team: 10
  team-count: 4
  grace-period: 10       # Seconds after walls fall before PvP

# Class Settings (customize abilities)
classes:
  hero:
    health: 22
    valor-strike-damage: 8
    valor-strike-cooldown: 12
    # ... more options

# Dragon Settings
dragon:
  health: 500
  armor: 0.20
  # ... more options
```

---

## 🎮 How to Play

### Game Phases

```
┌─────────────────────────────────────────┐
│  1. WAITING                             │
│  • Players join with /mw join           │
│  • Select class with /mw class <name>   │
│  • Admin starts with /mw start          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  2. PREPARATION (20 minutes default)    │
│  • Teams are at their spawns            │
│  • Gather resources, craft, build       │
│  • PvP is disabled                      │
│  • Prepare defenses for your Dragon!    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  3. WALLS FALL                          │
│  • Dragons spawn for each team          │
│  • 10 second grace period               │
│  • PvP becomes enabled!                 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  4. DEATHMATCH                          │
│  • Attack enemy bases                   │
│  • Kill enemy Dragons to eliminate teams│
│  • Protect YOUR Dragon!                 │
│  • Dead players become spectators       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  5. VICTORY                             │
│  • Last team with Dragon alive wins!    │
└─────────────────────────────────────────┘
```

### Using Abilities

Your abilities are in your hotbar:
- **Slot 4**: Primary Ability (Q) - Left Click to use
- **Slot 5**: Secondary Ability (E) - Right Click to use

Watch your cooldowns! They're shown in chat when you try to use an ability that's cooling down.

### Tips

1. **Hero**: Stay near teammates to buff them. Use Rally Cry when multiple allies are hurt.
2. **Marksman**: Keep distance! Piercing Shot is great for grouped enemies.
3. **Dual Warrior**: Get in close and stack Bloodlust for massive lifesteal!
4. **Dragon**: Protect it! The Dragon has powerful abilities but needs your help.

---

## 🗺️ Arena Setup (Detailed)

For a proper arena:

1. **Create 4 team bases** - Each should have:
   - Spawn area
   - Resources (ores, trees)
   - Space for a Dragon

2. **Build walls** between the bases (or use natural terrain)

3. **Set locations**:
   ```
   /mwadmin setlobby              # Central lobby
   /mwadmin setspawn red          # At Red team's base
   /mwadmin setspawn blue         # At Blue team's base
   /mwadmin setspawn green        # At Green team's base
   /mwadmin setspawn yellow       # At Yellow team's base
   /mwadmin setdragon red         # Where Red's dragon spawns
   # (repeat for each team)
   ```

4. **Test with quicksetup first** to understand the flow!

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Dragons flying away | They should stay within 50 blocks of home |
| Can't use abilities | Make sure you have a class selected |
| PvP not working | PvP only enables after walls fall |
| Game won't start | Need at least 1 player per team |

---

## 📝 License

Feel free to use and modify for your server!

---

*Enjoy Mega Walls! 🎮*
