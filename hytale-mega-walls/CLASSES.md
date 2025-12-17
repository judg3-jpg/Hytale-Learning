# Mega Walls Classes - Complete Reference

## Overview

Three classes available at launch:
1. **Hero** - Versatile Fighter / Team Support
2. **Marksman** - Ranged DPS / Sniper  
3. **Dual Warrior** - Melee DPS / Berserker

---

# 🦸 HERO CLASS

## Identity
The Hero is a legendary warrior - versatile, powerful, and inspiring to allies. Balanced combat with team support abilities.

## Stats
| Stat | Value |
|------|-------|
| Health | 22 HP |
| Damage | High |
| Mobility | High |
| Support | Excellent |

## Abilities

### [Q] Valor Strike
| Property | Value |
|----------|-------|
| Type | Active |
| Cooldown | 25 seconds |
| Damage | 8 HP |
| Range | 8 blocks dash |
| Effect | Stun 1.5 seconds |

**Description:** Dash forward 8 blocks, damaging and stunning all enemies in your path.

**Node Editor Logic:**
```
ON Key Press [Q]
→ IF cooldown ready
  → Reset cooldown to 0
  → Get player direction
  → Calculate end point (8 blocks forward)
  → Spawn gold particle trail
  → Get entities in path
  → FOR EACH enemy: Deal 8 damage, Apply stun
  → Teleport player to end point
```

---

### [E] Rally Cry
| Property | Value |
|----------|-------|
| Type | Active |
| Cooldown | 45 seconds |
| Heal (allies) | 6 HP |
| Heal (self) | 4 HP |
| Range | 15 blocks |
| Effect | Remove negative effects |

**Description:** Let out a battle cry, healing all allies within 15 blocks and removing negative effects.

**Node Editor Logic:**
```
ON Key Press [E]
→ IF cooldown ready
  → Reset cooldown to 0
  → Spawn expanding green ring particles
  → Play heal sound
  → Get players in 15 block radius
  → FOR EACH ally: Heal 6 HP, Remove poison/slowness
  → Heal self 4 HP
```

---

### [PASSIVE] Heroic Presence
| Property | Value |
|----------|-------|
| Type | Passive Aura |
| Range | 10 blocks |
| Ally Buff | +10% damage, +5% defense |
| Last Stand | +15% damage when below 50% HP |

**Description:** Inspire nearby allies with combat bonuses. Gain extra damage when wounded.

**Node Editor Logic:**
```
EVERY 1 second
→ Get allies in 10 block radius
→ FOR EACH ally: Apply Strength buff (2s duration)
→ IF player HP < 50%
  → Apply stronger Strength buff to self
```

---

### [PERK] Veteran Explorer
| Property | Value |
|----------|-------|
| Mining Speed | +15% |
| Double Ore | 10% chance |
| Mob Loot | +20% drops |

---

### Starting Kit
- 🗡️ Wooden Sword
- ⛏️ Wooden Pickaxe
- 🍞 Bread x8
- 👢 Leather Boots

---

# 🏹 MARKSMAN CLASS

## Identity
The Marksman is a deadly sniper - high damage at range, devastating special shots, but fragile up close.

## Stats
| Stat | Value |
|------|-------|
| Health | 18 HP |
| Damage | Very High |
| Mobility | Medium |
| Range | Excellent |

## Abilities

### [Q] Piercing Shot
| Property | Value |
|----------|-------|
| Type | Active |
| Cooldown | 15 seconds |
| Damage | 12 HP |
| Range | 30 blocks |
| Effect | Pierces through enemies |

**Description:** Fire a powerful arrow that pierces through all enemies in a line, dealing 12 damage to each.

**Node Editor Logic:**
```
ON Key Press [Q]
→ IF cooldown ready
  → Reset cooldown to 0
  → Get player aim direction
  → Spawn arrow projectile
  → Raycast 30 blocks forward
  → FOR EACH entity hit: Deal 12 damage
  → Spawn blue trail particles
```

---

### [E] Explosive Arrow
| Property | Value |
|----------|-------|
| Type | Active |
| Cooldown | 30 seconds |
| Damage | 10 HP |
| Radius | 5 blocks |
| Effect | Burning for 3 seconds |

**Description:** Launch an explosive arrow that detonates on impact, dealing AoE damage and igniting enemies.

**Node Editor Logic:**
```
ON Key Press [E]
→ IF cooldown ready
  → Reset cooldown to 0
  → Spawn special arrow projectile
  → ON arrow hit:
    → Spawn explosion particles
    → Get entities in 5 block radius
    → FOR EACH enemy: Deal 10 damage, Apply burning
```

---

### [PASSIVE] Eagle Eye
| Property | Value |
|----------|-------|
| Type | Passive |
| Headshot Bonus | +50% damage |
| Arrow Speed | +25% |
| Mark Duration | 5 seconds |

