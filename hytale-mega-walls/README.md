# 🎮 Hytale Mega Walls

A recreation of Hypixel's Mega Walls minigame for Hytale, built using the Asset Editor and Node Editor.

---

## 📋 Project Overview

**Mega Walls** is a team-based survival/PvP game where 4 teams compete to be the last team standing by defending their Dragon boss while trying to eliminate enemy Dragons.

### Current Phase: Phase 1 - Foundation

We're building:
1. ✅ **Hero Class** - First playable class with abilities
2. ✅ **Dragon Boss** - Team objective that must be protected

---

## 📁 Documentation

| Document | Description |
|----------|-------------|
| [GAME_DESIGN.md](./GAME_DESIGN.md) | Complete game mechanics, phases, and overview |
| [HERO_CLASS.md](./HERO_CLASS.md) | Detailed Hero class implementation guide |
| [DRAGON_BOSS.md](./DRAGON_BOSS.md) | Dragon boss AI and abilities guide |

---

## 🎯 Game Summary

### How Mega Walls Works

```
PHASE 1: PREPARATION (20 minutes)
├── Teams are separated by walls
├── Gather resources, craft gear, build defenses
└── PvP is disabled

PHASE 2: DEATHMATCH (Walls Fall)
├── Walls between teams disappear
├── Each team's Dragon spawns
├── PvP is enabled
└── Attack enemy bases, defend your Dragon

PHASE 3: ELIMINATION
├── Kill enemy Dragons to eliminate teams
├── Last team with a living Dragon wins
└── "Dragonless" teams get debuffs
```

---

## ⚔️ Hero Class Quick Reference

| Ability | Type | Effect | Cooldown |
|---------|------|--------|----------|
| Heroic Presence | Passive | +10% DMG to allies in 10 blocks | Always |
| Last Stand | Passive | +15% DMG when below 50% HP | Always |
| Valor Strike | Active | 8 block dash, 8 DMG, 1.5s stun | 25s |
| Rally Cry | Active | Heal allies 6 HP, remove debuffs | 45s |
| Veteran Explorer | Perk | +15% mining, 10% double drops | Always |

---

## 🐉 Dragon Boss Quick Reference

| Ability | Effect | Cooldown |
|---------|--------|----------|
| Fire Breath | 15 block cone, 6 DMG/sec for 3s | 8s |
| Wing Gust | Knockback all enemies 10 blocks | 15s |
| Tail Swipe | 10 DMG to enemies behind | 5s |
| Roar | +20% ally DMG, slow enemies | 60s |

**Stats:** 500 HP, 20% armor, 2 HP/sec regen

---

## 🛠️ Implementation Phases

### Phase 1 (Current)
- [x] Game design documentation
- [x] Hero class design
- [x] Dragon boss design
- [ ] Implement Hero in Hytale Node Editor
- [ ] Implement Dragon in Hytale Node Editor
- [ ] Basic testing

### Phase 2 (Next)
- [ ] Game loop (preparation timer)
- [ ] Walls fall mechanic
- [ ] Team system
- [ ] Basic UI

### Phase 3 (Future)
- [ ] Additional classes
- [ ] Balance tuning
- [ ] Map creation
- [ ] Polish & effects

---

## 🎨 Asset Checklist

### Models Needed
- [ ] Dragon boss model (or use Hytale existing)
- [ ] Valor Strike Orb item
- [ ] Rally Cry Horn item
- [ ] Wall blocks (destructible)

### Particles Needed
- [ ] Gold trail (Valor Strike)
- [ ] Heal ring (Rally Cry)
- [ ] Fire breath cone
- [ ] Wing gust wind
- [ ] Dragon death explosion

### Sounds Needed
- [ ] heroic_charge.ogg
- [ ] rally_cry.ogg
- [ ] dragon_fire.ogg
- [ ] dragon_roar.ogg
- [ ] dragon_death.ogg

---

## 📝 Node Editor Files Structure

```
hytale-mega-walls/
├── scripts/
│   ├── game/
│   │   ├── game_controller.node
│   │   ├── team_manager.node
│   │   ├── walls_controller.node
│   │   └── win_condition.node
│   ├── classes/
│   │   └── hero/
│   │       ├── hero_init.node
│   │       ├── hero_passive.node
│   │       ├── hero_valor_strike.node
│   │       ├── hero_rally_cry.node
│   │       └── hero_gathering.node
│   └── bosses/
│       └── dragon/
│           ├── dragon_spawn.node
│           ├── dragon_ai.node
│           ├── dragon_fire_breath.node
│           ├── dragon_wing_gust.node
│           ├── dragon_tail_swipe.node
│           ├── dragon_roar.node
│           └── dragon_death.node
└── prefabs/
    ├── spawn_platforms/
    └── dragon_spawn_point.prefab
```

---

## 🚀 Getting Started

1. **Read the documentation** - Start with GAME_DESIGN.md
2. **Open Hytale Asset Editor** - Access the Node Editor
3. **Create game controller** - Set up basic variables
4. **Implement Hero class** - Follow HERO_CLASS.md
5. **Implement Dragon boss** - Follow DRAGON_BOSS.md
6. **Test in game** - Spawn and test abilities

---

## 📊 Balance Notes

These values are starting points - expect to adjust after testing:

| Concern | If Too Strong | If Too Weak |
|---------|--------------|-------------|
| Valor Strike stun | Reduce to 1s | Increase to 2s |
| Rally Cry heal | Reduce to 4 HP | Increase to 8 HP |
| Dragon HP | Reduce to 400 | Increase to 600 |
| Fire Breath damage | Reduce to 4/sec | Increase to 8/sec |

---

## 💡 Tips for Hytale Node Editor

1. **Use variables** for all cooldowns and stats
2. **Test frequently** - small changes, test often
3. **Use debug messages** - print values to check logic
4. **Start simple** - get basic version working first
5. **Iterate** - polish after core mechanics work

---

## 📞 Support

Having trouble implementing? Check:
- Hytale official documentation
- Hytale modding community forums
- Node Editor tutorials

---

*Version 1.0 - Phase 1 Design Complete*
*Ready to build in Hytale!* 🎮
