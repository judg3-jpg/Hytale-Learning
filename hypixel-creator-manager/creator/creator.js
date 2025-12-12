// Creator Profile Page JavaScript

let currentRowIndex = null;
let currentCreator = null;
let liveStats = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Get row index from URL
  const params = new URLSearchParams(window.location.search);
  currentRowIndex = parseInt(params.get('row'));
  
  if (isNaN(currentRowIndex)) {
    showError('No creator specified');
    return;
  }
  
  await loadCreatorData();
  setupEventListeners();
  await initializeAPIs();
});

// Load creator data from CSV
async function loadCreatorData() {
  try {
    await csvManager.init();
    
    if (!csvManager.hasData()) {
      showError('No data loaded. Please upload a CSV first.');
      return;
    }
    
    currentCreator = csvManager.getRow(currentRowIndex);
    
    if (!currentCreator) {
      showError('Creator not found');
      return;
    }
    
    // Show main content
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    
    // Populate the page
    populateCreatorData();
    
  } catch (error) {
    console.error('Error loading creator:', error);
    showError(error.message);
  }
}

// Populate all creator data fields
function populateCreatorData() {
  const c = currentCreator;
  
  // Banner section
  document.getElementById('creatorName').textContent = c.name || 'Unknown Creator';
  document.getElementById('avatarInitial').textContent = (c.name || '?').charAt(0).toUpperCase();
  document.getElementById('creatorRank').textContent = c.rankGiven || 'CREATOR';
  
  // Detect platform
  const platform = detectPlatform(c.channel);
  const platformBadge = document.getElementById('creatorPlatform');
  platformBadge.textContent = platform.toUpperCase();
  platformBadge.classList.add(platform);
  
  // Channel link
  const channelLink = document.getElementById('channelLink');
  if (c.channel) {
    channelLink.href = c.channel;
    channelLink.textContent = 'View Channel →';
  } else {
    channelLink.style.display = 'none';
  }
  
  // Quick stats (from CSV)
  document.getElementById('quickStatSubs').textContent = formatNumber(c.subscribers) || '-';
  document.getElementById('quickStatViews').textContent = '-'; // Will be filled by API
  document.getElementById('quickStatVideos').textContent = '-'; // Will be filled by API
  
  // Channel Statistics
  document.getElementById('statSubscribers').textContent = formatNumber(c.subscribers) || '-';
  document.getElementById('statTotalViews').textContent = '-';
  document.getElementById('statVideoCount').textContent = '-';
  document.getElementById('statLastUpload').textContent = c.lastUploadAgo || '-';
  document.getElementById('statChannelCreated').textContent = '-';
  
  // Review Status
  document.getElementById('statLastChecked').textContent = c.lastChecked || 'Never';
  document.getElementById('statReviewedBy').textContent = c.contentReviewBy || '-';
  document.getElementById('statDateAccepted').textContent = c.dateAccepted || '-';
  document.getElementById('statAcceptedBy').textContent = c.acceptedBy || '-';
  document.getElementById('statStatus').innerHTML = getStatusBadge(c);
  
  // Creator Info
  document.getElementById('statUUID').textContent = c.uuid || '-';
  document.getElementById('statCreatorCode').textContent = c.creatorCode || 'N/A';
  document.getElementById('statLanguage').textContent = c.contentLanguage || '-';
  document.getElementById('statLocale').textContent = c.locale || '-';
  document.getElementById('statContact').textContent = c.contactEmail || '-';
  
  // Notes
  populateNotes(c.notes);
  
  // Warnings
  populateWarnings(c.warnings);
}

// Populate notes section
function populateNotes(notesStr) {
  const container = document.getElementById('notesContent');
  
  if (!notesStr || !notesStr.trim()) {
    container.innerHTML = '<p class="no-notes">No notes yet</p>';
    return;
  }
  
  const notes = notesStr.split('\n').filter(n => n.trim());
  container.innerHTML = notes.map(note => {
    const match = note.match(/^\[([^\]]+)\]\s*(.*)$/);
    if (match) {
      return `<div class="note-item"><span class="note-date">${escapeHtml(match[1])}</span>${escapeHtml(match[2])}</div>`;
    }
    return `<div class="note-item">${escapeHtml(note)}</div>`;
  }).join('');
}

// Populate warnings section
function populateWarnings(warningsStr) {
  const container = document.getElementById('warningsContent');
  
  if (!warningsStr || !warningsStr.trim()) {
    container.innerHTML = '<p class="no-notes">No warnings</p>';
    return;
  }
  
  const warnings = warningsStr.split('\n').filter(w => w.trim());
  container.innerHTML = warnings.map(warning => {
    const match = warning.match(/^\[([^\]]+)\]\s*(.*)$/);
    if (match) {
      return `<div class="warning-item"><span class="note-date">${escapeHtml(match[1])}</span>${escapeHtml(match[2])}</div>`;
    }
    return `<div class="warning-item">${escapeHtml(warning)}</div>`;
  }).join('');
}

