// Dashboard JavaScript - CSV Version

let allCreators = [];
let reviewQueue = [];
let selectedForReview = new Set();

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupNavigation();
  setupEventListeners();
  setupFileUpload();
  await initializeData();
});

// Load settings
async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get({
      reviewerName: 'Judge',
      overdueMonths: 3,
      inactiveMonths: 6,
      youtubeApiKey: '',
      twitchClientId: '',
      twitchClientSecret: ''
    });
    
    document.getElementById('settingReviewerName').value = settings.reviewerName;
    document.getElementById('settingOverdueMonths').value = settings.overdueMonths;
    document.getElementById('settingInactiveMonths').value = settings.inactiveMonths;
    
    // API settings
    if (document.getElementById('settingYoutubeApiKey')) {
      document.getElementById('settingYoutubeApiKey').value = settings.youtubeApiKey || '';
      updateApiStatusBadge('youtube', !!settings.youtubeApiKey);
    }
    if (document.getElementById('settingTwitchClientId')) {
      document.getElementById('settingTwitchClientId').value = settings.twitchClientId || '';
    }
    if (document.getElementById('settingTwitchClientSecret')) {
      document.getElementById('settingTwitchClientSecret').value = settings.twitchClientSecret || '';
      updateApiStatusBadge('twitch', !!(settings.twitchClientId && settings.twitchClientSecret));
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Update API status badge
function updateApiStatusBadge(api, isConfigured) {
  const badge = document.getElementById(`${api}ApiStatusBadge`);
  if (badge) {
    if (isConfigured) {
      badge.textContent = '✓ Configured';
      badge.classList.add('configured');
    } else {
      badge.textContent = 'Not Configured';
      badge.classList.remove('configured');
    }
  }
}

// Setup navigation
function setupNavigation() {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      navigateTo(page);
    });
  });
}

// Navigate to page
function navigateTo(pageName) {
  // Update nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageName);
  });
  
  // Update pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.toggle('active', page.id === `page-${pageName}`);
  });
  
  // Update header
  const titles = {
    overview: ['Overview', 'Dashboard overview and statistics'],
    creators: ['All Creators', 'View and manage all creators'],
    reviews: ['Review Queue', 'Creators needing review'],
    warnings: ['Warnings', 'Creators with warnings'],
    inactive: ['Inactive', 'Inactive creators (6+ months)'],
    settings: ['Settings', 'Configure your preferences']
  };
  
  const [title, subtitle] = titles[pageName] || ['Dashboard', ''];
  document.getElementById('pageTitle').textContent = title;
  document.getElementById('pageSubtitle').textContent = subtitle;
}

// Setup event listeners
function setupEventListeners() {
  // Save settings
  document.getElementById('btnSaveSettings').addEventListener('click', saveSettings);
  
  // Export buttons
  document.getElementById('btnExportCSV').addEventListener('click', exportCSV);
  document.getElementById('btnExportCreators')?.addEventListener('click', exportCSV);
  document.getElementById('btnExportSettings')?.addEventListener('click', exportCSV);
  
  // Refresh buttons
  document.getElementById('btnRefreshCreators')?.addEventListener('click', refreshData);
  document.getElementById('btnRefreshQueue')?.addEventListener('click', refreshData);
  document.getElementById('btnReloadCSV')?.addEventListener('click', showUploadSection);
  
  // Bulk review
  document.getElementById('btnBulkReview')?.addEventListener('click', handleBulkReview);
  
  // Search
  document.getElementById('searchInput').addEventListener('input', handleSearch);
  
  // Clear data
  document.getElementById('btnClearData')?.addEventListener('click', handleClearData);
  
  // Settings upload
  document.getElementById('btnUploadSettings')?.addEventListener('click', () => {
    document.getElementById('csvFileInputSettings').click();
  });
  document.getElementById('csvFileInputSettings')?.addEventListener('change', handleFileSelect);
  
  // Modal
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  
  // Add Creator Modal
  document.getElementById('btnAddCreator')?.addEventListener('click', openAddCreatorModal);
  document.getElementById('btnAddCreatorEmpty')?.addEventListener('click', startFreshWithAddCreator);
  document.getElementById('addCreatorClose')?.addEventListener('click', closeAddCreatorModal);
  document.getElementById('addCreatorCancel')?.addEventListener('click', closeAddCreatorModal);
  document.getElementById('addCreatorBackdrop')?.addEventListener('click', closeAddCreatorModal);
  document.getElementById('addCreatorSubmit')?.addEventListener('click', handleAddCreator);
  
  // API Settings
  document.getElementById('btnSaveApiKeys')?.addEventListener('click', saveApiKeys);
  
  // Toggle password visibility for API keys
  setupPasswordToggle('btnToggleYoutubeKey', 'settingYoutubeApiKey');
  setupPasswordToggle('btnToggleTwitchId', 'settingTwitchClientId');
  setupPasswordToggle('btnToggleTwitchSecret', 'settingTwitchClientSecret');
}

