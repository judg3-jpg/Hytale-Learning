// Dashboard JavaScript - Professional Enterprise Version

let allCreators = [];
let filteredCreators = [];
let reviewQueue = [];
let selectedForReview = new Set();

// Pagination settings
let currentPage = 1;
const creatorsPerPage = 50;

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
      youtubeApiKey: '',
      twitchClientId: '',
      twitchClientSecret: ''
    });
    
    const reviewerInput = document.getElementById('settingReviewerName');
    if (reviewerInput) reviewerInput.value = settings.reviewerName;
    
    // API settings
    const youtubeInput = document.getElementById('settingYoutubeApiKey');
    if (youtubeInput) {
      youtubeInput.value = settings.youtubeApiKey || '';
      updateApiStatusBadge('youtube', !!settings.youtubeApiKey);
    }
    
    const twitchIdInput = document.getElementById('settingTwitchClientId');
    if (twitchIdInput) twitchIdInput.value = settings.twitchClientId || '';
    
    const twitchSecretInput = document.getElementById('settingTwitchClientSecret');
    if (twitchSecretInput) {
      twitchSecretInput.value = settings.twitchClientSecret || '';
      updateApiStatusBadge('twitch', !!(settings.twitchClientId && settings.twitchClientSecret));
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Update API status badge
function updateApiStatusBadge(api, isConfigured) {
  const badge = document.getElementById(`${api}ApiStatus`);
  if (badge) {
    if (isConfigured) {
      badge.textContent = '✓ Configured';
      badge.classList.add('configured');
    } else {
      badge.textContent = 'Not configured';
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
    overview: ['Dashboard', 'Overview of all creator statistics'],
    creators: ['Creators', 'View and manage all creators'],
    review: ['Review Queue', 'Creators needing review'],
    warnings: ['Warnings', 'Creators with warnings'],
    settings: ['Settings', 'Configure your preferences']
  };
  
  const [title, subtitle] = titles[pageName] || ['Dashboard', ''];
  document.getElementById('pageTitle').textContent = title;
  document.getElementById('pageSubtitle').textContent = subtitle;
  
  // Toggle search visibility
  const searchBox = document.getElementById('globalSearch');
  if (searchBox) {
    searchBox.style.display = pageName === 'creators' ? 'flex' : 'none';
  }
}

// Setup event listeners
function setupEventListeners() {
  // Export
  document.getElementById('exportLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    exportCSV();
  });
  document.getElementById('btnExportCsv')?.addEventListener('click', exportCSV);
  
  // Re-import
  document.getElementById('btnReimport')?.addEventListener('click', () => {
    document.getElementById('fileInput').click();
  });
  
  // Refresh names
  document.getElementById('btnRefreshNames')?.addEventListener('click', refreshCreatorNames);
  
  // Bulk review
  document.getElementById('btnBulkReview')?.addEventListener('click', handleBulkReview);
  
  // Search
  document.getElementById('searchInput')?.addEventListener('input', handleSearch);
  
  // Clear data
  document.getElementById('btnClearData')?.addEventListener('click', handleClearData);
  
  // Add Creator Modal
  document.getElementById('btnAddCreator')?.addEventListener('click', openAddCreatorModal);
  document.getElementById('btnAddCreatorEmpty')?.addEventListener('click', startFreshWithAddCreator);
  document.getElementById('addCreatorClose')?.addEventListener('click', closeAddCreatorModal);
  document.getElementById('addCreatorCancel')?.addEventListener('click', closeAddCreatorModal);
  document.getElementById('addCreatorBackdrop')?.addEventListener('click', closeAddCreatorModal);
  document.getElementById('addCreatorSubmit')?.addEventListener('click', handleAddCreator);
  document.getElementById('btnLookupUUID')?.addEventListener('click', lookupMinecraftUUID);
  document.getElementById('btnFetchChannelStats')?.addEventListener('click', fetchChannelStats);
  
  // Name Changes Modal
  document.getElementById('nameChangesClose')?.addEventListener('click', closeNameChangesModal);
  document.getElementById('nameChangesBackdrop')?.addEventListener('click', closeNameChangesModal);
  document.getElementById('nameChangesOk')?.addEventListener('click', closeNameChangesModal);
  
  // Save YouTube API Key
  document.getElementById('btnSaveYoutubeKey')?.addEventListener('click', async () => {
    const key = document.getElementById('settingYoutubeApiKey')?.value.trim();
    await chrome.storage.sync.set({ youtubeApiKey: key });
    updateApiStatusBadge('youtube', !!key);
    showNotification('YouTube API key saved!', 'success');
  });
  
  // Save Twitch credentials
  document.getElementById('btnSaveTwitchKey')?.addEventListener('click', async () => {
    const clientId = document.getElementById('settingTwitchClientId')?.value.trim();
    const clientSecret = document.getElementById('settingTwitchClientSecret')?.value.trim();
    await chrome.storage.sync.set({ twitchClientId: clientId, twitchClientSecret: clientSecret });
    updateApiStatusBadge('twitch', !!(clientId && clientSecret));
    showNotification('Twitch credentials saved!', 'success');
  });
  
  // Save reviewer name
  document.getElementById('settingReviewerName')?.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ reviewerName: e.target.value });
    showNotification('Settings saved!', 'success');
  });
}

