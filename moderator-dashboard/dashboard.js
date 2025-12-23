/**
 * Standalone Moderator Dashboard - No Server Required
 * Uses IndexedDB for local storage
 */

// IndexedDB setup
const DB_NAME = 'ModeratorDashboard';
const DB_VERSION = 2; // Incremented to add absent field
let db = null;

// Global state
let moderators = [];
let filteredModerators = [];
let dashboardStats = {};
let charts = {};

// Migrate absent field for existing moderators
async function migrateAbsentFieldIfNeeded(db) {
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction(['moderators'], 'readwrite');
            const store = transaction.objectStore('moderators');
            const request = store.getAll();
            
            request.onsuccess = () => {
                const moderators = request.result;
                let needsMigration = false;
                
                moderators.forEach(mod => {
                    if (!mod.hasOwnProperty('absent')) {
                        mod.absent = null;
                        store.put(mod);
                        needsMigration = true;
                    }
                });
                
                if (needsMigration) {
                    console.log('Migrated absent field for existing moderators');
                }
                resolve();
            };
            
            request.onerror = () => reject(request.error);
        } catch (error) {
            // If migration fails, continue anyway
            console.warn('Migration warning:', error);
            resolve();
        }
    });
}

// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        
        request.onupgradeneeded = (event) => {
            console.log('Database upgrade needed, creating stores...');
            const db = event.target.result;
            const oldVersion = event.oldVersion;
            
            // Create moderators store
            if (!db.objectStoreNames.contains('moderators')) {
                console.log('Creating moderators store...');
                const modStore = db.createObjectStore('moderators', { keyPath: 'id', autoIncrement: true });
                modStore.createIndex('name', 'name', { unique: false });
            }
            
            // Create stats store
            if (!db.objectStoreNames.contains('stats')) {
                console.log('Creating stats store...');
                const statsStore = db.createObjectStore('stats', { keyPath: 'id', autoIncrement: true });
                statsStore.createIndex('moderator_id', 'moderator_id', { unique: false });
                statsStore.createIndex('year_month', ['moderator_id', 'year', 'month'], { unique: true });
            }
            
            // Create activity log store
            if (!db.objectStoreNames.contains('activity_log')) {
                console.log('Creating activity_log store...');
                const logStore = db.createObjectStore('activity_log', { keyPath: 'id', autoIncrement: true });
                logStore.createIndex('moderator_id', 'moderator_id', { unique: false });
            }
            
            console.log('Database stores created successfully');
        };
        
        request.onsuccess = () => {
            db = request.result;
            // Migration: Add absent field to existing moderators
            migrateAbsentFieldIfNeeded(db).then(() => {
                resolve(db);
            }).catch(reject);
        };
    });
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing dashboard...');
        await initDB();
        console.log('Database initialized');
        
        const count = await getModeratorCount();
        console.log('Current moderator count:', count);
        
        await initializeModerators();
        console.log('Moderators initialized');
        
        const finalCount = await getModeratorCount();
        console.log('Final moderator count:', finalCount);
        
        initializeTheme();
        await loadDashboard();
        setupEventListeners();
        console.log('Dashboard loaded successfully');
    } catch (error) {
        console.error('Error initializing:', error);
        alert('Error initializing dashboard: ' + error.message);
    }
});

// Initialize default moderators if database is empty
async function initializeModerators() {
    try {
        const count = await getModeratorCount();
        console.log('Checking moderator count:', count);
        
        if (count === 0) {
            console.log('Database is empty, seeding default moderators...');
            const defaultMods = [
                { name: 'Alexa', notes: 'SkyBlock Moderator', rank: 'Mod', status: 'active' },
                { name: 'AmyTheMudkip', notes: 'Report Moderator', rank: 'Mod', status: 'active' },
                { name: 'Blake', notes: 'SkyBlock Moderator', rank: 'Mod', status: 'active' },
                { name: 'Changitesz', notes: 'Report Moderator', rank: 'Mod', status: 'active' },
                { name: 'DeluxeRose', notes: 'Report Moderator', rank: 'Mod', status: 'active' },
                { name: 'Gainful', notes: 'Report Moderator', rank: 'Mod', status: 'active' },
                { name: 'Gerbor', notes: 'SkyBlock Moderator', rank: 'Mod', status: 'active' },
                { name: 'Jade', notes: 'Report Moderator', rank: 'Mod', status: 'active' },
                { name: 'LeBrilliant', notes: 'Report Moderator', rank: 'Mod', status: 'active' },
                { name: 'Quack', notes: 'Forum & Report Moderator', rank: 'Mod', status: 'active' },
                { name: 'Rhune', notes: 'SkyBlock Moderator', rank: 'Mod', status: 'active' },
                { name: 'SaltyLia', notes: 'Report & SkyBlock Moderator', rank: 'Mod', status: 'active' },
                { name: 'Smoarzified', notes: 'Appeals & SkyBlock Moderator', rank: 'Mod', status: 'active' },
                { name: 'MCVisuals', notes: 'Appeals & Report Moderator', rank: 'Mod', status: 'active' }
            ];
            
            for (let i = 0; i < defaultMods.length; i++) {
                const mod = defaultMods[i];
                try {
                    const id = await createModerator(mod);
                    console.log(`Created moderator ${i + 1}/${defaultMods.length}: ${mod.name} (ID: ${id})`);
                } catch (error) {
                    console.error(`Error creating moderator ${mod.name}:`, error);
                }
            }
            
            const newCount = await getModeratorCount();
            console.log(`Seeding complete. Total moderators: ${newCount}`);
        } else {
            console.log(`Database already has ${count} moderators, skipping seed.`);
        }
    } catch (error) {
        console.error('Error in initializeModerators:', error);
        throw error;
    }
}

