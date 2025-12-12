// Side Panel JavaScript - CSV Version

let currentCreator = null;
let currentRowIndex = null;

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
  setupFileUpload();
  await initializeData();
});

// Load saved settings
async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get({
      reviewerName: 'Judge',
      overdueMonths: 3
    });
    
    window.reviewerName = settings.reviewerName;
    window.overdueMonths = settings.overdueMonths;
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Initialize data
async function initializeData() {
  const hasData = await csvManager.init();
  
  updateDataStatus(hasData);
  
  if (hasData) {
    enableActions(true);
    await refreshQueue();
  } else {
    enableActions(false);
    showUploadSection();
  }
}

// Update data status UI
function updateDataStatus(hasData) {
  const indicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  const uploadBtn = document.getElementById('btnUploadCSV');
  const exportBtn = document.getElementById('btnExportCSV');
  
  if (hasData) {
    indicator.classList.add('loaded');
    statusText.textContent = `${csvManager.data.length} creators loaded`;
    uploadBtn.textContent = 'Update CSV';
    exportBtn.disabled = false;
    document.getElementById('uploadSection').style.display = 'none';
  } else {
    indicator.classList.remove('loaded');
    statusText.textContent = 'No data loaded';
    uploadBtn.textContent = 'Upload CSV';
    exportBtn.disabled = true;
  }
}

// Show upload section
function showUploadSection() {
  document.getElementById('uploadSection').style.display = 'block';
}

// Enable/disable action buttons
function enableActions(enabled) {
  const buttons = document.querySelectorAll('.btn-action, .btn-note');
  buttons.forEach(btn => {
    btn.disabled = !enabled;
  });
}

// Setup event listeners
function setupEventListeners() {
  // Upload button
  document.getElementById('btnUploadCSV').addEventListener('click', () => {
    document.getElementById('csvFileInput').click();
  });
  
  // Quick actions
  document.getElementById('btnQuickReview').addEventListener('click', handleQuickReview);
  document.getElementById('btnOpenChannel').addEventListener('click', handleOpenChannel);
  document.getElementById('btnClearCheckup').addEventListener('click', handleClearCheckup);
  document.getElementById('btnAddWarning').addEventListener('click', handleAddWarning);
  
  // Quick notes
  document.querySelectorAll('.btn-note[data-note]').forEach(btn => {
    btn.addEventListener('click', () => handleQuickNote(btn.dataset.note));
  });
  document.getElementById('btnCustomNote').addEventListener('click', handleCustomNote);
  
  // Export
  document.getElementById('btnExportCSV').addEventListener('click', handleExportCSV);
  
  // Dashboard buttons
  document.getElementById('btnOpenDashboard').addEventListener('click', openDashboard);
  document.getElementById('btnFullDashboard').addEventListener('click', openDashboard);
  
  // Search
  document.getElementById('searchInput').addEventListener('input', handleSearch);
}

// Setup file upload
function setupFileUpload() {
  const dropzone = document.getElementById('uploadDropzone');
  const fileInput = document.getElementById('csvFileInput');
  
  // Click to upload
  dropzone.addEventListener('click', () => fileInput.click());
  
  // File selected
  fileInput.addEventListener('change', handleFileSelect);
  
  // Drag and drop
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });
  
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].name.endsWith('.csv')) {
      handleFile(files[0]);
    } else {
      showToast('Please upload a CSV file', 'error');
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
    showToast('Importing CSV...', 'info');
    
    const result = await csvManager.importCSV(file);
    
    showToast(`Imported ${result.rowCount} creators!`, 'success');
    
    updateDataStatus(true);
    enableActions(true);
    await refreshQueue();
  } catch (error) {
    console.error('Import error:', error);
    showToast('Failed to import: ' + error.message, 'error');
  }
}

// Handle quick review
async function handleQuickReview() {
  if (currentRowIndex === null) {
    showToast('Select a creator from the queue first', 'warning');
    return;
  }
  
  try {
    await csvManager.quickReview(currentRowIndex, window.reviewerName || 'Judge');
    showToast(`Reviewed ${currentCreator?.name || 'creator'}!`, 'success');
    await refreshQueue();
    
    // Update creator card
    if (currentRowIndex !== null) {
      const updated = csvManager.getRow(currentRowIndex);
      if (updated) {
        updateCreatorCard(updated);
      }
    }
  } catch (error) {
    showToast('Failed to save review: ' + error.message, 'error');
  }
}