// Setup file upload
function setupFileUpload() {
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  
  if (!uploadArea || !fileInput) return;
  
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
  const statusDot = document.getElementById('dataStatusDot');
  const dataStatus = document.getElementById('dataStatusText');
  
  if (hasData) {
    if (statusDot) statusDot.classList.add('loaded');
    if (dataStatus) dataStatus.textContent = `${csvManager.data.length} creators loaded`;
  } else {
    if (statusDot) statusDot.classList.remove('loaded');
    if (dataStatus) dataStatus.textContent = 'No data loaded';
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
  const lastUpdateEl = document.getElementById('lastUpdateDate');
  if (lastUpdated && lastUpdateEl) {
    const date = new Date(lastUpdated);
    lastUpdateEl.textContent = date.toLocaleDateString();
  }
  
  // Update last name check time
  updateNameCheckStatus();
}

// Update name check status display
async function updateNameCheckStatus() {
  try {
    const settings = await chrome.storage.local.get(['lastNameCheck']);
    const lastCheck = settings.lastNameCheck;
    const lastCheckEl = document.getElementById('lastNameCheckDate');
    
    if (!lastCheckEl) return;
    
    if (lastCheck) {
      const date = new Date(lastCheck);
      const daysSince = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSince >= 7) {
        lastCheckEl.innerHTML = `${date.toLocaleDateString()} <span style="color: var(--warning);">(${daysSince}d ago)</span>`;
        promptNameRefresh(daysSince);
      } else {
        lastCheckEl.textContent = `${date.toLocaleDateString()} (${daysSince}d ago)`;
      }
    } else {
      lastCheckEl.textContent = 'Never';
    }
  } catch (error) {
    console.error('Error checking name status:', error);
  }
}

// Prompt user to refresh names if it's been 7+ days
async function promptNameRefresh(daysSince) {
  if (window.nameRefreshPrompted) return;
  window.nameRefreshPrompted = true;
  
  setTimeout(() => {
    const shouldRefresh = confirm(
      `It's been ${daysSince} days since you last checked for Minecraft name changes.\n\n` +
      `Would you like to refresh creator names now?`
    );
    
    if (shouldRefresh) {
      refreshCreatorNames();
    }
  }, 1500);
}

