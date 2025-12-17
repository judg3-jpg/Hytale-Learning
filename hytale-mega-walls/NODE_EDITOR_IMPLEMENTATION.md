# Mega Walls - Node Editor Implementation Guide

## Complete Step-by-Step Instructions for Hytale Node Editor

---

# PART 1: SETUP & VARIABLES

## Step 1.1: Create the Main Script

1. Open **Node Editor** in Hytale
2. Create a new script called `MegaWalls_Main`
3. This will be your game controller

---

## Step 1.2: Create Global Variables

In your `MegaWalls_Main` script, create these variables:

### Game State Variables
```
Variable Name         | Type      | Default Value
---------------------|-----------|---------------
game_phase           | Integer   | 0
prep_timer           | Integer   | 1200
walls_are_up         | Boolean   | true
game_started         | Boolean   | false
```

### Team Status Variables
```
Variable Name         | Type      | Default Value
---------------------|-----------|---------------
team_red_alive       | Boolean   | true
team_blue_alive      | Boolean   | true
team_green_alive     | Boolean   | true
team_yellow_alive    | Boolean   | true
```

### How to create variables in Node Editor:
1. Right-click in empty space
2. Select "Create Variable" or "Add Variable"
3. Name it exactly as shown above
4. Set the type (Integer, Boolean, etc.)
5. Set the default value

---

# PART 2: HERO CLASS IMPLEMENTATION

## Step 2.1: Create Hero Script

1. Create new script: `Hero_Class`
2. This script attaches to players who select Hero

---

## Step 2.2: Hero Variables

Create these variables in `Hero_Class`:

```
Variable Name         | Type      | Default Value
---------------------|-----------|---------------
valor_cooldown       | Float     | 0
rally_cooldown       | Float     | 0
is_hero              | Boolean   | false
hero_max_health      | Integer   | 22
```

---

## Step 2.3: Hero Initialization

### Node Graph: "On Player Becomes Hero"

```
┌─────────────────────────────────────────────────────────────┐
│ TRIGGER: On Script Start / On Class Selected                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SET VARIABLE: is_hero = true                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SET VARIABLE: valor_cooldown = 25  (starts ready)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SET VARIABLE: rally_cooldown = 45  (starts ready)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SET PLAYER MAX HEALTH: 22                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ GIVE ITEM: Wooden Sword (slot 0)                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ GIVE ITEM: Wooden Pickaxe (slot 1)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ GIVE ITEM: Bread x8 (slot 2)                                │
└─────────────────────────────────────────────────────────────┘
```

### Step-by-step to build this:

1. **Add Trigger Node**: "On Script Start" or "On Event" (class selection)
2. **Connect to**: Set Variable node → set `is_hero` to `true`
3. **Connect to**: Set Variable node → set `valor_cooldown` to `25`
4. **Connect to**: Set Variable node → set `rally_cooldown` to `45`
5. **Connect to**: Set Player Property node → set "Max Health" to `22`
6. **Connect to**: Give Item node → "Wooden Sword", slot 0
7. **Connect to**: Give Item node → "Wooden Pickaxe", slot 1
8. **Connect to**: Give Item node → "Bread", quantity 8, slot 2

---

## Step 2.4: Cooldown Timer System

### Node Graph: "Cooldown Tick"

```
┌─────────────────────────────────────────────────────────────┐
│ TRIGGER: On Tick / Every Frame / Update                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ GET VARIABLE: valor_cooldown                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ BRANCH: valor_cooldown < 25 ?                               │
└─────────────────────────────────────────────────────────────┘
                    │                    │
                   YES                   NO
                    │                    │
                    ▼                    ▼
┌──────────────────────────┐    ┌──────────────────┐
│ MATH: valor_cooldown +   │    │ (do nothing)     │
│       delta_time         │    └──────────────────┘
│ SET: valor_cooldown      │
└──────────────────────────┘
                    │
                    ▼
        (Same logic for rally_cooldown)
```

### Step-by-step:

