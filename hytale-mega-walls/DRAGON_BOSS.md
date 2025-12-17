# Dragon Boss - Detailed Implementation Guide

## Overview

The **Dragon** serves as each team's core objective in Mega Walls. When a team's Dragon is killed, that team is eliminated. This is the "Wither" equivalent for our Hytale implementation.

---

## Dragon Boss Summary

| Attribute | Value |
|-----------|-------|
| Role | Team Objective / Defender |
| Health | 500 HP |
| Armor | 20% damage reduction |
| Regen | 2 HP/sec when out of combat |
| Size | Large (intimidating) |

---

## Dragon Abilities

### 🔥 1. Fire Breath (Primary Attack)

**What it does:**
- Breathes fire in a cone shape
- Deals 6 damage per second for 3 seconds
- Leaves burning ground for 2 seconds
- 8 second cooldown

**Stats:**
| Property | Value |
|----------|-------|
| Damage | 6 HP/second (18 total) |
| Range | 15 blocks |
| Cone Angle | 45 degrees |
| Duration | 3 seconds |
| Cooldown | 8 seconds |

**Implementation:**

```
[Function: FireBreath]
    │
    ▼
[Check: fire_breath_cooldown >= 8]
   │
   ├── No → [Exit function]
   │
   └── Yes ↓
           │
           ▼
[Set fire_breath_cooldown = 0]
    │
    ▼
[Get Dragon facing direction]
    │
    ▼
[Play Animation: "fire_breath_charge" (0.5s)]
    │
    ▼
[Loop: 6 times (every 0.5s for 3 seconds)]
    │
    ├──► [Calculate cone area]
    │       │
    │       ▼
    │    [Get all entities in cone]
    │       │
    │       ▼
    │    [For each entity:]
    │       │
    │       ├── [If enemy team:]
    │       │      │
    │       │      ▼
    │       │   [Deal 3 damage]
    │       │      │
    │       │      ▼
    │       │   [Apply fire visual]
    │       │
    │       └── [Continue]
    │
    ├──► [Spawn fire particles in cone]
    │
    └──► [Spawn fire blocks on ground]
    
[After loop: Remove fire blocks after 2s]
```

**Cone Calculation:**
```
Dragon position: (dx, dy, dz)
Dragon facing: angle θ
Cone half-angle: 22.5 degrees (45° total)
Cone length: 15 blocks

For each potential target:
1. Calculate vector from dragon to target
2. Calculate angle between facing and target vector
3. If angle < 22.5° AND distance < 15:
   → Target is in cone
```

---

### 💨 2. Wing Gust (Defensive)

**What it does:**
- Powerful wing flap knocks back all nearby enemies
- Prevents the dragon from being swarmed
- Triggers when 3+ enemies are close

**Stats:**
| Property | Value |
|----------|-------|
| Knockback | 10 blocks |
| Range | 8 blocks (all directions) |
| Cooldown | 15 seconds |
| Trigger | Auto when 3+ enemies within 8 blocks |

**Implementation:**

```
[AI Check: Every 0.5 seconds]
    │
    ▼
[Count enemies within 8 blocks]
    │
    ▼
[If count >= 3 AND wing_gust_cooldown >= 15]
    │
    ├── No → [Skip]
    │
    └── Yes ↓
            │
            ▼
[Set wing_gust_cooldown = 0]
    │
    ▼
[Play Animation: "wing_gust"]
    │
    ▼
[Play Sound: "dragon_wing_flap"]
    │
    ▼
[For each entity within 8 blocks:]
    │
    ├── [If enemy team:]
    │      │
    │      ▼
    │   [Calculate knockback direction (away from dragon)]
    │      │
    │      ▼
    │   [Apply velocity: direction * 2.5]
    │      │
    │      ▼
    │   [Deal 2 damage (minor)]
    │
    └── [Continue]
    
[Spawn wind particle ring effect]
```

---

### 🦎 3. Tail Swipe (Melee)

**What it does:**
- Swipes tail at enemies behind the dragon
- High damage, punishes flanking attempts
- Quick attack for close threats

**Stats:**
| Property | Value |
|----------|-------|
| Damage | 10 HP |
| Range | 5 blocks (behind dragon) |
| Arc | 120 degrees behind |
| Cooldown | 5 seconds |

**Implementation:**