// Setup password toggle
function setupPasswordToggle(btnId, inputId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  
  if (btn && input) {
    btn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.textContent = isPassword ? 'Hide' : 'Show';
    });
  }
}

// Save API keys
async function saveApiKeys() {
  const youtubeApiKey = document.getElementById('settingYoutubeApiKey')?.value.trim() || '';
  const twitchClientId = document.getElementById('settingTwitchClientId')?.value.trim() || '';
  const twitchClientSecret = document.getElementById('settingTwitchClientSecret')?.value.trim() || '';
  
  try {
    await chrome.storage.sync.set({
      youtubeApiKey,
      twitchClientId,
      twitchClientSecret
    });
    
    updateApiStatusBadge('youtube', !!youtubeApiKey);
    updateApiStatusBadge('twitch', !!(twitchClientId && twitchClientSecret));
    
    showNotification('API keys saved!', 'success');
  } catch (error) {
    showNotification('Failed to save API keys', 'error');
  }
}

// Setup file upload
function setupFileUpload() {
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('csvFileInput');
  
  // Click to upload
  uploadArea.addEventListener('click', () => fileInput.click());
  
  // File selected
  fileInput.addEventListener('change', handleFileSelect);
  
  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].name.endsWith('.csv')) {
      handleFile(files[0]);
    } else {
      showNotification('Please upload a CSV file', 'error');
    }
  });
}

// Handle file selection
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
    handleFile(file);
  }
}

// Handle file upload
async function handleFile(file) {
  try {
    showNotification('Importing CSV...', 'info');
    
    const result = await csvManager.importCSV(file);
    
    showNotification(`Imported ${result.rowCount} creators!`, 'success');
    
    await initializeData();
  } catch (error) {
    console.error('Import error:', error);
    showNotification('Failed to import: ' + error.message, 'error');
  }
}

// Initialize data
async function initializeData() {
  const hasData = await csvManager.init();
  
  updateDataIndicator(hasData);
  
  if (hasData) {
    showStatsSection();
    await loadAllData();
  } else {
    showUploadSection();
  }
}

// Update data indicator
function updateDataIndicator(hasData) {
  const statusDot = document.getElementById('statusDot');
  const dataStatus = document.getElementById('dataStatus');
  const exportBtn = document.getElementById('btnExportCSV');
  
  if (hasData) {
    statusDot.classList.add('loaded');
    dataStatus.textContent = `${csvManager.data.length} creators loaded`;
    exportBtn.style.display = 'inline-flex';
  } else {
    statusDot.classList.remove('loaded');
    dataStatus.textContent = 'No data loaded';
    exportBtn.style.display = 'none';
  }
}

// Show upload section
function showUploadSection() {
  document.getElementById('uploadSection').style.display = 'flex';
  document.getElementById('statsSection').style.display = 'none';
}

// Show stats section
function showStatsSection() {
  document.getElementById('uploadSection').style.display = 'none';
  document.getElementById('statsSection').style.display = 'block';
  
  // Update last updated time
  const lastUpdated = csvManager.getLastUpdated();
  if (lastUpdated) {
    const date = new Date(lastUpdated);
    document.getElementById('lastUpdatedTime').textContent = date.toLocaleString();
  }
}

// Load all data
async function loadAllData() {
  await Promise.all([
    loadStatistics(),
    loadAllCreators(),
    loadReviewQueue(),
    loadWarnings(),
    loadInactive()
  ]);
}

// Refresh data
async function refreshData() {
  await loadAllData();
  showNotification('Data refreshed!', 'success');
}

