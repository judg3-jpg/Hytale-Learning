/**
 * Moderator Statistics Dashboard - Frontend JavaScript
 */

// Global state
let moderators = [];
let filteredModerators = [];
let dashboardStats = {};
let charts = {}; // Store chart instances

// API base URL
const API_BASE = '/api';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    loadDashboard();
    setupEventListeners();
    
    // Check if we should open a specific moderator detail
    const urlParams = new URLSearchParams(window.location.search);
    const modId = urlParams.get('mod');
    if (modId) {
        // Wait for dashboard to load, then show detail
        setTimeout(() => {
            showModeratorDetail(parseInt(modId));
        }, 1000);
    }
});

// ============================================
// THEME MANAGEMENT
// ============================================

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ============================================
// API FUNCTIONS
// ============================================

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

async function fetchModeratorDetails(id) {
    try {
        const response = await fetch(`${API_BASE}/moderators/${id}`);
        if (!response.ok) throw new Error('Failed to fetch moderator details');
        return await response.json();
    } catch (error) {
        console.error('Error fetching moderator details:', error);
        return null;
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

async function fetchTopPerformers(metric = 'reports_handled', limit = 5) {
    try {
        const response = await fetch(`${API_BASE}/analytics/top-performers?metric=${metric}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch top performers');
        return await response.json();
    } catch (error) {
        console.error('Error fetching top performers:', error);
        return [];
    }
}

async function createModerator(data) {
    try {
        const response = await fetch(`${API_BASE}/moderators`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create moderator');
        return await response.json();
    } catch (error) {
        console.error('Error creating moderator:', error);
        throw error;
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

// ============================================
// DASHBOARD LOADING
// ============================================

async function loadDashboard() {
    try {
        // Load all data in parallel
        const [mods, stats] = await Promise.all([
            fetchModerators(),
            fetchDashboardStats()
        ]);
        
        moderators = mods;
        dashboardStats = stats;
        filteredModerators = [...moderators];
        
        // Update UI
        updateSummaryCards();
        renderModeratorCards();
        loadTopPerformers();
        
        // Populate dropdowns
        populateModeratorDropdowns();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard data');
    }
}

function updateSummaryCards() {
    document.getElementById('totalModerators').textContent = dashboardStats.total_moderators || 0;
    document.getElementById('activeModerators').textContent = dashboardStats.active_moderators || 0;
    document.getElementById('totalReports').textContent = dashboardStats.current_month?.total_reports || 0;
    document.getElementById('totalHours').textContent = (dashboardStats.current_month?.total_hours || 0).toFixed(1);
    document.getElementById('avgQuality').textContent = (dashboardStats.current_month?.avg_quality_score || 0).toFixed(2);
}

async function loadTopPerformers() {
    const performers = await fetchTopPerformers('reports_handled', 5);
    const container = document.getElementById('topPerformers');
    
    if (performers.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No data available</p>';
        return;
    }
    
    container.innerHTML = performers.map(p => `
        <div class="top-performer-item">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">${p.name}</div>
            <div style="font-size: 0.875rem; color: var(--text-secondary);">${p.rank || 'N/A'}</div>
            <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary-color); margin-top: 0.5rem;">${p.value || 0}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">Reports Handled</div>
        </div>
    `).join('');
}

// ============================================
// MODERATOR CARDS RENDERING
// ============================================

async function renderModeratorCards() {
    const grid = document.getElementById('moderatorGrid');
    const noResults = document.getElementById('noResults');
    
    if (filteredModerators.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    // Load stats for all moderators
    const cardsData = await Promise.all(
        filteredModerators.map(async (mod) => {
            const stats = await fetchModeratorStats(mod.id, 12);
            const currentMonth = getCurrentMonthStats(stats);
            return { moderator: mod, stats, currentMonth };
        })
    );
    
    grid.innerHTML = cardsData.map(({ moderator, stats, currentMonth }) => 
        createModeratorCardHTML(moderator, stats, currentMonth)
    ).join('');
    
    // Initialize mini charts
    cardsData.forEach(({ moderator, stats }) => {
        if (stats.length > 0) {
            createMiniChart(moderator.id, stats);
        }
    });
    
    // Attach click handlers to cards
    attachCardClickHandlers();
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
                <div class="card-actions">
                    <button class="card-action-btn" onclick="event.stopPropagation(); showModeratorDetail(${moderator.id})">View Details</button>
                    <button class="card-action-btn" onclick="event.stopPropagation(); exportModeratorData(${moderator.id})">Export</button>
                </div>
            </div>
        </div>
    `;
}

// Add click handler to moderator cards after rendering
function attachCardClickHandlers() {
    document.querySelectorAll('.moderator-card[data-mod-id]').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on buttons or links
            if (e.target.closest('.card-action-btn')) return;
            const modId = card.getAttribute('data-mod-id');
            if (modId) {
                showModeratorDetail(parseInt(modId));
            }
        });
    });
}

