/**
 * Background Service Worker for Moderator Dashboard Extension
 */

const DASHBOARD_URL = 'http://localhost:3000';

// Open dashboard in new tab when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
    // Check if dashboard tab is already open
    chrome.tabs.query({ url: `${DASHBOARD_URL}/*` }, (tabs) => {
        if (tabs.length > 0) {
            // Focus existing dashboard tab
            chrome.tabs.update(tabs[0].id, { active: true });
            chrome.windows.update(tabs[0].windowId, { focused: true });
        } else {
            // Open new dashboard tab
            chrome.tabs.create({ url: DASHBOARD_URL });
        }
    });
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
    if (command === 'open-dashboard') {
        chrome.tabs.query({ url: `${DASHBOARD_URL}/*` }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.update(tabs[0].id, { active: true });
                chrome.windows.update(tabs[0].windowId, { focused: true });
            } else {
                chrome.tabs.create({ url: DASHBOARD_URL });
            }
        });
    }
});