async function getModeratorCount() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        try {
            const transaction = db.transaction(['moderators'], 'readonly');
            const store = transaction.objectStore('moderators');
            const request = store.count();
            request.onsuccess = () => {
                console.log('Moderator count result:', request.result);
                resolve(request.result);
            };
            request.onerror = () => {
                console.error('Error getting moderator count:', request.error);
                reject(request.error);
            };
        } catch (error) {
            console.error('Exception getting moderator count:', error);
            reject(error);
        }
    });
}

// Database operations
async function getAllModerators() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        try {
            const transaction = db.transaction(['moderators'], 'readonly');
            const store = transaction.objectStore('moderators');
            const request = store.getAll();
            request.onsuccess = () => {
                console.log('Loaded moderators:', request.result.length);
                // Ensure all moderators have absent field
                const moderators = (request.result || []).map(mod => {
                    if (!mod.hasOwnProperty('absent')) {
                        mod.absent = null;
                    }
                    return mod;
                });
                resolve(moderators);
            };
            request.onerror = () => {
                console.error('Error getting all moderators:', request.error);
                reject(request.error);
            };
        } catch (error) {
            console.error('Exception getting all moderators:', error);
            reject(error);
        }
    });
}

async function createModerator(moderator) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        try {
            const transaction = db.transaction(['moderators'], 'readwrite');
            const store = transaction.objectStore('moderators');
            const modData = {
                name: moderator.name,
                discord_id: moderator.discord_id || null,
                rank: moderator.rank || 'Mod',
                status: moderator.status || 'active',
                join_date: moderator.join_date || null,
                avatar_url: moderator.avatar_url || null,
                notes: moderator.notes || moderator.rank || 'Moderator',
                absent: moderator.absent || null,
                created_at: new Date().toISOString()
            };
            const request = store.add(modData);
            request.onsuccess = () => {
                console.log('Moderator created successfully:', moderator.name, 'ID:', request.result);
                resolve(request.result);
            };
            request.onerror = () => {
                console.error('Error creating moderator:', request.error);
                reject(request.error);
            };
        } catch (error) {
            console.error('Exception creating moderator:', error);
            reject(error);
        }
    });
}

async function updateModerator(moderatorId, updates) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        try {
            const transaction = db.transaction(['moderators'], 'readwrite');
            const store = transaction.objectStore('moderators');
            const getRequest = store.get(moderatorId);
            
            getRequest.onsuccess = () => {
                const moderator = getRequest.result;
                if (!moderator) {
                    reject(new Error('Moderator not found'));
                    return;
                }
                
                // Update fields
                if (updates.name !== undefined) moderator.name = updates.name;
                if (updates.discord_id !== undefined) moderator.discord_id = updates.discord_id || null;
                if (updates.rank !== undefined) moderator.rank = updates.rank;
                if (updates.status !== undefined) moderator.status = updates.status;
                if (updates.join_date !== undefined) moderator.join_date = updates.join_date || null;
                if (updates.avatar_url !== undefined) moderator.avatar_url = updates.avatar_url || null;
                if (updates.notes !== undefined) moderator.notes = updates.notes;
                if (updates.absent !== undefined) moderator.absent = updates.absent || null;
                
                const updateRequest = store.put(moderator);
                updateRequest.onsuccess = () => {
                    console.log('Moderator updated successfully:', moderatorId);
                    resolve(moderator);
                };
                updateRequest.onerror = () => {
                    console.error('Error updating moderator:', updateRequest.error);
                    reject(updateRequest.error);
                };
            };
            
            getRequest.onerror = () => {
                console.error('Error getting moderator:', getRequest.error);
                reject(getRequest.error);
            };
        } catch (error) {
            console.error('Exception updating moderator:', error);
            reject(error);
        }
    });
}

async function getModeratorStats(moderatorId, limit = 12) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['stats'], 'readonly');
        const store = transaction.objectStore('stats');
        const index = store.index('moderator_id');
        const request = index.getAll(moderatorId);
        
        request.onsuccess = () => {
            const stats = request.result
                .sort((a, b) => {
                    if (a.year !== b.year) return b.year - a.year;
                    return b.month - a.month;
                })
                .slice(0, limit);
            resolve(stats);
        };
        request.onerror = () => reject(request.error);
    });
}

