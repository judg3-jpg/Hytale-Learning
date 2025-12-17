# 🎮 Mega Walls for Hytale

Ready-to-import Node Editor scripts for Mega Walls minigame.

---

## 📁 Project Structure

```
hytale-mega-walls/
├── scripts/
│   ├── hero/
│   │   └── hero_class.json        ← HERO CLASS (all abilities)
│   ├── dragon/
│   │   └── dragon_boss.json       ← DRAGON BOSS (AI + attacks)
│   └── game/
│       └── game_controller.json   ← GAME LOGIC (timer, win)
├── IMPORT_INSTRUCTIONS.md         ← HOW TO USE THESE FILES
├── QUICK_START_GUIDE.md           ← Step-by-step manual build
└── NODE_EDITOR_IMPLEMENTATION.md  ← Detailed reference
```

---

## 🚀 Quick Start

### 1. Import the Scripts

Go to `scripts/` folder and import the JSON files into Hytale's Node Editor:

| File | Attach To | Purpose |
|------|-----------|---------|
| `hero_class.json` | Player (Hero class) | All hero abilities |
| `dragon_boss.json` | Dragon entity | Boss AI & attacks |
| `game_controller.json` | World/Game object | Game loop |

### 2. Read Import Instructions

Open **[IMPORT_INSTRUCTIONS.md](./IMPORT_INSTRUCTIONS.md)** for:
- How to import/recreate the scripts
- Variable setup guide
- Node type reference
- Testing checklist

---

## ⚔️ What's Included

### Hero Class (`hero_class.json`)
| Ability | Key | What It Does |
|---------|-----|--------------|
| **Valor Strike** | Q | Dash 8 blocks, 8 damage, stun enemies |
| **Rally Cry** | E | Heal allies 6 HP in 15 block radius |
| **Heroic Presence** | Passive | Nearby allies get +damage buff |
| **Last Stand** | Passive | +damage when below 50% HP |

### Dragon Boss (`dragon_boss.json`)
| Ability | Trigger | What It Does |
|---------|---------|--------------|
| **Fire Breath** | Enemy in front | 18 damage cone over 3 seconds |
| **Wing Gust** | 3+ enemies close | Knockback everyone 10 blocks |
| **Tail Swipe** | Enemy behind | 10 damage melee |
| **Dragon Roar** | HP < 50% | Buff allies, slow enemies |

**Stats:** 500 HP, 20% armor, 2 HP/sec regen

### Game Controller (`game_controller.json`)
- 20-minute preparation phase
- Walls fall mechanic
- Dragon spawning
- Team elimination tracking
- Win condition detection

---

## 📋 Game Flow

```
1. PREPARATION (20 min)
   └── Teams separated, gather resources

2. WALLS FALL
   ├── Walls destroyed
   ├── Dragons spawn (10s protection)
   └── PvP enabled

3. DEATHMATCH
   └── Attack enemy dragons, defend yours

4. VICTORY
   └── Last team with dragon wins!
```

---

## 📖 Additional Documentation

- **[QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)** - Manual step-by-step build instructions
- **[NODE_EDITOR_IMPLEMENTATION.md](./NODE_EDITOR_IMPLEMENTATION.md)** - Full technical reference
- **[GAME_DESIGN.md](./GAME_DESIGN.md)** - Complete game design document

---

## ✅ Implementation Status

- [x] Hero Class - Complete
- [x] Dragon Boss - Complete  
- [x] Game Controller - Complete
- [ ] Additional Classes (future)
- [ ] Map/Arena (build in Hytale)

---

*Import the scripts and start playing!* 🎮