// Load all data
async function loadAllData() {
  await Promise.all([
    loadStatistics(),
    loadAllCreators(),
    loadReviewQueue(),
    loadWarnings()
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
  
  document.getElementById('statTotal').textContent = stats.totalCreators.toLocaleString();
  document.getElementById('statActive').textContent = stats.active.toLocaleString();
  document.getElementById('statSemiInactive').textContent = stats.semiInactive.toLocaleString();
  document.getElementById('statInactive').textContent = stats.inactive.toLocaleString();
  document.getElementById('statReview').textContent = stats.needsReview.toLocaleString();
  document.getElementById('statWarnings').textContent = stats.hasWarnings.toLocaleString();
  
  // Update nav badges
  const reviewBadge = document.getElementById('reviewBadge');
  const warningBadge = document.getElementById('warningBadge');
  
  if (reviewBadge) {
    reviewBadge.textContent = stats.needsReview;
    reviewBadge.style.display = stats.needsReview > 0 ? 'flex' : 'none';
  }
  
  if (warningBadge) {
    warningBadge.textContent = stats.hasWarnings;
    warningBadge.style.display = stats.hasWarnings > 0 ? 'flex' : 'none';
  }
  
  // Render charts
  renderBarChart('chartRanks', stats.byRank);
  renderBarChart('chartContent', stats.byContentType || {});
  
  // Load activity list
  loadActivityList();
}

// Load activity list for overview
function loadActivityList() {
  const container = document.getElementById('activityList');
  if (!container) return;
  
  const needsAttention = allCreators.filter(c => 
    c.creator.requiresCheckup || c.creator.warnings
  ).slice(0, 5);
  
  if (needsAttention.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">✓</span>
        <p>All creators are up to date</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = needsAttention.map(({ rowIndex, creator }) => `
    <div class="review-item">
      <div class="review-item-avatar">${(creator.name || '?').charAt(0).toUpperCase()}</div>
      <div class="review-item-info">
        <div class="review-item-name">${escapeHtml(creator.name || 'Unknown')}</div>
        <div class="review-item-meta">${creator.warnings ? 'Has warning' : 'Needs checkup'}</div>
      </div>
      <button class="btn btn-secondary btn-small btn-view" data-row="${rowIndex}">View</button>
    </div>
  `).join('');
  
  container.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', () => openCreatorModal(parseInt(btn.dataset.row)));
  });
}

// Render bar chart
function renderBarChart(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 5);
  
  if (entries.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding: 20px;"><span class="empty-icon">📊</span><p>No data</p></div>';
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

// Render creators table with pagination
function renderCreatorsTable(creators) {
  filteredCreators = creators;
  const tbody = document.getElementById('creatorsTableBody');
  if (!tbody) return;
  
  if (creators.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-cell">No creators found. Import a CSV or add creators manually.</td></tr>';
    renderPagination(0);
    return;
  }
  
  // Calculate pagination
  const totalPages = Math.ceil(creators.length / creatorsPerPage);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  
  const startIndex = (currentPage - 1) * creatorsPerPage;
  const endIndex = startIndex + creatorsPerPage;
  const pageCreators = creators.slice(startIndex, endIndex);
  
  tbody.innerHTML = pageCreators.map(({ rowIndex, creator }) => `
    <tr data-row="${rowIndex}">
      <td>
        <div class="table-avatar">${(creator.name || '?').charAt(0).toUpperCase()}</div>
      </td>
      <td>
        <div style="font-weight: 500;">${escapeHtml(creator.name || 'Unknown')}</div>
        <div style="font-size: 11px; color: var(--text-tertiary);">${escapeHtml((creator.uuid || '').substring(0, 8))}...</div>
      </td>
      <td>${getPlatformBadge(creator.channel)}</td>
      <td style="font-weight: 600; color: var(--brand-primary);">${formatNumber(creator.subscribers) || '-'}</td>
      <td>${escapeHtml(creator.lastUploadAgo || '-')}</td>
      <td>${getActivityBadge(creator.lastUploadAgo)}</td>
      <td><span class="rank-badge">${escapeHtml(creator.rankGiven || 'CREATOR')}</span></td>
      <td>
        <button class="btn btn-secondary btn-small btn-view" data-row="${rowIndex}">View →</button>
      </td>
    </tr>
  `).join('');
  
  // Add click handlers
  tbody.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCreatorModal(parseInt(btn.dataset.row));
    });
  });
  
  renderPagination(creators.length);
}

// Get platform badge
function getPlatformBadge(channel) {
  if (!channel) return '<span class="status-badge unknown">Unknown</span>';
  const url = channel.toLowerCase();
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return '<span class="status-badge" style="background: rgba(255,0,0,0.1); color: #FF0000;">YouTube</span>';
  }
  if (url.includes('twitch.tv')) {
    return '<span class="status-badge" style="background: rgba(145,70,255,0.1); color: #9146FF;">Twitch</span>';
  }
  return '<span class="status-badge unknown">Other</span>';
}

// Get activity badge based on last upload
function getActivityBadge(lastUploadAgo) {
  if (!lastUploadAgo || lastUploadAgo === '-') {
    return '<span class="status-badge unknown">Unknown</span>';
  }
  
  const months = parseMonthsFromUpload(lastUploadAgo);
  
  if (months === null) {
    return '<span class="status-badge unknown">Unknown</span>';
  }
  
  if (months >= 24) {
    return '<span class="status-badge inactive">Inactive</span>';
  } else if (months >= 12) {
    return '<span class="status-badge semi-inactive">Semi-Inactive</span>';
  } else {
    return '<span class="status-badge active">Active</span>';
  }
}