// Load statistics
async function loadStatistics() {
  const stats = csvManager.getStatistics();
  
  document.getElementById('statTotalCreators').textContent = stats.totalCreators;
  document.getElementById('statNeedsReview').textContent = stats.needsReview;
  document.getElementById('statWarnings').textContent = stats.hasWarnings;
  document.getElementById('statInactive').textContent = stats.inactive;
  
  document.getElementById('navReviewCount').textContent = stats.needsReview;
  
  // Render charts
  renderBarChart('chartRanks', stats.byRank);
  renderBarChart('chartLanguages', stats.byLanguage);
}

// Render bar chart
function renderBarChart(containerId, data) {
  const container = document.querySelector(`#${containerId} .chart-bars`);
  if (!container) return;
  
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 5);
  
  if (entries.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding: 20px;"><p>No data</p></div>';
    return;
  }
  
  const max = Math.max(...entries.map(e => e[1]));
  
  container.innerHTML = entries.map(([label, value]) => `
    <div class="chart-bar">
      <span class="chart-bar-label" title="${escapeHtml(label)}">${escapeHtml(label || 'Unknown')}</span>
      <div class="chart-bar-track">
        <div class="chart-bar-fill" style="width: ${(value / max) * 100}%">${value}</div>
      </div>
    </div>
  `).join('');
}

// Load all creators
async function loadAllCreators() {
  allCreators = csvManager.getAllCreators();
  renderCreatorsTable(allCreators);
}

// Render creators table
function renderCreatorsTable(creators) {
  const tbody = document.getElementById('creatorsTableBody');
  if (!tbody) return;
  
  if (creators.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">No creators found</td></tr>';
    return;
  }
  
  tbody.innerHTML = creators.slice(0, 100).map(({ rowIndex, creator }) => `
    <tr data-row="${rowIndex}">
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #FFAA00, #FF5500); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: #0D0D0D; box-shadow: 0 2px 8px rgba(255, 170, 0, 0.3);">
            ${(creator.name || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="font-weight: 600; font-size: 14px;">${escapeHtml(creator.name || 'Unknown')}</div>
            <div style="font-size: 11px; color: #666;">${escapeHtml((creator.uuid || '').substring(0, 8))}...</div>
          </div>
        </div>
      </td>
      <td><span style="padding: 5px 12px; background: linear-gradient(135deg, rgba(255, 170, 0, 0.15), rgba(255, 85, 0, 0.1)); border: 1px solid rgba(255, 170, 0, 0.3); border-radius: 6px; font-size: 11px; font-weight: 600; color: #FFAA00;">${escapeHtml(creator.rankGiven || 'CREATOR')}</span></td>
      <td style="font-weight: 600; color: #55FFFF;">${formatNumber(creator.subscribers) || '-'}</td>
      <td>${escapeHtml(creator.lastUploadAgo || '-')}</td>
      <td>${escapeHtml(creator.lastChecked || 'Never')}</td>
      <td>${getStatusBadge(creator)}</td>
      <td>
        <button class="btn btn-primary btn-view" data-row="${rowIndex}" style="padding: 8px 16px; font-size: 12px;">View →</button>
      </td>
    </tr>
  `).join('');
  
  // Add click handlers for view buttons
  tbody.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const rowIndex = parseInt(btn.dataset.row);
      openCreatorModal(rowIndex);
    });
  });
}

// Get status badge
function getStatusBadge(creator) {
  if (creator.requiresCheckup) {
    return '<span style="padding: 5px 12px; background: rgba(255, 85, 85, 0.15); border: 1px solid rgba(255, 85, 85, 0.3); color: #FF5555; border-radius: 6px; font-size: 11px; font-weight: 600;">⚠️ Needs Checkup</span>';
  }
  if (creator.warnings) {
    return '<span style="padding: 5px 12px; background: rgba(255, 85, 0, 0.15); border: 1px solid rgba(255, 85, 0, 0.3); color: #FF5500; border-radius: 6px; font-size: 11px; font-weight: 600;">⚠️ Has Warning</span>';
  }
  if (!creator.lastChecked) {
    return '<span style="padding: 5px 12px; background: rgba(85, 255, 255, 0.15); border: 1px solid rgba(85, 255, 255, 0.3); color: #55FFFF; border-radius: 6px; font-size: 11px; font-weight: 600;">📋 Never Reviewed</span>';
  }
  return '<span style="padding: 5px 12px; background: rgba(85, 255, 85, 0.15); border: 1px solid rgba(85, 255, 85, 0.3); color: #55FF55; border-radius: 6px; font-size: 11px; font-weight: 600;">✓ Active</span>';
}

