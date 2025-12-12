// Hypixel Creator Manager - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize UI
  initializeUI();
  
  // Check data status
  await checkDataStatus();
});

// Initialize UI
function initializeUI() {
  // Main buttons
  document.getElementById('btnOpenDashboard').addEventListener('click', openDashboard);
  document.getElementById('btnOpenSidePanel').addEventListener('click', openSidePanel);
  
  // Collapsible sections
  document.getElementById('shortcutsToggle').addEventListener('click', () => {
    document.getElementById('shortcutsToggle').closest('.collapsible').classList.toggle('open');
  });
  
  document.getElementById('howItWorksToggle').addEventListener('click', () => {
    document.getElementById('howItWorksToggle').closest('.collapsible').classList.toggle('open');
  });
}

// Open dashboard
function openDashboard() {
  chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
  window.close();
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
    // Fallback - open dashboard
    openDashboard();
  }
}

// Check data status
async function checkDataStatus() {
  try {
    const stored = await chrome.storage.local.get(['creatorData', 'lastUpdated']);
    
    const dataIcon = document.getElementById('dataIcon');
    const dataLabel = document.getElementById('dataLabel');
    const dataHint = document.getElementById('dataHint');
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.getElementById('statusText');
    
    if (stored.creatorData && stored.creatorData.length > 0) {
      dataIcon.textContent = '✅';
      dataLabel.textContent = `${stored.creatorData.length} creators loaded`;
      
      if (stored.lastUpdated) {
        const date = new Date(stored.lastUpdated);
        dataHint.textContent = `Last updated: ${date.toLocaleDateString()}`;
      } else {
        dataHint.textContent = 'Data ready to use';
      }
      
      statusDot.style.background = '#4caf50';
      statusText.textContent = 'Data loaded';
    } else {
      dataIcon.textContent = '📤';
      dataLabel.textContent = 'No data loaded';
      dataHint.textContent = 'Open Dashboard to upload CSV';
      
      statusDot.style.background = '#ff9800';
      statusText.textContent = 'Upload CSV to start';
    }
  } catch (error) {
    console.error('Error checking data status:', error);
  }
}