async function createStats(stats) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['stats'], 'readwrite');
        const store = transaction.objectStore('stats');
        const index = store.index('year_month');
        const key = [stats.moderator_id, stats.year, stats.month];
        
        // Check if exists
        const checkRequest = index.get(key);
        checkRequest.onsuccess = () => {
            if (checkRequest.result) {
                // Update existing
                const existing = checkRequest.result;
                Object.assign(existing, stats);
                existing.updated_at = new Date().toISOString();
                const updateRequest = store.put(existing);
                updateRequest.onsuccess = () => resolve(existing.id);
                updateRequest.onerror = () => reject(updateRequest.error);
            } else {
                // Create new
                const statsData = {
                    moderator_id: parseInt(stats.moderator_id),
                    year: parseInt(stats.year),
                    month: parseInt(stats.month),
                    reports_handled: parseInt(stats.reports_handled) || 0,
                    hours_worked: parseFloat(stats.hours_worked) || 0,
                    punishments_issued: parseInt(stats.punishments_issued) || 0,
                    warnings_issued: parseInt(stats.warnings_issued) || 0,
                    mutes_issued: parseInt(stats.mutes_issued) || 0,
                    kicks_issued: parseInt(stats.kicks_issued) || 0,
                    bans_issued: parseInt(stats.bans_issued) || 0,
                    appeals_reviewed: parseInt(stats.appeals_reviewed) || 0,
                    tickets_resolved: parseInt(stats.tickets_resolved) || 0,
                    quality_score: stats.quality_score ? parseFloat(stats.quality_score) : null,
                    response_time_avg: stats.response_time_avg ? parseInt(stats.response_time_avg) : null,
                    notes: stats.notes || null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                const addRequest = store.add(statsData);
                addRequest.onsuccess = () => resolve(addRequest.result);
                addRequest.onerror = () => reject(addRequest.error);
            }
        };
        checkRequest.onerror = () => reject(checkRequest.error);
    });
}

async function getDashboardStats() {
    const allMods = await getAllModerators();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Get current month stats
    const transaction = db.transaction(['stats'], 'readonly');
    const store = transaction.objectStore('stats');
    const allStats = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
    
    const currentMonthStats = allStats.filter(s => 
        s.year === currentYear && s.month === currentMonth
    );
    
    return {
        total_moderators: allMods.length,
        active_moderators: allMods.filter(m => m.status === 'active').length,
        current_month: {
            active_moderators: new Set(currentMonthStats.map(s => s.moderator_id)).size,
            total_reports: currentMonthStats.reduce((sum, s) => sum + (s.reports_handled || 0), 0),
            total_hours: currentMonthStats.reduce((sum, s) => sum + (s.hours_worked || 0), 0),
            avg_quality_score: currentMonthStats.length > 0
                ? currentMonthStats.reduce((sum, s) => sum + (s.quality_score || 0), 0) / currentMonthStats.length
                : 0
        }
    };
}

// Dashboard loading
async function loadDashboard() {
    try {
        console.log('Loading dashboard...');
        moderators = await getAllModerators();
        console.log('Moderators loaded:', moderators.length);
        
        if (moderators.length === 0) {
            console.warn('No moderators found! Attempting to re-initialize...');
            await initializeModerators();
            moderators = await getAllModerators();
            console.log('After re-initialization, moderators:', moderators.length);
        }
        
        dashboardStats = await getDashboardStats();
        filteredModerators = [...moderators];
        
        updateSummaryCards();
        renderModeratorCards();
        populateModeratorDropdowns();
        console.log('Dashboard loaded successfully');
    } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('Error loading dashboard: ' + error.message);
    }
}

function updateSummaryCards() {
    document.getElementById('totalModerators').textContent = dashboardStats.total_moderators || 0;
    document.getElementById('activeModerators').textContent = dashboardStats.active_moderators || 0;
    document.getElementById('totalReports').textContent = dashboardStats.current_month?.total_reports || 0;
    document.getElementById('totalHours').textContent = (dashboardStats.current_month?.total_hours || 0).toFixed(1);
    document.getElementById('avgQuality').textContent = (dashboardStats.current_month?.avg_quality_score || 0).toFixed(2);
}

