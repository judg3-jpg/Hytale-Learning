// Mega Walls Preview - Interactive JavaScript

// ============================================
// CLASS DATA
// ============================================

const classData = {
    hero: {
        name: "Hero",
        health: 22,
        abilities: {
            q: {
                name: "Valor Strike",
                damage: 8,
                cooldown: 25,
                description: "Dashes forward, dealing 8 damage and stunning enemies"
            },
            e: {
                name: "Rally Cry",
                damage: 0,
                heal: 6,
                selfHeal: 4,
                cooldown: 45,
                description: "Heals nearby allies for 6 HP, self for 4 HP"
            }
        }
    },
    marksman: {
        name: "Marksman",
        health: 18,
        abilities: {
            q: {
                name: "Piercing Shot",
                damage: 12,
                cooldown: 15,
                description: "Fires a piercing arrow dealing 12 damage"
            },
            e: {
                name: "Explosive Arrow",
                damage: 10,
                cooldown: 30,
                description: "Explosive arrow dealing 10 AoE damage + burn"
            }
        }
    },
    "dual-warrior": {
        name: "Dual Warrior",
        health: 20,
        abilities: {
            q: {
                name: "Blade Storm",
                damage: 12,
                cooldown: 20,
                description: "Spin attack dealing ~12 damage over 3 seconds"
            },
            e: {
                name: "Twin Strike",
                damage: 14,
                cooldown: 12,
                description: "Dual strike for 14 damage (x2 on low HP targets)"
            }
        }
    }
};

// ============================================
// STATE
// ============================================

let currentClass = 'hero';
let playerHealth = 22;
let playerMaxHealth = 22;
let targetHealth = 500;
let targetMaxHealth = 500;

let cooldowns = {
    q: 0,
    e: 0
};

let cooldownIntervals = {
    q: null,
    e: null
};

// ============================================
// NAVIGATION
// ============================================

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update sections
        const sectionId = btn.dataset.section;
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');
    });
});

// ============================================
// CLASS SELECTOR
// ============================================

document.querySelectorAll('.class-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Update tabs
        document.querySelectorAll('.class-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update class display
        const classId = tab.dataset.class;
        document.querySelectorAll('.class-display').forEach(d => d.classList.remove('active'));
        document.getElementById(`class-${classId}`).classList.add('active');
    });
});

// ============================================
// SIMULATOR
// ============================================

// Class selector in simulator
const simClassSelect = document.getElementById('sim-class-select');
simClassSelect.addEventListener('change', () => {
    currentClass = simClassSelect.value;
    updateSimulator();
    resetCooldowns();
    addLogEntry(`Switched to ${classData[currentClass].name} class`, 'ability');
});

function updateSimulator() {
    const data = classData[currentClass];
    
    // Update health
    playerMaxHealth = data.health;
    playerHealth = data.health;
    updatePlayerHealth();
    
    // Update ability names
    document.getElementById('sim-q-name').textContent = data.abilities.q.name;
    document.getElementById('sim-e-name').textContent = data.abilities.e.name;
}

function updatePlayerHealth() {
    const percent = (playerHealth / playerMaxHealth) * 100;
    document.getElementById('player-hp-fill').style.width = `${percent}%`;
    document.getElementById('player-hp-text').textContent = `${playerHealth}/${playerMaxHealth}`;
}

function updateTargetHealth() {
    const percent = (targetHealth / targetMaxHealth) * 100;
    document.getElementById('target-hp-fill').style.width = `${percent}%`;
    document.getElementById('target-hp-text').textContent = `${targetHealth}/${targetMaxHealth}`;
}

function resetCooldowns() {
    cooldowns.q = 0;
    cooldowns.e = 0;
    document.getElementById('sim-q-cd').style.width = '0%';
    document.getElementById('sim-e-cd').style.width = '0%';
    document.getElementById('sim-q-btn').disabled = false;
    document.getElementById('sim-e-btn').disabled = false;
    
    if (cooldownIntervals.q) clearInterval(cooldownIntervals.q);
    if (cooldownIntervals.e) clearInterval(cooldownIntervals.e);
}

// ============================================
// ABILITIES
// ============================================