```
[AI Check: Every 0.5 seconds]
    │
    ▼
[Check for enemies BEHIND dragon (120° arc, 5 blocks)]
    │
    ▼
[If enemy found AND tail_swipe_cooldown >= 5]
    │
    ├── No → [Skip]
    │
    └── Yes ↓
            │
            ▼
[Set tail_swipe_cooldown = 0]
    │
    ▼
[Play Animation: "tail_swipe"]
    │
    ▼
[Play Sound: "dragon_tail_swoosh"]
    │
    ▼
[For each entity in rear arc:]
    │
    ├── [If enemy team:]
    │      │
    │      ▼
    │   [Deal 10 damage]
    │      │
    │      ▼
    │   [Apply small knockback (sideways)]
    │
    └── [Continue]

[Spawn swoosh particle effect]
```

**Behind Detection:**
```
Dragon facing: forward vector F
Target position relative to dragon: vector T

Dot product: D = F · T
If D < 0: Target is behind dragon
If D > 0: Target is in front

For 120° arc behind:
If D < -0.5: Target is in tail swipe range
```

---

### 📢 4. Roar (Buff/Debuff)

**What it does:**
- Powerful roar when dragon is wounded
- Buffs nearby allies
- Debuffs nearby enemies with fear
- Emergency ability at 50% HP

**Stats:**
| Property | Value |
|----------|-------|
| Ally Buff | +20% damage for 10 seconds |
| Enemy Debuff | Slowness (50%) for 5 seconds |
| Range | 20 blocks |
| Cooldown | 60 seconds |
| Trigger | Dragon HP < 50% |

**Implementation:**

```
[AI Check: Every 1 second]
    │
    ▼
[If dragon_health < 250 AND roar_cooldown >= 60]
    │
    ├── No → [Skip]
    │
    └── Yes ↓
            │
            ▼
[Set roar_cooldown = 0]
    │
    ▼
[Play Animation: "roar"]
    │
    ▼
[Play Sound: "dragon_roar" (loud, echoing)]
    │
    ▼
[Camera shake effect for all players in 30 blocks]
    │
    ▼
[For each player within 20 blocks:]
    │
    ├── [If same team as dragon:]
    │      │
    │      ▼
    │   [Apply buff: "Dragon's Fury" +20% damage, 10s]
    │      │
    │      ▼
    │   [Show buff icon on HUD]
    │
    ├── [If enemy team:]
    │      │
    │      ▼
    │   [Apply debuff: "Fear" -50% speed, 5s]
    │      │
    │      ▼
    │   [Play fear visual (dark edges on screen)]
    │
    └── [Continue]

[Spawn shockwave particle effect]
```

---

## Dragon AI Behavior

### Priority System

The Dragon's AI follows this priority order:

```
PRIORITY 1 (HIGHEST): Respond to direct attack
   → If dragon is taking damage, target that player
   
PRIORITY 2: Attack nearest threat
   → Target nearest enemy within 15 blocks
   
PRIORITY 3: Defensive measures
   → Use Wing Gust if being swarmed (3+ enemies close)
   
PRIORITY 4: Tail defense
   → Tail Swipe if enemy is behind
   
PRIORITY 5: Emergency roar
   → Use Roar when below 50% HP
   
PRIORITY 6 (LOWEST): Idle/regenerate
   → If no enemies, regenerate health
```

### AI State Machine

```
STATES:
├── IDLE: No enemies nearby, regenerating
├── ALERT: Enemies detected, choosing target
├── ATTACKING: Actively using abilities
├── DEFENSIVE: Using Wing Gust/Tail Swipe
└── WOUNDED: Below 50% HP, more aggressive

TRANSITIONS:
IDLE → ALERT: Enemy enters 30 block range
ALERT → ATTACKING: Target acquired within 15 blocks
ATTACKING → DEFENSIVE: 3+ enemies within 8 blocks
ANY → WOUNDED: HP drops below 50%
ALERT → IDLE: No enemies for 10 seconds
```

### Main AI Loop