// Get status badge HTML
function getStatusBadge(creator) {
  if (creator.requiresCheckup) {
    return '<span style="color: #FF5555;">⚠️ Needs Checkup</span>';
  }
  if (creator.warnings && creator.warnings.trim()) {
    return '<span style="color: #FFAA00;">⚠️ Has Warnings</span>';
  }
  if (!creator.lastChecked) {
    return '<span style="color: #55FFFF;">📋 Never Reviewed</span>';
  }
  return '<span style="color: #55FF55;">✓ Active</span>';
}

// Setup event listeners
function setupEventListeners() {
  // Edit Creator
  document.getElementById('btnEditCreator').addEventListener('click', openEditModal);
  document.getElementById('editModalClose').addEventListener('click', closeEditModal);
  document.getElementById('editModalCancel').addEventListener('click', closeEditModal);
  document.getElementById('editModalBackdrop').addEventListener('click', closeEditModal);
  document.getElementById('editModalSave').addEventListener('click', saveCreatorEdits);
  
  // Quick Review
  document.getElementById('btnQuickReview').addEventListener('click', handleQuickReview);
  
  // Add Note
  document.getElementById('btnAddNote').addEventListener('click', handleAddNote);
  document.getElementById('btnAddNoteInline').addEventListener('click', handleAddNote);
  
  // Add Warning
  document.getElementById('btnAddWarning').addEventListener('click', handleAddWarning);
  document.getElementById('btnAddWarningInline').addEventListener('click', handleAddWarning);
  
  // Clear Checkup
  document.getElementById('btnClearCheckup').addEventListener('click', handleClearCheckup);
  
  // Refresh Stats
  document.getElementById('btnRefreshStats').addEventListener('click', handleRefreshStats);
}

// Initialize APIs
async function initializeAPIs() {
  await apiManager.init();
  
  // Update API status indicators
  updateApiStatus();
  
  // Try to fetch live stats if API is configured
  if (currentCreator.channel) {
    await fetchLiveStats();
  }
}

// Update API status display
function updateApiStatus() {
  const ytStatus = document.querySelector('#youtubeApiStatus .api-badge');
  const twitchStatus = document.querySelector('#twitchApiStatus .api-badge');
  
  if (apiManager.hasYouTubeApi()) {
    ytStatus.textContent = 'Configured';
    ytStatus.classList.remove('not-configured');
    ytStatus.classList.add('configured');
  }
  
  if (apiManager.hasTwitchApi()) {
    twitchStatus.textContent = 'Configured';
    twitchStatus.classList.remove('not-configured');
    twitchStatus.classList.add('configured');
  }
}

// Fetch live stats from API
async function fetchLiveStats() {
  const platform = detectPlatform(currentCreator.channel);
  
  if (platform === 'youtube' && !apiManager.hasYouTubeApi()) return;
  if (platform === 'twitch' && !apiManager.hasTwitchApi()) return;
  
  try {
    document.getElementById('statsSource').textContent = 'Fetching...';
    
    liveStats = await apiManager.getChannelStats(currentCreator.channel);
    
    // Update UI with live stats
    updateWithLiveStats(liveStats);
    
    document.getElementById('statsSource').textContent = 'Live from API';
    document.getElementById('statsSource').classList.add('live');
    
  } catch (error) {
    console.error('Failed to fetch live stats:', error);
    document.getElementById('statsSource').textContent = 'From CSV (API error)';
  }
}

// Update UI with live stats
function updateWithLiveStats(stats) {
  // Update quick stats
  document.getElementById('quickStatSubs').textContent = apiManager.formatNumber(stats.subscribers);
  document.getElementById('quickStatViews').textContent = apiManager.formatNumber(stats.totalViews);
  document.getElementById('quickStatVideos').textContent = stats.videoCount || stats.recentVideos?.length || '-';
  
  // Update detailed stats
  document.getElementById('statSubscribers').textContent = apiManager.formatNumber(stats.subscribers);
  document.getElementById('statTotalViews').textContent = apiManager.formatNumber(stats.totalViews);
  document.getElementById('statVideoCount').textContent = stats.videoCount || '-';
  document.getElementById('statLastUpload').textContent = apiManager.getTimeSinceLastUpload(stats.lastUploadDate || stats.lastStreamDate);
  document.getElementById('statChannelCreated').textContent = stats.createdAt ? new Date(stats.createdAt).toLocaleDateString() : '-';
  
  // Update avatar if available
  if (stats.thumbnail) {
    const avatarEl = document.getElementById('creatorAvatar');
    avatarEl.innerHTML = `<img src="${stats.thumbnail}" alt="${stats.name}">`;
  }
  
  // Show recent videos
  if (stats.recentVideos && stats.recentVideos.length > 0) {
    showRecentVideos(stats.recentVideos, stats.platform);
  }
}