function createMiniChart(moderatorId, stats) {
    const canvas = document.getElementById(`chart-${moderatorId}`);
    if (!canvas) return;
    
    // Destroy existing chart if any
    if (charts[moderatorId]) {
        charts[moderatorId].destroy();
    }
    
    // Sort stats by date
    const sortedStats = [...stats].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });
    
    // Get last 12 months
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

// ============================================
// SEARCH AND FILTER
// ============================================

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

// ============================================
// MODAL MANAGEMENT
// ============================================

function setupModals() {
    // Close modals on close button click
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.getAttribute('data-modal');
            closeModal(modalId);
        });
    });
    
    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Add moderator button
    document.getElementById('addModeratorBtn').addEventListener('click', () => {
        openModal('addModeratorModal');
    });
    
    // Add stats button
    document.getElementById('addStatsBtn').addEventListener('click', () => {
        openModal('addStatsModal');
        // Set current month/year as default
        const now = new Date();
        document.getElementById('statsYear').value = now.getFullYear();
        document.getElementById('statsMonth').value = now.getMonth() + 1;
    });
    
    // Export button
    document.getElementById('exportBtn').addEventListener('click', () => {
        openModal('exportModal');
        populateExportDropdown();
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        // Reset forms
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

// ============================================
// FORM HANDLING
// ============================================

function setupForms() {
    // Add moderator form
    document.getElementById('addModeratorForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            await createModerator(data);
            closeModal('addModeratorModal');
            await loadDashboard();
            showSuccess('Moderator created successfully');
        } catch (error) {
            showError(error.message || 'Failed to create moderator');
        }
    });
    
    // Add stats form
    document.getElementById('addStatsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Convert numeric fields
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
            showSuccess('Statistics saved successfully');
        } catch (error) {
            showError(error.message || 'Failed to save statistics');
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

function populateExportDropdown() {
    populateModeratorDropdowns();
}

// ============================================
// INDIVIDUAL MODERATOR VIEW
// ============================================

async function showModeratorDetail(moderatorId) {
    const modal = document.getElementById('moderatorDetailModal');
    const content = document.getElementById('moderatorDetailContent');
    
    content.innerHTML = '<div class="loading">Loading...</div>';
    openModal('moderatorDetailModal');
    
    try {
        const details = await fetchModeratorDetails(moderatorId);
        if (!details) {
            content.innerHTML = '<p>Failed to load moderator details</p>';
            return;
        }
        
        const stats = details.stats || [];
        const sortedStats = [...stats].sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });
        
        document.getElementById('detailModeratorName').textContent = details.name;
        
        content.innerHTML = `
            <div class="detail-section">
                <h3>Moderator Information</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div><strong>Name:</strong> ${escapeHtml(details.name)}</div>
                    <div><strong>Rank:</strong> ${escapeHtml(details.rank || 'N/A')}</div>
                    <div><strong>Status:</strong> <span class="card-status status-${details.status}">${details.status}</span></div>
                    <div><strong>Discord ID:</strong> ${escapeHtml(details.discord_id || 'N/A')}</div>
                    <div><strong>Join Date:</strong> ${details.join_date || 'N/A'}</div>
                </div>
                ${details.notes ? `<div style="margin-top: 1rem;"><strong>Notes:</strong> ${escapeHtml(details.notes)}</div>` : ''}
            </div>
            
            <div class="detail-section">
                <h3>12-Month Statistics</h3>
                <div class="detail-chart-container">
                    <canvas id="detailChart"></canvas>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Monthly Breakdown (Last 12 Months)</h3>
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
            
            ${details.activity_log && details.activity_log.length > 0 ? `
            <div class="detail-section">
                <h3>Recent Activity</h3>
                <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 0.5rem; max-height: 300px; overflow-y: auto;">
                    ${details.activity_log.slice(0, 20).map(log => `
                        <div style="padding: 0.75rem; border-bottom: 1px solid var(--border-color);">
                            <div style="font-size: 0.875rem; color: var(--text-secondary);">
                                <strong>${escapeHtml(log.action_type || 'Activity')}</strong>
                                <span style="float: right; font-size: 0.75rem;">${new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                            ${log.details ? `<div style="margin-top: 0.25rem; font-size: 0.8rem; color: var(--text-tertiary);">${escapeHtml(log.details)}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;
        
        // Create detail chart
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

// ============================================
// EXPORT FUNCTIONALITY
// ============================================

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
        showSuccess('Export completed successfully');
    } catch (error) {
        showError('Failed to export data');
    }
}

function exportModeratorData(moderatorId) {
    exportData(moderatorId, 'csv');
}

// Make exportData available globally
window.exportData = exportData;
window.exportModeratorData = exportModeratorData;
window.showModeratorDetail = showModeratorDetail;

// ============================================
// EVENT LISTENERS SETUP
// ============================================

function setupEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Search and filter
    setupSearchAndFilter();
    
    // Modals
    setupModals();
    
    // Forms
    setupForms();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    // Simple alert for now - can be enhanced with a toast notification
    alert('Error: ' + message);
}

function showSuccess(message) {
    // Simple alert for now - can be enhanced with a toast notification
    alert('Success: ' + message);
}