```
[Every 0.5 Seconds: Dragon AI Tick]
    │
    ▼
[Update cooldown timers]
    │
    ▼
[Scan for enemies within 30 blocks]
    │
    ▼
[If dragon taking damage:]
    │   │
    │   ▼
    │ [Set target = damage source]
    │ [Set state = ATTACKING]
    │
    └──► [Else if enemies detected:]
           │
           ▼
         [Set target = nearest enemy]
         [Set state = ALERT]
    
[Switch on state:]
    │
    ├── IDLE:
    │      │
    │      ▼
    │   [If no enemies for 10s: Regenerate 2 HP/s]
    │   [Play idle animation]
    │
    ├── ALERT:
    │      │
    │      ▼
    │   [Face target]
    │   [If target within 15 blocks: state = ATTACKING]
    │
    ├── ATTACKING:
    │      │
    │      ▼
    │   [Face target]
    │   [Select ability based on situation:]
    │      │
    │      ├── Target behind? → Tail Swipe
    │      ├── Target in front, <15 blocks? → Fire Breath
    │      ├── 3+ enemies close? → Wing Gust
    │      └── Default: Fire Breath (if ready)
    │
    ├── DEFENSIVE:
    │      │
    │      ▼
    │   [Use Wing Gust]
    │   [After knockback: state = ATTACKING]
    │
    └── WOUNDED:
           │
           ▼
         [Same as ATTACKING but:]
         [- More aggressive targeting]
         [- Use Roar when available]
         [- Reduced ability cooldowns (optional)]
```

---

## Dragon Health Bar

Display a boss health bar for the dragon:

```
┌────────────────────────────────────────┐
│ 🐉 RED DRAGON                          │
│ ████████████████████░░░░░░░░░░  385/500│
└────────────────────────────────────────┘

Features:
- Visible to all players
- Shows team color
- Updates in real-time
- Flashes when taking damage
- Different color segments for HP thresholds
```

**Health Bar Implementation:**
```
[On Dragon Spawn:]
    │
    ▼
[Create Boss Bar UI element]
    │
    ▼
[Set title: "{Team Color} DRAGON"]
    │
    ▼
[Set max value: 500]
    │
    ▼
[Set color: Team color]

[On Dragon Take Damage:]
    │
    ▼
[Update bar value: current_health]
    │
    ▼
[Flash bar briefly]
    │
    ▼
[If health < 250: Change bar color to yellow]
    │
    ▼
[If health < 100: Change bar color to red]
```

---

## Dragon Spawn Sequence

When the walls fall, dragons spawn with a dramatic sequence:

```
[Trigger: Walls Fall]
    │
    ▼
[Wait 3 seconds]
    │
    ▼
[For each team spawn point:]
    │
    ▼
[Play dramatic music sting]
    │
    ▼
[Spawn portal/rift effect at spawn point]
    │
    ▼
[After 2 seconds: Dragon emerges from portal]
    │
    ▼
[Dragon plays spawn animation (rising up)]
    │
    ▼
[Dragon roars (intro roar, no gameplay effect)]
    │
    ▼
[Apply 10 second spawn protection (invulnerable)]
    │
    ▼
[Broadcast: "§c[RED] §fDragon has awakened!"]
    │
    ▼
[Create boss health bar]
    │
    ▼
[Start Dragon AI]
```

---

## Dragon Death Sequence

When a dragon dies, dramatic death sequence:

```
[Dragon HP reaches 0]
    │
    ▼
[Disable Dragon AI]
    │
    ▼
[Play death animation: Dragon falls, roars in pain]
    │
    ▼
[Screen shake for nearby players]
    │
    ▼
[Wait 2 seconds]
    │
    ▼
[Spawn explosion particles]
    │
    ▼
[Play explosion sound + death cry]
    │
    ▼
[Dragon entity disappears]
    │
    ▼
[Broadcast: "§c[RED] §fDragon has been SLAIN!"]
    │
    ▼
[Apply "Dragonless" debuff to all team members:]
    │ - 20% damage reduction
    │ - 10% movement speed reduction
    │
    ▼
[Set team_X_alive = false]
    │
    ▼
[Remove boss health bar]
    │
    ▼
[Call: CheckWinCondition]
```

---

## Dragon Positioning

### Spawn Point Setup

```
Each team base needs:
├── Dragon Spawn Platform (elevated, 5x5 blocks)
├── Clear space above (10 blocks height)
├── Approach paths for attackers
└── Defender positions for team

Platform design:
    ┌───────────────┐
    │   ░░░░░░░░░   │
    │   ░ DRAGON░   │  ← 5x5 platform
    │   ░░░░░░░░░   │
    │               │
    │   DEFENDER    │  ← Team spawn nearby
    │    SPAWNS     │
    └───────────────┘
```

### Dragon Movement

The dragon should stay near its spawn point:

```
Behavior:
- Dragon patrols within 10 blocks of spawn
- Never leaves base area (30 block limit)
- Returns to spawn if somehow moved
- Hovers/flies slightly above ground
```

---

## Implementation Files

