// Creator Profile Page - Professional Version

let currentRowIndex = null;
let currentCreator = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Get row index from URL
  const params = new URLSearchParams(window.location.search);
  currentRowIndex = parseInt(params.get('row'));
  
  if (isNaN(currentRowIndex)) {
    showError('Invalid creator ID');
    return;
  }
  
  // Initialize CSV manager and load creator
  const hasData = await csvManager.init();
  
  if (!hasData) {
    showError('No data loaded');
    return;
  }
  
  await loadCreator();
  setupEventListeners();
});

// Load creator data
async function loadCreator() {
  const row = csvManager.getRow(currentRowIndex);
  
  if (!row) {
    showError('Creator not found');
    return;
  }
  
  currentCreator = row;
  
  // Hide loading, show content
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('creatorContent').style.display = 'block';
  
  // Populate all fields
  populateProfile();
  
  // Check API status
  checkApiStatus();
}

// Populate profile data
function populateProfile() {
  const c = currentCreator;
  
  // Avatar and name
  const initial = (c.name || '?').charAt(0).toUpperCase();
  document.getElementById('avatarInitial').textContent = initial;
  document.getElementById('creatorName').textContent = c.name || 'Unknown Creator';
  document.title = `${c.name || 'Creator'} | Hypixel Creator Manager`;
  
  // Badges
  document.getElementById('creatorRank').textContent = c.rankGiven || 'CREATOR';
  
  // Platform badge
  const platformBadge = document.getElementById('creatorPlatform');
  if (c.channel) {
    if (c.channel.toLowerCase().includes('youtube')) {
      platformBadge.textContent = 'YouTube';
      platformBadge.style.color = '#FF0000';
    } else if (c.channel.toLowerCase().includes('twitch')) {
      platformBadge.textContent = 'Twitch';
      platformBadge.style.color = '#9146FF';
    } else {
      platformBadge.textContent = 'Other';
    }
  }
  
  // Status badge
  const statusBadge = document.getElementById('creatorStatus');
  const months = parseMonthsFromUpload(c.lastUploadAgo);
  if (months !== null) {
    if (months >= 24) {
      statusBadge.textContent = 'Inactive';
      statusBadge.classList.add('danger');
    } else if (months >= 12) {
      statusBadge.textContent = 'Semi-Inactive';
      statusBadge.classList.add('warning');
    } else {
      statusBadge.textContent = 'Active';
    }
  } else {
    statusBadge.textContent = 'Unknown';
    statusBadge.classList.remove('warning', 'danger');
    statusBadge.style.background = 'var(--bg-elevated)';
    statusBadge.style.color = 'var(--text-tertiary)';
  }
  
  // Meta info
  document.getElementById('creatorDateAccepted').textContent = formatDate(c.dateAccepted) || 'Unknown';
  document.getElementById('creatorLastChecked').textContent = formatDate(c.lastChecked) || 'Never';
  document.getElementById('creatorUUID').textContent = c.uuid ? `${c.uuid.substring(0, 8)}...` : 'No UUID';
  
  // Stats
  document.getElementById('statSubscribers').textContent = formatNumber(c.subscribers) || '-';
  document.getElementById('statLastUpload').textContent = c.lastUploadAgo || '-';
  document.getElementById('statContentType').textContent = c.contentType || '-';
  document.getElementById('statLocale').textContent = c.locale || '-';
  
  // Channel
  const channelLink = document.getElementById('channelLink');
  const channelIcon = document.getElementById('channelIcon');
  const channelName = document.getElementById('channelName');
  const channelUrl = document.getElementById('channelUrl');
  
  if (c.channel) {
    channelLink.href = c.channel;
    channelName.textContent = c.name || 'Channel';
    channelUrl.textContent = c.channel;
    
    if (c.channel.toLowerCase().includes('youtube')) {
      channelIcon.textContent = '📺';
    } else if (c.channel.toLowerCase().includes('twitch')) {
      channelIcon.textContent = '💜';
    }
  } else {
    channelLink.href = '#';
    channelName.textContent = 'No channel linked';
    channelUrl.textContent = '-';
  }
  
  // Notes
  const notesContent = document.getElementById('notesContent');
  if (c.notes && c.notes.trim()) {
    notesContent.innerHTML = `<div class="notes-content">${escapeHtml(c.notes)}</div>`;
  } else {
    notesContent.innerHTML = '<div class="notes-empty">No notes for this creator.</div>';
  }
  
  // Warnings
  const warningsCard = document.getElementById('warningsCard');
  const warningsContent = document.getElementById('warningsContent');
  if (c.warnings && c.warnings.trim()) {
    warningsCard.style.display = 'block';
    warningsContent.textContent = c.warnings;
  } else {
    warningsCard.style.display = 'none';
  }
  
  // Details
  document.getElementById('detailVerifiedBy').textContent = c.verifiedBy || '-';
  document.getElementById('detailAcceptedBy').textContent = c.acceptedBy || '-';
  document.getElementById('detailReviewBy').textContent = c.contentReviewBy || '-';
  document.getElementById('detailCode').textContent = c.creatorCode || '-';
  document.getElementById('detailLanguage').textContent = c.contentLanguage || '-';
  
  // Contact
  document.getElementById('detailEmail').innerHTML = c.contactEmail 
    ? `<a href="mailto:${escapeHtml(c.contactEmail)}">${escapeHtml(c.contactEmail)}</a>` 
    : '-';
  document.getElementById('detailZendesk').textContent = c.zendeskId || '-';
}

