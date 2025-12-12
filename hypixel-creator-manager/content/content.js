// Hypixel Creator Manager - Content Script
// Runs on Google Sheets pages

(function() {
  'use strict';

  // Column indices (0-based) - Updated based on the sheet structure
  const COLUMNS = {
    UUID: 0,
    NAME: 1,
    MAIN_CHANNEL: 2,
    DATE_ACCEPTED: 3,
    VERIFIED_BY: 4,
    ACCEPTED_BY: 5,
    LAST_CHECKED: 6,
    CONTENT_REVIEW_BY: 7,
    CREATOR_CODE: 8,
    SUBSCRIBERS: 9,
    LAST_UPLOAD_DATE: 10,
    LAST_UPLOAD_AGO: 11,
    RANK_GIVEN: 12,
    CONTENT_TYPE: 13,
    VIDEO_CATEGORY: 14,
    LOCALE: 15,
    CONTENT_LANGUAGE: 16,
    CONTACT_EMAIL: 17,
    ZENDESK_ID: 18,
    NOTES: 19,
    REFERENCE_TAGS: 20,
    REPORTS: 21,
    WARNINGS: 22,
    REQUIRES_CHECKUP: 23
  };

  // Highlight colors
  const HIGHLIGHT_COLORS = {
    overdue: '#ffcccc',      // Light red
    inactive: '#fff3cd',     // Light yellow
    checkup: '#cce5ff',      // Light blue
    warning: '#f8d7da'       // Pink
  };

  // Track highlighted rows for cleanup
  let highlightedElements = [];

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    handleAction(request.action, request.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, message: error.message }));
    return true; // Keep channel open for async response
  });

  // Main action handler
  async function handleAction(action, data) {
    switch (action) {
      case 'quickReview':
        return quickReview(data);
      case 'openChannel':
        return openChannel();
      case 'clearCheckup':
        return clearCheckup();
      case 'addWarning':
        return addWarning();
      case 'insertNote':
        return insertNote(data.note);
      case 'findOverdue':
        return findOverdue(data.overdueMonths);
      case 'findInactive':
        return findInactive(data.inactiveMonths);
      case 'highlightCheckups':
        return highlightCheckups();
      case 'clearHighlights':
        return clearHighlights();
      default:
        return { success: false, message: 'Unknown action' };
    }
  }

  // Get the currently selected cell info
  function getSelectedCell() {
    // Google Sheets uses a specific class for the selected cell
    const selection = document.querySelector('.cell-input');
    const activeCell = document.querySelector('.active-cell-border');
    
    if (!activeCell) {
      return null;
    }
    
    // Try to get cell reference from the name box
    const nameBox = document.querySelector('.jfk-textinput-label input, [aria-label="Name Box"]');
    if (nameBox) {
      return nameBox.value;
    }
    
    return null;
  }

  // Get the current row number
  function getCurrentRow() {
    // Try to find the row from the selection
    const nameBox = document.querySelector('input[aria-label="Name Box"]');
    if (nameBox && nameBox.value) {
      const match = nameBox.value.match(/[A-Z]+(\d+)/);
      if (match) {
        return parseInt(match[1]);
      }
    }
    
    // Fallback: look at the active cell
    const activeCell = document.querySelector('.active-cell-border');
    if (activeCell) {
      const style = activeCell.getAttribute('style');
      // Parse position from style to estimate row
    }
    
    return null;
  }

  // Simulate keyboard input
  function simulateKeyPress(key, modifiers = {}) {
    const event = new KeyboardEvent('keydown', {
      key: key,
      code: key,
      bubbles: true,
      cancelable: true,
      ctrlKey: modifiers.ctrl || false,
      shiftKey: modifiers.shift || false,
      altKey: modifiers.alt || false,
      metaKey: modifiers.meta || false
    });
    document.activeElement.dispatchEvent(event);
  }

  // Type text into the current cell
  function typeInCell(text) {
    // Find the active input element
    const input = document.querySelector('.cell-input') || document.activeElement;
    
    if (input) {
      // Focus and clear
      input.focus();
      
      // Use execCommand for compatibility
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, text);
      
      return true;
    }
    return false;
  }

  // Navigate to a specific cell
  function goToCell(cellRef) {
    // Use Ctrl+G or F5 to open Go To dialog, or use the name box
    const nameBox = document.querySelector('input[aria-label="Name Box"]');
    if (nameBox) {
      nameBox.focus();
      nameBox.value = cellRef;
      nameBox.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Simulate Enter key
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        bubbles: true
      });
      nameBox.dispatchEvent(enterEvent);
      
      return true;
    }
    return false;
  }

  // Get today's date in YYYY-MM-DD format
  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Quick Review Action
  async function quickReview(data) {
    const reviewerName = data.reviewerName || 'Judge';
    const today = getTodayDate();
    
    try {
      // Get current row
      const row = getCurrentRow();
      if (!row) {
        return { success: false, message: 'Please select a cell in the row to review' };
      }

      // Instructions for the user since direct cell manipulation is limited
      const instructions = `
Quick Review for Row ${row}:
1. Go to column G (Last Checked) → Enter: ${today}
2. Go to column H (Content Review By) → Enter: ${reviewerName}

Use Ctrl+G to navigate, or click the cells directly.
      `.trim();

      // Try to navigate to Last Checked column (G)
      const lastCheckedCell = `G${row}`;
      
      // Copy date to clipboard for easy pasting
      await navigator.clipboard.writeText(today);
      
      // Show notification
      showNotification(`📋 Date copied! Paste in G${row}, then add "${reviewerName}" to H${row}`, 'info');
      
      return { 
        success: true, 
        message: `Date copied! Paste in G${row} (Last Checked)` 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Open Channel Action
  async function openChannel() {
    try {
      // Try to find URL in the current row
      // Look for YouTube links in the page
      const selection = window.getSelection();
      const row = getCurrentRow();
      
      if (!row) {
        return { success: false, message: 'Please select a cell in the creator row' };
      }

      // Try to find the channel URL - look in column C
      // Since we can't directly access cell data, we'll look for links
      const links = document.querySelectorAll('a[href*="youtube.com"], a[href*="twitch.tv"]');
      
      if (links.length > 0) {
        // Open the first found link (user should be on the right row)
        showNotification('💡 Tip: Click the channel link in column C to open it', 'info');
        return { success: true, message: 'Click the channel link in column C' };
      }
      
      // Alternative: prompt user to copy the URL
      showNotification('Copy the channel URL from column C and paste here, or click the link directly', 'info');
      
      return { success: true, message: 'Click the channel link in column C to open' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Clear Checkup Flag
  async function clearCheckup() {
    try {
      const row = getCurrentRow();
      if (!row) {
        return { success: false, message: 'Please select a cell in the row' };
      }

      // Column X (24th column) is Requires Checkup
      await navigator.clipboard.writeText('');
      showNotification(`Go to X${row} (Requires Checkup) and clear the cell`, 'info');
      
      return { success: true, message: `Clear cell X${row} to remove checkup flag` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Add Warning
  async function addWarning() {
    try {
      const row = getCurrentRow();
      if (!row) {
        return { success: false, message: 'Please select a cell in the row' };
      }

      const warning = prompt('Enter warning message:');
      if (!warning) {
        return { success: false, message: 'Warning cancelled' };
      }

      const today = getTodayDate();
      const warningText = `[${today}] ${warning}`;
      
      await navigator.clipboard.writeText(warningText);
      showNotification(`⚠️ Warning copied! Paste in W${row} (Warnings column)`, 'warning');
      
      return { success: true, message: `Warning copied! Paste in W${row}` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Insert Note
  async function insertNote(note) {
    try {
      const row = getCurrentRow();
      if (!row) {
        return { success: false, message: 'Please select a cell in the row' };
      }

      const today = getTodayDate();
      const noteText = `[${today}] ${note}`;
      
      await navigator.clipboard.writeText(noteText);
      showNotification(`📝 Note copied! Paste in T${row} (Notes column)`, 'info');
      
      return { success: true, message: `Note copied! Paste in T${row}` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Find Overdue Reviews
  async function findOverdue(months = 3) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - months);
      
      showNotification(
        `🔍 To find overdue reviews:\n` +
        `1. Click column G header (Last Checked)\n` +
        `2. Use Data → Create a filter\n` +
        `3. Filter for dates before ${cutoffDate.toISOString().split('T')[0]}`,
        'info',
        8000
      );
      
      return { 
        success: true, 
        message: `Filter column G for dates before ${cutoffDate.toISOString().split('T')[0]}` 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Find Inactive Channels
  async function findInactive(months = 6) {
    try {
      showNotification(
        `💤 To find inactive channels:\n` +
        `1. Click column L header (Last Upload duration)\n` +
        `2. Use Data → Create a filter\n` +
        `3. Filter for values containing "${months}+ Months"`,
        'info',
        8000
      );
      
      return { 
        success: true, 
        message: `Filter column L for "${months}+ Months" to find inactive channels` 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Highlight Checkups
  async function highlightCheckups() {
    try {
      showNotification(
        `🔔 To highlight rows needing checkup:\n` +
        `1. Click column X header (Requires Checkup)\n` +
        `2. Use Data → Create a filter\n` +
        `3. Filter for non-empty cells`,
        'info',
        8000
      );
      
      return { 
        success: true, 
        message: 'Filter column X (Requires Checkup) for non-empty cells' 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Clear Highlights
  async function clearHighlights() {
    try {
      // Remove any highlights we added
      highlightedElements.forEach(el => {
        if (el && el.style) {
          el.style.backgroundColor = '';
        }
      });
      highlightedElements = [];
      
      showNotification('🧹 To clear filters: Data → Remove filter', 'info');
      
      return { success: true, message: 'Use Data → Remove filter to clear' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Show notification toast
  function showNotification(message, type = 'info', duration = 4000) {
    // Remove existing notification
    const existing = document.getElementById('hcm-notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.id = 'hcm-notification';
    notification.className = `hcm-notification hcm-${type}`;
    notification.innerHTML = `
      <div class="hcm-notification-content">
        <span class="hcm-notification-icon">${type === 'info' ? 'ℹ️' : type === 'warning' ? '⚠️' : '✅'}</span>
        <span class="hcm-notification-message">${message.replace(/\n/g, '<br>')}</span>
      </div>
      <button class="hcm-notification-close">×</button>
    `;

    document.body.appendChild(notification);

    // Close button handler
    notification.querySelector('.hcm-notification-close').addEventListener('click', () => {
      notification.remove();
    });

    // Auto-remove after duration
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.add('hcm-notification-fadeout');
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);
  }

  // Initialize - add keyboard shortcuts
  document.addEventListener('keydown', async (e) => {
    // Get settings
    const settings = await chrome.storage.sync.get({
      reviewerName: 'Judge',
      overdueMonths: 3,
      inactiveMonths: 6
    });

    // Alt+R - Quick Review
    if (e.altKey && e.key === 'r') {
      e.preventDefault();
      quickReview(settings);
    }
    
    // Alt+1 - Note: Inactive
    if (e.altKey && e.key === '1') {
      e.preventDefault();
      insertNote('Channel inactive - no uploads in X months');
    }
    
    // Alt+2 - Note: Non-gaming
    if (e.altKey && e.key === '2') {
      e.preventDefault();
      insertNote('Channel no longer produces gaming content');
    }
    
    // Alt+3 - Note: Reviewed
    if (e.altKey && e.key === '3') {
      e.preventDefault();
      insertNote('Content reviewed - meets standards ✓');
    }
    
    // Alt+O - Open Channel
    if (e.altKey && e.key === 'o') {
      e.preventDefault();
      openChannel();
    }
  });

  // Log initialization
  console.log('🎮 Hypixel Creator Manager loaded!');
  
  // Show welcome notification on first load
  setTimeout(() => {
    showNotification('🎮 Creator Manager ready! Use Alt+R for quick review.', 'info', 3000);
  }, 1000);

})();