// Handle open channel
function handleOpenChannel() {
  if (currentCreator && currentCreator.channel) {
    window.open(currentCreator.channel, '_blank');
  } else {
    showToast('No channel URL available', 'warning');
  }
}

// Handle clear checkup
async function handleClearCheckup() {
  if (currentRowIndex === null) {
    showToast('Select a creator first', 'warning');
    return;
  }
  
  try {
    await csvManager.clearCheckup(currentRowIndex);
    showToast('Checkup flag cleared!', 'success');
    await refreshQueue();
  } catch (error) {
    showToast('Failed to clear checkup: ' + error.message, 'error');
  }
}

// Handle add warning
async function handleAddWarning() {
  if (currentRowIndex === null) {
    showToast('Select a creator first', 'warning');
    return;
  }
  
  const warning = prompt('Enter warning message:');
  if (!warning) return;
  
  try {
    await csvManager.addWarning(currentRowIndex, warning);
    showToast('Warning added!', 'success');
  } catch (error) {
    showToast('Failed to add warning: ' + error.message, 'error');
  }
}

// Handle quick note
async function handleQuickNote(note) {
  if (currentRowIndex === null) {
    showToast('Select a creator first', 'warning');
    return;
  }
  
  try {
    await csvManager.addNote(currentRowIndex, note);
    showToast('Note added!', 'success');
  } catch (error) {
    showToast('Failed to add note: ' + error.message, 'error');
  }
}

// Handle custom note
async function handleCustomNote() {
  if (currentRowIndex === null) {
    showToast('Select a creator first', 'warning');
    return;
  }
  
  const note = prompt('Enter your note:');
  if (!note) return;
  
  try {
    await csvManager.addNote(currentRowIndex, note);
    showToast('Note added!', 'success');
  } catch (error) {
    showToast('Failed to add note: ' + error.message, 'error');
  }
}

// Handle export CSV
function handleExportCSV() {
  if (!csvManager.hasData()) {
    showToast('No data to export', 'error');
    return;
  }
  
  const filename = `hypixel-creators-${new Date().toISOString().split('T')[0]}.csv`;
  csvManager.downloadCSV(filename);
  showToast('CSV exported!', 'success');
}

// Refresh the review queue
async function refreshQueue() {
  const queueList = document.getElementById('queueList');
  const queueCount = document.getElementById('queueCount');
  
  const queue = csvManager.getReviewQueue(window.overdueMonths || 3);
  
  queueCount.textContent = queue.length;
  
  if (queue.length === 0) {
    queueList.innerHTML = `
      <div class="queue-empty">
        <span>🎉 All caught up! No creators need review.</span>
      </div>
    `;
    return;
  }
  
  queueList.innerHTML = queue.slice(0, 15).map(item => `
    <div class="queue-item" data-row="${item.rowIndex}">
      <div class="queue-item-avatar">${(item.creator.name || '?').charAt(0).toUpperCase()}</div>
      <div class="queue-item-info">
        <div class="queue-item-name">${escapeHtml(item.creator.name || 'Unknown')}</div>
        <div class="queue-item-reason">${escapeHtml(item.reason)}</div>
      </div>
      <button class="queue-item-action">Review</button>
    </div>
  `).join('');
  
  // Add click handlers
  queueList.querySelectorAll('.queue-item').forEach(item => {
    item.addEventListener('click', () => selectCreator(item));
  });
}

