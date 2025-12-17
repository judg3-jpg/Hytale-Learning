# 🚀 Quick Start Guide - Build in Node Editor

Follow these steps EXACTLY in order. Each step builds on the previous one.

---

# PHASE 1: HERO CLASS

## Step 1: Create Your First Script

1. Open **Node Editor** in Hytale
2. Click **"New Script"** or **"Create Script"**
3. Name it: `Hero_Class`
4. Save it

---

## Step 2: Add Variables

In your `Hero_Class` script, add these variables:

| Click "Add Variable" | Set Name | Set Type | Set Default |
|---------------------|----------|----------|-------------|
| + | `valor_cooldown` | Number/Float | `25` |
| + | `rally_cooldown` | Number/Float | `45` |
| + | `is_hero` | Boolean | `true` |

---

## Step 3: Build Hero Initialization

**What we're building:** When a player becomes a Hero, give them items and set their health.

### Nodes to add (connect in order):

```
[1] EVENT: "On Script Start" or "On Spawn"
         |
         ▼
[2] SET VARIABLE → is_hero = true
         |
         ▼
[3] SET PLAYER HEALTH → Max Health = 22
         |
         ▼
[4] GIVE ITEM → "Wooden Sword" to slot 0
         |
         ▼
[5] GIVE ITEM → "Wooden Pickaxe" to slot 1
         |
         ▼
[6] GIVE ITEM → "Bread" quantity 8 to slot 2
```

### How to connect:
- Drag from the **output** (right side) of node 1
- Connect to the **input** (left side) of node 2
- Continue connecting each node in sequence

---

## Step 4: Build Cooldown System

**What we're building:** Cooldowns tick up over time so abilities become ready.

### Nodes to add:

```
[1] EVENT: "On Update" or "On Tick"
         |
         ▼
[2] GET VARIABLE → valor_cooldown
         |
         ▼
[3] COMPARE → valor_cooldown < 25 ?
         |
    YES  |  NO
         ▼
[4] MATH → valor_cooldown + 0.016 (or delta_time)
         |
         ▼
[5] SET VARIABLE → valor_cooldown = (result from math)
```

**Repeat the same for `rally_cooldown` (comparing to 45)**

---

## Step 5: Build Valor Strike (Dash Attack)

**What we're building:** Press Q to dash forward and damage enemies.

### Nodes to add:

```
[1] EVENT: "On Key Press" → Key: Q
         |
         ▼
[2] GET VARIABLE → valor_cooldown
         |
         ▼
[3] COMPARE → valor_cooldown >= 25 ?
         |
    NO   |  YES
    ↓    |
[4a]     |  [4b]
SHOW     |  SET VARIABLE → valor_cooldown = 0
MESSAGE  |       |
"Wait!"  |       ▼
         |  [5] GET PLAYER POSITION → store as "start_pos"
         |       |
         |       ▼
         |  [6] GET PLAYER LOOK DIRECTION → store as "direction"
         |       |
         |       ▼
         |  [7] MATH → direction × 8 = "offset"
         |       |
         |       ▼
         |  [8] MATH → start_pos + offset = "end_pos"
         |       |
         |       ▼
         |  [9] SPAWN PARTICLES → from start_pos to end_pos (gold color)
         |       |
         |       ▼
         |  [10] PLAY SOUND → "whoosh" or dash sound
         |       |
         |       ▼
         |  [11] GET ENTITIES IN AREA → sphere from start to end, radius 3
         |       |
         |       ▼
         |  [12] FOR EACH → entity in list
         |       |
         |       ▼
         |  [13] COMPARE → entity.team ≠ player.team ?
         |       |
         |  YES  |  NO
         |       ↓
         |  [14] DAMAGE ENTITY → 8 damage
         |       |
         |       ▼
         |  [15] APPLY EFFECT → "Slowness" level MAX, duration 1.5s
         |       |
         |       ▼
         |  (end for each)
         |       |
         |       ▼
         |  [16] TELEPORT PLAYER → to end_pos
```

---

## Step 6: Build Rally Cry (Heal Ability)

**What we're building:** Press E to heal nearby allies.

### Nodes to add:

```
[1] EVENT: "On Key Press" → Key: E
         |
         ▼
[2] COMPARE → rally_cooldown >= 45 ?
         |
    NO   |  YES
    ↓    |
[4a]     |  [4b]
MESSAGE  |  SET VARIABLE → rally_cooldown = 0
"Wait!"  |       |
         |       ▼
         |  [5] GET PLAYER POSITION
         |       |
         |       ▼
         |  [6] SPAWN PARTICLES → green ring expanding
         |       |
         |       ▼
         |  [7] PLAY SOUND → healing sound
         |       |
         |       ▼
         |  [8] GET ENTITIES IN AREA → sphere radius 15, type: Players
         |       |
         |       ▼
         |  [9] FOR EACH → player in list
         |       |
         |       ▼
         |  [10] COMPARE → player.team == my team ?
         |       |
         |  YES  |  NO
         |       ↓
         |  [11] HEAL ENTITY → 6 HP
         |       |
         |       ▼
         |  [12] REMOVE EFFECT → "Poison"
         |       |
         |       ▼
         |  [13] REMOVE EFFECT → "Slowness"
         |       |
         |       ▼
         |  (end for each)
         |       |
         |       ▼
         |  [14] HEAL SELF → 4 HP
```

---

## Step 7: Build Heroic Presence (Passive)

**What we're building:** Nearby allies get a damage buff every second.

### Nodes to add:

```
[1] EVENT: "On Timer" → repeat every 1 second
         |
         ▼
[2] GET PLAYER POSITION
         |
         ▼
[3] GET ENTITIES IN AREA → sphere radius 10, type: Players
         |
         ▼
[4] FOR EACH → player in list
         |
         ▼
[5] COMPARE → player.team == my team AND player ≠ self ?
         |
    YES  |  NO
         ↓
[6] APPLY EFFECT → "Strength" level 1, duration 2 seconds
         |
         ▼
    (end for each)
         |
         ▼
[7] GET PLAYER HEALTH → current_health
         |
         ▼
[8] COMPARE → current_health < 11 ? (below 50%)
         |
    YES  |  NO
         ↓
[9] APPLY EFFECT TO SELF → "Strength" level 2, duration 2 seconds
```

---

## ✅ TEST YOUR HERO CLASS

Before continuing, test everything:

1. [ ] Spawn as hero - do you have 22 max health?
2. [ ] Check inventory - sword, pickaxe, bread?
3. [ ] Press Q - do you dash forward?
4. [ ] Press Q again immediately - does it say "cooldown"?
5. [ ] Wait 25 seconds, press Q - does it work again?
6. [ ] Dash into an enemy - do they take damage?
7. [ ] Press E - do allies nearby get healed?
8. [ ] Stand near ally for a few seconds - do they get strength buff?
9. [ ] Get damaged to below half health - do you get strength buff?

---

# PHASE 2: DRAGON BOSS

## Step 8: Create Dragon Script

1. Click **"New Script"**
2. Name it: `Dragon_Boss`
3. This script attaches to the dragon entity/prefab

---

## Step 9: Add Dragon Variables

| Click "Add Variable" | Set Name | Set Type | Set Default |
|---------------------|----------|----------|-------------|
| + | `dragon_health` | Number/Integer | `500` |
| + | `dragon_team` | String | `"red"` |
| + | `fire_cooldown` | Number/Float | `8` |
| + | `gust_cooldown` | Number/Float | `15` |
| + | `tail_cooldown` | Number/Float | `5` |
| + | `roar_cooldown` | Number/Float | `60` |
| + | `current_target` | Entity/Object | `null` |
| + | `combat_timer` | Number/Float | `0` |

---

## Step 10: Dragon Spawn Setup

### Nodes to add:

```
[1] EVENT: "On Script Start" or "On Spawn"
         |
         ▼
[2] SET VARIABLE → dragon_health = 500
         |
         ▼
[3] SET all cooldowns to their max values (ready to use)
         |
         ▼
[4] SPAWN PARTICLES → dramatic spawn effect
         |
         ▼
[5] PLAY SOUND → dragon roar
         |
         ▼
[6] BROADCAST MESSAGE → "Dragon has awakened!"
         |
         ▼
[7] SET PROPERTY → invulnerable = true
         |
         ▼
[8] WAIT → 10 seconds
         |
         ▼
[9] SET PROPERTY → invulnerable = false
```

---

## Step 11: Dragon AI Loop

### Nodes to add:

```
[1] EVENT: "On Update" or "On Timer" (every 0.5 seconds)
         |
         ▼
[2] UPDATE all cooldowns (add delta_time)
         |
         ▼
[3] GET ENTITIES IN AREA → sphere radius 30, type: Players
         |
         ▼
[4] FILTER LIST → keep only enemy team players
         |
         ▼
[5] COMPARE → list length > 0 ?
         |
    NO   |  YES
    ↓    |
[6a]     |  [6b]
(idle)   |  GET NEAREST → from filtered list
         |       |
         |       ▼
         |  [7] SET VARIABLE → current_target = nearest
         |       |
         |       ▼
         |  [8] ROTATE TO FACE → current_target
         |       |
         |       ▼
         |  [9] Call ability selection (Step 12)
```

