// Side Panel JavaScript

let currentCreator = null;
let currentRowIndex = null;

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await initializeConnection();
  setupEventListeners();
});

// Load saved settings
async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get({
      reviewerName: 'Judge',
      overdueMonths: 3,
      sheetId: ''
    });
    
    document.getElementById('reviewerName').value = settings.reviewerName;
    document.getElementById('overdueMonths').value = settings.overdueMonths;
    document.getElementById('sheetId').value = settings.sheetId;
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Initialize connection
async function initializeConnection() {
  updateConnectionStatus('connecting', 'Connecting...');
  
  try {
    const connected = await sheetsAPI.init();
    
    if (connected) {
      updateConnectionStatus('connected', 'Connected to Google Sheets');
      enableActions(true);
      await refreshQueue();
    } else {
      updateConnectionStatus('disconnected', 'Not connected');
      enableActions(false);
    }
  } catch (error) {
    console.error('Connection error:', error);
    updateConnectionStatus('disconnected', 'Connection failed');
    enableActions(false);
  }
}

// Update connection status UI
function updateConnectionStatus(status, text) {
  const statusDiv = document.getElementById('connectionStatus');
  const indicator = statusDiv.querySelector('.status-indicator');
  const statusText = statusDiv.querySelector('.status-text');
  const connectBtn = document.getElementById('btnConnect');
  
  indicator.className = 'status-indicator ' + status;
  statusText.textContent = text;
  
  if (status === 'connected') {
    connectBtn.textContent = 'Reconnect';
    connectBtn.classList.remove('btn-primary');
    connectBtn.classList.add('btn-outline');
  } else {
    connectBtn.textContent = 'Connect Sheet';
    connectBtn.classList.remove('btn-outline');
    connectBtn.classList.add('btn-primary');
  }
}

// Enable/disable action buttons
function enableActions(enabled) {
  const buttons = document.querySelectorAll('.btn-action, .btn-note, #btnRefreshQueue');
  buttons.forEach(btn => {
    btn.disabled = !enabled;
  });
}

// Setup event listeners
function setupEventListeners() {
  // Connect button
  document.getElementById('btnConnect').addEventListener('click', handleConnect);
  
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
  
  // Queue
  document.getElementById('btnRefreshQueue').addEventListener('click', refreshQueue);
  
  // Settings
  document.getElementById('settingsToggle').addEventListener('click', toggleSettings);
  document.getElementById('btnSaveSettings').addEventListener('click', saveSettings);
  
  // Dashboard buttons
  document.getElementById('btnOpenDashboard').addEventListener('click', openDashboard);
  document.getElementById('btnFullDashboard').addEventListener('click', openDashboard);
  
  // Listen for messages from content script
  chrome.runtime.onMessage.addListener(handleMessage);
}

// Handle connect button
async function handleConnect() {
  const sheetIdInput = document.getElementById('sheetId').value.trim();
  
  if (!sheetIdInput) {
    // Try to get from current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url.includes('docs.google.com/spreadsheets')) {
      const sheetId = sheetsAPI.extractSheetIdFromUrl(tab.url);
      if (sheetId) {
        document.getElementById('sheetId').value = sheetId;
        await sheetsAPI.setSheetId(sheetId);
      }
    } else {
      showToast('Please enter a Sheet ID or open your Google Sheet', 'error');
      return;
    }
  } else {
    await sheetsAPI.setSheetId(sheetIdInput);
  }
  
  updateConnectionStatus('connecting', 'Authenticating...');
  
  try {
    await sheetsAPI.authenticate();
    updateConnectionStatus('connected', 'Connected to Google Sheets');
    enableActions(true);
    await refreshQueue();
    showToast('Connected successfully!', 'success');
  } catch (error) {
    console.error('Connection failed:', error);
    updateConnectionStatus('disconnected', 'Authentication failed');
    showToast('Failed to connect: ' + error.message, 'error');
  }
}

