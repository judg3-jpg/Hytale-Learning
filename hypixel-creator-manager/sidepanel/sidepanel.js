// Side Panel JavaScript - Professional Version

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await initializeData();
});

// Initialize data
async function initializeData() {
  const hasData = await csvManager.init();
  
  updateDataStatus(hasData);
  
  if (hasData) {
    await loadStats();
    await loadReviewQueue();
  }
}

// Update data status UI
function updateDataStatus(hasData) {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  
  if (hasData) {
    statusDot.classList.add('loaded');
    statusText.textContent = `${csvManager.data.length} creators loaded`;
  } else {
    statusDot.classList.remove('loaded');
    statusText.textContent = 'No data - open dashboard to import';
  }
}

// Load stats
async function loadStats() {
  const stats = csvManager.getStatistics();
  
  document.getElementById('statTotal').textContent = stats.totalCreators || '-';
  document.getElementById('statActive').textContent = stats.active || '-';
  document.getElementById('statReview').textContent = stats.needsReview || '-';
  document.getElementById('statWarnings').textContent = stats.hasWarnings || '-';
}

// Load review queue
async function loadReviewQueue() {
  const queue = csvManager.getReviewQueue(3);
  const reviewBadge = document.getElementById('reviewBadge');
  const reviewList = document.getElementById('reviewList');
  
  reviewBadge.textContent = queue.length;
  
  if (queue.length === 0) {
    reviewList.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">✓</span>
        <p>All caught up!</p>
      </div>
    `;
    return;
  }
  
  reviewList.innerHTML = queue.slice(0, 8).map(item => `
    <div class="review-item" data-row="${item.rowIndex}">
      <div class="review-avatar">${(item.creator.name || '?').charAt(0).toUpperCase()}</div>
      <div class="review-info">
        <div class="review-name">${escapeHtml(item.creator.name || 'Unknown')}</div>
        <div class="review-meta">${escapeHtml(item.reason)}</div>
      </div>
      <button class="review-action" data-row="${item.rowIndex}">✓</button>
    </div>
  `).join('');
  
  // Add click handlers for review buttons
  reviewList.querySelectorAll('.review-action').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await quickReview(parseInt(btn.dataset.row));
    });
  });
  
  // Add click handlers for items (open dashboard)
  reviewList.querySelectorAll('.review-item').forEach(item => {
    item.addEventListener('click', () => {
      const rowIndex = item.dataset.row;
      chrome.tabs.create({ url: chrome.runtime.getURL(`creator/creator.html?row=${rowIndex}`) });
    });
  });
}

// Quick review
async function quickReview(rowIndex) {
  try {
    const settings = await chrome.storage.sync.get({ reviewerName: 'Judge' });
    await csvManager.quickReview(rowIndex, settings.reviewerName);
    
    showToast('Reviewed!', 'success');
    await loadStats();
    await loadReviewQueue();
  } catch (error) {
    showToast('Failed to review', 'error');
  }
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('btnOpenDashboard')?.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
  });
}

// Toast notification
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 2000);
}

// Utility
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

// Add toast styles
const styles = document.createElement('style');
styles.textContent = `
  .toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 16px;
    border-radius: 6px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    color: var(--text-primary);
    font-size: 12px;
    z-index: 1000;
    animation: toastIn 0.2s ease;
  }
  .toast-success { border-color: var(--success); color: var(--success); }
  .toast-error { border-color: var(--danger); color: var(--danger); }
  @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } }
`;
document.head.appendChild(styles);
