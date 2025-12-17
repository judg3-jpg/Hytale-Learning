# Mega Walls - Hytale Edition
## Game Design Document

---

## 📋 Table of Contents
1. [Game Overview](#game-overview)
2. [Game Phases](#game-phases)
3. [Core Mechanics](#core-mechanics)
4. [Classes Overview](#classes-overview)
5. [Phase 1: Hero Class Design](#phase-1-hero-class)
6. [Phase 1: Dragon Boss Design](#phase-1-dragon-boss)
7. [Node Editor Implementation Guide](#node-editor-implementation)

---

## 🎮 Game Overview

**Mega Walls** is a team-based survival/PvP minigame where 4 teams compete to be the last team standing.

### Key Features:
- **4 Teams** (Red, Blue, Green, Yellow) - up to 12 players each
- **3 Game Phases**: Preparation → Deathmatch → Boss Battle
- **Class System**: Each player selects a class with unique abilities
- **Boss Mechanic**: Each team has a boss (Dragon in our case) that must be protected
- **Win Condition**: Eliminate all enemy team bosses

### Map Layout:
```
    ┌─────────────┬─────────────┐
    │             │             │
    │   BLUE      │    GREEN    │
    │   TEAM      │    TEAM     │
    │   [Dragon]  │   [Dragon]  │
    │             │             │
    ├─────────────┼─────────────┤
    │             │             │
    │   RED       │   YELLOW    │
    │   TEAM      │    TEAM     │
    │   [Dragon]  │   [Dragon]  │
    │             │             │
    └─────────────┴─────────────┘
    
    WALLS separate each quadrant during Preparation Phase
```

---

## ⏱️ Game Phases

### Phase 1: Preparation (20 minutes)
| Aspect | Details |
|--------|---------|
| Duration | 20:00 minutes |
| PvP | DISABLED |
| Walls | UP (teams separated) |
| Boss | NOT SPAWNED |
| Objectives | Gather resources, craft gear, build defenses |

**What players do:**
- Mine ores (iron, gold, diamond equivalents in Hytale)
- Gather wood and stone
- Farm food
- Craft weapons, armor, tools
- Build defensive structures
- Prepare class abilities

### Phase 2: Deathmatch (Walls Fall)
| Aspect | Details |
|--------|---------|
| Duration | Until 1 team remains |
| PvP | ENABLED |
| Walls | DOWN |
| Boss | SPAWNS at each base |
| Objectives | Attack enemies, defend your boss |

**When walls fall:**
1. Announcement: "THE WALLS HAVE FALLEN!"
2. All barriers between quadrants disappear
3. Each team's Dragon Boss spawns at their base
4. PvP is enabled globally
5. Players can now invade other bases

### Phase 3: Boss Hunt
| Aspect | Details |
|--------|---------|
| Trigger | After walls fall |
| Goal | Kill enemy Dragons |
| Elimination | Team loses when their Dragon dies |
| Victory | Last team with living Dragon wins |

---

## ⚙️ Core Mechanics

### Resource Tiers
| Tier | Hytale Equivalent | Use |
|------|-------------------|-----|
| Wood | Wood | Basic tools, structures |
| Stone | Stone | Better tools, walls |
| Iron | Ember Ore (or equivalent) | Iron-tier gear |
| Gold | Gold Ore | Special items |
| Diamond | Cobalt/Mythril | Best gear |

### Combat Stats
- **Health**: Base 20 HP (10 hearts)
- **Armor**: Reduces damage taken
- **Damage**: Weapon-based
- **Regeneration**: Slow passive regen + food

### Class System Basics
Each class has:
1. **Passive Ability** - Always active bonus
2. **Active Skill** - Cooldown-based ability (activated)
3. **Gathering Perk** - Resource gathering bonus
4. **Kit** - Starting equipment

---

## 🎭 Classes Overview

For Phase 1, we're creating the **HERO** class. Future classes can include:
- Warrior (tank)
- Archer (ranged DPS)
- Mage (magic abilities)
- Assassin (stealth/burst)
- Healer (support)
- Engineer (building/traps)

---

## ⚔️ Phase 1: HERO CLASS

### Class Identity
The **Hero** is a legendary warrior class - versatile, powerful, and inspiring to allies. Think of a classic RPG hero with balanced combat abilities and team-boosting effects.

### Hero Class Stats
| Stat | Value | Notes |
|------|-------|-------|
| Base Health | 22 HP | Slightly tankier than average |
| Movement Speed | 100% | Standard |
| Attack Speed | 100% | Standard |
| Armor Bonus | +5% | Passive damage reduction |

---

### 🔷 PASSIVE ABILITY: "Heroic Presence"

**Description:** The Hero inspires nearby allies, granting them combat bonuses.

| Effect | Range | Bonus |
|--------|-------|-------|
| Damage Boost | 10 blocks | +10% damage to nearby allies |
| Damage Resistance | 10 blocks | +5% damage reduction to nearby allies |
| Self Buff | Always | +15% damage when below 50% HP ("Last Stand") |

**Node Editor Logic:**
```
TRIGGER: Every 1 second
├── GET all players within 10 blocks of Hero
├── FOR EACH ally player:
│   ├── IF same team:
│   │   ├── APPLY buff: "Heroic Inspiration"
│   │   └── Duration: 2 seconds
│   └── END IF
└── IF Hero HP < 50%:
    └── APPLY self buff: "Last Stand" (+15% damage)
```

---

### 🔶 ACTIVE SKILL: "Valor Strike"

**Description:** The Hero charges forward, dealing damage to all enemies in their path and stunning them briefly.

| Property | Value |
|----------|-------|
| Cooldown | 25 seconds |
| Damage | 8 HP (4 hearts) |
| Range | 8 blocks dash |
| Stun Duration | 1.5 seconds |
| Width | 3 blocks wide |

**How it works:**
1. Player activates skill (right-click special item or keybind)
2. Hero dashes forward 8 blocks
3. All enemies in path take damage
4. Hit enemies are stunned for 1.5 seconds
5. Visual: Golden particle trail

**Node Editor Logic:**
```
TRIGGER: Player uses "Valor Strike" item
├── CHECK cooldown timer >= 25 seconds
│   ├── IF on cooldown:
│   │   └── DISPLAY message: "Ability on cooldown! X seconds remaining"
│   └── IF ready:
│       ├── SET cooldown = 0
│       ├── GET player facing direction
│       ├── CALCULATE end position (8 blocks forward)
│       ├── SPAWN particles along path (gold/yellow)
│       ├── FOR EACH entity in path (3 block width):
│       │   ├── IF enemy team:
│       │   │   ├── DEAL 8 damage
│       │   │   ├── APPLY stun effect (1.5s)
│       │   │   └── SPAWN hit particles
│       │   └── END IF
│       ├── TELEPORT player to end position
│       └── PLAY sound: heroic_charge.ogg
└── INCREMENT cooldown timer every second
```

---

### 🔷 SECONDARY SKILL: "Rally Cry"

**Description:** The Hero lets out a battle cry, healing allies and removing negative effects.

| Property | Value |
|----------|-------|
| Cooldown | 45 seconds |
| Heal Amount | 6 HP (3 hearts) |
| Range | 15 blocks radius |
| Effect | Removes: Poison, Slowness, Weakness |
| Self Heal | 4 HP (2 hearts) |

**Node Editor Logic:**
```
TRIGGER: Player uses "Rally Cry" item
├── CHECK cooldown >= 45 seconds
├── IF ready:
│   ├── SPAWN circular particle effect (green/gold)
│   ├── PLAY sound: rally_cry.ogg
│   ├── FOR EACH player within 15 blocks:
│   │   ├── IF same team:
│   │   │   ├── HEAL 6 HP
│   │   │   ├── REMOVE negative effects
│   │   │   └── SPAWN heal particles on player
│   │   └── END IF
│   ├── HEAL self 4 HP
│   └── RESET cooldown
└── END
```

---

### 🟢 GATHERING PERK: "Veteran Explorer"

**Description:** The Hero has experience from many adventures, improving resource gathering.

| Bonus | Effect |
|-------|--------|
| Mining Speed | +15% faster |
| Double Drop Chance | 10% chance for ores |
| Mob Loot | +20% extra drops from mobs |

---

### 📦 STARTING KIT

| Item | Quantity | Notes |
|------|----------|-------|
| Wooden Sword | 1 | Starting weapon |
| Wooden Pickaxe | 1 | Mining tool |
| Bread | 8 | Food supply |
| Valor Strike Orb | 1 | Activates primary skill |
| Rally Cry Horn | 1 | Activates secondary skill |
| Leather Boots | 1 | Slight protection |

---

### 🎨 Hero Visual Design

**Appearance Suggestions for Hytale:**
- Golden/brass armor trim
- Cape or cloak (red/gold colors)
- Glowing eyes effect when abilities active
- Heroic stance idle animation

**Particle Effects:**
| Ability | Particle Type | Color |
|---------|---------------|-------|
| Heroic Presence | Subtle aura | Gold/White |
| Valor Strike | Dash trail | Bright Gold |
| Rally Cry | Expanding ring | Green/Gold |
| Last Stand | Fire-like aura | Orange/Red |

---

## 🐉 Phase 1: DRAGON BOSS

### Boss Identity
The Dragon serves as each team's "Wither" equivalent - a powerful boss that must be protected. When your Dragon dies, your team is eliminated.

### Dragon Stats
| Stat | Value | Notes |
|------|-------|-------|
| Health | 500 HP | Substantial health pool |
| Armor | 20% damage reduction | Tanky |
| Regen | 2 HP/second | When not in combat |
| Size | Large | Intimidating presence |

---

### 🔥 Dragon Abilities

#### 1. Fire Breath (Primary Attack)
| Property | Value |
|----------|-------|
| Damage | 6 HP per second |
| Range | 15 blocks cone |
| Duration | 3 seconds |
| Cooldown | 8 seconds |
| Effect | Leaves fire on ground (2 seconds) |

**Behavior:**
- Dragon targets nearest enemy
- Breathes fire in cone shape
- Ground burns for 2 seconds after

#### 2. Wing Gust (Defensive)
| Property | Value |
|----------|-------|
| Knockback | 10 blocks |
| Range | 360° around dragon |
| Cooldown | 15 seconds |
| Trigger | When 3+ enemies nearby |

**Behavior:**
- Dragon flaps wings powerfully
- All nearby enemies knocked back
- Prevents being swarmed

#### 3. Tail Swipe (Melee)
| Property | Value |
|----------|-------|
| Damage | 10 HP |
| Range | 5 blocks behind dragon |
| Cooldown | 5 seconds |
| Trigger | Enemy behind dragon |

**Behavior:**
- Dragon swipes tail at enemies behind it
- High damage, punishes flanking

#### 4. Roar (Buff/Debuff)
| Property | Value |
|----------|-------|
| Ally Buff | +20% damage for 10 seconds |
| Enemy Debuff | Fear (slowness) for 5 seconds |
| Range | 20 blocks |
| Cooldown | 60 seconds |
| Trigger | Dragon below 50% HP |

---

### 🎯 Dragon AI Behavior

**Priority System:**
```
1. HIGHEST: Attack player actively damaging dragon
2. HIGH: Attack nearest enemy within 15 blocks
3. MEDIUM: Use Wing Gust if surrounded (3+ enemies)
4. LOW: Idle/patrol around spawn point
5. LOWEST: Regenerate health when no enemies nearby
```

**Node Editor AI Logic:**
```
TRIGGER: Every 0.5 seconds (AI tick)
├── GET all enemy players within 30 blocks
├── IF dragon taking damage:
│   └── SET target = player dealing damage
├── ELSE IF enemies within 15 blocks:
│   └── SET target = nearest enemy
│
├── IF target exists:
│   ├── FACE target
│   ├── IF target distance < 5 blocks AND behind dragon:
│   │   └── USE Tail Swipe
│   ├── ELSE IF target distance < 15 blocks:
│   │   └── USE Fire Breath (if off cooldown)
│   └── IF enemy count >= 3 within 8 blocks:
│       └── USE Wing Gust
│
├── IF dragon HP < 50% AND Roar off cooldown:
│   └── USE Roar
│
└── IF no enemies nearby for 10 seconds:
    └── ENABLE health regeneration
```

---

### 🏠 Dragon Spawn Behavior

**Spawn Conditions:**
1. Walls fall (Phase 2 begins)
2. Dragon spawns at designated platform in base
3. Dragon is invulnerable for 10 seconds (spawn protection)
4. Announcement: "[TEAM] Dragon has awakened!"

**Death Behavior:**
1. Dragon HP reaches 0
2. Dragon plays death animation (3 seconds)
3. Explosion effect
4. Announcement: "[TEAM] Dragon has been slain!"
5. All team members receive "Dragonless" debuff:
   - -20% damage
   - -10% movement speed
6. Team marked for elimination (cannot win)

---

## 🔧 Node Editor Implementation Guide

### Getting Started in Hytale Asset Editor

#### Step 1: Create Game Controller
```
Entity: "MegaWalls_GameController"
Type: Invisible/Logic Entity
Purpose: Manages game state, timers, team data
```

#### Step 2: Create Variables (Game State)
```
Variables to create:
├── game_phase (integer): 0=Lobby, 1=Prep, 2=Deathmatch, 3=Ended
├── prep_timer (integer): 1200 (20 minutes in seconds)
├── team_red_alive (boolean): true
├── team_blue_alive (boolean): true
├── team_green_alive (boolean): true
├── team_yellow_alive (boolean): true
├── walls_status (boolean): true (up) / false (down)
└── winner_team (string): ""
```

#### Step 3: Main Game Loop
```
Node Graph: "GameLoop"

[On Game Start]
    │
    ▼
[Set game_phase = 1 (Preparation)]
    │
    ▼
[Start Prep Timer (1200 seconds)]
    │
    ▼
[Every 1 Second] ──────────────────┐
    │                              │
    ▼                              │
[Decrement prep_timer]             │
    │                              │
    ▼                              │
[IF prep_timer <= 0] ───No────────►│
    │                              │
    Yes                            │
    ▼                              │
[Call: WallsFall]                  │
    │                              │
    ▼                              │
[Set game_phase = 2]               │
    │                              │
    ▼                              │
[Spawn All Dragons]                │
    │                              │
    ▼                              │
[Enable PvP]◄──────────────────────┘
```

#### Step 4: Hero Class Node Graph

**File: "HeroClass_Abilities"**

```
=== PASSIVE: Heroic Presence ===

[Every 1 Second]
    │
    ▼
[Get Player Position]
    │
    ▼
[Find All Players in 10 Block Radius]
    │
    ▼
[For Each Player Found]
    │
    ├──► [IF Same Team]
    │        │
    │        ▼
    │    [Apply Buff: +10% Damage, 2 sec duration]
    │
    └──► [IF Player (self) HP < 50%]
             │
             ▼
         [Apply Self Buff: +15% Damage]


=== ACTIVE: Valor Strike ===

[On Item Use: "Valor Strike Orb"]
    │
    ▼
[Check Variable: valor_cooldown >= 25]
    │
    ├──No──► [Send Message: "On cooldown!"]
    │
    Yes
    │
    ▼
[Set valor_cooldown = 0]
    │
    ▼
[Get Player Facing Direction]
    │
    ▼
[Calculate Dash End Point (8 blocks)]
    │
    ▼
[Spawn Particle Trail: Gold]
    │
    ▼
[Raycast/Area Check for Entities in Path]
    │
    ▼
[For Each Entity Hit]
    │
    ├──► [IF Enemy Team]
    │        │
    │        ▼
    │    [Deal 8 Damage]
    │        │
    │        ▼
    │    [Apply Stun: 1.5 seconds]
    │
    └──► [Continue to next entity]
    
[After Loop]
    │
    ▼
[Teleport Player to End Point]
    │
    ▼
[Play Sound: "heroic_charge"]


=== SECONDARY: Rally Cry ===

[On Item Use: "Rally Cry Horn"]
    │
    ▼
[Check Variable: rally_cooldown >= 45]
    │
    ├──No──► [Send Message: "On cooldown!"]
    │
    Yes
    │
    ▼
[Set rally_cooldown = 0]
    │
    ▼
[Spawn Expanding Ring Particle Effect]
    │
    ▼
[Play Sound: "rally_cry"]
    │
    ▼
[Find All Players in 15 Block Radius]
    │
    ▼
[For Each Player]
    │
    ├──► [IF Same Team]
    │        │
    │        ▼
    │    [Heal 6 HP]
    │        │
    │        ▼
    │    [Remove Negative Effects]
    │
    └──► [Heal Self 4 HP]
```

#### Step 5: Dragon Boss Node Graph

**File: "DragonBoss_AI"**

```
=== DRAGON AI CONTROLLER ===

[Every 0.5 Seconds]
    │
    ▼
[Get All Entities in 30 Block Radius]
    │
    ▼
[Filter: Enemy Team Players Only]
    │
    ▼
[IF Dragon Taking Damage]
    │   │
    │   ▼
    │   [Set Target = Damage Source]
    │
    └──► [ELSE: Set Target = Nearest Enemy]

[IF Target Exists]
    │
    ▼
[Rotate to Face Target]
    │
    ▼
[Get Target Distance]
    │
    ├──► [IF Distance < 5 AND Behind Dragon]
    │        │
    │        ▼
    │    [Call: TailSwipe]
    │
    ├──► [ELSE IF Distance < 15]
    │        │
    │        ▼
    │    [Call: FireBreath]
    │
    └──► [IF Enemy Count >= 3 in 8 blocks]
             │
             ▼
         [Call: WingGust]

[IF Dragon HP < 250 (50%)]
    │
    ▼
[Call: Roar (if off cooldown)]


=== FIRE BREATH ===

[Function: FireBreath]
    │
    ▼
[Check Cooldown >= 8 seconds]
    │
    ▼
[Play Animation: "fire_breath"]
    │
    ▼
[Spawn Cone Particle Effect (15 blocks)]
    │
    ▼
[For 3 Seconds, Every 0.5 Seconds]
    │
    ▼
[Deal 3 Damage to Entities in Cone]
    │
    ▼
[Spawn Fire Blocks on Ground (2 sec duration)]


=== DRAGON DEATH ===

[On Dragon HP <= 0]
    │
    ▼
[Play Animation: "death"]
    │
    ▼
[Wait 3 Seconds]
    │
    ▼
[Spawn Explosion Particles]
    │
    ▼
[Broadcast: "{Team} Dragon has been slain!"]
    │
    ▼
[Set team_X_alive = false]
    │
    ▼
[Apply Debuff to Team: -20% damage, -10% speed]
    │
    ▼
[Call: CheckWinCondition]
```

---

## 📁 File Structure for Hytale

```
hytale-mega-walls/
├── assets/
│   ├── models/
│   │   ├── dragon_boss.model
│   │   └── hero_items/
│   │       ├── valor_orb.model
│   │       └── rally_horn.model
│   ├── particles/
│   │   ├── gold_trail.particle
│   │   ├── heal_ring.particle
│   │   └── fire_breath.particle
│   └── sounds/
│       ├── heroic_charge.ogg
│       ├── rally_cry.ogg
│       ├── dragon_roar.ogg
│       └── dragon_fire.ogg
├── scripts/
│   ├── game_controller.node
│   ├── hero_class.node
│   ├── dragon_boss.node
│   └── team_manager.node
└── prefabs/
    ├── spawn_platform_red.prefab
    ├── spawn_platform_blue.prefab
    ├── spawn_platform_green.prefab
    ├── spawn_platform_yellow.prefab
    └── dragon_spawn_point.prefab
```

---

## 🎯 Implementation Phases

### Phase 1 (Current) - Core Foundation
- [x] Game design document
- [ ] Hero class implementation
- [ ] Dragon boss implementation
- [ ] Basic game loop (prep phase only)

### Phase 2 - Full Game Loop
- [ ] Walls fall mechanic
- [ ] Team elimination system
- [ ] Win condition detection
- [ ] Basic UI (timers, team status)

### Phase 3 - Polish & Balance
- [ ] Balance testing
- [ ] Visual effects
- [ ] Sound design
- [ ] Additional classes

---

## 📝 Notes for Hytale Implementation

1. **Node Editor Tips:**
   - Use variables for cooldowns (increment every second)
   - Use triggers for ability activation
   - Use area/raycast for detecting entities
   - Use prefabs for spawn points

2. **Testing Checklist:**
   - [ ] Hero passive affects nearby allies
   - [ ] Valor Strike travels correct distance
   - [ ] Valor Strike hits enemies in path
   - [ ] Rally Cry heals in radius
   - [ ] Dragon attacks enemies
   - [ ] Dragon uses abilities correctly
   - [ ] Dragon death eliminates team

3. **Known Hytale Limitations to Consider:**
   - Check if cone-shaped damage areas are supported
   - Verify stun effect implementation
   - Test dash/teleport mechanics

---

*Document Version: 1.0*
*Created for Hytale Mega Walls Project*