async function renderModeratorCards() {
    const grid = document.getElementById('moderatorGrid');
    const noResults = document.getElementById('noResults');
    
    if (filteredModerators.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    const cardsData = await Promise.all(
        filteredModerators.map(async (mod) => {
            const stats = await getModeratorStats(mod.id, 12);
            const currentMonth = getCurrentMonthStats(stats);
            return { moderator: mod, stats, currentMonth };
        })
    );
    
    grid.innerHTML = cardsData.map(({ moderator, stats, currentMonth }) => 
        createModeratorCardHTML(moderator, stats, currentMonth)
    ).join('');
    
    // Attach click handlers BEFORE creating charts (so charts don't break)
    attachCardClickHandlers();
    attachEditButtonHandlers();
    
    // Create charts after handlers are attached
    cardsData.forEach(({ moderator, stats }) => {
        if (stats.length > 0) {
            createMiniChart(moderator.id, stats);
        }
    });
}

function createModeratorCardHTML(moderator, stats, currentMonth) {
    const avatar = moderator.avatar_url || getInitials(moderator.name);
    const statusClass = `status-${moderator.status || 'active'}`;
    const performanceBadge = getPerformanceBadge(currentMonth);
    const workSection = moderator.notes || moderator.rank || 'Moderator';
    // Check for absent field - handle both null, undefined, and empty string
    const hasAbsent = moderator.absent && moderator.absent.trim() !== '';
    const absentInfo = hasAbsent ? `<div class="card-absent-info">🚫 Absent: ${escapeHtml(moderator.absent)}</div>` : '';
    
    return `
        <div class="moderator-card" data-mod-id="${moderator.id}" style="cursor: pointer;">
            <div class="card-content">
                <div class="card-header">
                    <div class="card-avatar">
                        ${typeof avatar === 'string' && avatar.startsWith('http') 
                            ? `<img src="${avatar}" alt="${moderator.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid var(--card-bg);">`
                            : avatar}
                    </div>
                    <div class="card-info" style="flex: 1;">
                        <div class="card-mod-tag">MODERATOR</div>
                        <div class="card-name">${escapeHtml(moderator.name)}</div>
                        <div class="card-work-section">${escapeHtml(workSection)}</div>
                        <span class="card-status ${statusClass}" style="margin-top: 0.5rem; display: inline-block;">${moderator.status || 'active'}</span>
                        ${absentInfo}
                    </div>
                    <button class="card-edit-btn" data-edit-mod-id="${moderator.id}" title="Edit Moderator">
                        ✏️
                    </button>
                </div>
                <div class="card-stats">
                    <div class="stat-item">
                        <div class="stat-label">Reports</div>
                        <div class="stat-value">${currentMonth?.reports_handled || 0}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Hours</div>
                        <div class="stat-value">${(currentMonth?.hours_worked || 0).toFixed(1)}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Punishments</div>
                        <div class="stat-value">${currentMonth?.punishments_issued || 0}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Quality</div>
                        <div class="stat-value">${(currentMonth?.quality_score || 0).toFixed(1)}</div>
                    </div>
                </div>
                <div class="card-chart">
                    <canvas id="chart-${moderator.id}"></canvas>
                </div>
                ${performanceBadge}
            </div>
        </div>
    `;
}

function createMiniChart(moderatorId, stats) {
    const canvas = document.getElementById(`chart-${moderatorId}`);
    if (!canvas) return;
    
    if (charts[moderatorId]) {
        charts[moderatorId].destroy();
    }
    
    const sortedStats = [...stats].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });
    
    const last12Months = sortedStats.slice(-12);
    
    const ctx = canvas.getContext('2d');
    charts[moderatorId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last12Months.map(s => `${s.month}/${s.year}`),
            datasets: [{
                label: 'Reports',
                data: last12Months.map(s => s.reports_handled || 0),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            },
            scales: {
                y: { beginAtZero: true, display: false },
                x: { display: false }
            }
        }
    });
}

function getCurrentMonthStats(stats) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    return stats.find(s => s.year === currentYear && s.month === currentMonth);
}

function getPerformanceBadge(currentMonth) {
    if (!currentMonth) return '';
    const quality = currentMonth.quality_score || 0;
    const reports = currentMonth.reports_handled || 0;
    let badgeClass = 'badge-needs-improvement';
    let badgeText = 'Needs Improvement';
    if (quality >= 4.0 && reports >= 50) {
        badgeClass = 'badge-excellent';
        badgeText = 'Excellent';
    } else if (quality >= 3.0 && reports >= 25) {
        badgeClass = 'badge-good';
        badgeText = 'Good';
    }
    return `<span class="performance-badge ${badgeClass}">${badgeText}</span>`;
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function attachCardClickHandlers() {
    // Attach click handler directly to each card
    const cards = document.querySelectorAll('.moderator-card[data-mod-id]');
    console.log(`Found ${cards.length} moderator cards to attach handlers`);
    
    cards.forEach(card => {
        const modId = card.getAttribute('data-mod-id');
        if (!modId) {
            console.warn('Card missing data-mod-id');
            return;
        }
        
        // Attach click handler to the card
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on buttons or inputs
            if (e.target.closest('button') || 
                e.target.closest('input') || 
                e.target.closest('.card-edit-btn') ||
                e.target.tagName === 'BUTTON' ||
                e.target.tagName === 'INPUT') {
                return;
            }
            
            console.log('Card clicked, opening detail for ID:', modId);
            e.preventDefault();
            e.stopPropagation();
            showModeratorDetail(parseInt(modId));
        });
        
        // Ensure cursor style
        card.style.cursor = 'pointer';
    });
    
    console.log('Card click handlers attached successfully');
}

function attachEditButtonHandlers() {
    // Attach click handlers to all edit buttons
    const editButtons = document.querySelectorAll('.card-edit-btn[data-edit-mod-id]');
    console.log(`Found ${editButtons.length} edit buttons to attach handlers`);
    
    editButtons.forEach(button => {
        const modId = button.getAttribute('data-edit-mod-id');
        if (!modId) {
            console.warn('Edit button missing data-edit-mod-id');
            return;
        }
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Edit button clicked for moderator ID:', modId);
            const modIdInt = parseInt(modId);
            if (typeof editModerator === 'function') {
                editModerator(modIdInt);
            } else if (typeof window.editModerator === 'function') {
                window.editModerator(modIdInt);
            } else {
                console.error('editModerator function not found');
                alert('Edit functionality not available. Please refresh the page.');
            }
        });
    });
    
    console.log('Edit button handlers attached successfully');
}

