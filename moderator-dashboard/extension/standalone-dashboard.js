/**
 * Standalone Moderator Dashboard - No Server Required
 * Uses IndexedDB for local storage
 */

// IndexedDB setup
const DB_NAME = 'ModeratorDashboard';
const DB_VERSION = 1;
let db = null;

// Global state
let moderators = [];
let filteredModerators = [];
let dashboardStats = {};
let charts = {};

// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create moderators store
            if (!db.objectStoreNames.contains('moderators')) {
                const modStore = db.createObjectStore('moderators', { keyPath: 'id', autoIncrement: true });
                modStore.createIndex('name', 'name', { unique: false });
            }
            
            // Create stats store
            if (!db.objectStoreNames.contains('stats')) {
                const statsStore = db.createObjectStore('stats', { keyPath: 'id', autoIncrement: true });
                statsStore.createIndex('moderator_id', 'moderator_id', { unique: false });
                statsStore.createIndex('year_month', ['moderator_id', 'year', 'month'], { unique: true });
            }
            
            // Create activity log store
            if (!db.objectStoreNames.contains('activity_log')) {
                const logStore = db.createObjectStore('activity_log', { keyPath: 'id', autoIncrement: true });
                logStore.createIndex('moderator_id', 'moderator_id', { unique: false });
            }
        };
    });
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initDB();
        await initializeModerators();
        initializeTheme();
        await loadDashboard();
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing:', error);
    }
});

// Initialize default moderators if database is empty
async function initializeModerators() {
    const count = await getModeratorCount();
    if (count === 0) {
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
        
        for (const mod of defaultMods) {
            await createModerator(mod);
        }
    }
}

async function getModeratorCount() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['moderators'], 'readonly');
        const store = transaction.objectStore('moderators');
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Database operations
async function getAllModerators() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['moderators'], 'readonly');
        const store = transaction.objectStore('moderators');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function createModerator(moderator) {
    return new Promise((resolve, reject) => {
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
            created_at: new Date().toISOString()
        };
        const request = store.add(modData);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
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
    moderators = await getAllModerators();
    dashboardStats = await getDashboardStats();
    filteredModerators = [...moderators];
    
    updateSummaryCards();
    renderModeratorCards();
    populateModeratorDropdowns();
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
    
    cardsData.forEach(({ moderator, stats }) => {
        if (stats.length > 0) {
            createMiniChart(moderator.id, stats);
        }
    });
    
    attachCardClickHandlers();
}

function createModeratorCardHTML(moderator, stats, currentMonth) {
    const avatar = moderator.avatar_url || getInitials(moderator.name);
    const statusClass = `status-${moderator.status || 'active'}`;
    const performanceBadge = getPerformanceBadge(currentMonth);
    const workSection = moderator.notes || moderator.rank || 'Moderator';
    
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
                    </div>
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
    document.querySelectorAll('.moderator-card[data-mod-id]').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.card-action-btn')) return;
            const modId = card.getAttribute('data-mod-id');
            if (modId) {
                showModeratorDetail(parseInt(modId));
            }
        });
    });
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
    const modal = document.getElementById('moderatorDetailModal');
    const content = document.getElementById('moderatorDetailContent');
    
    content.innerHTML = '<div class="loading">Loading...</div>';
    openModal('moderatorDetailModal');
    
    try {
        const moderator = moderators.find(m => m.id === moderatorId);
        if (!moderator) {
            content.innerHTML = '<p>Moderator not found</p>';
            return;
        }
        
        const stats = await getModeratorStats(moderatorId, 12);
        const sortedStats = [...stats].sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });
        
        document.getElementById('detailModeratorName').textContent = moderator.name;
        
        content.innerHTML = `
            <div class="detail-section">
                <h3>Moderator Information</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div><strong>Name:</strong> ${escapeHtml(moderator.name)}</div>
                    <div><strong>Rank:</strong> ${escapeHtml(moderator.rank || 'N/A')}</div>
                    <div><strong>Status:</strong> <span class="card-status status-${moderator.status}">${moderator.status}</span></div>
                    <div><strong>Work Section:</strong> ${escapeHtml(moderator.notes || 'N/A')}</div>
                    <div><strong>Discord ID:</strong> ${escapeHtml(moderator.discord_id || 'N/A')}</div>
                    <div><strong>Join Date:</strong> ${moderator.join_date || 'N/A'}</div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>12-Month Statistics</h3>
                <div class="detail-chart-container">
                    <canvas id="detailChart"></canvas>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Monthly Breakdown</h3>
                <div class="detail-stats-grid">
                    ${sortedStats.slice(0, 12).map(s => `
                        <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 0.5rem; border: 1px solid var(--border-color);">
                            <div style="font-weight: 600; margin-bottom: 0.75rem; font-size: 1rem; color: var(--text-primary);">
                                ${getMonthName(s.month)} ${s.year}
                            </div>
                            <div style="font-size: 0.875rem; color: var(--text-secondary); display: grid; gap: 0.5rem;">
                                <div><strong>Reports:</strong> ${s.reports_handled || 0}</div>
                                <div><strong>Hours:</strong> ${(s.hours_worked || 0).toFixed(1)}</div>
                                <div><strong>Quality Score:</strong> ${(s.quality_score || 0).toFixed(2)}/5.00</div>
                                <div><strong>Punishments:</strong> ${s.punishments_issued || 0}</div>
                                <div><strong>Warnings:</strong> ${s.warnings_issued || 0}</div>
                                <div><strong>Mutes:</strong> ${s.mutes_issued || 0}</div>
                                <div><strong>Kicks:</strong> ${s.kicks_issued || 0}</div>
                                <div><strong>Bans:</strong> ${s.bans_issued || 0}</div>
                                <div><strong>Appeals:</strong> ${s.appeals_reviewed || 0}</div>
                                <div><strong>SkyBlock Reports:</strong> ${s.tickets_resolved || 0}</div>
                                ${s.response_time_avg ? `<div><strong>Avg Response:</strong> ${s.response_time_avg} min</div>` : ''}
                                ${s.notes ? `<div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color);"><strong>Notes:</strong> ${escapeHtml(s.notes)}</div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        if (stats.length > 0) {
            setTimeout(() => createDetailChart(stats), 100);
        }
    } catch (error) {
        console.error('Error loading moderator details:', error);
        content.innerHTML = '<p>Error loading moderator details</p>';
    }
}

function createDetailChart(stats) {
    const canvas = document.getElementById('detailChart');
    if (!canvas) return;
    
    const sortedStats = [...stats].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });
    
    const last12Months = sortedStats.slice(-12);
    
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: last12Months.map(s => `${getMonthName(s.month)} ${s.year}`),
            datasets: [
                {
                    label: 'Reports Handled',
                    data: last12Months.map(s => s.reports_handled || 0),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Hours Worked',
                    data: last12Months.map(s => s.hours_worked || 0),
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true },
                tooltip: { enabled: true }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    title: { display: true, text: 'Reports' }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: { display: true, text: 'Hours' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
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

window.exportData = exportData;
window.showModeratorDetail = showModeratorDetail;

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