1. **Add Trigger**: "On Tick" or "On Update" (runs every frame)
2. **Add Get Variable**: Get `valor_cooldown`
3. **Add Branch/Condition**: Check if `valor_cooldown < 25`
4. **If TRUE**: Add Math node → `valor_cooldown + delta_time`
5. **Connect to**: Set Variable → update `valor_cooldown`
6. **Repeat** for `rally_cooldown` (checking < 45)

**Note**: `delta_time` is the time since last frame. If your Node Editor doesn't have this, use a repeating timer (every 0.1 seconds) and add 0.1 instead.

---

## Step 2.5: Valor Strike Ability

### Node Graph: "Valor Strike"

```
┌─────────────────────────────────────────────────────────────┐
│ TRIGGER: On Key Press [Q] or On Item Use "Valor Orb"        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ GET VARIABLE: valor_cooldown                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ BRANCH: valor_cooldown >= 25 ?                              │
└─────────────────────────────────────────────────────────────┘
            │                                    │
           NO                                   YES
            │                                    │
            ▼                                    ▼
┌─────────────────────┐         ┌─────────────────────────────┐
│ SHOW MESSAGE:       │         │ SET VARIABLE:               │
│ "Cooldown! Wait X"  │         │ valor_cooldown = 0          │
└─────────────────────┘         └─────────────────────────────┘
                                                 │
                                                 ▼
                                ┌─────────────────────────────┐
                                │ GET: Player Position        │
                                └─────────────────────────────┘
                                                 │
                                                 ▼
                                ┌─────────────────────────────┐
                                │ GET: Player Look Direction  │
                                │ (horizontal only)           │
                                └─────────────────────────────┘
                                                 │
                                                 ▼
                                ┌─────────────────────────────┐
                                │ MATH: Calculate End Point   │
                                │ end = position + (dir * 8)  │
                                └─────────────────────────────┘
                                                 │
                                                 ▼
                                ┌─────────────────────────────┐
                                │ SPAWN PARTICLES:            │
                                │ Gold trail from start→end   │
                                └─────────────────────────────┘
                                                 │
                                                 ▼
                                ┌─────────────────────────────┐
                                │ PLAY SOUND: "dash_sound"    │
                                └─────────────────────────────┘
                                                 │
                                                 ▼
                                ┌─────────────────────────────┐
                                │ GET ALL ENTITIES:           │
                                │ In box/sphere along path    │
                                └─────────────────────────────┘
                                                 │
                                                 ▼
                                ┌─────────────────────────────┐
                                │ FOR EACH: entity in list    │
                                └─────────────────────────────┘
                                                 │
                                                 ▼
                                ┌─────────────────────────────┐
                                │ BRANCH: Is entity enemy?    │
                                └─────────────────────────────┘
                                        │              │
                                       YES             NO
                                        │              │
                                        ▼              ▼
                                ┌──────────────┐  (skip)
                                │ DAMAGE: 8 HP │
                                └──────────────┘
                                        │
                                        ▼
                                ┌─────────────────────────────┐
                                │ APPLY EFFECT: Slowness 100% │
                                │ Duration: 1.5 seconds       │
                                │ (This simulates stun)       │
                                └─────────────────────────────┘
                                        │
                                        ▼
                                   (end for each)
                                        │
                                        ▼
                                ┌─────────────────────────────┐
                                │ TELEPORT PLAYER: to end pos │
                                └─────────────────────────────┘
```

### Step-by-step to build:

1. **Add Trigger**: "On Key Press" → Key: Q (or your preferred key)
2. **Add Get Variable**: `valor_cooldown`
3. **Add Branch**: Condition `valor_cooldown >= 25`

**If NO (on cooldown):**
4. **Add Display Message**: "Ability on cooldown!"

**If YES (ready):**
5. **Add Set Variable**: `valor_cooldown = 0`
6. **Add Get Player Position**: Store in temp variable `start_pos`
7. **Add Get Player Look Direction**: Store in `look_dir`
8. **Add Math nodes**:
   - Multiply `look_dir` by 8
   - Add result to `start_pos` = `end_pos`