// Parse months from last upload string
function parseMonthsFromUpload(lastUploadAgo) {
  if (!lastUploadAgo) return null;
  
  const str = lastUploadAgo.toLowerCase();
  
  const monthMatch = str.match(/(\d+)\s*month/i);
  if (monthMatch) return parseInt(monthMatch[1]);
  
  const yearMatch = str.match(/(\d+)\s*year/i);
  if (yearMatch) return parseInt(yearMatch[1]) * 12;
  
  if (str.includes('week') || str.includes('day') || str.includes('hour')) return 0;
  
  return null;
}

// Render pagination controls
function renderPagination(totalItems) {
  const paginationContainer = document.getElementById('paginationContainer');
  if (!paginationContainer) return;
  
  const totalPages = Math.ceil(totalItems / creatorsPerPage);
  
  if (totalPages <= 1) {
    paginationContainer.innerHTML = `<div class="pagination-info">Showing all ${totalItems} creators</div>`;
    return;
  }
  
  const startItem = (currentPage - 1) * creatorsPerPage + 1;
  const endItem = Math.min(currentPage * creatorsPerPage, totalItems);
  
  // Generate page numbers
  let pageNumbers = [];
  const maxVisiblePages = 7;
  
  if (totalPages <= maxVisiblePages) {
    pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    pageNumbers.push(1);
    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);
    
    if (startPage > 2) pageNumbers.push('...');
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    if (endPage < totalPages - 1) pageNumbers.push('...');
    pageNumbers.push(totalPages);
  }
  
  paginationContainer.innerHTML = `
    <div class="pagination-info">Showing ${startItem}-${endItem} of ${totalItems}</div>
    <div class="pagination-controls">
      <button class="pagination-btn" id="paginationFirst" ${currentPage === 1 ? 'disabled' : ''}>First</button>
      <button class="pagination-btn" id="paginationPrev" ${currentPage === 1 ? 'disabled' : ''}>←</button>
      <div class="pagination-pages">
        ${pageNumbers.map(page => {
          if (page === '...') return '<span class="pagination-ellipsis">...</span>';
          return `<button class="pagination-page ${page === currentPage ? 'active' : ''}" data-page="${page}">${page}</button>`;
        }).join('')}
      </div>
      <button class="pagination-btn" id="paginationNext" ${currentPage === totalPages ? 'disabled' : ''}>→</button>
      <button class="pagination-btn" id="paginationLast" ${currentPage === totalPages ? 'disabled' : ''}>Last</button>
    </div>
    <div class="pagination-jump">
      <span>Page:</span>
      <input type="number" id="paginationJumpInput" min="1" max="${totalPages}" value="${currentPage}">
    </div>
  `;
  
  // Event listeners
  document.getElementById('paginationFirst')?.addEventListener('click', () => goToPage(1));
  document.getElementById('paginationPrev')?.addEventListener('click', () => goToPage(currentPage - 1));
  document.getElementById('paginationNext')?.addEventListener('click', () => goToPage(currentPage + 1));
  document.getElementById('paginationLast')?.addEventListener('click', () => goToPage(totalPages));
  
  document.querySelectorAll('.pagination-page').forEach(btn => {
    btn.addEventListener('click', () => goToPage(parseInt(btn.dataset.page)));
  });
  
  document.getElementById('paginationJumpInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const page = parseInt(e.target.value);
      if (page >= 1 && page <= totalPages) goToPage(page);
    }
  });
}

// Go to specific page
function goToPage(page) {
  currentPage = page;
  renderCreatorsTable(filteredCreators);
  document.querySelector('#page-creators .table-container')?.scrollIntoView({ behavior: 'smooth' });
}

// Load review queue
async function loadReviewQueue() {
  reviewQueue = csvManager.getReviewQueue(3);
  renderReviewQueue(reviewQueue);
}