// Handle search
function handleSearch(e) {
  const query = e.target.value.trim();
  const resultsDiv = document.getElementById('searchResults');
  
  if (!query || query.length < 2) {
    resultsDiv.innerHTML = '';
    return;
  }
  
  const results = csvManager.searchCreators(query);
  
  if (results.length === 0) {
    resultsDiv.innerHTML = '<div class="search-empty">No creators found</div>';
    return;
  }
  
  resultsDiv.innerHTML = results.slice(0, 5).map(({ rowIndex, creator }) => `
    <div class="search-result-item" data-row="${rowIndex}">
      <div class="queue-item-avatar" style="width: 28px; height: 28px; font-size: 12px;">${(creator.name || '?').charAt(0).toUpperCase()}</div>
      <div class="queue-item-info">
        <div class="queue-item-name" style="font-size: 12px;">${escapeHtml(creator.name || 'Unknown')}</div>
        <div class="queue-item-reason" style="font-size: 10px;">${escapeHtml(creator.rankGiven || 'Creator')}</div>
      </div>
    </div>
  `).join('');
  
  // Add click handlers
  resultsDiv.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const rowIndex = parseInt(item.dataset.row);
      currentRowIndex = rowIndex;
      currentCreator = csvManager.getRow(rowIndex);
      updateCreatorCard(currentCreator);
      resultsDiv.innerHTML = '';
      document.getElementById('searchInput').value = '';
    });
  });
}

// Select a creator from the queue
function selectCreator(element) {
  // Remove previous selection
  document.querySelectorAll('.queue-item.selected').forEach(el => {
    el.classList.remove('selected');
  });
  
  // Select this one
  element.classList.add('selected');
  
  currentRowIndex = parseInt(element.dataset.row);
  currentCreator = csvManager.getRow(currentRowIndex);
  
  // Update creator card
  updateCreatorCard(currentCreator);
}

// Update the creator card display
function updateCreatorCard(creator) {
  const section = document.getElementById('creatorSection');
  section.style.display = 'block';
  
  document.getElementById('creatorName').textContent = creator.name || 'Unknown';
  document.getElementById('creatorRank').textContent = creator.rankGiven || 'CREATOR';
  document.getElementById('creatorSubs').textContent = formatNumber(creator.subscribers) || '-';
  document.getElementById('creatorLastUpload').textContent = creator.lastUploadAgo || '-';
  document.getElementById('creatorLastChecked').textContent = creator.lastChecked || 'Never';
  
  const channelLink = document.getElementById('creatorChannelLink');
  if (creator.channel) {
    channelLink.href = creator.channel;
    channelLink.style.display = 'flex';
  } else {
    channelLink.style.display = 'none';
  }
}

// Open dashboard
function openDashboard() {
  chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
}

// Toast notification
function showToast(message, type = 'info') {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close">×</button>
  `;
  
  document.body.appendChild(toast);
  
  // Add close handler
  toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
  
  // Auto remove
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('toast-fadeout');
      setTimeout(() => toast.remove(), 300);
    }
  }, 3000);
}

// Utility functions
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function formatNumber(num) {
  if (!num) return null;
  const n = parseInt(num.toString().replace(/,/g, ''));
  if (isNaN(n)) return num;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

// Add styles dynamically
const extraStyles = document.createElement('style');
extraStyles.textContent = `
  .toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 20px;
    border-radius: 8px;
    background: #333;
    color: white;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 10000;
    animation: toastIn 0.3s ease;
  }
  .toast-success { background: linear-gradient(135deg, #11998e, #38ef7d); color: #1a1a2e; }
  .toast-error { background: linear-gradient(135deg, #f5576c, #f093fb); }
  .toast-warning { background: linear-gradient(135deg, #f7931e, #ffd700); color: #1a1a2e; }
  .toast-info { background: linear-gradient(135deg, #667eea, #764ba2); }
  .toast-close { background: none; border: none; color: inherit; font-size: 18px; cursor: pointer; opacity: 0.7; }
  .toast-close:hover { opacity: 1; }
  .toast-fadeout { animation: toastOut 0.3s ease forwards; }
  @keyframes toastIn { from { transform: translateX(-50%) translateY(20px); opacity: 0; } }
  @keyframes toastOut { to { transform: translateX(-50%) translateY(20px); opacity: 0; } }
  .queue-item.selected { background: rgba(102, 126, 234, 0.2); border: 1px solid rgba(102, 126, 234, 0.3); }
  .search-empty { padding: 12px; text-align: center; color: #888; font-size: 12px; }
  .search-result-item { display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(255,255,255,0.03); border-radius: 6px; margin-top: 6px; cursor: pointer; }
  .search-result-item:hover { background: rgba(255,255,255,0.08); }
`;
document.head.appendChild(extraStyles);