9. **Add Spawn Particle**: Type "trail" or "spark", from `start_pos` to `end_pos`
10. **Add Play Sound**: Choose a dash/whoosh sound
11. **Add Get Entities in Area**: 
    - Use sphere or box shape
    - Center between `start_pos` and `end_pos`
    - Radius: ~4 blocks
12. **Add For Each Loop**: Iterate through found entities
13. **Inside loop - Add Branch**: Check if entity's team ≠ player's team
14. **If enemy - Add Damage**: Deal 8 damage to entity
15. **Add Apply Effect**: "Slowness" at 100% (or max level) for 1.5 seconds
16. **After loop - Add Teleport**: Move player to `end_pos`

---

## Step 2.6: Rally Cry Ability

### Node Graph: "Rally Cry"

```
┌─────────────────────────────────────────────────────────────┐
│ TRIGGER: On Key Press [E] or On Item Use "Rally Horn"       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ BRANCH: rally_cooldown >= 45 ?                              │
└─────────────────────────────────────────────────────────────┘
            │                                    │
           NO                                   YES
            │                                    │
            ▼                                    ▼
┌─────────────────────┐         ┌─────────────────────────────┐
│ SHOW MESSAGE:       │         │ SET: rally_cooldown = 0     │
│ "Cooldown!"         │         └─────────────────────────────┘
└─────────────────────┘                          │
                                                 ▼
                                ┌─────────────────────────────┐
                                │ GET: Player Position        │
                                └─────────────────────────────┘
                                                 │
                                                 ▼
                                ┌─────────────────────────────┐
                                │ SPAWN PARTICLES:            │
                                │ Green ring expanding        │
                                └─────────────────────────────┘
                                                 │
                                                 ▼
                                ┌─────────────────────────────┐
                                │ PLAY SOUND: "heal_sound"    │
                                └─────────────────────────────┘
                                                 │
                                                 ▼
                                ┌─────────────────────────────┐
                                │ GET ALL ENTITIES:           │
                                │ Radius: 15 blocks           │
                                │ Type: Players               │
                                └─────────────────────────────┘
                                                 │
                                                 ▼
                                ┌─────────────────────────────┐
                                │ FOR EACH: player in list    │
                                └─────────────────────────────┘
                                                 │
                                                 ▼
                                ┌─────────────────────────────┐
                                │ BRANCH: Same team as caster?│
                                └─────────────────────────────┘
                                        │              │
                                       YES             NO
                                        │              │
                                        ▼              ▼
                                ┌──────────────┐  (skip)
                                │ HEAL: 6 HP   │
                                └──────────────┘
                                        │
                                        ▼
                                ┌─────────────────────────────┐
                                │ REMOVE EFFECT: Poison       │
                                │ REMOVE EFFECT: Slowness     │
                                │ REMOVE EFFECT: Weakness     │
                                └─────────────────────────────┘
                                        │
                                        ▼
                                   (end for each)
                                        │
                                        ▼
                                ┌─────────────────────────────┐
                                │ HEAL SELF: 4 HP             │
                                └─────────────────────────────┘
```

### Step-by-step:

1. **Add Trigger**: "On Key Press" → Key: E
2. **Add Branch**: `rally_cooldown >= 45`

**If NO:** Display "Cooldown!" message

**If YES:**
3. **Add Set Variable**: `rally_cooldown = 0`
4. **Add Get Player Position**
5. **Add Spawn Particle**: Green/healing particles in ring shape
6. **Add Play Sound**: Healing or horn sound
7. **Add Get Entities in Area**: Sphere, radius 15, filter "Players"
8. **Add For Each Loop**
9. **Inside loop - Branch**: Check if `entity.team == player.team`
10. **If same team - Add Heal**: Heal entity for 6 HP
11. **Add Remove Effect** nodes for: Poison, Slowness, Weakness
12. **After loop - Add Heal**: Heal self (the caster) for 4 HP

---

## Step 2.7: Heroic Presence (Passive Aura)

### Node Graph: "Heroic Presence Tick"