// Search and Filter
function setupSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
    const rankFilter = document.getElementById('rankFilter');
    const statusFilter = document.getElementById('statusFilter');
    const clearFilters = document.getElementById('clearFilters');
    
    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const rankValue = rankFilter.value;
        const statusValue = statusFilter.value;
        
        filteredModerators = moderators.filter(mod => {
            const matchesSearch = !searchTerm || 
                mod.name.toLowerCase().includes(searchTerm) ||
                (mod.rank && mod.rank.toLowerCase().includes(searchTerm));
            const matchesRank = !rankValue || mod.rank === rankValue;
            const matchesStatus = !statusValue || mod.status === statusValue;
            return matchesSearch && matchesRank && matchesStatus;
        });
        
        renderModeratorCards();
    };
    
    searchInput.addEventListener('input', applyFilters);
    rankFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    clearFilters.addEventListener('click', () => {
        searchInput.value = '';
        rankFilter.value = '';
        statusFilter.value = '';
        applyFilters();
    });
}

// Modal Management
function setupModals() {
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.getAttribute('data-modal');
            closeModal(modalId);
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    document.getElementById('addModeratorBtn').addEventListener('click', () => {
        openModal('addModeratorModal');
    });
    
    document.getElementById('addStatsBtn').addEventListener('click', () => {
        openModal('addStatsModal');
        const now = new Date();
        document.getElementById('statsYear').value = now.getFullYear();
        document.getElementById('statsMonth').value = now.getMonth() + 1;
    });
    
    document.getElementById('exportBtn').addEventListener('click', () => {
        openModal('exportModal');
        populateModeratorDropdowns();
    });
    
    const importBtn = document.getElementById('importNovemberBtn');
    if (importBtn) {
        importBtn.addEventListener('click', async () => {
            if (confirm('Import November 2024 hours for all moderators?')) {
                await importNovemberHours();
            }
        });
    }
    
    const resetBtn = document.getElementById('resetDatabaseBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
            await resetDatabase();
        });
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

// Form Handling
function setupForms() {
    document.getElementById('addModeratorForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            await createModerator(data);
            closeModal('addModeratorModal');
            await loadDashboard();
            alert('Moderator created successfully');
        } catch (error) {
            alert('Error: ' + (error.message || 'Failed to create moderator'));
        }
    });
    
    document.getElementById('addStatsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            await createStats(data);
            closeModal('addStatsModal');
            await loadDashboard();
            alert('Statistics saved successfully');
        } catch (error) {
            alert('Error: ' + (error.message || 'Failed to save statistics'));
        }
    });
    
    const editForm = document.getElementById('editModeratorForm');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const moderatorId = parseInt(formData.get('id'));
            const data = {
                name: formData.get('name'),
                discord_id: formData.get('discord_id'),
                rank: formData.get('rank'),
                status: formData.get('status'),
                notes: formData.get('notes'),
                join_date: formData.get('join_date'),
                avatar_url: formData.get('avatar_url'),
                absent: formData.get('absent')
            };
            
            try {
                await updateModerator(moderatorId, data);
                closeModal('editModeratorModal');
                await loadDashboard();
                alert('Moderator updated successfully');
            } catch (error) {
                alert('Error: ' + (error.message || 'Failed to update moderator'));
            }
        });
    }
}

function populateModeratorDropdowns() {
    const selects = ['statsModerator', 'exportModeratorSelect'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Select Moderator</option>' +
                moderators.map(m => `<option value="${m.id}">${escapeHtml(m.name)}</option>`).join('');
        }
    });
}

