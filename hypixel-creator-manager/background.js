// Hypixel Creator Manager - Background Service Worker

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      reviewerName: 'Judge',
      overdueMonths: 3,
      inactiveMonths: 6,
      customNotes: []
    });
    
    console.log('Hypixel Creator Manager installed!');
  }
});

// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
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

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
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
    case 'hcm-search-youtube':
      // Open YouTube search in new tab
      const searchQuery = encodeURIComponent(info.selectionText);
      chrome.tabs.create({
        url: `https://www.youtube.com/results?search_query=${searchQuery}`
      });
      return;
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
    case 'open-channel':
      action = 'openChannel';
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

// Log service worker start
console.log('Hypixel Creator Manager service worker started');