```
┌─────────────────────────────────────────────────────────────┐
│ TRIGGER: On Tick / Every 1 Second (use timer)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ BRANCH: is_hero == true ?                                   │
└─────────────────────────────────────────────────────────────┘
            │                                    │
           NO                                   YES
            │                                    │
           (exit)                                ▼
                                ┌─────────────────────────────┐
                                │ GET: Player Position        │
                                └─────────────────────────────┘
                                                 │
                                                 ▼
                                ┌─────────────────────────────┐
                                │ GET ALL PLAYERS:            │
                                │ Radius: 10 blocks           │
                                └─────────────────────────────┘
                                                 │
                                                 ▼
                                ┌─────────────────────────────┐
                                │ FOR EACH: ally in list      │
                                └─────────────────────────────┘
                                                 │
                                                 ▼
                                ┌─────────────────────────────┐
                                │ BRANCH: Same team?          │
                                │ AND: Not self?              │
                                └─────────────────────────────┘
                                        │              │
                                       YES             NO
                                        │              │
                                        ▼              ▼
                                ┌──────────────┐  (skip)
                                │ APPLY EFFECT:│
                                │ "Strength"   │
                                │ Level: 1     │
                                │ Duration: 2s │
                                └──────────────┘
                                        │
                                        ▼
                                   (end for each)
                                        │
                                        ▼
                    ┌─────────────────────────────────────────┐
                    │ GET: Player Current Health              │
                    │ GET: Player Max Health                  │
                    └─────────────────────────────────────────┘
                                        │
                                        ▼
                    ┌─────────────────────────────────────────┐
                    │ BRANCH: current_health < max_health/2 ? │
                    └─────────────────────────────────────────┘
                                │              │
                               YES             NO
                                │              │
                                ▼              ▼
                    ┌──────────────────┐   (skip)
                    │ APPLY EFFECT:    │
                    │ "Strength"       │
                    │ Level: 2         │
                    │ Duration: 2s     │
                    │ (to self)        │
                    └──────────────────┘
```

### Step-by-step:

1. **Create a Timer**: Set to repeat every 1 second
2. **Add Branch**: Check `is_hero == true`
3. **Add Get Player Position**
4. **Add Get Entities**: Players within 10 block radius
5. **Add For Each Loop**
6. **Inside loop**:
   - **Branch**: Check same team AND not self
   - **If true**: Apply "Strength" effect, level 1, duration 2 seconds
7. **After loop**:
   - **Get** player's current and max health
   - **Branch**: Check if `current < max / 2`
   - **If true**: Apply "Strength" level 2 to self for 2 seconds

---

# PART 3: DRAGON BOSS IMPLEMENTATION

## Step 3.1: Create Dragon Script

1. Create new script: `Dragon_Boss`
2. This script attaches to the Dragon entity

---

## Step 3.2: Dragon Variables

```
Variable Name         | Type      | Default Value
---------------------|-----------|---------------
dragon_health        | Integer   | 500
dragon_max_health    | Integer   | 500
dragon_team          | String    | "red"
fire_cooldown        | Float     | 0
gust_cooldown        | Float     | 0
tail_cooldown        | Float     | 0
roar_cooldown        | Float     | 0
current_target       | Entity    | null
is_in_combat         | Boolean   | false
combat_timer         | Float     | 0
```

---

## Step 3.3: Dragon Spawn

### Node Graph: "Dragon Spawn"

```
┌─────────────────────────────────────────────────────────────┐
│ TRIGGER: On Entity Spawn / On Script Start                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SET: dragon_health = 500                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SET: All cooldowns to max (ready to use)                    │
│ fire_cooldown = 8                                           │
│ gust_cooldown = 15                                          │
│ tail_cooldown = 5                                           │
│ roar_cooldown = 60                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SPAWN PARTICLES: Dragon emergence effect                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PLAY SOUND: "dragon_roar"                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ BROADCAST MESSAGE: "[TEAM] Dragon has awakened!"            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SET: Invulnerable = true (spawn protection)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ WAIT: 10 seconds                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SET: Invulnerable = false                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 3.4: Dragon AI Main Loop

### Node Graph: "Dragon AI Tick"

```
┌─────────────────────────────────────────────────────────────┐
│ TRIGGER: On Tick / Every 0.5 Seconds                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ UPDATE ALL COOLDOWNS: add delta_time to each                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ GET ALL ENTITIES: within 30 blocks, type: Player            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ FILTER: Keep only enemy team players                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ BRANCH: Any enemies found?                                  │
└─────────────────────────────────────────────────────────────┘
            │                                    │
           NO                                   YES
            │                                    │
            ▼                                    ▼
