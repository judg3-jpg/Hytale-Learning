// Popup JavaScript - Professional Version

document.addEventListener('DOMContentLoaded', async () => {
  await checkDataStatus();
  setupEventListeners();
});

// Check data status
async function checkDataStatus() {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const statusCount = document.getElementById('statusCount');
  
  try {
    const data = await chrome.storage.local.get(['csvData']);
    
    if (data.csvData && data.csvData.data && data.csvData.data.length > 0) {
      statusDot.classList.add('loaded');
      statusText.textContent = 'Data loaded';
      statusCount.textContent = `${data.csvData.data.length} creators`;
    } else {
      statusDot.classList.remove('loaded');
      statusText.textContent = 'No data loaded';
      statusCount.textContent = '';
    }
  } catch (error) {
    statusText.textContent = 'Error checking data';
    console.error('Error:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Open Dashboard
  document.getElementById('btnOpenDashboard')?.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
    window.close();
  });
  
  // Open Side Panel
  document.getElementById('btnOpenSidePanel')?.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.sidePanel.open({ tabId: tab.id });
      window.close();
    } catch (error) {
      // Fallback: open dashboard
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
      window.close();
    }
  });
  
  // Settings
  document.getElementById('btnSettings')?.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html#settings') });
    window.close();
  });
}