### dragon_boss/
```
dragon_boss/
├── dragon_spawn.node       (Spawn sequence)
├── dragon_ai.node          (Main AI controller)
├── dragon_fire_breath.node (Fire attack)
├── dragon_wing_gust.node   (Knockback defense)
├── dragon_tail_swipe.node  (Melee attack)
├── dragon_roar.node        (Buff/debuff ability)
├── dragon_death.node       (Death sequence)
├── dragon_healthbar.node   (Boss bar UI)
└── dragon_config.node      (Constants/settings)
```

### dragon_config.node (Variables)

```
Constants:
├── dragon_max_health: 500
├── dragon_armor: 0.20
├── dragon_regen: 2
├── fire_breath_damage: 6
├── fire_breath_range: 15
├── fire_breath_cooldown: 8
├── wing_gust_knockback: 10
├── wing_gust_range: 8
├── wing_gust_cooldown: 15
├── tail_swipe_damage: 10
├── tail_swipe_range: 5
├── tail_swipe_cooldown: 5
├── roar_buff_strength: 0.20
├── roar_debuff_strength: 0.50
├── roar_range: 20
├── roar_cooldown: 60
└── spawn_protection_duration: 10
```

---

## Testing Checklist

### Spawn Testing
- [ ] Dragon spawns at correct location
- [ ] Spawn animation plays
- [ ] Boss health bar appears
- [ ] Spawn protection works (10 seconds)
- [ ] Broadcast message shows

### Combat Testing
- [ ] Fire Breath:
  - [ ] Cone damage works correctly
  - [ ] Fire particles appear
  - [ ] Ground fire spawns
  - [ ] Cooldown functions
- [ ] Wing Gust:
  - [ ] Triggers at 3+ enemies
  - [ ] Knockback direction is correct
  - [ ] Cooldown functions
- [ ] Tail Swipe:
  - [ ] Detects enemies behind
  - [ ] Damage applies correctly
  - [ ] Cooldown functions
- [ ] Roar:
  - [ ] Triggers at 50% HP
  - [ ] Ally buff applies
  - [ ] Enemy debuff applies
  - [ ] Cooldown functions

### AI Testing
- [ ] Targets nearest enemy
- [ ] Switches to damage source when hit
- [ ] Uses appropriate ability for situation
- [ ] Returns to idle when no enemies
- [ ] Regenerates when idle

### Death Testing
- [ ] Death animation plays
- [ ] Explosion effect appears
- [ ] Boss bar disappears
- [ ] Team gets "Dragonless" debuff
- [ ] Elimination is tracked
- [ ] Win condition checked

---

## Quick Reference

```
╔════════════════════════════════════════╗
║           DRAGON BOSS                  ║
╠════════════════════════════════════════╣
║ Health: 500 HP | Armor: 20%            ║
║ Regen: 2 HP/sec (out of combat)        ║
╠════════════════════════════════════════╣
║ 🔥 FIRE BREATH (8s CD)                 ║
║ • 15 block cone, 6 DMG/sec, 3 sec      ║
║ • Leaves fire on ground                ║
╠════════════════════════════════════════╣
║ 💨 WING GUST (15s CD)                  ║
║ • 8 block radius knockback             ║
║ • Auto-triggers: 3+ enemies close      ║
╠════════════════════════════════════════╣
║ 🦎 TAIL SWIPE (5s CD)                  ║
║ • 5 blocks behind, 10 DMG              ║
║ • Punishes flanking                    ║
╠════════════════════════════════════════╣
║ 📢 ROAR (60s CD)                       ║
║ • Triggers at 50% HP                   ║
║ • Allies: +20% DMG for 10s             ║
║ • Enemies: -50% speed for 5s           ║
╚════════════════════════════════════════╝
```

---

## Notes for Hytale

1. **Dragon Model:**
   - Use existing Hytale dragon if available
   - Scale appropriately for boss size
   - Ensure animations support all attacks

2. **Particle Effects:**
   - Fire breath: Orange/red flame particles
   - Wing gust: White/gray wind particles
   - Tail swipe: Motion blur/swoosh
   - Roar: Shockwave ring

3. **Sound Design:**
   - Fire breath: Crackling flames + dragon grunt
   - Wing gust: Powerful whoosh
   - Tail swipe: Swift swoosh
   - Roar: Deep, echoing roar
   - Death: Pained cry + explosion

4. **Performance:**
   - AI tick every 0.5s (not every frame)
   - Limit particle counts
   - Use efficient area checks

---

*Ready to implement? Start with dragon_config.node, then dragon_spawn.node, then dragon_ai.node!*
