# Hero Class - Detailed Implementation Guide

## Overview

The **Hero** is the first class we're implementing for Mega Walls in Hytale. This document provides step-by-step instructions for creating the Hero class using Hytale's Node Editor.

---

## Hero Class Summary

| Attribute | Value |
|-----------|-------|
| Role | Versatile Fighter / Team Support |
| Difficulty | Medium |
| Playstyle | Front-line combat with team buffs |
| Health | 22 HP (11 hearts) |

---

## Abilities Breakdown

### 1️⃣ PASSIVE: Heroic Presence

**What it does:**
- Allies within 10 blocks get +10% damage and +5% damage reduction
- When Hero is below 50% HP, they gain +15% damage ("Last Stand")

**Implementation Steps:**

```
STEP 1: Create a repeating timer (every 1 second)

STEP 2: On timer tick:
   → Get Hero's current position
   → Find all entities within 10 block radius
   → Filter for: Players on same team (excluding self)

STEP 3: For each ally found:
   → Apply temporary buff "Heroic_Inspiration"
   → Buff stats: damage_multiplier = 1.10, damage_reduction = 0.05
   → Buff duration: 2 seconds (refreshes each tick)

STEP 4: Check Hero's health:
   → IF current_health < max_health * 0.5
   → Apply self buff "Last_Stand"
   → Buff stats: damage_multiplier = 1.15
   → Duration: 2 seconds
```

**Variables Needed:**
```
heroic_presence_range: 10 (constant)
heroic_presence_damage_boost: 0.10 (constant)
heroic_presence_defense_boost: 0.05 (constant)
last_stand_threshold: 0.5 (constant)
last_stand_damage_boost: 0.15 (constant)
```

**Visual Feedback:**
- Subtle golden aura particles around Hero
- Allies with buff show small gold sparkles
- Last Stand: Orange/red fire-like particles when active

---

### 2️⃣ PRIMARY SKILL: Valor Strike

**What it does:**
- Hero dashes forward 8 blocks
- Damages all enemies in path for 8 HP
- Stuns hit enemies for 1.5 seconds
- 25 second cooldown

**Implementation Steps:**

```
STEP 1: Create item "Valor_Strike_Orb"
   → Right-click activated
   → Consumable: NO (stays in inventory)

STEP 2: On item use:
   → Check cooldown variable: valor_cooldown
   → IF valor_cooldown < 25:
      → Show action bar message: "Cooldown: X seconds"
      → Cancel ability
   → ELSE: Continue to STEP 3

STEP 3: Execute dash:
   → Get player's look direction (horizontal only, Y=0)
   → Normalize direction vector
   → Calculate end position: current_pos + (direction * 8)
   → Store start position

STEP 4: Damage pass:
   → Create raycast or area check from start to end
   → Width: 3 blocks (1.5 blocks each side)
   → Find all entities in this path

STEP 5: For each entity in path:
   → Check if enemy team
   → IF enemy:
      → Deal 8 damage
      → Apply "Stunned" effect (1.5 seconds)
      → Spawn hit particles (red/orange)
      → Play hit sound

STEP 6: Move player:
   → Teleport/dash player to end position
   → OR use velocity if dash is preferred

STEP 7: Effects:
   → Spawn gold particle trail along path
   → Play "heroic_charge" sound
   → Reset cooldown: valor_cooldown = 0
```

**Cooldown System:**
```
STEP A: Create variable: valor_cooldown = 25 (starts ready)

STEP B: Create repeating timer (every 1 second)
   → IF valor_cooldown < 25:
      → valor_cooldown = valor_cooldown + 1
```

**Stun Implementation:**
```
Option 1: Apply slowness effect (speed = 0)
Option 2: Use Hytale's native stun if available
Option 3: Disable player input + apply particle effect

Stun visuals: Stars/swirls above head
Stun prevents: Movement, attacking, using items
```

---