// Load review queue
async function loadReviewQueue() {
  const overdueMonths = parseInt(document.getElementById('settingOverdueMonths')?.value) || 3;
  reviewQueue = csvManager.getReviewQueue(overdueMonths);
  
  renderReviewQueue(reviewQueue);
  
  // Update nav badge
  document.getElementById('navReviewCount').textContent = reviewQueue.length;
  
  // Update overview preview
  const recentQueue = document.getElementById('recentQueue');
  if (recentQueue) {
    if (reviewQueue.length === 0) {
      recentQueue.innerHTML = `
        <div class="empty-state" style="padding: 20px;">
          <span class="empty-icon">🎉</span>
          <p>All caught up! No creators need review.</p>
        </div>
      `;
    } else {
      recentQueue.innerHTML = reviewQueue.slice(0, 5).map(item => `
        <div class="review-item" style="margin-bottom: 8px; padding: 12px;">
          <div class="review-item-avatar" style="width: 36px; height: 36px; font-size: 14px;">${(item.creator.name || '?').charAt(0).toUpperCase()}</div>
          <div class="review-item-info">
            <div class="review-item-name" style="font-size: 14px;">${escapeHtml(item.creator.name || 'Unknown')}</div>
            <div class="review-item-meta">${escapeHtml(item.reason)}</div>
          </div>
        </div>
      `).join('');
    }
  }
}

// Render review queue
function renderReviewQueue(queue) {
  const container = document.getElementById('reviewList');
  if (!container) return;
  
  if (queue.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🎉</span>
        <p>All caught up! No creators need review.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = queue.map(item => `
    <div class="review-item" data-row="${item.rowIndex}">
      <input type="checkbox" class="review-item-checkbox" data-row="${item.rowIndex}">
      <div class="review-item-avatar">${(item.creator.name || '?').charAt(0).toUpperCase()}</div>
      <div class="review-item-info">
        <div class="review-item-name">${escapeHtml(item.creator.name || 'Unknown')}</div>
        <div class="review-item-meta">${escapeHtml(item.creator.rankGiven || 'Creator')} • ${escapeHtml(item.creator.subscribers || '?')} subs</div>
      </div>
      <span class="review-item-reason">${escapeHtml(item.reason)}</span>
      <div class="review-item-actions">
        <button class="btn btn-success btn-quick-review" data-row="${item.rowIndex}" style="padding: 8px 16px;">
          <span>✓</span> Review
        </button>
        <button class="btn btn-outline btn-view" data-row="${item.rowIndex}" style="padding: 8px 16px;">
          View
        </button>
      </div>
    </div>
  `).join('');
  
  // Setup checkbox handlers
  container.querySelectorAll('.review-item-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const row = parseInt(cb.dataset.row);
      if (cb.checked) {
        selectedForReview.add(row);
      } else {
        selectedForReview.delete(row);
      }
      document.getElementById('btnBulkReview').disabled = selectedForReview.size === 0;
    });
  });
  
  // Setup quick review buttons
  container.querySelectorAll('.btn-quick-review').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      quickReview(parseInt(btn.dataset.row));
    });
  });
  
  // Setup view buttons
  container.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCreatorModal(parseInt(btn.dataset.row));
    });
  });
}

// Load warnings
async function loadWarnings() {
  const container = document.getElementById('warningsList');
  if (!container) return;
  
  const withWarnings = allCreators.filter(c => c.creator.warnings && c.creator.warnings.trim());
  
  if (withWarnings.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">✅</span>
        <p>No creators have warnings</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = withWarnings.map(({ rowIndex, creator }) => `
    <div class="review-item" data-row="${rowIndex}">
      <div class="review-item-avatar">${(creator.name || '?').charAt(0).toUpperCase()}</div>
      <div class="review-item-info">
        <div class="review-item-name">${escapeHtml(creator.name || 'Unknown')}</div>
        <div class="review-item-meta" style="color: #f5576c;">${escapeHtml((creator.warnings || '').split('\n')[0])}</div>
      </div>
      <button class="btn btn-outline btn-view" data-row="${rowIndex}" style="padding: 8px 16px;">View</button>
    </div>
  `).join('');
  
  // Setup view buttons
  container.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCreatorModal(parseInt(btn.dataset.row));
    });
  });
}

