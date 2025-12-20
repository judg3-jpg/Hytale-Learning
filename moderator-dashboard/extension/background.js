/**
 * Background Service Worker for Moderator Dashboard Extension
 */

// Open dashboard in new tab when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
    // Open the standalone dashboard HTML file
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
    if (command === 'open-dashboard') {
        chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    }
});

