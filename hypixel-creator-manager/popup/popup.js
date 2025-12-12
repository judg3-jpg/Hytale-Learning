// Hypixel Creator Manager - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  // Load saved settings
  await loadSettings();
  
  // Initialize UI
  initializeUI();
  
  // Check if we're on a Google Sheet
  checkSheetStatus();
});

// Settings Management
async function loadSettings() {
  const defaults = {
    reviewerName: 'Judge',
    overdueMonths: 3,
    inactiveMonths: 6,
    customNotes: []
  };
  
  try {
    const result = await chrome.storage.sync.get(defaults);
    document.getElementById('reviewerName').value = result.reviewerName;
    document.getElementById('overdueMonths').value = result.overdueMonths;
    document.getElementById('inactiveMonths').value = result.inactiveMonths;
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function saveSettings() {
  const settings = {
    reviewerName: document.getElementById('reviewerName').value || 'Judge',
    overdueMonths: parseInt(document.getElementById('overdueMonths').value) || 3,
    inactiveMonths: parseInt(document.getElementById('inactiveMonths').value) || 6
  };
  
  try {
    await chrome.storage.sync.set(settings);
    showStatus('Settings saved!', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Error saving settings', 'error');
  }
}

// UI Initialization
function initializeUI() {
  // Settings toggle
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsSection = settingsToggle.closest('.collapsible');
  
  settingsToggle.addEventListener('click', () => {
    settingsSection.classList.toggle('open');
  });
  
  // Save settings button
  document.getElementById('btnSaveSettings').addEventListener('click', saveSettings);
  
  // Quick Action buttons
  document.getElementById('btnQuickReview').addEventListener('click', () => sendAction('quickReview'));
  document.getElementById('btnOpenChannel').addEventListener('click', () => sendAction('openChannel'));
  document.getElementById('btnClearCheckup').addEventListener('click', () => sendAction('clearCheckup'));
  document.getElementById('btnFlagWarning').addEventListener('click', () => sendAction('addWarning'));
  
  // Quick Notes buttons
  document.getElementById('noteInactive').addEventListener('click', () => sendAction('insertNote', { note: 'Channel inactive - no uploads in X months' }));
  document.getElementById('noteNonGaming').addEventListener('click', () => sendAction('insertNote', { note: 'Channel no longer produces gaming content' }));
  document.getElementById('noteReviewed').addEventListener('click', () => sendAction('insertNote', { note: 'Content reviewed - meets standards ✓' }));
  document.getElementById('noteCustom').addEventListener('click', promptCustomNote);
  
  // Bulk Action buttons
  document.getElementById('btnFindOverdue').addEventListener('click', () => sendAction('findOverdue'));
  document.getElementById('btnFindInactive').addEventListener('click', () => sendAction('findInactive'));
  document.getElementById('btnHighlightCheckups').addEventListener('click', () => sendAction('highlightCheckups'));
  document.getElementById('btnClearHighlights').addEventListener('click', () => sendAction('clearHighlights'));
}

// Send action to content script
async function sendAction(action, data = {}) {
  showStatus('Working...', 'working');
  
  try {
    // Get settings to include
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
      showStatus(response?.message || 'Action failed', 'error');
    }
  } catch (error) {
    console.error('Error sending action:', error);
    showStatus('Error: Make sure you\'re on the sheet', 'error');
  }
}

// Custom note prompt
function promptCustomNote() {
  const note = prompt('Enter your custom note:');
  if (note && note.trim()) {
    sendAction('insertNote', { note: note.trim() });
  }
}

// Check if current tab is a Google Sheet
async function checkSheetStatus() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.url && tab.url.includes('docs.google.com/spreadsheets')) {
      showStatus('Connected to Google Sheet', 'success');
    } else {
      showStatus('Open your Creator Sheet to get started', 'warning');
    }
  } catch (error) {
    showStatus('Ready', 'success');
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
  }
  
  statusText.textContent = message;
  
  // Auto-reset after 3 seconds for success/error
  if (type !== 'working') {
    setTimeout(() => {
      checkSheetStatus();
    }, 3000);
  }
}