// Render review queue
function renderReviewQueue(queue) {
  const container = document.getElementById('reviewList');
  if (!container) return;
  
  if (queue.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">✓</span>
        <p>No creators pending review</p>
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
        <div class="review-item-meta">${escapeHtml(item.creator.rankGiven || 'Creator')} • ${formatNumber(item.creator.subscribers) || '?'} subs</div>
      </div>
      <span class="review-item-reason">${escapeHtml(item.reason)}</span>
      <div class="review-item-actions">
        <button class="btn btn-success btn-small btn-quick-review" data-row="${item.rowIndex}">✓ Review</button>
        <button class="btn btn-secondary btn-small btn-view" data-row="${item.rowIndex}">View</button>
      </div>
    </div>
  `).join('');
  
  // Setup handlers
  container.querySelectorAll('.review-item-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const row = parseInt(cb.dataset.row);
      if (cb.checked) selectedForReview.add(row);
      else selectedForReview.delete(row);
      document.getElementById('btnBulkReview').disabled = selectedForReview.size === 0;
    });
  });
  
  container.querySelectorAll('.btn-quick-review').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      quickReview(parseInt(btn.dataset.row));
    });
  });
  
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
        <span class="empty-icon">✓</span>
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
        <div class="review-item-meta" style="color: var(--danger);">${escapeHtml((creator.warnings || '').split('\n')[0])}</div>
      </div>
      <button class="btn btn-secondary btn-small btn-view" data-row="${rowIndex}">View</button>
    </div>
  `).join('');
  
  container.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCreatorModal(parseInt(btn.dataset.row));
    });
  });
}

// Quick review
async function quickReview(rowIndex) {
  const settings = await chrome.storage.sync.get({ reviewerName: 'Judge' });
  
  try {
    await csvManager.quickReview(rowIndex, settings.reviewerName);
    showNotification('Review saved!', 'success');
    await loadAllData();
  } catch (error) {
    showNotification('Failed to save review: ' + error.message, 'error');
  }
}

// Bulk review
async function handleBulkReview() {
  if (selectedForReview.size === 0) return;
  
  const settings = await chrome.storage.sync.get({ reviewerName: 'Judge' });
  const rows = Array.from(selectedForReview);
  
  try {
    for (const row of rows) {
      await csvManager.quickReview(row, settings.reviewerName);
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
  currentPage = 1;
  
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
  if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) return;
  
  await csvManager.clearData();
  showNotification('Data cleared', 'success');
  showUploadSection();
  updateDataIndicator(false);
  
  document.getElementById('creatorsTableBody').innerHTML = '<tr><td colspan="8" class="empty-cell">No creators found</td></tr>';
}

// Open creator profile page
function openCreatorModal(rowIndex) {
  if (!csvManager || !csvManager.hasData()) {
    showNotification('No data loaded', 'error');
    return;
  }
  
  const creator = csvManager.getRow(rowIndex);
  if (!creator) {
    showNotification('Creator not found', 'error');
    return;
  }
  
  window.location.href = `../creator/creator.html?row=${rowIndex}`;
}

// Close name changes modal
function closeNameChangesModal() {
  document.getElementById('nameChangesModal')?.classList.remove('active');
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
    if (notification.parentNode) notification.remove();
  }, 4000);
}

// Utility functions
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
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

async function startFreshWithAddCreator() {
  csvManager.headers = csvManager.EXPECTED_HEADERS;
  csvManager.data = [];
  csvManager.isLoaded = true;
  csvManager.lastUpdated = new Date().toISOString();
  
  await csvManager.saveToStorage();
  
  showStatsSection();
  updateDataIndicator(true);
  await loadStatistics();
  
  openAddCreatorModal();
  showNotification('Started fresh! Add your first creator.', 'info');
}

function openAddCreatorModal() {
  if (!csvManager.hasData()) {
    csvManager.headers = csvManager.EXPECTED_HEADERS;
    csvManager.data = [];
    csvManager.isLoaded = true;
  }
  
  document.getElementById('addCreatorModal').classList.add('active');
}

function closeAddCreatorModal() {
  document.getElementById('addCreatorModal').classList.remove('active');
  document.getElementById('addCreatorForm').reset();
}