┌─────────────────────┐     ┌─────────────────────────────────┐
│ Call: IdleBehavior  │     │ SET: current_target = nearest   │
└─────────────────────┘     │      enemy from list            │
                            └─────────────────────────────────┘
                                                 │
                                                 ▼
                            ┌─────────────────────────────────┐
                            │ SET: is_in_combat = true        │
                            │ SET: combat_timer = 0           │
                            └─────────────────────────────────┘
                                                 │
                                                 ▼
                            ┌─────────────────────────────────┐
                            │ ROTATE: Face current_target     │
                            └─────────────────────────────────┘
                                                 │
                                                 ▼
                            ┌─────────────────────────────────┐
                            │ Call: SelectAndUseAbility       │
                            └─────────────────────────────────┘
```

---

## Step 3.5: Dragon Ability Selection

### Node Graph: "Select And Use Ability"

```
┌─────────────────────────────────────────────────────────────┐
│ GET: Distance to current_target                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ COUNT: Enemies within 8 blocks                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ CHECK: Is target behind dragon?                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ BRANCH: enemy_count >= 3 AND gust_cooldown >= 15?           │
└─────────────────────────────────────────────────────────────┘
            │                                    │
           YES                                   NO
            │                                    │
            ▼                                    ▼
┌─────────────────────┐     ┌─────────────────────────────────┐
│ Call: WingGust      │     │ BRANCH: target_behind AND       │
└─────────────────────┘     │         tail_cooldown >= 5?     │
                            └─────────────────────────────────┘
                                        │              │
                                       YES             NO
                                        │              │
                                        ▼              ▼
                            ┌──────────────┐  ┌───────────────┐
                            │Call:TailSwipe│  │BRANCH: dist<15│
                            └──────────────┘  │AND fire_cd>=8?│
                                              └───────────────┘
                                                   │       │
                                                  YES      NO
                                                   │       │
                                                   ▼       ▼
                                          ┌────────────┐ (wait)
                                          │Call:       │
                                          │FireBreath  │
                                          └────────────┘
```

---

## Step 3.6: Fire Breath Ability

### Node Graph: "Fire Breath"

```
┌─────────────────────────────────────────────────────────────┐
│ SET: fire_cooldown = 0                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PLAY ANIMATION: "fire_breath" (if available)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PLAY SOUND: "fire_breath_sound"                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ GET: Dragon position and facing direction                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ LOOP: 6 times (with 0.5s delay between each)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
            ┌─────────────────────────────────────┐
            │ SPAWN PARTICLES: Fire cone effect   │
            │ Start: dragon position              │
            │ Direction: facing                   │
            │ Length: 15 blocks                   │
            └─────────────────────────────────────┘
                              │
                              ▼
            ┌─────────────────────────────────────┐
            │ GET ENTITIES: In cone area          │
            │ (Use box or multiple spheres        │
            │  in front of dragon)                │
            └─────────────────────────────────────┘
                              │
                              ▼
            ┌─────────────────────────────────────┐
            │ FOR EACH: entity in cone            │
            └─────────────────────────────────────┘
                              │
                              ▼
            ┌─────────────────────────────────────┐
            │ BRANCH: Is enemy team?              │
            └─────────────────────────────────────┘
                    │                    │
                   YES                   NO
                    │                    │
                    ▼                    ▼
            ┌──────────────┐        (skip)
            │ DAMAGE: 3 HP │
            │ (3 per tick  │
            │  = 18 total) │
            └──────────────┘
                    │
                    ▼
            ┌─────────────────────────────────────┐
            │ APPLY EFFECT: Fire/Burning (1s)     │
            └─────────────────────────────────────┘
                              │
                              ▼
                    (end loop after 6 iterations)