---

## Step 12: Dragon Ability Selection

### Nodes to add (continue from Step 11):

```
[9] GET DISTANCE → to current_target
         |
         ▼
[10] COUNT ENTITIES → enemies within 8 blocks
         |
         ▼
[11] COMPARE → enemy_count >= 3 AND gust_cooldown >= 15 ?
         |
    YES  |  NO
    ↓    |
[12a]    |  [12b]
CALL:    |  COMPARE → target is behind dragon AND tail_cooldown >= 5 ?
WingGust |       |
         |  YES  |  NO
         |  ↓    |
         | [13a] |  [13b]
         | CALL: |  COMPARE → distance < 15 AND fire_cooldown >= 8 ?
         | Tail  |       |
         | Swipe |  YES  |  NO
         |       |  ↓    |
         |       | [14]  |
         |       | CALL: | (wait for cooldown)
         |       | Fire  |
         |       | Breath|
```

---

## Step 13: Fire Breath Attack

### Nodes to add:

```
[1] (Called from ability selection)
         |
         ▼
[2] SET VARIABLE → fire_cooldown = 0
         |
         ▼
[3] PLAY ANIMATION → "fire_breath" (if available)
         |
         ▼
[4] PLAY SOUND → fire breathing sound
         |
         ▼
[5] GET DRAGON POSITION AND DIRECTION
         |
         ▼
[6] LOOP → 6 times with 0.5 second delay
         |
    (each iteration):
         |
         ▼
[7] SPAWN PARTICLES → fire cone in front of dragon
         |
         ▼
[8] GET ENTITIES IN AREA → Use 3 overlapping spheres:
    - Sphere 1: 3 blocks ahead, radius 2
    - Sphere 2: 8 blocks ahead, radius 3
    - Sphere 3: 13 blocks ahead, radius 4
         |
         ▼
[9] FOR EACH → entity in combined results
         |
         ▼
[10] COMPARE → is enemy team?
         |
    YES  |
         ↓
[11] DAMAGE ENTITY → 3 HP (×6 iterations = 18 total)
         |
         ▼
[12] APPLY EFFECT → "Fire" or burning visual, 1 second
```

---

## Step 14: Wing Gust Attack

### Nodes to add:

```
[1] (Called when 3+ enemies nearby)
         |
         ▼
[2] SET VARIABLE → gust_cooldown = 0
         |
         ▼
[3] PLAY ANIMATION → wing flap
         |
         ▼
[4] PLAY SOUND → wind gust
         |
         ▼
[5] SPAWN PARTICLES → wind ring around dragon
         |
         ▼
[6] GET ENTITIES IN AREA → sphere radius 8
         |
         ▼
[7] FOR EACH → entity
         |
         ▼
[8] COMPARE → is enemy team?
         |
    YES  |
         ↓
[9] GET DIRECTION → from dragon to entity (away from dragon)
         |
         ▼
[10] APPLY VELOCITY → direction × 2.5 (launches them back)
         |
         ▼
[11] DAMAGE ENTITY → 2 HP
```

---

## Step 15: Tail Swipe Attack

### Nodes to add:

```
[1] (Called when enemy is behind dragon)
         |
         ▼
[2] SET VARIABLE → tail_cooldown = 0
         |
         ▼
[3] PLAY ANIMATION → tail swipe
         |
         ▼
[4] PLAY SOUND → swoosh
         |
         ▼
[5] GET DRAGON BACKWARD DIRECTION → opposite of facing
         |
         ▼
[6] CALCULATE POSITION → dragon_pos + (backward × 3)
         |
         ▼
[7] GET ENTITIES IN AREA → sphere at back position, radius 4
         |
         ▼
[8] FOR EACH → entity
         |
         ▼
[9] COMPARE → is enemy team?
         |
    YES  |
         ↓
[10] DAMAGE ENTITY → 10 HP
```

---

## Step 16: Dragon Roar (Emergency)

### Nodes to add:

```
[1] (Check this in AI loop when health < 250)
         |
         ▼
[2] COMPARE → dragon_health < 250 AND roar_cooldown >= 60 ?
         |
    YES  |
         ↓
[3] SET VARIABLE → roar_cooldown = 0
         |
         ▼
[4] PLAY ANIMATION → roar
         |
         ▼
[5] PLAY SOUND → loud roar
         |
         ▼
[6] SPAWN PARTICLES → shockwave ring
         |
         ▼
[7] GET ALL PLAYERS → within 20 blocks
         |
         ▼
[8] FOR EACH → player
         |
         ▼
[9] COMPARE → same team as dragon?
         |
    YES  |  NO
    ↓    |  ↓
[10a]    |  [10b]
APPLY    |  APPLY EFFECT
"Strength"|  "Slowness"
level 2  |  level 2
10 sec   |  5 sec
```