### 3️⃣ SECONDARY SKILL: Rally Cry

**What it does:**
- Heals all allies within 15 blocks for 6 HP
- Removes negative effects (poison, slowness, weakness)
- Heals self for 4 HP
- 45 second cooldown

**Implementation Steps:**

```
STEP 1: Create item "Rally_Cry_Horn"
   → Right-click activated
   → Consumable: NO

STEP 2: On item use:
   → Check cooldown variable: rally_cooldown
   → IF rally_cooldown < 45:
      → Show message: "Cooldown: X seconds"
      → Cancel
   → ELSE: Continue

STEP 3: Find targets:
   → Get player position
   → Find all entities within 15 block radius
   → Filter for: Players on same team

STEP 4: Heal allies:
   → For each ally:
      → Heal 6 HP (don't exceed max health)
      → Remove effects: "poison", "slowness", "weakness"
      → Spawn green heal particles on ally

STEP 5: Heal self:
   → Heal player 4 HP
   → Spawn heal particles on self

STEP 6: Effects:
   → Spawn expanding ring particle (green/gold)
   → Play "rally_cry" sound
   → Reset cooldown: rally_cooldown = 0
```

**Expanding Ring Effect:**
```
Frame 1: Ring radius = 0
Frame 2: Ring radius = 3
Frame 3: Ring radius = 6
Frame 4: Ring radius = 9
Frame 5: Ring radius = 12
Frame 6: Ring radius = 15 (max)
Duration: ~0.5 seconds total
```

---

### 4️⃣ GATHERING PERK: Veteran Explorer

**What it does:**
- +15% mining speed
- 10% chance for double ore drops
- +20% mob loot drops

**Implementation:**

```
Mining Speed:
   → Apply mining speed modifier when player spawns
   → mining_speed = base_speed * 1.15

Double Ore Drops:
   → On ore block break:
      → Generate random number 0-100
      → IF random < 10:
         → Spawn extra ore item
         → Show "+1" floating text

Mob Loot:
   → On entity death caused by Hero:
      → Multiply loot drops by 1.2
      → OR add 20% chance for extra drop
```

---

## Starting Kit

When a player selects Hero class, give them:

```
Slot 0: Wooden Sword
Slot 1: Wooden Pickaxe  
Slot 2: Valor Strike Orb (custom item)
Slot 3: Rally Cry Horn (custom item)
Slot 4: Bread x8
Slot 5: Leather Boots (equipped automatically)
```

**Custom Item Properties:**

```
Valor Strike Orb:
   → Item ID: "megawalls:valor_orb"
   → Display Name: "§6Valor Strike"
   → Lore: "§7Right-click to dash forward"
   → Lore: "§7Damages and stuns enemies in path"
   → Lore: "§8Cooldown: 25 seconds"
   → Texture: Golden orb with sword icon

Rally Cry Horn:
   → Item ID: "megawalls:rally_horn"
   → Display Name: "§aRally Cry"
   → Lore: "§7Right-click to heal nearby allies"
   → Lore: "§7Removes negative effects"
   → Lore: "§8Cooldown: 45 seconds"
   → Texture: Golden horn/trumpet
```

---

## Node Editor Structure

### Files to Create:

```
hero_class/
├── hero_passive.node      (Heroic Presence logic)
├── hero_valor_strike.node (Primary ability)
├── hero_rally_cry.node    (Secondary ability)
├── hero_gathering.node    (Mining/loot perks)
├── hero_kit.node          (Starting items)
└── hero_init.node         (Called when player picks Hero)
```

### hero_init.node

```
[On Player Selects Hero Class]
    │
    ▼
[Set Player Variable: class = "hero"]
    │
    ▼
[Set Player Variable: valor_cooldown = 25]
    │
    ▼
[Set Player Variable: rally_cooldown = 45]
    │
    ▼
[Set Player Max Health = 22]
    │
    ▼
[Call: GiveHeroKit]
    │
    ▼
[Start Hero Passive Timer]
    │
    ▼
[Apply Mining Speed Modifier]
```