// Individual Moderator View
async function showModeratorDetail(moderatorId) {
    console.log('showModeratorDetail called with ID:', moderatorId);
    
    const modal = document.getElementById('moderatorDetailModal');
    const content = document.getElementById('moderatorDetailContent');
    
    if (!modal || !content) {
        console.error('Modal elements not found!');
        alert('Error: Modal not found. Please refresh the page.');
        return;
    }
    
    content.innerHTML = '<div class="loading">Loading...</div>';
    openModal('moderatorDetailModal');
    
    try {
        const moderator = moderators.find(m => m.id === moderatorId);
        if (!moderator) {
            console.error('Moderator not found:', moderatorId);
            content.innerHTML = '<p>Moderator not found</p>';
            return;
        }
        
        const stats = await getModeratorStats(moderatorId, 12);
        const sortedStats = [...stats].sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });
        
        document.getElementById('detailModeratorName').textContent = moderator.name;
        
        const avatar = moderator.avatar_url || getInitials(moderator.name);
        const workSection = moderator.notes || moderator.rank || 'Moderator';
        
        content.innerHTML = `
            <div class="detail-header">
                <div class="detail-avatar">
                    ${typeof avatar === 'string' && avatar.startsWith('http') 
                        ? `<img src="${avatar}" alt="${moderator.name}">`
                        : `<div class="avatar-initials">${avatar}</div>`}
                </div>
                <div class="detail-header-info">
                    <h2>${escapeHtml(moderator.name)}</h2>
                    <div class="detail-badges">
                        <span class="detail-badge detail-badge-mod">MODERATOR</span>
                        <span class="detail-badge detail-badge-section">${escapeHtml(workSection)}</span>
                        <span class="card-status status-${moderator.status}">${moderator.status}</span>
                    </div>
                    <button id="addStatsFromDetailBtn" class="btn-primary" style="margin-top: 1rem;">
                        + Add Stats for This Moderator
                    </button>
                </div>
            </div>
            
            <div class="detail-info-grid">
                <div class="detail-info-item">
                    <span class="detail-info-label">Rank</span>
                    <span class="detail-info-value">${escapeHtml(moderator.rank || 'N/A')}</span>
                </div>
                <div class="detail-info-item">
                    <span class="detail-info-label">Discord ID</span>
                    <span class="detail-info-value">${escapeHtml(moderator.discord_id || 'N/A')}</span>
                </div>
                <div class="detail-info-item">
                    <span class="detail-info-label">Join Date</span>
                    <span class="detail-info-value">${moderator.join_date ? new Date(moderator.join_date).toLocaleDateString() : 'N/A'}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <div class="detail-section-header">
                    <h3>📈 12-Month Statistics</h3>
                </div>
                <div class="detail-chart-container">
                    <canvas id="detailChart"></canvas>
                </div>
            </div>
            
            <div class="detail-section">
                <div class="detail-section-header">
                    <h3>📅 Monthly Breakdown</h3>
                    <span class="detail-section-subtitle">Last 12 months of activity</span>
                </div>
                <div class="detail-stats-grid">
                    ${sortedStats.length > 0 ? sortedStats.slice(0, 12).map(s => `
                        <div class="monthly-stat-card">
                            <div class="monthly-stat-header">
                                <span class="monthly-stat-month">${getMonthName(s.month)}</span>
                                <span class="monthly-stat-year">${s.year}</span>
                            </div>
                            <div class="monthly-stat-content">
                                <div class="monthly-stat-row">
                                    <span class="monthly-stat-label">📝 Reports</span>
                                    <span class="monthly-stat-value">${s.reports_handled || 0}</span>
                                </div>
                                <div class="monthly-stat-row">
                                    <span class="monthly-stat-label">⏱️ Hours</span>
                                    <span class="monthly-stat-value">${(s.hours_worked || 0).toFixed(1)}</span>
                                </div>
                                <div class="monthly-stat-row">
                                    <span class="monthly-stat-label">⭐ Quality</span>
                                    <span class="monthly-stat-value">${(s.quality_score || 0).toFixed(2)}</span>
                                </div>
                                <div class="monthly-stat-row">
                                    <span class="monthly-stat-label">⚖️ Punishments</span>
                                    <span class="monthly-stat-value">${s.punishments_issued || 0}</span>
                                </div>
                                <div class="monthly-stat-row">
                                    <span class="monthly-stat-label">⚠️ Warnings</span>
                                    <span class="monthly-stat-value">${s.warnings_issued || 0}</span>
                                </div>
                                <div class="monthly-stat-row">
                                    <span class="monthly-stat-label">🔇 Mutes</span>
                                    <span class="monthly-stat-value">${s.mutes_issued || 0}</span>
                                </div>
                                <div class="monthly-stat-row">
                                    <span class="monthly-stat-label">👢 Kicks</span>
                                    <span class="monthly-stat-value">${s.kicks_issued || 0}</span>
                                </div>
                                <div class="monthly-stat-row">
                                    <span class="monthly-stat-label">🚫 Bans</span>
                                    <span class="monthly-stat-value">${s.bans_issued || 0}</span>
                                </div>
                                <div class="monthly-stat-row">
                                    <span class="monthly-stat-label">📋 Appeals</span>
                                    <span class="monthly-stat-value">${s.appeals_reviewed || 0}</span>
                                </div>
                                <div class="monthly-stat-row">
                                    <span class="monthly-stat-label">🎮 SkyBlock Reports</span>
                                    <span class="monthly-stat-value">${s.tickets_resolved || 0}</span>
                                </div>
                                ${s.response_time_avg ? `
                                <div class="monthly-stat-row">
                                    <span class="monthly-stat-label">⏱️ Avg Response</span>
                                    <span class="monthly-stat-value">${s.response_time_avg} min</span>
                                </div>
                                ` : ''}
                                ${s.notes ? `
                                <div class="monthly-stat-notes">
                                    <strong>Notes:</strong> ${escapeHtml(s.notes)}
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('') : '<div class="no-stats-message">No statistics available yet. Add stats to see monthly breakdown.</div>'}
                </div>
            </div>
        `;
        
        // Attach add stats button handler
        const addStatsBtn = document.getElementById('addStatsFromDetailBtn');
        if (addStatsBtn) {
            addStatsBtn.addEventListener('click', () => {
                closeModal('moderatorDetailModal');
                // Pre-select this moderator in the add stats form
                setTimeout(() => {
                    openModal('addStatsModal');
                    const statsModeratorSelect = document.getElementById('statsModerator');
                    if (statsModeratorSelect) {
                        statsModeratorSelect.value = moderatorId;
                    }
                    const now = new Date();
                    document.getElementById('statsYear').value = now.getFullYear();
                    document.getElementById('statsMonth').value = now.getMonth() + 1;
                }, 300);
            });
        }
        
        // Create chart after ensuring Chart.js is loaded
        if (stats.length > 0) {
            waitForChartJS(() => {
                createDetailChart(stats);
            });
        } else {
            const chartContainer = document.querySelector('.detail-chart-container');
            if (chartContainer) {
                chartContainer.innerHTML = '<div class="no-stats-message">No statistics available yet. Add stats to see the chart.</div>';
            }
        }
    } catch (error) {
        console.error('Error loading moderator details:', error);
        content.innerHTML = '<p class="error-message">Error loading moderator details: ' + escapeHtml(error.message) + '</p>';
    }
}

