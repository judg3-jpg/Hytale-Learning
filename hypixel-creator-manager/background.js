// Hypixel Creator Manager - Background Service Worker

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      reviewerName: 'Judge',
      overdueMonths: 3,
      inactiveMonths: 6
    });
    
    console.log('Hypixel Creator Manager installed!');
    
    // Open dashboard on first install
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
  }
  
  // Create context menu items
  setupContextMenus();
});

// Setup context menus
function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    // Parent menu
    chrome.contextMenus.create({
      id: 'hcm-parent',
      title: '🎮 Creator Manager',
      contexts: ['page', 'selection']
    });

    // Open Dashboard
    chrome.contextMenus.create({
      id: 'hcm-open-dashboard',
      parentId: 'hcm-parent',
      title: '📊 Open Dashboard',
      contexts: ['page', 'selection']
    });

    // Open Side Panel
    chrome.contextMenus.create({
      id: 'hcm-open-sidepanel',
      parentId: 'hcm-parent',
      title: '📋 Open Side Panel',
      contexts: ['page', 'selection']
    });

    // Separator
    chrome.contextMenus.create({
      id: 'hcm-separator-1',
      parentId: 'hcm-parent',
      type: 'separator',
      contexts: ['page', 'selection']
    });

    // Search selected text on YouTube
    chrome.contextMenus.create({
      id: 'hcm-search-youtube',
      parentId: 'hcm-parent',
      title: '🔍 Search "%s" on YouTube',
      contexts: ['selection']
    });
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  switch (info.menuItemId) {
    case 'hcm-open-dashboard':
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
      break;
      
    case 'hcm-open-sidepanel':
      if (tab) {
        chrome.sidePanel.open({ tabId: tab.id });
      }
      break;
      
    case 'hcm-search-youtube':
      const searchQuery = encodeURIComponent(info.selectionText);
      chrome.tabs.create({ url: `https://www.youtube.com/results?search_query=${searchQuery}` });
      break;
  }
});

// Handle messages from popup/sidepanel/dashboard
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openDashboard') {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
    sendResponse({ success: true });
  }
  
  if (request.action === 'openSidePanel') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.sidePanel.open({ tabId: tabs[0].id });
      }
    });
    sendResponse({ success: true });
  }
  
  return true;
});

// Allow side panel to be opened
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

// Log service worker start
console.log('Hypixel Creator Manager service worker started (CSV Mode)');