// Show recent videos section
function showRecentVideos(videos, platform) {
  const section = document.getElementById('recentVideosSection');
  const grid = document.getElementById('videosGrid');
  
  section.style.display = 'block';
  
  const baseUrl = platform === 'youtube' ? 'https://www.youtube.com/watch?v=' : 'https://www.twitch.tv/videos/';
  
  grid.innerHTML = videos.slice(0, 5).map(video => `
    <a href="${baseUrl}${video.id}" target="_blank" class="video-card">
      <img src="${video.thumbnail}" alt="${escapeHtml(video.title)}" class="video-thumbnail">
      <div class="video-info">
        <div class="video-title">${escapeHtml(video.title)}</div>
        <div class="video-date">${apiManager.getTimeSinceLastUpload(video.publishedAt)}</div>
      </div>
    </a>
  `).join('');
}

// Handle Quick Review
async function handleQuickReview() {
  try {
    const settings = await chrome.storage.sync.get({ reviewerName: 'Judge' });
    await csvManager.quickReview(currentRowIndex, settings.reviewerName);
    
    // Reload creator data
    currentCreator = csvManager.getRow(currentRowIndex);
    populateCreatorData();
    
    showNotification('Marked as reviewed!', 'success');
  } catch (error) {
    showNotification('Failed to save review: ' + error.message, 'error');
  }
}

// Handle Add Note
async function handleAddNote() {
  const note = prompt('Enter note:');
  if (!note) return;
  
  try {
    await csvManager.addNote(currentRowIndex, note);
    
    // Reload creator data
    currentCreator = csvManager.getRow(currentRowIndex);
    populateNotes(currentCreator.notes);
    
    showNotification('Note added!', 'success');
  } catch (error) {
    showNotification('Failed to add note: ' + error.message, 'error');
  }
}

// Handle Add Warning
async function handleAddWarning() {
  const warning = prompt('Enter warning:');
  if (!warning) return;
  
  try {
    await csvManager.addWarning(currentRowIndex, warning);
    
    // Reload creator data
    currentCreator = csvManager.getRow(currentRowIndex);
    populateWarnings(currentCreator.warnings);
    populateCreatorData(); // Update status badge
    
    showNotification('Warning added!', 'success');
  } catch (error) {
    showNotification('Failed to add warning: ' + error.message, 'error');
  }
}

// Handle Clear Checkup
async function handleClearCheckup() {
  try {
    await csvManager.clearCheckup(currentRowIndex);
    
    // Reload creator data
    currentCreator = csvManager.getRow(currentRowIndex);
    populateCreatorData();
    
    showNotification('Checkup flag cleared!', 'success');
  } catch (error) {
    showNotification('Failed to clear checkup: ' + error.message, 'error');
  }
}

// Handle Refresh Stats
async function handleRefreshStats() {
  if (!currentCreator.channel) {
    showNotification('No channel URL available', 'error');
    return;
  }
  
  await fetchLiveStats();
}

// ==================== EDIT MODAL FUNCTIONS ====================

// Open Edit Modal
function openEditModal() {
  const c = currentCreator;
  
  // Populate form fields with current data
  document.getElementById('editName').value = c.name || '';
  document.getElementById('editChannel').value = c.channel || '';
  document.getElementById('editUUID').value = c.uuid || '';
  document.getElementById('editCreatorCode').value = c.creatorCode || '';
  document.getElementById('editSubscribers').value = c.subscribers || '';
  document.getElementById('editRank').value = c.rankGiven || '';
  document.getElementById('editContentType').value = c.contentType || '';
  document.getElementById('editLanguage').value = c.contentLanguage || '';
  document.getElementById('editLastUpload').value = c.lastUploadAgo || '';
  document.getElementById('editLocale').value = c.locale || '';
  document.getElementById('editLastChecked').value = c.lastChecked || '';
  document.getElementById('editReviewedBy').value = c.contentReviewBy || '';
  document.getElementById('editDateAccepted').value = c.dateAccepted || '';
  document.getElementById('editAcceptedBy').value = c.acceptedBy || '';
  document.getElementById('editEmail').value = c.contactEmail || '';
  document.getElementById('editZendesk').value = c.zendeskId || '';
  document.getElementById('editNotes').value = c.notes || '';
  document.getElementById('editWarnings').value = c.warnings || '';
  document.getElementById('editRequiresCheckup').checked = !!(c.requiresCheckup && c.requiresCheckup.trim());
  
  document.getElementById('editModal').classList.add('active');
}