async function handleAddCreator(e) {
  e.preventDefault();
  
  const name = document.getElementById('newCreatorName').value.trim();
  const channel = document.getElementById('newCreatorChannel').value.trim();
  
  if (!name || !channel) {
    showNotification('Name and Channel URL are required', 'error');
    return;
  }
  
  const newRow = new Array(24).fill('');
  
  newRow[0] = document.getElementById('newCreatorUUID').value.trim() || '';
  newRow[1] = name;
  newRow[2] = channel;
  newRow[3] = new Date().toISOString().split('T')[0];
  newRow[9] = document.getElementById('newCreatorSubscribers').value.trim() || '';
  newRow[11] = document.getElementById('newCreatorLastUpload').value.trim() || '';
  newRow[12] = document.getElementById('newCreatorRank').value || '';
  newRow[13] = document.getElementById('newCreatorContentType').value || '';
  newRow[15] = document.getElementById('newCreatorLocale').value.trim() || '';
  newRow[17] = document.getElementById('newCreatorEmail').value.trim() || '';
  newRow[19] = document.getElementById('newCreatorNotes').value.trim() || '';
  
  try {
    await csvManager.addRow(newRow);
    
    showNotification(`Added ${name} to creators!`, 'success');
    closeAddCreatorModal();
    
    await loadAllData();
    navigateTo('creators');
    
  } catch (error) {
    console.error('Error adding creator:', error);
    showNotification('Failed to add creator: ' + error.message, 'error');
  }
}

