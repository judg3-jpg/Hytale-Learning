// Hypixel Creator Manager - Background Service Worker

// Import sheets API
importScripts('lib/sheets-api.js');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      reviewerName: 'Judge',
      overdueMonths: 3,
      inactiveMonths: 6,
      customNotes: [],
      sheetId: ''
    });
    
    console.log('Hypixel Creator Manager installed!');
    
    // Open setup page on first install
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html#settings') });
  }
  
  // Create context menu items
  setupContextMenus();
});

// Setup context menus
function setupContextMenus() {
  // Clear existing menus
  chrome.contextMenus.removeAll(() => {
    // Parent menu
    chrome.contextMenus.create({
      id: 'hcm-parent',
      title: '🎮 Creator Manager',
      contexts: ['selection', 'page'],
      documentUrlPatterns: ['https://docs.google.com/spreadsheets/*']
    });

    // Quick Review
    chrome.contextMenus.create({
      id: 'hcm-quick-review',
      parentId: 'hcm-parent',
      title: '✓ Quick Review (Alt+R)',
      contexts: ['selection', 'page']
    });

    // Open Side Panel
    chrome.contextMenus.create({
      id: 'hcm-open-sidepanel',
      parentId: 'hcm-parent',
      title: '📋 Open Side Panel',
      contexts: ['selection', 'page']
    });

    // Open Dashboard
    chrome.contextMenus.create({
      id: 'hcm-open-dashboard',
      parentId: 'hcm-parent',
      title: '📊 Open Dashboard',
      contexts: ['selection', 'page']
    });

    // Separator
    chrome.contextMenus.create({
      id: 'hcm-separator-1',
      parentId: 'hcm-parent',
      type: 'separator',
      contexts: ['selection', 'page']
    });

    // Notes submenu
    chrome.contextMenus.create({
      id: 'hcm-notes',
      parentId: 'hcm-parent',
      title: '📝 Insert Note',
      contexts: ['selection', 'page']
    });

    chrome.contextMenus.create({
      id: 'hcm-note-inactive',
      parentId: 'hcm-notes',
      title: 'Channel inactive',
      contexts: ['selection', 'page']
    });

    chrome.contextMenus.create({
      id: 'hcm-note-nongaming',
      parentId: 'hcm-notes',
      title: 'Non-gaming content',
      contexts: ['selection', 'page']
    });

    chrome.contextMenus.create({
      id: 'hcm-note-reviewed',
      parentId: 'hcm-notes',
      title: 'Content reviewed ✓',
      contexts: ['selection', 'page']
    });

    // Separator
    chrome.contextMenus.create({
      id: 'hcm-separator-2',
      parentId: 'hcm-parent',
      type: 'separator',
      contexts: ['selection', 'page']
    });

    // Other actions
    chrome.contextMenus.create({
      id: 'hcm-add-warning',
      parentId: 'hcm-parent',
      title: '⚠️ Add Warning',
      contexts: ['selection', 'page']
    });

    chrome.contextMenus.create({
      id: 'hcm-clear-checkup',
      parentId: 'hcm-parent',
      title: '🧹 Clear Checkup Flag',
      contexts: ['selection', 'page']
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
  // Handle special actions that don't need content script
  if (info.menuItemId === 'hcm-open-sidepanel') {
    chrome.sidePanel.open({ tabId: tab.id });
    return;
  }
  
  if (info.menuItemId === 'hcm-open-dashboard') {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
    return;
  }
  
  if (info.menuItemId === 'hcm-search-youtube') {
    const searchQuery = encodeURIComponent(info.selectionText);
    chrome.tabs.create({ url: `https://www.youtube.com/results?search_query=${searchQuery}` });
    return;
  }
  
  // Actions that need content script
  if (!tab || !tab.url.includes('docs.google.com/spreadsheets')) {
    return;
  }

  const settings = await chrome.storage.sync.get({
    reviewerName: 'Judge'
  });

  let action = null;
  let data = { ...settings };

  switch (info.menuItemId) {
    case 'hcm-quick-review':
      action = 'quickReview';
      break;
    case 'hcm-note-inactive':
      action = 'insertNote';
      data.note = 'Channel inactive - no uploads in X months';
      break;
    case 'hcm-note-nongaming':
      action = 'insertNote';
      data.note = 'Channel no longer produces gaming content';
      break;
    case 'hcm-note-reviewed':
      action = 'insertNote';
      data.note = 'Content reviewed - meets standards ✓';
      break;
    case 'hcm-add-warning':
      action = 'addWarning';
      break;
    case 'hcm-clear-checkup':
      action = 'clearCheckup';
      break;
  }

  if (action) {
    try {
      await chrome.tabs.sendMessage(tab.id, { action, data });
    } catch (error) {
      console.error('Error sending message to content script:', error);
    }
  }
});

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab || !tab.url.includes('docs.google.com/spreadsheets')) {
    return;
  }

  const settings = await chrome.storage.sync.get({
    reviewerName: 'Judge'
  });

  let action = null;
  let data = { ...settings };

  switch (command) {
    case 'quick-review':
      action = 'quickReview';
      break;
    case 'note-inactive':
      action = 'insertNote';
      data.note = 'Channel inactive - no uploads in X months';
      break;
    case 'note-non-gaming':
      action = 'insertNote';
      data.note = 'Channel no longer produces gaming content';
      break;
    case 'note-reviewed':
      action = 'insertNote';
      data.note = 'Content reviewed - meets standards ✓';
      break;
  }

  if (action) {
    try {
      await chrome.tabs.sendMessage(tab.id, { action, data });
    } catch (error) {
      console.error('Error sending message to content script:', error);
    }
  }
});

// Handle side panel open on action click
chrome.action.onClicked.addListener(async (tab) => {
  // If popup is defined, this won't fire
  // If we want side panel to open on icon click:
  // chrome.sidePanel.open({ tabId: tab.id });
});

// Allow side panel to be opened on Google Sheets
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

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

// Log service worker start
console.log('Hypixel Creator Manager service worker started');