// Handle quick review
async function handleQuickReview() {
  if (!currentRowIndex) {
    showToast('Select a creator from the queue first', 'warning');
    return;
  }
  
  const reviewerName = document.getElementById('reviewerName').value || 'Judge';
  
  try {
    await sheetsAPI.quickReview(currentRowIndex, reviewerName);
    showToast(`Reviewed ${currentCreator?.name || 'creator'}!`, 'success');
    await refreshQueue();
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
  if (!currentRowIndex) {
    showToast('Select a creator first', 'warning');
    return;
  }
  
  try {
    await sheetsAPI.clearCheckup(currentRowIndex);
    showToast('Checkup flag cleared!', 'success');
    await refreshQueue();
  } catch (error) {
    showToast('Failed to clear checkup: ' + error.message, 'error');
  }
}

// Handle add warning
async function handleAddWarning() {
  if (!currentRowIndex) {
    showToast('Select a creator first', 'warning');
    return;
  }
  
  const warning = prompt('Enter warning message:');
  if (!warning) return;
  
  try {
    await sheetsAPI.addWarning(currentRowIndex, warning, currentCreator?.warnings);
    showToast('Warning added!', 'success');
  } catch (error) {
    showToast('Failed to add warning: ' + error.message, 'error');
  }
}

// Handle quick note
async function handleQuickNote(note) {
  if (!currentRowIndex) {
    showToast('Select a creator first', 'warning');
    return;
  }
  
  try {
    await sheetsAPI.addNote(currentRowIndex, note, currentCreator?.notes);
    showToast('Note added!', 'success');
  } catch (error) {
    showToast('Failed to add note: ' + error.message, 'error');
  }
}

// Handle custom note
async function handleCustomNote() {
  if (!currentRowIndex) {
    showToast('Select a creator first', 'warning');
    return;
  }
  
  const note = prompt('Enter your note:');
  if (!note) return;
  
  try {
    await sheetsAPI.addNote(currentRowIndex, note, currentCreator?.notes);
    showToast('Note added!', 'success');
  } catch (error) {
    showToast('Failed to add note: ' + error.message, 'error');
  }
}

// Refresh the review queue
async function refreshQueue() {
  const queueList = document.getElementById('queueList');
  const queueCount = document.getElementById('queueCount');
  
  try {
    const overdueMonths = parseInt(document.getElementById('overdueMonths').value) || 3;
    const queue = await sheetsAPI.getReviewQueue(overdueMonths);
    
    queueCount.textContent = queue.length;
    
    if (queue.length === 0) {
      queueList.innerHTML = `
        <div class="queue-empty">
          <span>🎉 All caught up! No creators need review.</span>
        </div>
      `;
      return;
    }
    
    queueList.innerHTML = queue.slice(0, 20).map(item => `
      <div class="queue-item" data-row="${item.rowIndex}" data-creator='${JSON.stringify(item.creator).replace(/'/g, "\\'")}'>
        <div class="queue-item-avatar">${item.creator.name.charAt(0).toUpperCase()}</div>
        <div class="queue-item-info">
          <div class="queue-item-name">${escapeHtml(item.creator.name)}</div>
          <div class="queue-item-reason">${escapeHtml(item.reason)}</div>
        </div>
        <button class="queue-item-action">Review</button>
      </div>
    `).join('');
    
    // Add click handlers
    queueList.querySelectorAll('.queue-item').forEach(item => {
      item.addEventListener('click', () => selectCreator(item));
    });
    
  } catch (error) {
    console.error('Failed to refresh queue:', error);
    queueList.innerHTML = `
      <div class="queue-empty">
        <span>⚠️ Failed to load queue</span>
      </div>
    `;
  }
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
  currentCreator = JSON.parse(element.dataset.creator);
  
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

// Toggle settings section
function toggleSettings() {
  const section = document.getElementById('settingsToggle').closest('.collapsible');
  section.classList.toggle('open');
}

// Save settings
async function saveSettings() {
  const settings = {
    reviewerName: document.getElementById('reviewerName').value || 'Judge',
    overdueMonths: parseInt(document.getElementById('overdueMonths').value) || 3,
    sheetId: document.getElementById('sheetId').value
  };
  
  try {
    await chrome.storage.sync.set(settings);
    showToast('Settings saved!', 'success');
  } catch (error) {
    showToast('Failed to save settings', 'error');
  }
}

// Open dashboard
function openDashboard() {
  chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
}

// Handle messages from content script
function handleMessage(request, sender, sendResponse) {
  if (request.action === 'creatorSelected') {
    currentRowIndex = request.rowIndex;
    currentCreator = request.creator;
    updateCreatorCard(request.creator);
  }
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

// Add toast styles dynamically
const toastStyles = document.createElement('style');
toastStyles.textContent = `
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
  .toast-close { background: none; border: none; color: inherit; font-size: 18px; cursor: pointer; opacity: 0.7; }
  .toast-close:hover { opacity: 1; }
  .toast-fadeout { animation: toastOut 0.3s ease forwards; }
  @keyframes toastIn { from { transform: translateX(-50%) translateY(20px); opacity: 0; } }
  @keyframes toastOut { to { transform: translateX(-50%) translateY(20px); opacity: 0; } }
  .queue-item.selected { background: rgba(102, 126, 234, 0.2); border: 1px solid rgba(102, 126, 234, 0.3); }
`;
document.head.appendChild(toastStyles);