```

### Cone Detection Simplified:

If your Node Editor doesn't have cone shapes, use this workaround:

```
Instead of a cone, use 3 overlapping spheres:

Sphere 1: 3 blocks in front of dragon, radius 2
Sphere 2: 8 blocks in front of dragon, radius 3  
Sphere 3: 13 blocks in front of dragon, radius 4

Get entities in all 3 spheres = approximate cone
```

---

## Step 3.7: Wing Gust Ability

### Node Graph: "Wing Gust"

```
┌─────────────────────────────────────────────────────────────┐
│ SET: gust_cooldown = 0                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PLAY ANIMATION: "wing_flap"                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PLAY SOUND: "wing_gust_sound"                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SPAWN PARTICLES: Wind ring around dragon                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ GET ALL ENTITIES: within 8 blocks                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ FOR EACH: entity                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ BRANCH: Is enemy?                                           │
└─────────────────────────────────────────────────────────────┘
            │                                    │
           YES                                   NO
            │                                    │
            ▼                                    ▼
┌─────────────────────────────────────┐     (skip)
│ CALCULATE: Direction from dragon    │
│            to entity (away vector)  │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ APPLY VELOCITY: direction * 2.5     │
│ (This launches them away)           │
└─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ DAMAGE: 2 HP (minor)                │
└─────────────────────────────────────┘
```

---

## Step 3.8: Tail Swipe Ability

### Node Graph: "Tail Swipe"

```
┌─────────────────────────────────────────────────────────────┐
│ SET: tail_cooldown = 0                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PLAY ANIMATION: "tail_swipe"                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PLAY SOUND: "tail_swoosh"                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ GET: Dragon's BACK direction (opposite of facing)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ CALCULATE: Area behind dragon                               │
│ Position = dragon_pos + (back_direction * 3)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ GET ENTITIES: In sphere at back position, radius 4          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ FOR EACH: entity in area                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ BRANCH: Is enemy?                                           │
└─────────────────────────────────────────────────────────────┘
            │                                    │
           YES                                   NO
            │                                    │
            ▼                                    ▼
┌─────────────────────┐                     (skip)
│ DAMAGE: 10 HP       │
└─────────────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ APPLY VELOCITY: Sideways knockback  │
└─────────────────────────────────────┘
```

---

## Step 3.9: Dragon Roar Ability

### Node Graph: "Dragon Roar"

```
┌─────────────────────────────────────────────────────────────┐
│ BRANCH: dragon_health < 250 AND roar_cooldown >= 60?        │
└─────────────────────────────────────────────────────────────┘
            │                                    │
           NO                                   YES
            │                                    │
          (exit)                                 ▼
                            ┌─────────────────────────────────┐
                            │ SET: roar_cooldown = 0          │
                            └─────────────────────────────────┘
                                                 │
                                                 ▼
                            ┌─────────────────────────────────┐
                            │ PLAY ANIMATION: "roar"          │
                            └─────────────────────────────────┘
                                                 │
                                                 ▼
                            ┌─────────────────────────────────┐
                            │ PLAY SOUND: "dragon_roar_loud"  │
                            └─────────────────────────────────┘
                                                 │
                                                 ▼
                            ┌─────────────────────────────────┐
                            │ SPAWN PARTICLES: Shockwave ring │
                            └─────────────────────────────────┘
                                                 │
                                                 ▼
                            ┌─────────────────────────────────┐
                            │ CAMERA SHAKE: All players       │
                            │ within 30 blocks                │
                            └─────────────────────────────────┘
                                                 │
                                                 ▼
                            ┌─────────────────────────────────┐
                            │ GET ALL PLAYERS: within 20 blks │
                            └─────────────────────────────────┘
                                                 │
                                                 ▼
                            ┌─────────────────────────────────┐
                            │ FOR EACH: player                │
                            └─────────────────────────────────┘
                                                 │
                                                 ▼
                            ┌─────────────────────────────────┐
                            │ BRANCH: Same team as dragon?    │
                            └─────────────────────────────────┘
                                    │              │
                                   YES             NO (enemy)
                                    │              │
                                    ▼              ▼
                            ┌──────────────┐ ┌──────────────┐
                            │APPLY EFFECT: │ │APPLY EFFECT: │
                            │"Strength" 2  │ │"Slowness" 2  │
                            │Duration: 10s │ │Duration: 5s  │
                            └──────────────┘ └──────────────┘