// Load inactive
async function loadInactive() {
  const container = document.getElementById('inactiveList');
  if (!container) return;
  
  const inactive = allCreators.filter(c => {
    if (!c.creator.lastUploadAgo) return false;
    const match = c.creator.lastUploadAgo.match(/(\d+)\s*Month/i);
    return match && parseInt(match[1]) >= 6;
  });
  
  if (inactive.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🎉</span>
        <p>All creators are active</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = inactive.map(({ rowIndex, creator }) => `
    <div class="review-item" data-row="${rowIndex}">
      <div class="review-item-avatar">${(creator.name || '?').charAt(0).toUpperCase()}</div>
      <div class="review-item-info">
        <div class="review-item-name">${escapeHtml(creator.name || 'Unknown')}</div>
        <div class="review-item-meta">Last upload: ${escapeHtml(creator.lastUploadAgo || 'Unknown')}</div>
      </div>
      <button class="btn btn-outline btn-view" data-row="${rowIndex}" style="padding: 8px 16px;">View</button>
    </div>
  `).join('');
  
  // Setup view buttons
  container.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCreatorModal(parseInt(btn.dataset.row));
    });
  });
}

// Quick review
async function quickReview(rowIndex) {
  const reviewerName = document.getElementById('settingReviewerName')?.value || 'Judge';
  
  try {
    await csvManager.quickReview(rowIndex, reviewerName);
    showNotification('Review saved!', 'success');
    await loadAllData();
  } catch (error) {
    showNotification('Failed to save review: ' + error.message, 'error');
  }
}

// Bulk review
async function handleBulkReview() {
  if (selectedForReview.size === 0) return;
  
  const reviewerName = document.getElementById('settingReviewerName')?.value || 'Judge';
  const rows = Array.from(selectedForReview);
  
  try {
    for (const row of rows) {
      await csvManager.quickReview(row, reviewerName);
    }
    
    showNotification(`Reviewed ${rows.length} creators!`, 'success');
    selectedForReview.clear();
    await loadAllData();
  } catch (error) {
    showNotification('Failed to complete bulk review: ' + error.message, 'error');
  }
}

// Handle search
function handleSearch(e) {
  const query = e.target.value.trim();
  
  if (!query) {
    renderCreatorsTable(allCreators);
    return;
  }
  
  const filtered = csvManager.searchCreators(query);
  renderCreatorsTable(filtered);
}

// Export CSV
function exportCSV() {
  if (!csvManager.hasData()) {
    showNotification('No data to export', 'error');
    return;
  }
  
  const filename = `hypixel-creators-${new Date().toISOString().split('T')[0]}.csv`;
  csvManager.downloadCSV(filename);
  showNotification('CSV exported!', 'success');
}

// Handle clear data
async function handleClearData() {
  if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    return;
  }
  
  await csvManager.clearData();
  showNotification('Data cleared', 'success');
  showUploadSection();
  updateDataIndicator(false);
  
  // Clear UI
  document.getElementById('creatorsTableBody').innerHTML = '<tr><td colspan="7" class="empty-cell">Upload a CSV to see creators</td></tr>';
  document.getElementById('navReviewCount').textContent = '0';
}

// Open creator profile page
function openCreatorModal(rowIndex) {
  console.log('Opening creator profile for row:', rowIndex);
  
  if (!csvManager || !csvManager.hasData()) {
    console.error('CSV Manager not initialized or no data');
    showNotification('No data loaded', 'error');
    return;
  }
  
  const creator = csvManager.getRow(rowIndex);
  console.log('Creator data:', creator);
  
  if (!creator) {
    console.error('Creator not found at row:', rowIndex);
    showNotification('Creator not found', 'error');
    return;
  }
  
  // Navigate to creator profile page
  window.location.href = `../creator/creator.html?row=${rowIndex}`;
}

// Close modal
function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

