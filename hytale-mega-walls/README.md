# 🎮 Mega Walls - Hytale Edition

Complete game design, 3 classes, Dragon boss, and web preview for Mega Walls minigame.

---

## 📁 Project Structure

```
hytale-mega-walls/
│
├── 🌐 web-preview/              ← LOCALHOST PREVIEW
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
│
├── 📜 scripts/                  ← NODE EDITOR SCRIPTS (JSON)
│   ├── hero/hero_class.json
│   ├── dragon/dragon_boss.json
│   └── game/game_controller.json
│
├── 📖 Documentation
│   ├── CLASSES.md               ← ALL 3 CLASSES DETAILED
│   ├── GAME_DESIGN.md           ← Full game mechanics
│   ├── DRAGON_BOSS.md           ← Dragon boss details
│   └── IMPORT_INSTRUCTIONS.md   ← How to use scripts
│
└── README.md                    ← You are here
```

---

## 🚀 Run the Web Preview (Localhost)

### Option 1: Simple Python Server
```bash
cd hytale-mega-walls/web-preview
python -m http.server 8080
```
Then open: **http://localhost:8080**

### Option 2: Node.js (if you have it)
```bash
cd hytale-mega-walls/web-preview
npx serve .
```

### Option 3: Just Open the File
Double-click `web-preview/index.html` to open in browser!

---

## ⚔️ The 3 Classes

### 🦸 Hero (Support/Fighter)
| Ability | Key | Effect |
|---------|-----|--------|
| Valor Strike | Q | Dash 8 blocks, 8 damage, stun |
| Rally Cry | E | Heal allies 6 HP, cleanse debuffs |
| Heroic Presence | Passive | +10% damage to nearby allies |
| Last Stand | Passive | +15% damage when low HP |

**Health: 22 HP** | **Role: Team Support**

---

### 🏹 Marksman (Ranged DPS)
| Ability | Key | Effect |
|---------|-----|--------|
| Piercing Shot | Q | 12 damage, pierces all enemies |
| Explosive Arrow | E | 10 AoE damage + burning |
| Eagle Eye | Passive | +50% headshot damage |
| Hunter's Instinct | Perk | Track enemies, arrow recovery |

**Health: 18 HP** | **Role: Sniper**

---

### ⚔️ Dual Warrior (Melee DPS)
| Ability | Key | Effect |
|---------|-----|--------|
| Blade Storm | Q | Spin attack, ~12 damage over 3s |
| Twin Strike | E | 14 damage (x2 execute on low HP) |
| Bloodlust | Passive | Stacking attack speed + lifesteal |
| Battle Hardened | Perk | Faster crafting, combat ore drops |

**Health: 20 HP** | **Role: Berserker**

---

## 🐉 Dragon Boss

| Stat | Value |
|------|-------|
| Health | 500 HP |
| Armor | 20% damage reduction |
| Regen | 2 HP/sec (out of combat) |

### Dragon Abilities
| Ability | Cooldown | Effect |
|---------|----------|--------|
| Fire Breath | 8s | 18 damage cone over 3s |
| Wing Gust | 15s | Knockback all enemies 10 blocks |
| Tail Swipe | 5s | 10 damage to enemies behind |
| Dragon Roar | 60s | +20% ally damage, slow enemies |

---

## 📋 Game Flow

```
┌─────────────────────────────────────────┐
│  PHASE 1: PREPARATION (20 minutes)      │
│  • Teams separated by walls             │
│  • Gather resources, craft, build       │
│  • PvP disabled                         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  PHASE 2: WALLS FALL                    │
│  • Walls destroyed                      │
│  • Dragons spawn (10s protection)       │
│  • PvP enabled                          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  PHASE 3: DEATHMATCH                    │
│  • Attack enemy bases                   │
│  • Kill enemy dragons                   │
│  • Protect your dragon                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  VICTORY                                │
│  • Last team with dragon wins!          │
└─────────────────────────────────────────┘
```

---

## ✅ Implementation Status

- [x] Game Design Document
- [x] Hero Class (complete)
- [x] Marksman Class (complete)
- [x] Dual Warrior Class (complete)
- [x] Dragon Boss (complete)
- [x] Web Preview (complete)
- [x] Node Editor Scripts (JSON format)
- [ ] Asset Editor Format (when access available)
- [ ] In-game testing

---

## 🎮 Web Preview Features

The localhost preview includes:
- **Overview** - Game phases and teams
- **Classes** - All 3 classes with full ability details
- **Boss** - Dragon stats and abilities
- **Simulator** - Test abilities and see damage numbers!

Press **Q** or **E** in the Simulator to use abilities!

---

*Ready for Hytale implementation!* 🎮