```

---

## Step 3.10: Dragon Death

### Node Graph: "On Dragon Damaged"

```
┌─────────────────────────────────────────────────────────────┐
│ TRIGGER: On Entity Takes Damage                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ GET: damage_amount from event                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ MATH: Apply armor reduction                                 │
│ actual_damage = damage_amount * 0.8  (20% reduction)        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ MATH: dragon_health = dragon_health - actual_damage         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SET: is_in_combat = true                                    │
│ SET: combat_timer = 0                                       │
│ SET: current_target = damage_source                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ BRANCH: dragon_health <= 0?                                 │
└─────────────────────────────────────────────────────────────┘
            │                                    │
           NO                                   YES
            │                                    │
          (exit)                                 ▼
                            ┌─────────────────────────────────┐
                            │ Call: DragonDeath               │
                            └─────────────────────────────────┘
```

### Node Graph: "Dragon Death"

```
┌─────────────────────────────────────────────────────────────┐
│ PLAY ANIMATION: "death"                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PLAY SOUND: "dragon_death_cry"                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ WAIT: 2 seconds                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SPAWN PARTICLES: Large explosion                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PLAY SOUND: "explosion"                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ BROADCAST MESSAGE: "[TEAM] Dragon has been SLAIN!"          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SET GLOBAL: team_X_alive = false                            │
│ (based on dragon_team variable)                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ GET ALL PLAYERS: On dragon's team                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ FOR EACH: Apply "Weakness" and "Slowness" effects           │
│ (permanent until game ends)                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ DESTROY: Dragon entity                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Call: CheckWinCondition                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 3.11: Dragon Idle & Regeneration

### Node Graph: "Dragon Idle Behavior"

```
┌─────────────────────────────────────────────────────────────┐
│ (Called when no enemies nearby)                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ INCREMENT: combat_timer + delta_time                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ BRANCH: combat_timer > 10? (10 seconds out of combat)       │
└─────────────────────────────────────────────────────────────┘
            │                                    │
           NO                                   YES
            │                                    │
          (wait)                                 ▼
                            ┌─────────────────────────────────┐
                            │ SET: is_in_combat = false       │
                            └─────────────────────────────────┘
                                                 │
                                                 ▼
                            ┌─────────────────────────────────┐
                            │ BRANCH: dragon_health < 500?    │
                            └─────────────────────────────────┘
                                    │              │
                                   YES             NO
                                    │              │
                                    ▼              ▼
                            ┌──────────────┐  (at full HP)
                            │ HEAL: 2 HP   │
                            │ (per second) │
                            └──────────────┘
```

---

# PART 4: WIN CONDITION

## Step 4.1: Check Win Condition

### Node Graph: "Check Win Condition"

