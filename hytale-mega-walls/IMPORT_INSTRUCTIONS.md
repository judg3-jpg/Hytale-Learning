# 📥 Import Instructions

## Files Created

```
scripts/
├── hero/
│   └── hero_class.json      ← Hero class (all abilities)
├── dragon/
│   └── dragon_boss.json     ← Dragon boss (AI + abilities)
└── game/
    └── game_controller.json ← Game loop & win conditions
```

---

## How to Use These Files

### Option 1: Direct Import (if Hytale supports JSON import)

1. Open Hytale Node Editor
2. Look for "Import" or "Load Script" option
3. Select the `.json` file you want to import
4. The nodes should auto-populate

### Option 2: Manual Recreation (use as reference)

Each JSON file contains:
- **`variables`** - Create these first
- **`graphs`** - Each graph is a separate node chain

**Example from `hero_class.json`:**

```json
{
  "name": "Valor_Strike",
  "trigger": "on_key_press",
  "trigger_key": "Q",
  "nodes": [
    {"id": 1, "type": "event", "event": "on_key_press", "key": "Q"},
    {"id": 2, "type": "get_variable", "variable": "valor_cooldown"},
    ...
  ]
}
```

This means:
1. Create a graph named "Valor_Strike"
2. Set trigger to "On Key Press" with key "Q"
3. Add nodes in order (1, 2, 3...)
4. Connect them based on `output` values

---

## Quick Reference: Node Types

| JSON Type | Node Editor Equivalent |
|-----------|----------------------|
| `event` | Event/Trigger node |
| `set_variable` | Set Variable |
| `get_variable` | Get Variable |
| `branch` | If/Branch/Condition |
| `for_each` | For Each Loop |
| `math_add` | Math: Add |
| `math_subtract` | Math: Subtract |
| `math_multiply` | Math: Multiply |
| `damage_entity` | Damage Entity |
| `heal_entity` | Heal Entity |
| `apply_effect` | Apply Effect/Status |
| `remove_effect` | Remove Effect |
| `get_entities_in_area` | Get Entities in Sphere/Area |
| `spawn_particles` | Spawn Particles |
| `play_sound` | Play Sound |
| `teleport_entity` | Teleport Entity |
| `display_message` | Show Message/Text |
| `broadcast_message` | Broadcast to All |
| `wait` | Wait/Delay |
| `call_graph` | Call Another Graph |

---

## Setup Order

### Step 1: Game Controller
Import/create `game_controller.json` first
- This manages game state, timers, win conditions
- Attach to a world/game object

### Step 2: Hero Class
Import/create `hero_class.json`
- Attach this script to players who select Hero class
- Contains all 5 graphs (init, cooldowns, abilities, passive)

### Step 3: Dragon Boss
Import/create `dragon_boss.json`
- Attach this script to dragon entities
- Set `dragon_team` variable to "red", "blue", "green", or "yellow"

---

## Variable Setup

### Global Variables (in Game Controller)
```
game_phase: Integer = 0
prep_timer: Integer = 1200
team_red_alive: Boolean = true
team_blue_alive: Boolean = true
team_green_alive: Boolean = true
team_yellow_alive: Boolean = true
walls_are_up: Boolean = true
winner_team: String = ""
```

### Hero Variables (per player)
```
valor_cooldown: Float = 25.0
rally_cooldown: Float = 45.0
is_hero: Boolean = true
```

### Dragon Variables (per dragon)
```
dragon_health: Integer = 500
dragon_max_health: Integer = 500
dragon_team: String = "red"
fire_cooldown: Float = 8.0
gust_cooldown: Float = 15.0
tail_cooldown: Float = 5.0
roar_cooldown: Float = 60.0
current_target: Entity = null
is_in_combat: Boolean = false
combat_timer: Float = 0
is_invulnerable: Boolean = true
```

---

## Testing Checklist

### Hero Class
- [ ] Spawns with 22 HP and items
- [ ] Q = Valor Strike (dash, damage, stun)
- [ ] E = Rally Cry (heal allies)
- [ ] Passive aura buffs nearby allies
- [ ] Last Stand at low HP

### Dragon Boss
- [ ] Spawns with 500 HP
- [ ] 10 sec spawn protection
- [ ] Fire Breath damages cone
- [ ] Wing Gust knockback at 3+ enemies
- [ ] Tail Swipe damages behind
- [ ] Roar at 50% HP
- [ ] Death eliminates team

### Game Controller
- [ ] Prep timer counts down
- [ ] Walls fall at 0
- [ ] Dragons spawn
- [ ] Win when 1 team remains

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Script doesn't run | Check it's attached to entity |
| Ability doesn't fire | Verify key binding & cooldown check |
| Dragon won't attack | Check enemy detection radius (30) |
| Team check fails | Make sure team variable is set correctly |
| Particles missing | Use available particle type |
| Sound missing | Use available sound name |

---

## Need Help?

The JSON files are structured to be readable. Each node has:
- `id` - Unique identifier
- `type` - What kind of node
- `output` - Which node comes next
- Other properties specific to that node type

Follow the `output` chain to see the flow!
