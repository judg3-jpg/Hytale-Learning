/**
 * Chat Filter Dashboard - Frontend JavaScript
 * Handles all UI interactions and API calls
 */

// ============================================
// STATE
// ============================================
let filters = [];
let logs = [];
let currentPage = 'dashboard';

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Set up navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            showPage(page);
        });
    });

    // Set up pattern test
    document.getElementById('filterPattern')?.addEventListener('input', testPattern);
    document.getElementById('testInput')?.addEventListener('input', testPattern);

    // Initial load
    loadDashboard();
});

// ============================================
// NAVIGATION
// ============================================
function showPage(pageName) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === pageName);
    });

    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`page-${pageName}`)?.classList.add('active');

    // Update title
    const titles = {
        'dashboard': 'Dashboard',
        'filters': 'Filters',
        'add-filter': 'Add Filter',
        'bulk-import': 'Bulk Import',
        'logs': 'Logs',
        'whitelist': 'Whitelist'
    };
    document.getElementById('pageTitle').textContent = titles[pageName] || pageName;

    currentPage = pageName;

    // Load page data
    switch (pageName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'filters':
            loadFilters();
            break;
        case 'logs':
            loadLogs();
            break;
        case 'whitelist':
            loadWhitelist();
            break;
    }
}

// ============================================
// API HELPERS
// ============================================
async function api(endpoint, options = {}) {
    try {
        const response = await fetch(`/api${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// DASHBOARD
// ============================================
async function loadDashboard() {
    const result = await api('/stats');
    
    if (result.success) {
        const data = result.data;
        
        // Update stats
        document.getElementById('statTotalFilters').textContent = data.totalFilters;
        document.getElementById('statEnabledFilters').textContent = data.enabledFilters;
        document.getElementById('statDisabledFilters').textContent = data.disabledFilters;
        document.getElementById('statViolations').textContent = data.totalViolations;
        document.getElementById('filterCount').textContent = data.enabledFilters;

        // Update top filters
        const topFiltersEl = document.getElementById('topFilters');
        if (data.topFilters && data.topFilters.length > 0) {
            topFiltersEl.innerHTML = data.topFilters.map(f => `
                <div class="list-item">
                    <span class="list-item-name">${escapeHtml(f.filter_name || 'Unknown')}</span>
                    <span class="list-item-count">${f.hit_count} hits</span>
                </div>
            `).join('');
        } else {
            topFiltersEl.innerHTML = '<p class="empty-state">No data yet</p>';
        }

        // Update recent violations
        const violationsEl = document.getElementById('recentViolations');
        if (data.recentViolations && data.recentViolations.length > 0) {
            violationsEl.innerHTML = data.recentViolations.map(v => `
                <div class="violation-item">
                    <div class="violation-header">
                        <span class="violation-user">${escapeHtml(v.username || 'Unknown')}</span>
                        <span class="violation-time">${formatTime(v.timestamp)}</span>
                    </div>
                    <div class="violation-message">${escapeHtml(truncate(v.message_content, 100))}</div>
                </div>
            `).join('');
        } else {
            violationsEl.innerHTML = '<p class="empty-state">No violations yet</p>';
        }
    }
}

// ============================================
// FILTERS
// ============================================
async function loadFilters() {
    const result = await api('/filters');
    
    if (result.success) {
        filters = result.data;
        renderFiltersTable();
        document.getElementById('filterCount').textContent = filters.filter(f => f.enabled).length;
    }
}

function renderFiltersTable() {
    const tbody = document.getElementById('filtersTableBody');
    const searchTerm = document.getElementById('filterSearch')?.value.toLowerCase() || '';
    
    const filteredFilters = filters.filter(f => 
        f.name.toLowerCase().includes(searchTerm) || 
        f.pattern.toLowerCase().includes(searchTerm)
    );

    tbody.innerHTML = filteredFilters.map(f => `
        <tr>
            <td><input type="checkbox" class="filter-checkbox" value="${f.id}"></td>
            <td>${f.id}</td>
            <td>${escapeHtml(f.name)}</td>
            <td><code class="pattern-cell" title="${escapeHtml(f.pattern)}">${escapeHtml(truncate(f.pattern, 30))}</code></td>
            <td><span class="action-badge ${f.action}">${f.action}</span></td>
            <td>
                <span class="${f.enabled ? 'status-enabled' : 'status-disabled'}">
                    ${f.enabled ? '🟢 Active' : '🔴 Disabled'}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button onclick="toggleFilter(${f.id})" title="Toggle">
                        ${f.enabled ? '⏸️' : '▶️'}
                    </button>
                    <button onclick="editFilter(${f.id})" title="Edit">✏️</button>
                    <button onclick="deleteFilter(${f.id})" title="Delete">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterTable() {
    renderFiltersTable();
}

async function toggleFilter(id) {
    const result = await api(`/filters/${id}/toggle`, { method: 'POST' });
    
    if (result.success) {
        toast('Filter toggled', 'success');
        loadFilters();
    } else {
        toast(result.error || 'Failed to toggle filter', 'error');
    }
}

async function deleteFilter(id) {
    if (!confirm('Are you sure you want to delete this filter?')) return;
    
    const result = await api(`/filters/${id}`, { method: 'DELETE' });
    
    if (result.success) {
        toast('Filter deleted', 'success');
        loadFilters();
    } else {
        toast(result.error || 'Failed to delete filter', 'error');
    }
}

function editFilter(id) {
    const filter = filters.find(f => f.id === id);
    if (!filter) return;

    document.getElementById('editFilterId').value = filter.id;
    document.getElementById('editFilterName').value = filter.name;
    document.getElementById('editFilterPattern').value = filter.pattern;
    document.getElementById('editFilterAction').value = filter.action;

    document.getElementById('editModal').classList.add('active');
}

function closeModal() {
    document.getElementById('editModal').classList.remove('active');
}

async function saveFilter(e) {
    e.preventDefault();
    
    const id = document.getElementById('editFilterId').value;
    const updates = {
        name: document.getElementById('editFilterName').value,
        pattern: document.getElementById('editFilterPattern').value,
        action: document.getElementById('editFilterAction').value,
    };

    const result = await api(`/filters/${id}`, {
        method: 'PUT',
        body: updates
    });

    if (result.success) {
        toast('Filter updated', 'success');
        closeModal();
        loadFilters();
    } else {
        toast(result.error || 'Failed to update filter', 'error');
    }
}

function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll').checked;
    document.querySelectorAll('.filter-checkbox').forEach(cb => {
        cb.checked = selectAll;
    });
}

async function deleteSelectedFilters() {
    const selected = Array.from(document.querySelectorAll('.filter-checkbox:checked'))
        .map(cb => cb.value);
    
    if (selected.length === 0) {
        toast('No filters selected', 'warning');
        return;
    }

    if (!confirm(`Delete ${selected.length} filter(s)?`)) return;

    const result = await api('/filters/bulk-delete', {
        method: 'POST',
        body: { ids: selected }
    });

    if (result.success) {
        toast(`Deleted ${selected.length} filters`, 'success');
        loadFilters();
    } else {
        toast(result.error || 'Failed to delete filters', 'error');
    }
}

// ============================================
// ADD FILTER
// ============================================
async function addFilter(e) {
    e.preventDefault();

    const data = {
        name: document.getElementById('filterName').value,
        pattern: document.getElementById('filterPattern').value,
        action: document.getElementById('filterAction').value,
        caseSensitive: document.getElementById('filterCaseSensitive').value === 'true'
    };

    const result = await api('/filters', {
        method: 'POST',
        body: data
    });

    if (result.success) {
        toast('Filter added successfully', 'success');
        document.getElementById('addFilterForm').reset();
        document.getElementById('testResult').className = 'test-result';
        document.getElementById('testResult').textContent = '';
        showPage('filters');
    } else {
        toast(result.error || 'Failed to add filter', 'error');
    }
}

function testPattern() {
    const pattern = document.getElementById('filterPattern').value;
    const testInput = document.getElementById('testInput').value;
    const resultEl = document.getElementById('testResult');

    if (!pattern || !testInput) {
        resultEl.className = 'test-result';
        resultEl.textContent = '';
        return;
    }

    try {
        const regex = new RegExp(pattern, 'gi');
        const matches = testInput.match(regex);

        if (matches) {
            resultEl.className = 'test-result match';
            resultEl.textContent = `✗ WOULD BE FILTERED - Matched: "${matches.join('", "')}"`;
        } else {
            resultEl.className = 'test-result no-match';
            resultEl.textContent = '✓ Would pass - No match';
        }
    } catch (e) {
        resultEl.className = 'test-result match';
        resultEl.textContent = `Invalid regex: ${e.message}`;
    }
}

// ============================================
// BULK IMPORT
// ============================================
async function bulkImport(e) {
    e.preventDefault();

    const words = document.getElementById('bulkWords').value
        .split('\n')
        .map(w => w.trim())
        .filter(w => w.length > 0);

    if (words.length === 0) {
        toast('No words to import', 'warning');
        return;
    }

    const isRegex = document.getElementById('bulkIsRegex').checked;
    const action = document.getElementById('bulkAction').value;

    const filters = words.map(word => ({
        name: word.substring(0, 50),
        pattern: isRegex ? word : escapeRegex(word),
        action: action
    }));

    const result = await api('/filters/bulk-import', {
        method: 'POST',
        body: { filters, action }
    });

    if (result.success) {
        toast(`Imported ${result.data.added} filters (${result.data.failed} failed)`, 'success');
        document.getElementById('bulkWords').value = '';
        showPage('filters');
    } else {
        toast(result.error || 'Failed to import', 'error');
    }
}

async function loadToxicPresets() {
    if (!confirm('This will add 50+ toxic content filters. Continue?')) return;

    const result = await api('/filters/load-toxic', {
        method: 'POST',
        body: { action: 'delete' }
    });

    if (result.success) {
        toast(`Loaded ${result.data.added} toxic filters`, 'success');
        showPage('filters');
    } else {
        toast(result.error || 'Failed to load presets', 'error');
    }
}

// ============================================
// LOGS
// ============================================
async function loadLogs() {
    const result = await api('/logs?limit=100');
    
    if (result.success) {
        logs = result.data;
        renderLogsTable();
    }
}

function renderLogsTable() {
    const tbody = document.getElementById('logsTableBody');
    const searchTerm = document.getElementById('logSearch')?.value.toLowerCase() || '';
    
    const filteredLogs = logs.filter(l => 
        (l.username || '').toLowerCase().includes(searchTerm) || 
        (l.message_content || '').toLowerCase().includes(searchTerm) ||
        (l.filter_name || '').toLowerCase().includes(searchTerm)
    );

    tbody.innerHTML = filteredLogs.map(l => `
        <tr>
            <td>${formatTime(l.timestamp)}</td>
            <td>${escapeHtml(l.username || 'Unknown')}</td>
            <td>${escapeHtml(l.filter_name || 'Unknown')}</td>
            <td title="${escapeHtml(l.message_content || '')}">${escapeHtml(truncate(l.message_content, 50))}</td>
            <td><span class="action-badge ${l.action_taken}">${l.action_taken}</span></td>
        </tr>
    `).join('');

    if (filteredLogs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No logs found</td></tr>';
    }
}

function filterLogs() {
    renderLogsTable();
}

// ============================================
// WHITELIST
// ============================================
async function loadWhitelist() {
    const [rolesResult, channelsResult] = await Promise.all([
        api('/whitelist/roles'),
        api('/whitelist/channels')
    ]);

    // Render roles
    const rolesEl = document.getElementById('whitelistRoles');
    if (rolesResult.success && rolesResult.data.length > 0) {
        rolesEl.innerHTML = rolesResult.data.map(r => `
            <div class="whitelist-item">
                <div class="whitelist-item-info">
                    <span class="whitelist-item-name">${escapeHtml(r.role_name)}</span>
                    <span class="whitelist-item-id">${r.role_id}</span>
                </div>
                <button class="btn btn-sm btn-danger" onclick="removeWhitelistRole('${r.role_id}')">Remove</button>
            </div>
        `).join('');
    } else {
        rolesEl.innerHTML = '<p class="empty-state">No whitelisted roles</p>';
    }

    // Render channels
    const channelsEl = document.getElementById('whitelistChannels');
    if (channelsResult.success && channelsResult.data.length > 0) {
        channelsEl.innerHTML = channelsResult.data.map(c => `
            <div class="whitelist-item">
                <div class="whitelist-item-info">
                    <span class="whitelist-item-name">#${escapeHtml(c.channel_name)}</span>
                    <span class="whitelist-item-id">${c.channel_id}</span>
                </div>
                <button class="btn btn-sm btn-danger" onclick="removeWhitelistChannel('${c.channel_id}')">Remove</button>
            </div>
        `).join('');
    } else {
        channelsEl.innerHTML = '<p class="empty-state">No whitelisted channels</p>';
    }
}

async function addWhitelistRole(e) {
    e.preventDefault();
    
    const roleId = document.getElementById('roleId').value;
    const roleName = document.getElementById('roleName').value;

    const result = await api('/whitelist/roles', {
        method: 'POST',
        body: { roleId, roleName }
    });

    if (result.success) {
        toast('Role whitelisted', 'success');
        document.getElementById('roleId').value = '';
        document.getElementById('roleName').value = '';
        loadWhitelist();
    } else {
        toast(result.error || 'Failed to add role', 'error');
    }
}

async function removeWhitelistRole(roleId) {
    const result = await api(`/whitelist/roles/${roleId}`, { method: 'DELETE' });
    
    if (result.success) {
        toast('Role removed', 'success');
        loadWhitelist();
    } else {
        toast(result.error || 'Failed to remove role', 'error');
    }
}

async function addWhitelistChannel(e) {
    e.preventDefault();
    
    const channelId = document.getElementById('channelId').value;
    const channelName = document.getElementById('channelName').value;

    const result = await api('/whitelist/channels', {
        method: 'POST',
        body: { channelId, channelName }
    });

    if (result.success) {
        toast('Channel whitelisted', 'success');
        document.getElementById('channelId').value = '';
        document.getElementById('channelName').value = '';
        loadWhitelist();
    } else {
        toast(result.error || 'Failed to add channel', 'error');
    }
}

async function removeWhitelistChannel(channelId) {
    const result = await api(`/whitelist/channels/${channelId}`, { method: 'DELETE' });
    
    if (result.success) {
        toast('Channel removed', 'success');
        loadWhitelist();
    } else {
        toast(result.error || 'Failed to remove channel', 'error');
    }
}

// ============================================
// BOT CONTROL
// ============================================
async function reloadFilters() {
    const result = await api('/bot/reload', { method: 'POST' });
    
    if (result.success) {
        toast(`Filters reloaded! ${result.data.activeFilters} active`, 'success');
        document.getElementById('filterCount').textContent = result.data.activeFilters;
    } else {
        toast(result.error || 'Failed to reload', 'error');
    }
}

// ============================================
// UTILITIES
// ============================================
function toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${getToastIcon(type)}</span>
        <span>${escapeHtml(message)}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getToastIcon(type) {
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function truncate(str, length) {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
}

function formatTime(timestamp) {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleString();
}
