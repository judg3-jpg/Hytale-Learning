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
      inactiveMonths: 6
    });
    
    document.getElementById('settingReviewerName').value = settings.reviewerName;
    document.getElementById('settingOverdueMonths').value = settings.overdueMonths;
    document.getElementById('settingInactiveMonths').value = settings.inactiveMonths;
  } catch (error) {
    console.error('Error loading settings:', error);
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
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; font-size: 14px; color: white;">
            ${(creator.name || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="font-weight: 500;">${escapeHtml(creator.name || 'Unknown')}</div>
            <div style="font-size: 11px; color: #888;">${escapeHtml((creator.uuid || '').substring(0, 8))}...</div>
          </div>
        </div>
      </td>
      <td><span style="padding: 4px 8px; background: rgba(102, 126, 234, 0.2); border-radius: 4px; font-size: 11px;">${escapeHtml(creator.rankGiven || '-')}</span></td>
      <td>${formatNumber(creator.subscribers) || '-'}</td>
      <td>${escapeHtml(creator.lastUploadAgo || '-')}</td>
      <td>${escapeHtml(creator.lastChecked || 'Never')}</td>
      <td>${getStatusBadge(creator)}</td>
      <td>
        <button class="btn btn-outline" style="padding: 6px 12px; font-size: 11px;" onclick="openCreatorModal(${rowIndex})">View</button>
      </td>
    </tr>
  `).join('');
}

// Get status badge
function getStatusBadge(creator) {
  if (creator.requiresCheckup) {
    return '<span style="padding: 4px 8px; background: rgba(245, 87, 108, 0.2); color: #f5576c; border-radius: 4px; font-size: 11px;">Needs Checkup</span>';
  }
  if (creator.warnings) {
    return '<span style="padding: 4px 8px; background: rgba(247, 147, 30, 0.2); color: #f7931e; border-radius: 4px; font-size: 11px;">Has Warning</span>';
  }
  if (!creator.lastChecked) {
    return '<span style="padding: 4px 8px; background: rgba(79, 172, 254, 0.2); color: #4facfe; border-radius: 4px; font-size: 11px;">Never Reviewed</span>';
  }
  return '<span style="padding: 4px 8px; background: rgba(56, 239, 125, 0.2); color: #38ef7d; border-radius: 4px; font-size: 11px;">Active</span>';
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
        <button class="btn btn-success" style="padding: 8px 16px;" onclick="quickReview(${item.rowIndex})">
          <span>✓</span> Review
        </button>
        <button class="btn btn-outline" style="padding: 8px 16px;" onclick="openCreatorModal(${item.rowIndex})">
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
      <button class="btn btn-outline" style="padding: 8px 16px;" onclick="openCreatorModal(${rowIndex})">View</button>
    </div>
  `).join('');
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
      <button class="btn btn-outline" style="padding: 8px 16px;" onclick="openCreatorModal(${rowIndex})">View</button>
    </div>
  `).join('');
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

// Open creator modal
function openCreatorModal(rowIndex) {
  const creator = csvManager.getRow(rowIndex);
  if (!creator) return;
  
  document.getElementById('modalTitle').textContent = creator.name || 'Unknown Creator';
  document.getElementById('modalBody').innerHTML = `
    <div style="display: grid; gap: 16px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label style="font-size: 11px; color: #888; display: block;">UUID</label>
          <span style="font-size: 13px;">${escapeHtml(creator.uuid || '-')}</span>
        </div>
        <div>
          <label style="font-size: 11px; color: #888; display: block;">Rank</label>
          <span style="font-size: 13px;">${escapeHtml(creator.rankGiven || '-')}</span>
        </div>
        <div>
          <label style="font-size: 11px; color: #888; display: block;">Subscribers</label>
          <span style="font-size: 13px;">${escapeHtml(creator.subscribers || '-')}</span>
        </div>
        <div>
          <label style="font-size: 11px; color: #888; display: block;">Last Upload</label>
          <span style="font-size: 13px;">${escapeHtml(creator.lastUploadAgo || '-')}</span>
        </div>
        <div>
          <label style="font-size: 11px; color: #888; display: block;">Last Checked</label>
          <span style="font-size: 13px;">${escapeHtml(creator.lastChecked || 'Never')}</span>
        </div>
        <div>
          <label style="font-size: 11px; color: #888; display: block;">Reviewed By</label>
          <span style="font-size: 13px;">${escapeHtml(creator.contentReviewBy || '-')}</span>
        </div>
      </div>
      
      <div>
        <label style="font-size: 11px; color: #888; display: block;">Channel</label>
        <a href="${escapeHtml(creator.channel || '#')}" target="_blank" style="color: #4facfe; font-size: 13px; word-break: break-all;">${escapeHtml(creator.channel || '-')}</a>
      </div>
      
      <div>
        <label style="font-size: 11px; color: #888; display: block;">Notes</label>
        <div style="font-size: 13px; white-space: pre-wrap; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; max-height: 100px; overflow-y: auto;">
          ${escapeHtml(creator.notes || 'No notes')}
        </div>
      </div>
      
      ${creator.warnings ? `
        <div>
          <label style="font-size: 11px; color: #f5576c; display: block;">⚠️ Warnings</label>
          <div style="font-size: 13px; white-space: pre-wrap; background: rgba(245, 87, 108, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(245, 87, 108, 0.3);">
            ${escapeHtml(creator.warnings)}
          </div>
        </div>
      ` : ''}
    </div>
  `;
  
  document.getElementById('modalConfirm').textContent = 'Review';
  document.getElementById('modalConfirm').onclick = async () => {
    await quickReview(rowIndex);
    closeModal();
  };
  
  document.getElementById('modal').classList.add('active');
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

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 10px;
    background: #333;
    color: white;
    display: flex;
    align-items: center;
    gap: 16px;
    z-index: 10000;
    animation: notificationIn 0.3s ease;
  }
  .notification-success { background: linear-gradient(135deg, #11998e, #38ef7d); color: #1a1a2e; }
  .notification-error { background: linear-gradient(135deg, #f5576c, #f093fb); }
  .notification-info { background: linear-gradient(135deg, #667eea, #764ba2); }
  .notification button { background: none; border: none; color: inherit; font-size: 20px; cursor: pointer; }
  @keyframes notificationIn { from { transform: translateX(100%); opacity: 0; } }
`;
document.head.appendChild(notificationStyles);