### hero_passive.node

```
[Repeating Timer: 1 second]
    │
    ▼
[Get Player Data: position, health, team]
    │
    ▼
[Area Search: radius=10, type=Player]
    │
    ▼
[Filter: same team, not self]
    │
    ▼
[For Each: Apply "Heroic_Inspiration" buff]
    │
    ▼
[If health < 11: Apply "Last_Stand" buff]
```

### hero_valor_strike.node

```
[Trigger: Item Use "Valor_Orb"]
    │
    ▼
[Branch: valor_cooldown >= 25]
   │          │
   │No        │Yes
   │          │
   ▼          ▼
[Msg]      [Execute Dash]
              │
              ▼
           [Get Look Direction]
              │
              ▼
           [Calculate Path (8 blocks)]
              │
              ▼
           [Raycast/Area Damage]
              │
              ▼
           [Apply Stun to Hits]
              │
              ▼
           [Teleport Player]
              │
              ▼
           [Play Effects]
              │
              ▼
           [Set cooldown = 0]
```

---

## Balance Considerations

### Valor Strike Balance:
- **Too Strong?** Reduce damage to 6, stun to 1 second
- **Too Weak?** Increase dash to 10 blocks, add brief invulnerability
- **Tip:** Stun should be VERY noticeable but not frustrating

### Rally Cry Balance:
- **Too Strong?** Increase cooldown to 60 seconds
- **Too Weak?** Add brief damage immunity (1 second)
- **Tip:** Should feel impactful but not make team unkillable

### Heroic Presence Balance:
- **Too Strong?** Reduce range to 8 blocks, buff to +8%
- **Too Weak?** Increase range to 12 blocks
- **Tip:** Should encourage team play without being overpowered

---

## Testing Checklist

- [ ] Hero spawns with correct health (22 HP)
- [ ] Starting kit is given correctly
- [ ] Valor Strike:
  - [ ] Cooldown displays correctly
  - [ ] Dash travels 8 blocks
  - [ ] Enemies in path take damage
  - [ ] Stun is applied
  - [ ] Particles appear
  - [ ] Sound plays
- [ ] Rally Cry:
  - [ ] Cooldown works
  - [ ] Allies in range are healed
  - [ ] Negative effects are removed
  - [ ] Self heal works
  - [ ] Particles appear
- [ ] Heroic Presence:
  - [ ] Allies in range get buff
  - [ ] Buff refreshes properly
  - [ ] Last Stand activates at 50% HP
- [ ] Mining speed bonus works
- [ ] Double ore drops occur ~10% of time
- [ ] Mob loot bonus works

---

## Quick Reference Card

```
╔════════════════════════════════════════╗
║           HERO CLASS                   ║
╠════════════════════════════════════════╣
║ Health: 22 HP (11 hearts)              ║
╠════════════════════════════════════════╣
║ PASSIVE: Heroic Presence               ║
║ • Allies within 10 blocks: +10% DMG    ║
║ • Below 50% HP: +15% DMG (self)        ║
╠════════════════════════════════════════╣
║ [Q] VALOR STRIKE (25s cooldown)        ║
║ • Dash 8 blocks forward                ║
║ • 8 DMG + 1.5s stun to enemies         ║
╠════════════════════════════════════════╣
║ [E] RALLY CRY (45s cooldown)           ║
║ • Heal allies 6 HP in 15 block radius  ║
║ • Remove negative effects              ║
║ • Self heal: 4 HP                      ║
╠════════════════════════════════════════╣
║ GATHERING: Veteran Explorer            ║
║ • +15% mining speed                    ║
║ • 10% double ore drops                 ║
║ • +20% mob loot                        ║
╚════════════════════════════════════════╝
```

---

*Ready to implement? Start with hero_init.node, then hero_passive.node, then the abilities!*