// Setup event listeners
function setupEventListeners() {
  // Mark reviewed
  document.getElementById('btnMarkReviewed')?.addEventListener('click', markReviewed);
  
  // Edit creator
  document.getElementById('btnEditCreator')?.addEventListener('click', openEditModal);
  document.getElementById('editModalBackdrop')?.addEventListener('click', closeEditModal);
  document.getElementById('editModalClose')?.addEventListener('click', closeEditModal);
  document.getElementById('editCancel')?.addEventListener('click', closeEditModal);
  document.getElementById('editSave')?.addEventListener('click', saveCreator);
  
  // Refresh stats
  document.getElementById('btnRefreshStats')?.addEventListener('click', refreshStats);
  
  // Quick actions
  document.getElementById('btnEditNotes')?.addEventListener('click', openEditModal);
  document.getElementById('btnEditWarnings')?.addEventListener('click', openEditModal);
  document.getElementById('btnAddNote')?.addEventListener('click', () => addQuickNote());
  document.getElementById('btnAddWarning')?.addEventListener('click', () => addQuickWarning());
  document.getElementById('btnDeleteCreator')?.addEventListener('click', deleteCreator);
}

// Mark as reviewed
async function markReviewed() {
  try {
    const settings = await chrome.storage.sync.get({ reviewerName: 'Judge' });
    await csvManager.quickReview(currentRowIndex, settings.reviewerName);
    
    showNotification('Marked as reviewed!', 'success');
    
    // Reload to show updated data
    await csvManager.init();
    await loadCreator();
  } catch (error) {
    showNotification('Failed to mark reviewed: ' + error.message, 'error');
  }
}

// Check API status
async function checkApiStatus() {
  const settings = await chrome.storage.sync.get(['youtubeApiKey', 'twitchClientId', 'twitchClientSecret']);
  
  const statusDot = document.getElementById('apiStatusDot');
  const statusText = document.getElementById('apiStatusText');
  
  const isYouTube = currentCreator.channel?.toLowerCase().includes('youtube');
  const isTwitch = currentCreator.channel?.toLowerCase().includes('twitch');
  
  if (isYouTube && settings.youtubeApiKey) {
    statusDot.classList.add('active');
    statusText.textContent = 'YouTube API configured - Click Refresh Stats';
  } else if (isTwitch && settings.twitchClientId && settings.twitchClientSecret) {
    statusDot.classList.add('active');
    statusText.textContent = 'Twitch API configured - Click Refresh Stats';
  } else {
    statusDot.classList.remove('active');
    statusText.textContent = isYouTube 
      ? 'YouTube API not configured' 
      : isTwitch 
        ? 'Twitch API not configured' 
        : 'Configure API in Settings';
  }
}

