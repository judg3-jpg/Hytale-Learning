// Refund Calculator - Background Service Worker
// This service worker handles extension lifecycle events

// Extension installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Refund Calculator extension installed');
  } else if (details.reason === 'update') {
    console.log('Refund Calculator extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Keep service worker alive (optional, for future features)
chrome.runtime.onStartup.addListener(() => {
  console.log('Refund Calculator extension started');
});