// Wait for Chart.js to be available
function waitForChartJS(callback, maxAttempts = 50, attempt = 0) {
    if (typeof Chart !== 'undefined') {
        callback();
        return;
    }
    
    if (attempt >= maxAttempts) {
        console.error('Chart.js failed to load after maximum attempts');
        const container = document.querySelector('.detail-chart-container');
        if (container) {
            container.innerHTML = '<div class="error-message">Chart.js library failed to load. Please refresh the page.</div>';
        }
        return;
    }
    
    setTimeout(() => {
        waitForChartJS(callback, maxAttempts, attempt + 1);
    }, 100);
}

function createDetailChart(stats) {
    const canvas = document.getElementById('detailChart');
    if (!canvas) {
        console.error('Chart canvas not found!');
        return;
    }
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded! Attempting to wait...');
        waitForChartJS(() => createDetailChart(stats));
        return;
    }
    
    // Sort stats chronologically (oldest to newest)
    const sortedStats = [...stats].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });
    
    // Get last 12 months (or all if less than 12)
    const last12Months = sortedStats.slice(-12);
    
    if (last12Months.length === 0) {
        console.warn('No stats data available for chart');
        const container = canvas.parentElement;
        if (container) {
            container.innerHTML = '<div class="no-stats-message">No statistics available to display.</div>';
        }
        return;
    }
    
    console.log('Creating chart with', last12Months.length, 'data points');
    
    // Destroy existing chart if it exists
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last12Months.map(s => `${getMonthName(s.month).substring(0, 3)} ${s.year}`),
            datasets: [
                {
                    label: 'Reports Handled',
                    data: last12Months.map(s => s.reports_handled || 0),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Hours Worked',
                    data: last12Months.map(s => s.hours_worked || 0),
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1',
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Punishments Issued',
                    data: last12Months.map(s => s.punishments_issued || 0),
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: false,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { 
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: { 
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    title: { 
                        display: true, 
                        text: 'Reports / Punishments',
                        font: { size: 12 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: { 
                        display: true, 
                        text: 'Hours',
                        font: { size: 12 }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
    
    console.log('Chart created successfully');
}

function getMonthName(month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || month;
}

// Export
async function exportData(moderatorId, format) {
    try {
        let csv = '';
        
        if (moderatorId) {
            const moderator = moderators.find(m => m.id === parseInt(moderatorId));
            const stats = await getModeratorStats(parseInt(moderatorId), 1000);
            
            const headers = ['Year', 'Month', 'Reports Handled', 'Hours Worked', 'Punishments', 'Warnings', 'Mutes', 'Kicks', 'Bans', 'Appeals Reviewed', 'SkyBlock Reports', 'Quality Score', 'Avg Response Time'];
            const rows = stats.map(s => [
                s.year, s.month, s.reports_handled, s.hours_worked,
                s.punishments_issued, s.warnings_issued, s.mutes_issued,
                s.kicks_issued, s.bans_issued, s.appeals_reviewed,
                s.tickets_resolved, s.quality_score || '', s.response_time_avg || ''
            ]);
            
            csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${moderator.name}_stats.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            const allStats = [];
            for (const mod of moderators) {
                const stats = await getModeratorStats(mod.id, 1000);
                stats.forEach(s => {
                    allStats.push({
                        moderator: mod.name,
                        ...s
                    });
                });
            }
            
            const headers = ['Moderator', 'Year', 'Month', 'Reports Handled', 'Hours Worked', 'Punishments', 'Warnings', 'Mutes', 'Kicks', 'Bans', 'Appeals Reviewed', 'SkyBlock Reports', 'Quality Score', 'Avg Response Time'];
            const rows = allStats.map(s => [
                s.moderator, s.year, s.month, s.reports_handled, s.hours_worked,
                s.punishments_issued, s.warnings_issued, s.mutes_issued,
                s.kicks_issued, s.bans_issued, s.appeals_reviewed,
                s.tickets_resolved, s.quality_score || '', s.response_time_avg || ''
            ]);
            
            csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'all_moderators_stats.csv';
            a.click();
            URL.revokeObjectURL(url);
        }
        
        closeModal('exportModal');
        alert('Export completed successfully');
    } catch (error) {
        alert('Failed to export data');
    }
}

// Edit Moderator
async function editModerator(moderatorId) {
    const moderator = moderators.find(m => m.id === moderatorId);
    if (!moderator) {
        alert('Moderator not found');
        return;
    }
    
    // Populate the edit form
    document.getElementById('editModId').value = moderator.id;
    document.getElementById('editModName').value = moderator.name || '';
    document.getElementById('editModDiscordId').value = moderator.discord_id || '';
    document.getElementById('editModRank').value = moderator.rank || '';
    document.getElementById('editModStatus').value = moderator.status || 'active';
    document.getElementById('editModWorkSection').value = moderator.notes || '';
    document.getElementById('editModJoinDate').value = moderator.join_date || '';
    document.getElementById('editModAvatarUrl').value = moderator.avatar_url || '';
    document.getElementById('editModAbsent').value = moderator.absent || '';
    
    openModal('editModeratorModal');
}

window.exportData = exportData;
window.showModeratorDetail = showModeratorDetail;
window.editModerator = editModerator;

// Make sure it's available globally for onclick handlers
if (typeof window.showModeratorDetail === 'undefined') {
    window.showModeratorDetail = showModeratorDetail;
}
if (typeof window.editModerator === 'undefined') {
    window.editModerator = editModerator;
}

// Theme Management
function initializeTheme() {
    chrome.storage.sync.get(['theme'], (result) => {
        const savedTheme = result.theme || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    });
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    chrome.storage.sync.set({ theme: newTheme });
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Event Listeners
// Reset database and re-seed moderators
async function resetDatabase() {
    if (!confirm('This will clear all data and re-seed the default moderators. Continue?')) {
        return;
    }
    
    try {
        console.log('Resetting database...');
        
        // Close existing database connection
        if (db) {
            db.close();
        }
        
        // Delete the database
        const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
        await new Promise((resolve, reject) => {
            deleteRequest.onsuccess = () => {
                console.log('Database deleted');
                resolve();
            };
            deleteRequest.onerror = () => reject(deleteRequest.error);
            deleteRequest.onblocked = () => {
                console.warn('Database deletion blocked, retrying...');
                setTimeout(resolve, 100);
            };
        });
        
        // Re-initialize
        await initDB();
        console.log('Database re-initialized');
        
        // Re-seed moderators
        await initializeModerators();
        
        // Reload dashboard
        await loadDashboard();
        
        alert('Database reset successfully! All moderators have been re-seeded.');
    } catch (error) {
        console.error('Error resetting database:', error);
        alert('Error resetting database: ' + error.message);
    }
}

function setupEventListeners() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    setupSearchAndFilter();
    setupModals();
    setupForms();
}

// Import November Hours Function
async function importNovemberHours() {
    const novemberHours = {
        'Gerbor': 100,
        'Smoarzified': 111,
        'SaltyLia': 100,
        'Gainful': 122,
        'Rhune': 128,
        'Changitesz': 116,
        'MCVisuals': 135,
        'LeBrilliant': 74,
        'Quack': 66,
        'AmyTheMudkip': 105,
        'DeluxeRose': 180,
        'Blake': 80,
        'Alexa': 80,
        'Jade': 90
    };
    
    const year = 2024;
    const month = 11; // November
    
    // Reload moderators to ensure we have latest data
    moderators = await getAllModerators();
    
    let imported = 0;
    let updated = 0;
    let notFound = [];
    const results = [];
    
    for (const [name, hours] of Object.entries(novemberHours)) {
        const moderator = moderators.find(m => m.name === name);
        
        if (!moderator) {
            notFound.push(name);
            results.push(`❌ Moderator not found: ${name}`);
            continue;
        }
        
        try {
            // Check if stats entry exists
            const existingStats = await getModeratorStats(moderator.id, 12);
            const existing = existingStats.find(s => s.year === year && s.month === month);
            
            if (existing) {
                // Update existing - preserve other fields
                await createStats({
                    moderator_id: moderator.id,
                    year: year,
                    month: month,
                    hours_worked: hours,
                    reports_handled: existing.reports_handled || 0,
                    punishments_issued: existing.punishments_issued || 0,
                    warnings_issued: existing.warnings_issued || 0,
                    mutes_issued: existing.mutes_issued || 0,
                    kicks_issued: existing.kicks_issued || 0,
                    bans_issued: existing.bans_issued || 0,
                    appeals_reviewed: existing.appeals_reviewed || 0,
                    tickets_resolved: existing.tickets_resolved || 0,
                    quality_score: existing.quality_score || null,
                    response_time_avg: existing.response_time_avg || null,
                    notes: existing.notes || null
                });
                updated++;
                results.push(`✅ Updated: ${name} - ${hours} hours`);
            } else {
                // Create new
                await createStats({
                    moderator_id: moderator.id,
                    year: year,
                    month: month,
                    hours_worked: hours,
                    reports_handled: 0,
                    punishments_issued: 0,
                    warnings_issued: 0,
                    mutes_issued: 0,
                    kicks_issued: 0,
                    bans_issued: 0,
                    appeals_reviewed: 0,
                    tickets_resolved: 0,
                    quality_score: null,
                    response_time_avg: null,
                    notes: null
                });
                imported++;
                results.push(`✅ Imported: ${name} - ${hours} hours`);
            }
        } catch (error) {
            results.push(`❌ Error processing ${name}: ${error.message}`);
            console.error(`Error processing ${name}:`, error);
        }
    }
    
    console.log('\n📊 November Hours Import Summary:');
    results.forEach(r => console.log(r));
    console.log(`\n   ✅ Imported: ${imported}`);
    console.log(`   🔄 Updated: ${updated}`);
    if (notFound.length > 0) {
        console.log(`   ❌ Not Found: ${notFound.join(', ')}`);
    }
    
    // Reload dashboard
    await loadDashboard();
    
    const message = `November 2024 hours imported!\n\n✅ Imported: ${imported}\n🔄 Updated: ${updated}${notFound.length > 0 ? `\n❌ Not Found: ${notFound.join(', ')}` : ''}`;
    alert(message);
}

// Make it available globally
window.importNovemberHours = importNovemberHours;

// Utilities
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