**Description:** Headshots deal bonus damage. Arrows fly faster. Hit enemies are highlighted for your team.

**Node Editor Logic:**
```
ON Arrow Hit
→ IF hit location is head
  → Multiply damage by 1.5
→ Apply "Marked" effect to target (5s)
  → Target is visible through walls
```

---

### [PERK] Hunter's Instinct
| Property | Value |
|----------|-------|
| Arrow Recovery | 30% chance |
| Feather Drops | +25% |
| Tracking | Compass points to nearest enemy |

---

### Starting Kit
- 🏹 Bow
- 🪶 Arrow x32
- 🗡️ Wooden Dagger
- 🍞 Bread x6

---

# ⚔️ DUAL WARRIOR CLASS

## Identity
The Dual Warrior is a berserker - lightning-fast attacks, devastating combos, but lower defense. High risk, high reward.

## Stats
| Stat | Value |
|------|-------|
| Health | 20 HP |
| Damage | Very High |
| Attack Speed | Fastest |
| Defense | Low |

## Abilities

### [Q] Blade Storm
| Property | Value |
|----------|-------|
| Type | Active |
| Cooldown | 20 seconds |
| Damage | ~4 HP per hit |
| Radius | 4 blocks |
| Duration | 3 seconds |
| Effect | Knockback immunity |

**Description:** Spin rapidly for 3 seconds, damaging all nearby enemies. Immune to knockback while spinning.

**Node Editor Logic:**
```
ON Key Press [Q]
→ IF cooldown ready
  → Reset cooldown to 0
  → Apply knockback immunity to self
  → Play spin animation
  → LOOP for 3 seconds (every 0.33s):
    → Get enemies in 4 block radius
    → FOR EACH enemy: Deal 4 damage
    → Spawn spin particles
  → Remove knockback immunity
```

---

### [E] Twin Strike
| Property | Value |
|----------|-------|
| Type | Active |
| Cooldown | 12 seconds |
| Damage | 14 HP |
| Execute Threshold | 30% HP |
| Execute Bonus | Double damage |

**Description:** Instantly strike with both blades for 14 damage. If target is below 30% HP, deal double damage (execute).

**Node Editor Logic:**
```
ON Key Press [E]
→ IF cooldown ready
  → Reset cooldown to 0
  → Get nearest enemy in 3 blocks
  → IF target exists:
    → Calculate damage = 14
    → IF target HP < 30% max HP:
      → damage = damage * 2 (execute!)
      → Spawn special execute particles
    → Deal damage to target
    → Play dual slash animation
```

---

### [PASSIVE] Bloodlust
| Property | Value |
|----------|-------|
| Type | Passive Stacking |
| Max Stacks | 5 |
| Per Stack | +5% attack speed, +3% lifesteal |
| Stack Duration | 4 seconds |

**Description:** Each hit grants a Bloodlust stack. Stacks increase attack speed and provide lifesteal. Stacks decay if you stop attacking.

**Node Editor Logic:**
```
ON Hit Enemy
→ Add 1 Bloodlust stack (max 5)
→ Reset stack decay timer to 4 seconds
→ Calculate bonuses:
  → Attack speed = base * (1 + stacks * 0.05)
  → Lifesteal = stacks * 0.03
→ Heal for (damage dealt * lifesteal)

EVERY 0.1 seconds
→ IF decay timer <= 0:
  → Remove 1 stack
  → Reset decay timer
```

---

### [PERK] Battle Hardened
| Property | Value |
|----------|-------|
| Wood Chopping | +20% speed |
| Weapon Crafting | +15% speed |
| Combat Ore | Chance for ore on player kills |

---

### Starting Kit
- 🗡️ Wooden Sword x2 (dual wield)
- 🪓 Wooden Axe
- 🍖 Steak x4
- 🧤 Leather Gloves

---

# CLASS COMPARISON

| Stat | Hero | Marksman | Dual Warrior |
|------|------|----------|--------------|
| Health | 22 | 18 | 20 |
| Q Damage | 8 | 12 | ~12 |
| Q Cooldown | 25s | 15s | 20s |
| E Damage | 0 (heal) | 10 | 14-28 |
| E Cooldown | 45s | 30s | 12s |
| Playstyle | Support/Frontline | Backline Sniper | Aggressive Melee |
| Difficulty | Medium | Medium | Hard |

---

# BALANCE NOTES

## Hero
- **Strength:** Team utility, survivability
- **Weakness:** Lower solo damage
- **Counter:** Focus down before Rally Cry

## Marksman
- **Strength:** Massive ranged damage
- **Weakness:** Low HP, weak in melee
- **Counter:** Close gap quickly, avoid open areas

## Dual Warrior
- **Strength:** Highest DPS, execute potential
- **Weakness:** Must be in melee, low defense
- **Counter:** Kite, CC during Blade Storm

---

*Balance values subject to testing and adjustment!*
