// Hypixel Creator Manager - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize UI
  initializeUI();
  
  // Check connection and load stats
  await checkConnection();
});

// Initialize UI
function initializeUI() {
  // Main buttons
  document.getElementById('btnOpenSidePanel').addEventListener('click', openSidePanel);
  document.getElementById('btnOpenDashboard').addEventListener('click', openDashboard);
  
  // Quick actions
  document.getElementById('btnQuickReview').addEventListener('click', () => sendAction('quickReview'));
  document.getElementById('btnOpenChannel').addEventListener('click', () => sendAction('openChannel'));
  
  // Collapsible shortcuts
  document.getElementById('shortcutsToggle').addEventListener('click', () => {
    document.getElementById('shortcutsToggle').closest('.collapsible').classList.toggle('open');
  });
}

// Open side panel
async function openSidePanel() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      await chrome.sidePanel.open({ tabId: tab.id });
      window.close();
    }
  } catch (error) {
    console.error('Failed to open side panel:', error);
    showStatus('Failed to open side panel', 'error');
  }
}

// Open dashboard
function openDashboard() {
  chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
  window.close();
}

// Check connection and load stats
async function checkConnection() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.url && tab.url.includes('docs.google.com/spreadsheets')) {
      showStatus('On Google Sheet - Ready to use!', 'success');
    } else {
      showStatus('Open your Creator Sheet to use quick actions', 'warning');
    }
    
    // Try to load stats from storage
    const data = await chrome.storage.local.get(['cachedStats']);
    if (data.cachedStats) {
      document.getElementById('statsSection').style.display = 'block';
      document.getElementById('statCreators').textContent = data.cachedStats.total || '-';
      document.getElementById('statReviews').textContent = data.cachedStats.needsReview || '-';
      document.getElementById('statWarnings').textContent = data.cachedStats.warnings || '-';
    }
  } catch (error) {
    showStatus('Ready', 'success');
  }
}

// Send action to content script
async function sendAction(action, data = {}) {
  showStatus('Working...', 'working');
  
  try {
    const settings = await chrome.storage.sync.get({
      reviewerName: 'Judge',
      overdueMonths: 3,
      inactiveMonths: 6
    });
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url.includes('docs.google.com/spreadsheets')) {
      showStatus('Please open your Google Sheet first', 'error');
      return;
    }
    
    const response = await chrome.tabs.sendMessage(tab.id, {
      action,
      data: { ...data, ...settings }
    });
    
    if (response && response.success) {
      showStatus(response.message || 'Done!', 'success');
    } else {
      showStatus(response?.message || 'Action completed', 'success');
    }
  } catch (error) {
    console.error('Error sending action:', error);
    showStatus('Error: Make sure you\'re on the sheet', 'error');
  }
}

// Status display
function showStatus(message, type = 'success') {
  const statusBar = document.getElementById('statusBar');
  const statusText = document.getElementById('statusText');
  
  statusBar.className = 'status-bar';
  if (type === 'error') {
    statusBar.classList.add('error');
  } else if (type === 'working') {
    statusBar.classList.add('working');
  } else if (type === 'warning') {
    statusBar.classList.add('warning');
  }
  
  statusText.textContent = message;
}