// Save settings
async function saveSettings() {
  const settings = {
    reviewerName: document.getElementById('settingReviewerName').value || 'Judge',
    overdueMonths: parseInt(document.getElementById('settingOverdueMonths').value) || 3,
    inactiveMonths: parseInt(document.getElementById('settingInactiveMonths').value) || 6
  };
  
  try {
    await chrome.storage.sync.set(settings);
    showNotification('Settings saved!', 'success');
  } catch (error) {
    showNotification('Failed to save settings', 'error');
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()">×</button>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 4000);
}

// Utility functions
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function formatNumber(num) {
  if (!num) return null;
  const n = parseInt(String(num).replace(/,/g, ''));
  if (isNaN(n)) return num;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

// Make functions available globally
window.quickReview = quickReview;
window.openCreatorModal = openCreatorModal;

// ==================== ADD CREATOR FUNCTIONS ====================

// Start fresh - initialize empty data and open add creator modal
async function startFreshWithAddCreator() {
  // Initialize with expected headers but no data
  csvManager.headers = csvManager.EXPECTED_HEADERS;
  csvManager.data = [];
  csvManager.isLoaded = true;
  csvManager.lastUpdated = new Date().toISOString();
  
  await csvManager.saveToStorage();
  
  // Update UI to show stats section
  showStatsSection();
  updateDataIndicator(true);
  await loadStatistics();
  
  // Open add creator modal
  openAddCreatorModal();
  
  showNotification('Started fresh! Add your first creator.', 'info');
}

// Open Add Creator Modal
function openAddCreatorModal() {
  // Initialize CSV manager if no data yet (allows adding first creator)
  if (!csvManager.hasData()) {
    csvManager.headers = csvManager.EXPECTED_HEADERS;
    csvManager.data = [];
    csvManager.isLoaded = true;
  }
  
  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('newCreatorDateAccepted').value = today;
  
  // Get reviewer name for accepted by default
  const reviewerName = document.getElementById('settingReviewerName')?.value || 'Judge';
  document.getElementById('newCreatorAcceptedBy').value = reviewerName;
  
  document.getElementById('addCreatorModal').classList.add('active');
}

// Close Add Creator Modal
function closeAddCreatorModal() {
  document.getElementById('addCreatorModal').classList.remove('active');
  document.getElementById('addCreatorForm').reset();
}

// Handle Add Creator Form Submission
async function handleAddCreator(e) {
  e.preventDefault();
  
  const name = document.getElementById('newCreatorName').value.trim();
  const channel = document.getElementById('newCreatorChannel').value.trim();
  
  if (!name || !channel) {
    showNotification('Name and Channel URL are required', 'error');
    return;
  }
  
  // Build the new creator row based on COLUMNS mapping
  const newRow = new Array(24).fill(''); // 24 columns in the sheet
  
  // Map form values to column indices
  newRow[0] = document.getElementById('newCreatorUUID').value.trim() || generateUUID();
  newRow[1] = name;
  newRow[2] = channel;
  newRow[3] = document.getElementById('newCreatorDateAccepted').value || '';
  newRow[4] = document.getElementById('newCreatorVerifiedBy').value.trim() || '';
  newRow[5] = document.getElementById('newCreatorAcceptedBy').value.trim() || '';
  newRow[6] = ''; // Last Checked - empty for new creator
  newRow[7] = ''; // Content Review By - empty for new creator
  newRow[8] = document.getElementById('newCreatorCode').value.trim() || '';
  newRow[9] = document.getElementById('newCreatorSubs').value.trim() || '';
  newRow[10] = ''; // Last Upload Date
  newRow[11] = ''; // Last Upload Ago
  newRow[12] = document.getElementById('newCreatorRank').value || '';
  newRow[13] = document.getElementById('newCreatorContentType').value || '';
  newRow[14] = ''; // Video Category
  newRow[15] = document.getElementById('newCreatorLocale').value.trim() || '';
  newRow[16] = document.getElementById('newCreatorLanguage').value.trim() || '';
  newRow[17] = document.getElementById('newCreatorEmail').value.trim() || '';
  newRow[18] = document.getElementById('newCreatorZendesk').value.trim() || '';
  newRow[19] = document.getElementById('newCreatorNotes').value.trim() || '';
  newRow[20] = ''; // Reference Tags
  newRow[21] = ''; // Reports
  newRow[22] = ''; // Warnings
  newRow[23] = ''; // Requires Checkup
  
  try {
    // Add the new row to CSV data
    await csvManager.addRow(newRow);
    
    showNotification(`✅ Added ${name} to creators!`, 'success');
    closeAddCreatorModal();
    
    // Refresh the data
    await loadAllData();
    
    // Navigate to creators page to see the new entry
    navigateTo('creators');
    
  } catch (error) {
    console.error('Error adding creator:', error);
    showNotification('Failed to add creator: ' + error.message, 'error');
  }
}

// Generate a random UUID (for creators without one)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Notification styles are now in CSS file
