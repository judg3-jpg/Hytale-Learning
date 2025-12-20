/**
 * Moderator Dashboard Extension - Side Panel JavaScript
 * Connects to the local server or uses IndexedDB for offline access
 */

// Configuration - Change this to your server URL if different
const API_BASE = 'http://localhost:3000/api';
const USE_OFFLINE_MODE = false; // Set to true to use IndexedDB instead of server

// Global state
let moderators = [];
let filteredModerators = [];
let dashboardStats = {};
let charts = {};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    checkServerConnection();
    setupEventListeners();
});

// Check if server is available
async function checkServerConnection() {
    try {
        const response = await fetch(`${API_BASE}/stats`, { 
            method: 'GET',
            signal: AbortSignal.timeout(2000) // 2 second timeout
        });
        if (response.ok) {
            loadDashboard();
        } else {
            showOfflineMode();
        }
    } catch (error) {
        console.log('Server not available, using offline mode');
        showOfflineMode();
    }
}

function showOfflineMode() {
    const grid = document.getElementById('moderatorGrid');
    grid.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
            <p>⚠️ Server not available</p>
            <p style="font-size: 0.875rem; margin-top: 0.5rem;">
                Make sure the server is running on http://localhost:3000
            </p>
            <button class="btn-primary" onclick="location.reload()" style="margin-top: 1rem;">Retry Connection</button>
        </div>
    `;
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

// API Functions (same as main dashboard)
async function fetchModerators() {
    try {
        const response = await fetch(`${API_BASE}/moderators`);
        if (!response.ok) throw new Error('Failed to fetch moderators');
        return await response.json();
    } catch (error) {
        console.error('Error fetching moderators:', error);
        return [];
    }
}

async function fetchDashboardStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        return await response.json();
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {};
    }
}

async function fetchModeratorStats(id, limit = 12) {
    try {
        const response = await fetch(`${API_BASE}/stats/moderator/${id}?limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        return await response.json();
    } catch (error) {
        console.error('Error fetching stats:', error);
        return [];
    }
}

async function createStats(data) {
    try {
        const response = await fetch(`${API_BASE}/stats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create stats');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating stats:', error);
        throw error;
    }
}

// Dashboard Loading
async function loadDashboard() {
    try {
        const [mods, stats] = await Promise.all([
            fetchModerators(),
            fetchDashboardStats()
        ]);
        
        moderators = mods;
        dashboardStats = stats;
        filteredModerators = [...moderators];
        
        updateSummaryCards();
        renderModeratorCards();
        populateModeratorDropdowns();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard data');
    }
}

function updateSummaryCards() {
    const totalEl = document.getElementById('totalModerators');
    const activeEl = document.getElementById('activeModerators');
    const reportsEl = document.getElementById('totalReports');
    const hoursEl = document.getElementById('totalHours');
    
    if (totalEl) totalEl.textContent = dashboardStats.total_moderators || 0;
    if (activeEl) activeEl.textContent = dashboardStats.active_moderators || 0;
    if (reportsEl) reportsEl.textContent = dashboardStats.current_month?.total_reports || 0;
    if (hoursEl) hoursEl.textContent = (dashboardStats.current_month?.total_hours || 0).toFixed(1);
}

async function renderModeratorCards() {
    const grid = document.getElementById('moderatorGrid');
    const noResults = document.getElementById('noResults');
    
    if (filteredModerators.length === 0) {
        if (grid) grid.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    if (noResults) noResults.style.display = 'none';
    
    const cardsData = await Promise.all(
        filteredModerators.map(async (mod) => {
            const stats = await fetchModeratorStats(mod.id, 12);
            const currentMonth = getCurrentMonthStats(stats);
            return { moderator: mod, stats, currentMonth };
        })
    );
    
    if (grid) {
        grid.innerHTML = cardsData.map(({ moderator, stats, currentMonth }) => 
            createModeratorCardHTML(moderator, stats, currentMonth)
        ).join('');
        
        cardsData.forEach(({ moderator, stats }) => {
            if (stats.length > 0) {
                createMiniChart(moderator.id, stats);
            }
        });
        
        // Attach click handlers to cards
        attachCardClickHandlers();
    }
}

// Add click handler to moderator cards
function attachCardClickHandlers() {
    document.querySelectorAll('.moderator-card[data-mod-id]').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on buttons
            if (e.target.closest('.card-action-btn')) return;
            const modId = card.getAttribute('data-mod-id');
            if (modId) {
                showModeratorDetail(parseInt(modId));
            }
        });
    });
}

function createModeratorCardHTML(moderator, stats, currentMonth) {
    const avatar = moderator.avatar_url || getInitials(moderator.name);
    const statusClass = `status-${moderator.status || 'active'}`;
    const performanceBadge = getPerformanceBadge(currentMonth);
    
    // Get work section from notes field (contains work section info)
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

// Search and Filter
function setupSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
    const rankFilter = document.getElementById('rankFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    const applyFilters = () => {
        const searchTerm = searchInput?.value.toLowerCase() || '';
        const rankValue = rankFilter?.value || '';
        const statusValue = statusFilter?.value || '';
        
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
    
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (rankFilter) rankFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
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
    
    const addStatsBtn = document.getElementById('addStatsBtn');
    if (addStatsBtn) {
        addStatsBtn.addEventListener('click', () => {
            openModal('addStatsModal');
            const now = new Date();
            const yearInput = document.getElementById('statsYear');
            const monthInput = document.getElementById('statsMonth');
            if (yearInput) yearInput.value = now.getFullYear();
            if (monthInput) monthInput.value = now.getMonth() + 1;
        });
    }
    
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            openModal('exportModal');
            populateModeratorDropdowns();
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
    const form = document.getElementById('addStatsForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            const numericFields = ['year', 'month', 'reports_handled', 'hours_worked', 'warnings_issued', 
                                  'mutes_issued', 'kicks_issued', 'bans_issued', 'appeals_reviewed', 
                                  'tickets_resolved', 'quality_score', 'response_time_avg'];
            numericFields.forEach(field => {
                if (data[field]) {
                    data[field] = field === 'hours_worked' || field === 'quality_score' 
                        ? parseFloat(data[field]) 
                        : parseInt(data[field]);
                }
            });
            
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

// Export
async function exportData(moderatorId, format) {
    try {
        const url = moderatorId 
            ? `${API_BASE}/stats/export/${moderatorId}`
            : `${API_BASE}/stats/export`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Export failed');
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = moderatorId ? `moderator_${moderatorId}_stats.csv` : 'all_moderators_stats.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        
        closeModal('exportModal');
        alert('Export completed successfully');
    } catch (error) {
        alert('Failed to export data');
    }
}

window.exportData = exportData;

// Individual Moderator View
async function showModeratorDetail(moderatorId) {
    // Open in main dashboard page instead of modal for better experience
    window.open(`http://localhost:3000/?mod=${moderatorId}`, '_blank');
}

window.showModeratorDetail = showModeratorDetail;

// Event Listeners
function setupEventListeners() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    setupSearchAndFilter();
    setupModals();
    setupForms();
}

// Utilities
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    alert('Error: ' + message);
}