function useAbility(key) {
    const data = classData[currentClass];
    const ability = data.abilities[key];
    
    if (cooldowns[key] > 0) {
        addLogEntry(`${ability.name} is on cooldown! (${cooldowns[key].toFixed(1)}s)`, 'damage');
        return;
    }
    
    // Apply ability effects
    if (ability.damage > 0) {
        dealDamage(ability.damage);
        addLogEntry(`${ability.name} hits for ${ability.damage} damage!`, 'ability');
    }
    
    if (ability.heal) {
        // Rally Cry heals allies (simulated as self heal here)
        playerHealth = Math.min(playerHealth + ability.selfHeal, playerMaxHealth);
        updatePlayerHealth();
        addLogEntry(`${ability.name} heals you for ${ability.selfHeal} HP!`, 'heal');
    }
    
    // Start cooldown
    startCooldown(key, ability.cooldown);
}

function dealDamage(amount) {
    // Apply dragon armor (20% reduction)
    const actualDamage = Math.floor(amount * 0.8);
    targetHealth = Math.max(0, targetHealth - actualDamage);
    updateTargetHealth();
    showDamageNumber(actualDamage);
    
    if (targetHealth <= 0) {
        addLogEntry('🎉 DRAGON DEFEATED! You win!', 'heal');
        setTimeout(() => {
            targetHealth = targetMaxHealth;
            updateTargetHealth();
            addLogEntry('Dragon respawned for more testing.', 'ability');
        }, 2000);
    }
}

function showDamageNumber(damage) {
    const container = document.getElementById('damage-numbers');
    const num = document.createElement('div');
    num.className = 'damage-number';
    num.textContent = `-${damage}`;
    num.style.left = `${Math.random() * 60 - 30}px`;
    container.appendChild(num);
    
    setTimeout(() => {
        num.remove();
    }, 1000);
}

function startCooldown(key, duration) {
    cooldowns[key] = duration;
    const btn = document.getElementById(`sim-${key}-btn`);
    const overlay = document.getElementById(`sim-${key}-cd`);
    
    btn.disabled = true;
    overlay.style.width = '100%';
    
    const startTime = Date.now();
    const totalMs = duration * 1000;
    
    cooldownIntervals[key] = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, totalMs - elapsed);
        cooldowns[key] = remaining / 1000;
        
        const percent = (remaining / totalMs) * 100;
        overlay.style.width = `${percent}%`;
        
        if (remaining <= 0) {
            clearInterval(cooldownIntervals[key]);
            btn.disabled = false;
            cooldowns[key] = 0;
            addLogEntry(`${classData[currentClass].abilities[key].name} is ready!`, 'heal');
        }
    }, 100);
}

// Ability button clicks
document.getElementById('sim-q-btn').addEventListener('click', () => useAbility('q'));
document.getElementById('sim-e-btn').addEventListener('click', () => useAbility('e'));

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Only work when simulator is active
    const simSection = document.getElementById('simulator');
    if (!simSection.classList.contains('active')) return;
    
    if (e.key.toLowerCase() === 'q') {
        useAbility('q');
    } else if (e.key.toLowerCase() === 'e') {
        useAbility('e');
    }
});

// ============================================
// COMBAT LOG
// ============================================

function addLogEntry(message, type = '') {
    const log = document.getElementById('combat-log');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    
    const time = new Date().toLocaleTimeString();
    entry.textContent = `[${time}] ${message}`;
    
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
    
    // Keep log at reasonable size
    while (log.children.length > 50) {
        log.removeChild(log.firstChild);
    }
}

// ============================================
// DRAGON HEALTH BAR ANIMATION (Overview)
// ============================================

function animateDragonHealth() {
    const healthFill = document.getElementById('dragon-health-fill');
    if (!healthFill) return;
    
    // Simulate dragon taking damage for visual effect
    let health = 100;
    setInterval(() => {
        health = Math.max(20, Math.min(100, health + (Math.random() * 20 - 10)));
        healthFill.style.width = `${health}%`;
    }, 2000);
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    updateSimulator();
    animateDragonHealth();
    addLogEntry('Welcome to the Mega Walls Combat Simulator!', '');
    addLogEntry('Use Q and E keys (or buttons) to test abilities.', '');
    addLogEntry('Current class: Hero', 'ability');
});