```
┌─────────────────────────────────────────────────────────────┐
│ (Called after any dragon dies)                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ COUNT: How many teams still have dragons alive              │
│ alive_count = 0                                             │
│ IF team_red_alive: alive_count + 1, last_team = "Red"       │
│ IF team_blue_alive: alive_count + 1, last_team = "Blue"     │
│ IF team_green_alive: alive_count + 1, last_team = "Green"   │
│ IF team_yellow_alive: alive_count + 1, last_team = "Yellow" │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ BRANCH: alive_count == 1?                                   │
└─────────────────────────────────────────────────────────────┘
            │                                    │
           NO                                   YES
            │                                    │
          (continue                              ▼
           game)            ┌─────────────────────────────────┐
                            │ SET: game_phase = 3 (ended)     │
                            └─────────────────────────────────┘
                                                 │
                                                 ▼
                            ┌─────────────────────────────────┐
                            │ BROADCAST: "[TEAM] WINS!"       │
                            │ with fireworks/effects          │
                            └─────────────────────────────────┘
                                                 │
                                                 ▼
                            ┌─────────────────────────────────┐
                            │ PLAY SOUND: Victory fanfare     │
                            └─────────────────────────────────┘
                                                 │
                                                 ▼
                            ┌─────────────────────────────────┐
                            │ WAIT: 10 seconds                │
                            └─────────────────────────────────┘
                                                 │
                                                 ▼
                            ┌─────────────────────────────────┐
                            │ END GAME / Return to lobby      │
                            └─────────────────────────────────┘
```

---

# QUICK REFERENCE: ALL NODE GRAPHS NEEDED

## Scripts to Create:

```
1. MegaWalls_Main
   └── Contains: Global variables, win condition

2. Hero_Class (attach to hero players)
   ├── Hero_Init
   ├── Hero_Cooldowns
   ├── Hero_ValorStrike
   ├── Hero_RallyCry
   └── Hero_Passive

3. Dragon_Boss (attach to dragon entity)
   ├── Dragon_Spawn
   ├── Dragon_AI_Tick
   ├── Dragon_FireBreath
   ├── Dragon_WingGust
   ├── Dragon_TailSwipe
   ├── Dragon_Roar
   ├── Dragon_OnDamaged
   ├── Dragon_Death
   └── Dragon_Idle
```

---

# STEP-BY-STEP IMPLEMENTATION ORDER

## Day 1: Basic Setup
1. ☐ Create `MegaWalls_Main` script
2. ☐ Add all global variables
3. ☐ Test that script runs

## Day 2: Hero Class - Part 1
4. ☐ Create `Hero_Class` script
5. ☐ Add hero variables
6. ☐ Build `Hero_Init` (gives items, sets health)
7. ☐ Build cooldown timer system
8. ☐ Test: Hero spawns with items

## Day 3: Hero Class - Part 2
9. ☐ Build `Valor Strike` ability
10. ☐ Test: Dash works, damages enemies
11. ☐ Build `Rally Cry` ability
12. ☐ Test: Heals allies in range

## Day 4: Hero Class - Part 3
13. ☐ Build `Heroic Presence` passive
14. ☐ Test: Allies near hero get buff
15. ☐ Test: Last Stand activates at low HP

## Day 5: Dragon - Part 1
16. ☐ Create `Dragon_Boss` script
17. ☐ Add dragon variables
18. ☐ Build `Dragon_Spawn`
19. ☐ Build `Dragon_AI_Tick` (basic targeting)
20. ☐ Test: Dragon spawns and faces enemies

## Day 6: Dragon - Part 2
21. ☐ Build `Fire Breath` ability
22. ☐ Test: Fire damages enemies in front
23. ☐ Build `Wing Gust` ability
24. ☐ Test: Enemies get knocked back

## Day 7: Dragon - Part 3
25. ☐ Build `Tail Swipe` ability
26. ☐ Test: Damages enemies behind
27. ☐ Build `Dragon Roar` ability
28. ☐ Test: Buffs allies, debuffs enemies

## Day 8: Dragon - Part 4
29. ☐ Build `On Damaged` handler
30. ☐ Build `Dragon Death` sequence
31. ☐ Build `Dragon Idle` + regeneration
32. ☐ Test: Dragon dies properly, team debuffed

## Day 9: Win Condition
33. ☐ Build `Check Win Condition`
34. ☐ Test: Game ends when 1 dragon remains
35. ☐ Add victory effects

## Day 10: Polish & Testing
36. ☐ Balance damage numbers
37. ☐ Adjust cooldowns
38. ☐ Add missing particles/sounds
39. ☐ Full playtest!

---

*You now have everything you need to build this in Node Editor!*
*Start with Day 1 tasks and work through systematically.*