---

## Step 17: Dragon Takes Damage

### Nodes to add:

```
[1] EVENT: "On Entity Damaged" or "On Take Damage"
         |
         ▼
[2] GET → damage amount from event
         |
         ▼
[3] MATH → actual_damage = damage × 0.8 (20% armor reduction)
         |
         ▼
[4] MATH → dragon_health = dragon_health - actual_damage
         |
         ▼
[5] SET VARIABLE → current_target = damage source entity
         |
         ▼
[6] SET VARIABLE → combat_timer = 0 (reset regen timer)
         |
         ▼
[7] COMPARE → dragon_health <= 0 ?
         |
    YES  |
         ↓
[8] CALL → Dragon Death (Step 18)
```

---

## Step 18: Dragon Death

### Nodes to add:

```
[1] (Called when dragon_health <= 0)
         |
         ▼
[2] PLAY ANIMATION → death animation
         |
         ▼
[3] PLAY SOUND → death cry
         |
         ▼
[4] WAIT → 2 seconds
         |
         ▼
[5] SPAWN PARTICLES → explosion
         |
         ▼
[6] PLAY SOUND → explosion
         |
         ▼
[7] BROADCAST MESSAGE → "[TEAM] Dragon has been SLAIN!"
         |
         ▼
[8] GET ALL PLAYERS → on dragon's team
         |
         ▼
[9] FOR EACH → player
         |
         ▼
[10] APPLY EFFECT → "Weakness" permanent
         |
         ▼
[11] APPLY EFFECT → "Slowness" permanent
         |
         ▼
(end for each)
         |
         ▼
[12] SET GLOBAL VARIABLE → team_X_alive = false
         |
         ▼
[13] DESTROY ENTITY → dragon
         |
         ▼
[14] CALL → Check Win Condition (Step 19)
```

---

## Step 19: Win Condition Check

### Nodes to add:

```
[1] (Called after any dragon dies)
         |
         ▼
[2] COUNT → teams with dragons alive
    alive = 0
    IF team_red_alive: alive + 1, winner = "Red"
    IF team_blue_alive: alive + 1, winner = "Blue"
    IF team_green_alive: alive + 1, winner = "Green"
    IF team_yellow_alive: alive + 1, winner = "Yellow"
         |
         ▼
[3] COMPARE → alive == 1 ?
         |
    YES  |  NO
    ↓    |  (game continues)
         |
[4] BROADCAST MESSAGE → "[WINNER] TEAM WINS!"
         |
         ▼
[5] SPAWN PARTICLES → fireworks everywhere
         |
         ▼
[6] PLAY SOUND → victory music
         |
         ▼
[7] WAIT → 10 seconds
         |
         ▼
[8] END GAME → return to lobby
```

---

## ✅ TEST YOUR DRAGON BOSS

1. [ ] Dragon spawns with 500 HP?
2. [ ] Dragon is invulnerable for 10 seconds after spawn?
3. [ ] Dragon faces nearest enemy?
4. [ ] Fire Breath damages players in cone?
5. [ ] Wing Gust knocks back when 3+ enemies close?
6. [ ] Tail Swipe hits enemies behind dragon?
7. [ ] Roar triggers when dragon below 250 HP?
8. [ ] Dragon takes 20% less damage (armor)?
9. [ ] Dragon regenerates when out of combat?
10. [ ] Team gets debuffed when dragon dies?
11. [ ] Game ends when only 1 dragon remains?

---

# 🎉 CONGRATULATIONS!

You've built:
- ✅ Hero Class with 2 active abilities + 1 passive
- ✅ Dragon Boss with 4 abilities + full AI
- ✅ Win condition system

## Next Steps:
1. Add more classes (Warrior, Archer, Mage, etc.)
2. Build the preparation phase timer
3. Add the walls that fall
4. Create the map with 4 quadrants
5. Add team selection UI

---

# 🔧 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Ability doesn't trigger | Check your key binding, make sure event node is correct |
| Cooldown never resets | Make sure you're setting it to 0 when ability fires |
| Damage not applying | Check that you're targeting the correct entity, check team comparison |
| Dragon doesn't attack | Make sure AI loop is running (On Update/Timer), check target selection |
| Knockback doesn't work | Try adjusting velocity multiplier (2.5), check direction calculation |
| Effects don't apply | Verify effect names match what Hytale uses |
| Script doesn't start | Make sure script is attached to entity/player |

---

*Good luck! Take it one step at a time!* 🎮
