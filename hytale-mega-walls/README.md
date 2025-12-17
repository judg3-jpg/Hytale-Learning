# 🎮 Mega Walls for Hytale - Node Editor Build

Complete step-by-step guide to build Mega Walls using **only the Node Editor**.

---

## 📁 Files

| File | What It Contains |
|------|------------------|
| **[QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)** | ⭐ **START HERE** - Step-by-step instructions |
| [NODE_EDITOR_IMPLEMENTATION.md](./NODE_EDITOR_IMPLEMENTATION.md) | Detailed node graphs and logic |
| [GAME_DESIGN.md](./GAME_DESIGN.md) | Full game design reference |
| [HERO_CLASS.md](./HERO_CLASS.md) | Hero class details |
| [DRAGON_BOSS.md](./DRAGON_BOSS.md) | Dragon boss details |

---

## 🚀 Quick Start

### Open `QUICK_START_GUIDE.md` and follow the steps in order:

**Phase 1: Hero Class**
- Step 1-2: Create script & variables
- Step 3: Hero initialization (spawn with items)
- Step 4: Cooldown system
- Step 5: Valor Strike (dash attack)
- Step 6: Rally Cry (heal ability)
- Step 7: Heroic Presence (passive aura)

**Phase 2: Dragon Boss**
- Step 8-9: Create script & variables
- Step 10: Dragon spawn
- Step 11-12: AI targeting & ability selection
- Step 13: Fire Breath
- Step 14: Wing Gust
- Step 15: Tail Swipe
- Step 16: Dragon Roar
- Step 17-18: Damage & death
- Step 19: Win condition

---

## ⚔️ What You're Building

### Hero Class
| Ability | Key | Effect |
|---------|-----|--------|
| Valor Strike | Q | Dash 8 blocks, 8 damage, stun |
| Rally Cry | E | Heal allies 6 HP in 15 block radius |
| Heroic Presence | Passive | +Strength to nearby allies |
| Last Stand | Passive | +Strength when low HP |

### Dragon Boss
| Ability | Trigger | Effect |
|---------|---------|--------|
| Fire Breath | Enemy in front | 18 damage cone over 3 sec |
| Wing Gust | 3+ enemies close | Knockback everyone |
| Tail Swipe | Enemy behind | 10 damage melee |
| Dragon Roar | Below 50% HP | Buff allies, slow enemies |

---

## 📋 Checklist

### Hero Class
- [ ] Script created
- [ ] Variables added
- [ ] Spawns with items & 22 HP
- [ ] Valor Strike works
- [ ] Rally Cry works
- [ ] Passive buffs work

### Dragon Boss
- [ ] Script created
- [ ] Variables added
- [ ] Spawns with effects
- [ ] AI targets enemies
- [ ] Fire Breath works
- [ ] Wing Gust works
- [ ] Tail Swipe works
- [ ] Roar triggers at 50% HP
- [ ] Death eliminates team
- [ ] Win condition works

---

## 💡 Tips

1. **Build one thing at a time** - Don't try to do everything at once
2. **Test frequently** - Test after each step
3. **Save often** - Don't lose your work!
4. **Check connections** - Make sure nodes are properly linked
5. **Use debug messages** - Add "Print" nodes to see values

---

## 🔮 Future Additions

After Phase 1 is complete:
- [ ] More classes (Warrior, Archer, Mage)
- [ ] Preparation phase with timer
- [ ] Walls that fall
- [ ] 4-team map
- [ ] Team selection UI
- [ ] Scoreboard

---

*Start with QUICK_START_GUIDE.md - good luck!* 🎮