// Lookup Minecraft UUID
async function lookupMinecraftUUID() {
  const ignInput = document.getElementById('newCreatorIGN');
  const uuidInput = document.getElementById('newCreatorUUID');
  const uuidHint = document.getElementById('uuidHint');
  const lookupBtn = document.getElementById('btnLookupUUID');
  
  const ign = ignInput.value.trim();
  
  if (!ign) {
    uuidHint.textContent = 'Enter a Minecraft username first';
    uuidHint.className = 'field-hint error';
    return;
  }
  
  lookupBtn.disabled = true;
  lookupBtn.textContent = 'Looking up...';
  uuidHint.textContent = 'Fetching from Mojang API...';
  uuidHint.className = 'field-hint';
  
  try {
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(ign)}`);
    
    if (response.status === 404) throw new Error('Player not found');
    if (!response.ok) throw new Error('API error');
    
    const data = await response.json();
    const uuid = formatMinecraftUUID(data.id);
    
    uuidInput.value = uuid;
    uuidHint.textContent = `Found: ${data.name}`;
    uuidHint.className = 'field-hint success';
    
    const nameInput = document.getElementById('newCreatorName');
    if (!nameInput.value.trim()) nameInput.value = data.name;
    
  } catch (error) {
    uuidHint.textContent = error.message === 'Player not found' ? 'Player not found' : 'Lookup failed';
    uuidHint.className = 'field-hint error';
    uuidInput.value = '';
    uuidInput.readOnly = false;
    uuidInput.placeholder = 'Enter UUID manually';
    
  } finally {
    lookupBtn.disabled = false;
    lookupBtn.textContent = 'Lookup';
  }
}

function formatMinecraftUUID(uuid) {
  if (uuid.includes('-')) return uuid;
  return uuid.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
}

// Fetch channel stats
async function fetchChannelStats() {
  const channelInput = document.getElementById('newCreatorChannel');
  const channelHint = document.getElementById('channelHint');
  const autoFillHint = document.getElementById('channelAutoFillHint');
  const fetchBtn = document.getElementById('btnFetchChannelStats');
  
  const channelUrl = channelInput.value.trim();
  
  if (!channelUrl) {
    channelHint.textContent = 'Enter a channel URL first';
    channelHint.className = 'field-hint error';
    return;
  }
  
  const isYouTube = channelUrl.includes('youtube.com') || channelUrl.includes('youtu.be');
  const isTwitch = channelUrl.includes('twitch.tv');
  
  if (!isYouTube && !isTwitch) {
    channelHint.textContent = 'URL must be YouTube or Twitch';
    channelHint.className = 'field-hint error';
    return;
  }
  
  const settings = await chrome.storage.sync.get(['youtubeApiKey', 'twitchClientId', 'twitchClientSecret']);
  
  if (isYouTube && !settings.youtubeApiKey) {
    channelHint.textContent = 'YouTube API key not configured - go to Settings';
    channelHint.className = 'field-hint error';
    return;
  }
  
  if (isTwitch && (!settings.twitchClientId || !settings.twitchClientSecret)) {
    channelHint.textContent = 'Twitch API not configured - go to Settings';
    channelHint.className = 'field-hint error';
    return;
  }
  
  fetchBtn.disabled = true;
  fetchBtn.textContent = 'Fetching...';
  channelHint.textContent = `Fetching stats from ${isYouTube ? 'YouTube' : 'Twitch'}...`;
  channelHint.className = 'field-hint';
  
  try {
    let stats;
    
    if (isYouTube) {
      stats = await fetchYouTubeStats(channelUrl, settings.youtubeApiKey);
    } else {
      stats = await fetchTwitchStats(channelUrl, settings.twitchClientId, settings.twitchClientSecret);
    }
    
    document.getElementById('newCreatorSubscribers').value = stats.subscribers || stats.followers || '';
    
    const nameInput = document.getElementById('newCreatorName');
    if (!nameInput.value.trim() && stats.name) nameInput.value = stats.name;
    
    const contentTypeSelect = document.getElementById('newCreatorContentType');
    if (!contentTypeSelect.value) contentTypeSelect.value = 'Gaming';
    
    const rankSelect = document.getElementById('newCreatorRank');
    if (!rankSelect.value && stats.subscribers) {
      const subs = parseInt(stats.subscribers);
      if (subs >= 100000) rankSelect.value = 'YOUTUBER';
      else if (isTwitch) rankSelect.value = 'STREAMER';
      else rankSelect.value = 'YT';
    }
    
    channelHint.textContent = `Found: ${stats.name} (${formatNumber(stats.subscribers || stats.followers)} ${isYouTube ? 'subs' : 'followers'})`;
    channelHint.className = 'field-hint success';
    if (autoFillHint) {
      autoFillHint.textContent = '✓ Auto-filled';
      autoFillHint.className = 'section-hint success';
    }
    
    showNotification(`Fetched stats for ${stats.name}!`, 'success');
    
  } catch (error) {
    channelHint.textContent = error.message || 'Failed to fetch stats';
    channelHint.className = 'field-hint error';
    
  } finally {
    fetchBtn.disabled = false;
    fetchBtn.textContent = 'Fetch Stats';
  }
}

async function fetchYouTubeStats(channelUrl, apiKey) {
  let channelId = null;
  let searchQuery = null;
  
  const patterns = [
    { regex: /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/, type: 'id' },
    { regex: /youtube\.com\/c\/([a-zA-Z0-9_-]+)/, type: 'custom' },
    { regex: /youtube\.com\/@([a-zA-Z0-9_-]+)/, type: 'handle' },
    { regex: /youtube\.com\/user\/([a-zA-Z0-9_-]+)/, type: 'user' }
  ];
  
  for (const pattern of patterns) {
    const match = channelUrl.match(pattern.regex);
    if (match) {
      if (pattern.type === 'id') channelId = match[1];
      else searchQuery = match[1];
      break;
    }
  }
  
  if (!channelId && searchQuery) {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (searchData.error) throw new Error(searchData.error.message);
    if (searchData.items?.length > 0) channelId = searchData.items[0].snippet.channelId;
    else throw new Error('Channel not found');
  }
  
  if (!channelId) throw new Error('Could not parse channel URL');
  
  const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;
  const statsResponse = await fetch(statsUrl);
  const statsData = await statsResponse.json();
  
  if (statsData.error) throw new Error(statsData.error.message);
  if (!statsData.items?.length) throw new Error('Channel not found');
  
  const channel = statsData.items[0];
  
  return {
    name: channel.snippet.title,
    subscribers: channel.statistics.subscriberCount,
    totalViews: channel.statistics.viewCount,
    videoCount: channel.statistics.videoCount
  };
}

async function fetchTwitchStats(channelUrl, clientId, clientSecret) {
  const match = channelUrl.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
  if (!match) throw new Error('Could not parse Twitch URL');
  const username = match[1];
  
  const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
  });
  const tokenData = await tokenResponse.json();
  
  if (!tokenData.access_token) throw new Error('Failed to authenticate with Twitch');
  
  const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
    headers: {
      'Client-ID': clientId,
      'Authorization': `Bearer ${tokenData.access_token}`
    }
  });
  const userData = await userResponse.json();
  
  if (!userData.data?.length) throw new Error('Twitch user not found');
  
  const user = userData.data[0];
  
  const followersResponse = await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${user.id}`, {
    headers: {
      'Client-ID': clientId,
      'Authorization': `Bearer ${tokenData.access_token}`
    }
  });
  const followersData = await followersResponse.json();
  
  return {
    name: user.display_name,
    followers: followersData.total || 0
  };
}