// Refresh stats from API
async function refreshStats() {
  const btn = document.getElementById('btnRefreshStats');
  const originalText = btn.innerHTML;
  
  if (!currentCreator.channel) {
    showNotification('No channel URL to fetch stats from', 'error');
    return;
  }
  
  const isYouTube = currentCreator.channel.toLowerCase().includes('youtube');
  const isTwitch = currentCreator.channel.toLowerCase().includes('twitch');
  
  const settings = await chrome.storage.sync.get(['youtubeApiKey', 'twitchClientId', 'twitchClientSecret']);
  
  if (isYouTube && !settings.youtubeApiKey) {
    showNotification('YouTube API key not configured. Go to Settings.', 'error');
    return;
  }
  
  if (isTwitch && (!settings.twitchClientId || !settings.twitchClientSecret)) {
    showNotification('Twitch API not configured. Go to Settings.', 'error');
    return;
  }
  
  btn.disabled = true;
  btn.innerHTML = '⏳ Fetching...';
  
  try {
    let stats;
    
    if (isYouTube) {
      stats = await fetchYouTubeStats(currentCreator.channel, settings.youtubeApiKey);
    } else if (isTwitch) {
      stats = await fetchTwitchStats(currentCreator.channel, settings.twitchClientId, settings.twitchClientSecret);
    }
    
    if (stats) {
      // Update the creator data
      const updates = {};
      
      if (stats.subscribers || stats.followers) {
        updates[csvManager.COLUMNS.SUBSCRIBERS] = String(stats.subscribers || stats.followers);
      }
      
      // Save updates
      await csvManager.updateMultipleCells(currentRowIndex, updates);
      
      // Reload profile
      await csvManager.init();
      await loadCreator();
      
      showNotification(`Updated stats: ${formatNumber(stats.subscribers || stats.followers)} subscribers`, 'success');
    }
  } catch (error) {
    console.error('Refresh stats error:', error);
    showNotification('Failed to fetch stats: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

// Fetch YouTube stats
async function fetchYouTubeStats(channelUrl, apiKey) {
  let channelId = null;
  let searchQuery = null;
  
  const patterns = [
    { regex: /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/, type: 'id' },
    { regex: /youtube\.com\/c\/([a-zA-Z0-9_-]+)/, type: 'custom' },
    { regex: /youtube\.com\/@([a-zA-Z0-9_-]+)/, type: 'handle' },
    { regex: /youtube\.com\/user\/([a-zA-Z0-9_-]+)/, type: 'user' }
  ];
  
  for (const pattern of patterns) {
    const match = channelUrl.match(pattern.regex);
    if (match) {
      if (pattern.type === 'id') channelId = match[1];
      else searchQuery = match[1];
      break;
    }
  }
  
  if (!channelId && searchQuery) {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (searchData.error) throw new Error(searchData.error.message);
    if (searchData.items?.length > 0) channelId = searchData.items[0].snippet.channelId;
    else throw new Error('Channel not found');
  }
  
  if (!channelId) throw new Error('Could not parse channel URL');
  
  const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`;
  const statsResponse = await fetch(statsUrl);
  const statsData = await statsResponse.json();
  
  if (statsData.error) throw new Error(statsData.error.message);
  if (!statsData.items?.length) throw new Error('Channel not found');
  
  const channel = statsData.items[0];
  
  return {
    name: channel.snippet.title,
    subscribers: channel.statistics.subscriberCount,
    totalViews: channel.statistics.viewCount,
    videoCount: channel.statistics.videoCount
  };
}

// Fetch Twitch stats
async function fetchTwitchStats(channelUrl, clientId, clientSecret) {
  const match = channelUrl.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
  if (!match) throw new Error('Could not parse Twitch URL');
  const username = match[1];
  
  const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
  });
  const tokenData = await tokenResponse.json();
  
  if (!tokenData.access_token) throw new Error('Failed to authenticate with Twitch');
  
  const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
    headers: {
      'Client-ID': clientId,
      'Authorization': `Bearer ${tokenData.access_token}`
    }
  });
  const userData = await userResponse.json();
  
  if (!userData.data?.length) throw new Error('Twitch user not found');
  
  const user = userData.data[0];
  
  const followersResponse = await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${user.id}`, {
    headers: {
      'Client-ID': clientId,
      'Authorization': `Bearer ${tokenData.access_token}`
    }
  });
  const followersData = await followersResponse.json();
  
  return {
    name: user.display_name,
    followers: followersData.total || 0
  };
}

// Open edit modal
function openEditModal() {
  const c = currentCreator;
  
  // Populate form
  document.getElementById('editName').value = c.name || '';
  document.getElementById('editRank').value = c.rankGiven || '';
  document.getElementById('editChannel').value = c.channel || '';
  document.getElementById('editSubscribers').value = c.subscribers || '';
  document.getElementById('editLastUpload').value = c.lastUploadAgo || '';
  document.getElementById('editContentType').value = c.contentType || '';
  document.getElementById('editLocale').value = c.locale || '';
  document.getElementById('editIGN').value = c.name || '';
  document.getElementById('editUUID').value = c.uuid || '';
  document.getElementById('editEmail').value = c.contactEmail || '';
  document.getElementById('editZendesk').value = c.zendeskId || '';
  document.getElementById('editNotes').value = c.notes || '';
  document.getElementById('editWarnings').value = c.warnings || '';
  
  document.getElementById('editModal').classList.add('active');
}

// Close edit modal
function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
}

// Save creator changes
async function saveCreator(e) {
  e.preventDefault();
  
  try {
    const updates = {};
    
    updates[csvManager.COLUMNS.NAME] = document.getElementById('editName').value.trim();
    updates[csvManager.COLUMNS.CHANNEL] = document.getElementById('editChannel').value.trim();
    updates[csvManager.COLUMNS.SUBSCRIBERS] = document.getElementById('editSubscribers').value.trim();
    updates[csvManager.COLUMNS.LAST_UPLOAD_AGO] = document.getElementById('editLastUpload').value.trim();
    updates[csvManager.COLUMNS.RANK_GIVEN] = document.getElementById('editRank').value;
    updates[csvManager.COLUMNS.CONTENT_TYPE] = document.getElementById('editContentType').value;
    updates[csvManager.COLUMNS.LOCALE] = document.getElementById('editLocale').value.trim();
    updates[csvManager.COLUMNS.UUID] = document.getElementById('editUUID').value.trim();
    updates[csvManager.COLUMNS.CONTACT_EMAIL] = document.getElementById('editEmail').value.trim();
    updates[csvManager.COLUMNS.ZENDESK_ID] = document.getElementById('editZendesk').value.trim();
    updates[csvManager.COLUMNS.NOTES] = document.getElementById('editNotes').value.trim();
    updates[csvManager.COLUMNS.WARNINGS] = document.getElementById('editWarnings').value.trim();
    
    await csvManager.updateMultipleCells(currentRowIndex, updates);
    
    showNotification('Changes saved!', 'success');
    closeEditModal();
    
    // Reload data
    await csvManager.init();
    await loadCreator();
    
  } catch (error) {
    console.error('Save error:', error);
    showNotification('Failed to save: ' + error.message, 'error');
  }
}

// Add quick note
async function addQuickNote() {
  const note = prompt('Enter note:');
  if (!note) return;
  
  try {
    const existingNotes = currentCreator.notes || '';
    const timestamp = new Date().toLocaleDateString();
    const newNote = existingNotes 
      ? `${existingNotes}\n\n[${timestamp}] ${note}` 
      : `[${timestamp}] ${note}`;
    
    await csvManager.updateCell(currentRowIndex, csvManager.COLUMNS.NOTES, newNote);
    
    showNotification('Note added!', 'success');
    
    await csvManager.init();
    await loadCreator();
  } catch (error) {
    showNotification('Failed to add note: ' + error.message, 'error');
  }
}

// Add quick warning
async function addQuickWarning() {
  const warning = prompt('Enter warning:');
  if (!warning) return;
  
  try {
    const existingWarnings = currentCreator.warnings || '';
    const timestamp = new Date().toLocaleDateString();
    const newWarning = existingWarnings 
      ? `${existingWarnings}\n\n[${timestamp}] ${warning}` 
      : `[${timestamp}] ${warning}`;
    
    await csvManager.updateCell(currentRowIndex, csvManager.COLUMNS.WARNINGS, newWarning);
    
    showNotification('Warning added!', 'success');
    
    await csvManager.init();
    await loadCreator();
  } catch (error) {
    showNotification('Failed to add warning: ' + error.message, 'error');
  }
}

// Delete creator
async function deleteCreator() {
  if (!confirm(`Are you sure you want to delete ${currentCreator.name}? This cannot be undone.`)) {
    return;
  }
  
  try {
    await csvManager.deleteRow(currentRowIndex);
    showNotification('Creator deleted!', 'success');
    
    // Go back to dashboard
    setTimeout(() => {
      window.location.href = '../dashboard/dashboard.html';
    }, 1000);
  } catch (error) {
    showNotification('Failed to delete: ' + error.message, 'error');
  }
}

// Show error state
function showError(message) {
  document.getElementById('loadingState').innerHTML = `
    <div style="color: var(--danger); text-align: center;">
      <span style="font-size: 40px; display: block; margin-bottom: 16px;">⚠️</span>
      <p>${escapeHtml(message)}</p>
      <a href="../dashboard/dashboard.html" class="btn btn-secondary" style="margin-top: 16px;">Back to Dashboard</a>
    </div>
  `;
}

// Show notification
function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()">×</button>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) notification.remove();
  }, 4000);
}

// Utility functions
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function formatNumber(num) {
  if (!num) return null;
  const n = parseInt(String(num).replace(/,/g, ''));
  if (isNaN(n)) return num;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

function parseMonthsFromUpload(lastUploadAgo) {
  if (!lastUploadAgo) return null;
  
  const str = lastUploadAgo.toLowerCase();
  
  const monthMatch = str.match(/(\d+)\s*month/i);
  if (monthMatch) return parseInt(monthMatch[1]);
  
  const yearMatch = str.match(/(\d+)\s*year/i);
  if (yearMatch) return parseInt(yearMatch[1]) * 12;
  
  if (str.includes('week') || str.includes('day') || str.includes('hour')) return 0;
  
  return null;
}