// Close Edit Modal
function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
}

// Save Creator Edits
async function saveCreatorEdits() {
  try {
    const COLUMNS = csvManager.COLUMNS;
    
    // Update each field
    await csvManager.updateCell(currentRowIndex, COLUMNS.NAME, document.getElementById('editName').value.trim());
    await csvManager.updateCell(currentRowIndex, COLUMNS.MAIN_CHANNEL, document.getElementById('editChannel').value.trim());
    await csvManager.updateCell(currentRowIndex, COLUMNS.UUID, document.getElementById('editUUID').value.trim());
    await csvManager.updateCell(currentRowIndex, COLUMNS.CREATOR_CODE, document.getElementById('editCreatorCode').value.trim());
    await csvManager.updateCell(currentRowIndex, COLUMNS.SUBSCRIBERS, document.getElementById('editSubscribers').value.trim());
    await csvManager.updateCell(currentRowIndex, COLUMNS.RANK_GIVEN, document.getElementById('editRank').value);
    await csvManager.updateCell(currentRowIndex, COLUMNS.CONTENT_TYPE, document.getElementById('editContentType').value);
    await csvManager.updateCell(currentRowIndex, COLUMNS.CONTENT_LANGUAGE, document.getElementById('editLanguage').value.trim());
    await csvManager.updateCell(currentRowIndex, COLUMNS.LAST_UPLOAD_AGO, document.getElementById('editLastUpload').value.trim());
    await csvManager.updateCell(currentRowIndex, COLUMNS.LOCALE, document.getElementById('editLocale').value.trim());
    await csvManager.updateCell(currentRowIndex, COLUMNS.LAST_CHECKED, document.getElementById('editLastChecked').value);
    await csvManager.updateCell(currentRowIndex, COLUMNS.CONTENT_REVIEW_BY, document.getElementById('editReviewedBy').value.trim());
    await csvManager.updateCell(currentRowIndex, COLUMNS.DATE_ACCEPTED, document.getElementById('editDateAccepted').value);
    await csvManager.updateCell(currentRowIndex, COLUMNS.ACCEPTED_BY, document.getElementById('editAcceptedBy').value.trim());
    await csvManager.updateCell(currentRowIndex, COLUMNS.CONTACT_EMAIL, document.getElementById('editEmail').value.trim());
    await csvManager.updateCell(currentRowIndex, COLUMNS.ZENDESK_ID, document.getElementById('editZendesk').value.trim());
    await csvManager.updateCell(currentRowIndex, COLUMNS.NOTES, document.getElementById('editNotes').value.trim());
    await csvManager.updateCell(currentRowIndex, COLUMNS.WARNINGS, document.getElementById('editWarnings').value.trim());
    await csvManager.updateCell(currentRowIndex, COLUMNS.REQUIRES_CHECKUP, document.getElementById('editRequiresCheckup').checked ? 'Yes' : '');
    
    // Reload creator data
    currentCreator = csvManager.getRow(currentRowIndex);
    populateCreatorData();
    
    closeEditModal();
    showNotification('Changes saved!', 'success');
    
  } catch (error) {
    console.error('Error saving edits:', error);
    showNotification('Failed to save: ' + error.message, 'error');
  }
}

// Show error state
function showError(message) {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('mainContent').style.display = 'none';
  document.getElementById('errorState').style.display = 'flex';
  document.getElementById('errorMessage').textContent = message;
}

// Detect platform from URL
function detectPlatform(url) {
  if (!url) return 'unknown';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('twitch.tv')) return 'twitch';
  return 'unknown';
}

// Format numbers
function formatNumber(num) {
  if (!num) return null;
  const n = parseInt(String(num).replace(/,/g, ''));
  if (isNaN(n)) return num;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

// Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

// Show notification
function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()">×</button>`;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 16px;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    font-size: 14px;
  `;
  
  if (type === 'success') {
    notification.style.background = 'linear-gradient(135deg, #11998e, #55FF55)';
    notification.style.color = '#0D0D0D';
  } else if (type === 'error') {
    notification.style.background = 'linear-gradient(135deg, #FF5555, #f093fb)';
    notification.style.color = 'white';
  } else {
    notification.style.background = 'linear-gradient(135deg, #FFAA00, #FF5500)';
    notification.style.color = '#0D0D0D';
  }
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 4000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;
document.head.appendChild(style);