// ==================== NAME REFRESH FUNCTIONS ====================

async function refreshCreatorNames() {
  const btn = document.getElementById('btnRefreshNames');
  const originalText = btn.innerHTML;
  
  try {
    btn.disabled = true;
    btn.innerHTML = '⏳ Checking...';
    
    showNotification('Starting name check... This may take a while.', 'info');
    
    const creators = csvManager.getAllCreators();
    const creatorsWithUUID = creators.filter(c => 
      c.creator.uuid && c.creator.uuid.trim() !== '' && isValidMinecraftUUID(c.creator.uuid)
    );
    
    if (creatorsWithUUID.length === 0) {
      showNotification('No creators with valid UUIDs found', 'error');
      return;
    }
    
    const results = { checked: 0, updated: 0, failed: 0, changes: [] };
    
    const batchSize = 10;
    const delayBetweenBatches = 2000;
    const delayBetweenRequests = 200;
    
    for (let i = 0; i < creatorsWithUUID.length; i += batchSize) {
      const batch = creatorsWithUUID.slice(i, i + batchSize);
      const progress = Math.round((i / creatorsWithUUID.length) * 100);
      btn.innerHTML = `⏳ ${progress}%`;
      
      for (const { rowIndex, creator } of batch) {
        try {
          const newName = await lookupNameFromUUID(creator.uuid);
          results.checked++;
          
          if (newName && newName !== creator.name) {
            await csvManager.updateCell(rowIndex, csvManager.COLUMNS.NAME, newName);
            results.updated++;
            results.changes.push({ oldName: creator.name, newName, uuid: creator.uuid });
          }
          
          await sleep(delayBetweenRequests);
        } catch (error) {
          results.failed++;
        }
      }
      
      if (i + batchSize < creatorsWithUUID.length) await sleep(delayBetweenBatches);
    }
    
    await chrome.storage.local.set({ lastNameCheck: new Date().toISOString() });
    
    if (results.updated > 0) {
      showNameChangeResults(results);
      showNotification(`Updated ${results.updated} name(s)!`, 'success');
      await loadAllData();
    } else {
      showNotification(`Checked ${results.checked} creators - all names current!`, 'success');
    }
    
    updateNameCheckStatus();
    
  } catch (error) {
    showNotification('Failed to refresh names: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

async function lookupNameFromUUID(uuid) {
  const cleanUUID = uuid.replace(/-/g, '');
  const response = await fetch(`https://api.mojang.com/user/profile/${cleanUUID}`);
  
  if (response.status === 404) throw new Error('UUID not found');
  if (response.status === 429) throw new Error('Rate limited');
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  
  const data = await response.json();
  return data.name;
}

function isValidMinecraftUUID(uuid) {
  if (!uuid) return false;
  const withDashes = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const withoutDashes = /^[0-9a-f]{32}$/i;
  return withDashes.test(uuid) || withoutDashes.test(uuid);
}

function showNameChangeResults(results) {
  const modal = document.getElementById('nameChangesModal');
  const body = document.getElementById('nameChangesBody');
  
  if (!modal || !body) return;
  
  body.innerHTML = `
    <div style="margin-bottom: 16px;">
      <p style="color: var(--text-secondary); margin-bottom: 12px;">
        The following creators have changed their Minecraft IGN:
      </p>
      <div style="max-height: 300px; overflow-y: auto;">
        ${results.changes.map(c => `
          <div style="padding: 12px; background: var(--bg-elevated); border-radius: var(--radius-md); margin-bottom: 8px;">
            <span style="color: var(--danger);">${escapeHtml(c.oldName)}</span>
            <span style="color: var(--text-tertiary);"> → </span>
            <span style="color: var(--success);">${escapeHtml(c.newName)}</span>
          </div>
        `).join('')}
      </div>
    </div>
    <div style="padding: 12px; background: var(--bg-elevated); border-radius: var(--radius-md); font-size: 13px; color: var(--text-secondary);">
      Checked: ${results.checked} • Updated: ${results.updated}${results.failed > 0 ? ` • Failed: ${results.failed}` : ''}
    </div>
  `;
  
  modal.classList.add('active');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
