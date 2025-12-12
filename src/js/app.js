// ==========================================
// HYTALE MODERATION TOOL - Main Application
// ==========================================

// State
let currentTarget = null
let players = []
let isSearching = false

// DOM Elements
const elements = {
  // Header
  targetRank: document.getElementById('target-rank'),
  targetName: document.getElementById('target-name'),
  playerSearch: document.getElementById('player-search'),
  searchDropdown: document.getElementById('search-dropdown'),
  
  // Player Preview
  playerAvatar: document.getElementById('player-avatar'),
  playerStatus: document.getElementById('player-status'),
  
  // Info Panel
  infoNick: document.getElementById('info-nick'),
  infoLocation: document.getElementById('info-location'),
  infoClient: document.getElementById('info-client'),
  infoRank: document.getElementById('info-rank'),
  infoLevel: document.getElementById('info-level'),
  infoFirstjoin: document.getElementById('info-firstjoin'),
  infoPlaytime: document.getElementById('info-playtime'),
  infoWarnings: document.getElementById('info-warnings'),
  infoStatus: document.getElementById('info-status'),
  
  // Action Buttons
  actionBtns: document.querySelectorAll('.action-btn'),
  
  // Bottom Buttons
  btnPlayers: document.getElementById('btn-players'),
  btnPunishments: document.getElementById('btn-punishments'),
  btnActivity: document.getElementById('btn-activity'),
  
  // Modal
  modalOverlay: document.getElementById('modal-overlay'),
  modal: document.getElementById('modal'),
  modalTitle: document.getElementById('modal-title'),
  modalBody: document.getElementById('modal-body'),
  modalClose: document.getElementById('modal-close'),
  
  // Window Controls
  btnMinimize: document.getElementById('btn-minimize'),
  btnMaximize: document.getElementById('btn-maximize'),
  btnClose: document.getElementById('btn-close'),
}

// ==========================================
// INITIALIZATION
// ==========================================

async function init() {
  console.log('Initializing Hytale Moderation Tool...')
  
  // Initialize database
  await window.api.initDatabase()
  
  // Load players
  await loadPlayers()
  
  // Set up event listeners
  setupEventListeners()
  setupKeyboardShortcuts()
  
  console.log('Initialization complete!')
}

async function loadPlayers() {
  players = await window.api.getPlayers()
  console.log(`Loaded ${players.length} players`)
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
  // Window controls
  elements.btnMinimize.addEventListener('click', () => window.api.minimizeWindow())
  elements.btnMaximize.addEventListener('click', () => window.api.maximizeWindow())
  elements.btnClose.addEventListener('click', () => window.api.closeWindow())
  
  // Search
  elements.playerSearch.addEventListener('input', handleSearch)
  elements.playerSearch.addEventListener('focus', () => {
    if (elements.playerSearch.value.length > 0) {
      handleSearch()
    }
  })
  
  // Close search dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-actions')) {
      elements.searchDropdown.classList.remove('active')
    }
  })
  
  // Action buttons
  elements.actionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action
      handleAction(action)
    })
  })
  
  // Bottom navigation buttons
  elements.btnPlayers.addEventListener('click', () => showPlayerListModal())
  elements.btnPunishments.addEventListener('click', () => showPunishmentsModal())
  elements.btnActivity.addEventListener('click', () => showActivityModal())
  
  // Modal close
  elements.modalClose.addEventListener('click', closeModal)
  elements.modalOverlay.addEventListener('click', (e) => {
    if (e.target === elements.modalOverlay) {
      closeModal()
    }
  })
}

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      if (e.key === 'Escape') {
        e.target.blur()
        elements.searchDropdown.classList.remove('active')
      }
      return
    }
    
    // Close modal on Escape
    if (e.key === 'Escape') {
      closeModal()
      return
    }
    
    // Focus search on /
    if (e.key === '/') {
      e.preventDefault()
      elements.playerSearch.focus()
      return
    }
    
    // Action shortcuts (only when target is selected)
    if (!currentTarget) return
    
    const key = e.key.toUpperCase()
    
    switch (key) {
      case 'X':
        handleAction('teleport')
        break
      case 'W':
        handleAction('warn')
        break
      case 'M':
        handleAction('mute')
        break
      case 'K':
        handleAction('kick')
        break
      case 'B':
        handleAction('ban')
        break
      case 'I':
        handleAction('inventory')
        break
      case 'N':
        handleAction('notes')
        break
      case 'H':
        handleAction('history')
        break
      case 'C':
        handleAction('untarget')
        break
    }
  })
}

// ==========================================
// SEARCH FUNCTIONALITY
// ==========================================

async function handleSearch() {
  const query = elements.playerSearch.value.trim()
  
  if (query.length < 1) {
    elements.searchDropdown.classList.remove('active')
    return
  }
  
  const results = await window.api.searchPlayers(query)
  
  if (results.length === 0) {
    elements.searchDropdown.innerHTML = '<div class="search-no-results">No players found</div>'
  } else {
    elements.searchDropdown.innerHTML = results.map(player => `
      <div class="search-result" data-id="${player.id}">
        <div class="search-result-avatar">${player.player_name.substring(0, 2).toUpperCase()}</div>
        <div class="search-result-info">
          <div class="search-result-name">${player.player_name}</div>
          <div class="search-result-status">${player.rank} • ${player.status}</div>
        </div>
      </div>
    `).join('')
    
    // Add click handlers to results
    elements.searchDropdown.querySelectorAll('.search-result').forEach(el => {
      el.addEventListener('click', () => {
        const playerId = parseInt(el.dataset.id)
        const player = results.find(p => p.id === playerId)
        if (player) {
          targetPlayer(player)
          elements.searchDropdown.classList.remove('active')
          elements.playerSearch.value = ''
        }
      })
    })
  }
  
  elements.searchDropdown.classList.add('active')
}

// ==========================================
// TARGETING SYSTEM
// ==========================================

function targetPlayer(player) {
  currentTarget = player
  updateTargetDisplay()
  console.log(`Targeted: ${player.player_name}`)
  
  // Log activity
  window.api.logActivity(player.id, 'command', 'Player targeted for moderation')
}

function untargetPlayer() {
  currentTarget = null
  updateTargetDisplay()
  console.log('Target cleared')
}

function updateTargetDisplay() {
  if (!currentTarget) {
    // No target
    elements.targetRank.textContent = '[---]'
    elements.targetRank.className = 'target-rank'
    elements.targetName.textContent = 'No Target'
    
    // Clear avatar
    const avatar = elements.playerAvatar.querySelector('.avatar-placeholder')
    avatar.classList.remove('has-target')
    
    // Clear status
    elements.playerStatus.innerHTML = `
      <span class="status-dot offline"></span>
      <span class="status-text">No Target</span>
    `
    
    // Clear info
    elements.infoNick.textContent = '-'
    elements.infoLocation.textContent = '-'
    elements.infoClient.textContent = '-'
    elements.infoRank.textContent = '-'
    elements.infoLevel.textContent = '-'
    elements.infoFirstjoin.textContent = '-'
    elements.infoPlaytime.textContent = '-'
    elements.infoWarnings.textContent = '-'
    elements.infoStatus.textContent = '-'
    
    // Disable action buttons
    elements.actionBtns.forEach(btn => {
      if (btn.dataset.action !== 'untarget') {
        btn.disabled = true
      }
    })
    
    return
  }
  
  // Has target
  const player = currentTarget
  
  // Update header
  elements.targetRank.textContent = `[${player.rank}]`
  elements.targetRank.className = `target-rank ${player.rank.toLowerCase()}`
  elements.targetName.textContent = player.player_name
  
  // Update avatar
  const avatar = elements.playerAvatar.querySelector('.avatar-placeholder')
  avatar.classList.add('has-target')
  
  // Update status
  const statusClass = player.is_banned ? 'banned' : player.status
  elements.playerStatus.innerHTML = `
    <span class="status-dot ${statusClass}"></span>
    <span class="status-text">${player.is_banned ? 'Banned' : capitalizeFirst(player.status)}</span>
  `
  
  // Update info
  elements.infoNick.textContent = player.player_name
  elements.infoLocation.textContent = player.location || 'Unknown'
  elements.infoClient.textContent = player.client_info || 'Unknown'
  elements.infoRank.textContent = player.rank
  elements.infoLevel.textContent = player.level
  elements.infoFirstjoin.textContent = formatDate(player.first_join)
  elements.infoPlaytime.textContent = formatPlaytime(player.total_playtime)
  
  // Warnings with color
  elements.infoWarnings.textContent = player.warnings || 0
  elements.infoWarnings.className = 'info-value' + (player.warnings >= 3 ? ' danger' : player.warnings >= 1 ? ' warning' : '')
  
  // Status
  elements.infoStatus.textContent = player.is_banned ? 'Banned' : player.is_muted ? 'Muted' : capitalizeFirst(player.status)
  elements.infoStatus.className = 'info-value' + (player.is_banned ? ' danger' : player.is_muted ? ' warning' : player.status === 'online' ? ' success' : '')
  
  // Enable action buttons
  elements.actionBtns.forEach(btn => {
    btn.disabled = false
  })
}

// ==========================================
// ACTIONS
// ==========================================

function handleAction(action) {
  if (!currentTarget && action !== 'untarget') {
    console.log('No target selected')
    return
  }
  
  switch (action) {
    case 'teleport':
      showNotification(`Teleporting to ${currentTarget.player_name}...`, 'info')
      window.api.logActivity(currentTarget.id, 'command', 'Teleported to player')
      break
      
    case 'warn':
      showPunishmentModal('warn')
      break
      
    case 'mute':
      showPunishmentModal('mute')
      break
      
    case 'kick':
      showPunishmentModal('kick')
      break
      
    case 'ban':
      showPunishmentModal('ban')
      break
      
    case 'inventory':
      showInventoryModal()
      break
      
    case 'notes':
      showNotesModal()
      break
      
    case 'history':
      showHistoryModal()
      break
      
    case 'untarget':
      untargetPlayer()
      break
  }
}

// ==========================================
// MODALS
// ==========================================

function openModal(title, content) {
  elements.modalTitle.textContent = title
  elements.modalBody.innerHTML = content
  elements.modalOverlay.classList.add('active')
}

function closeModal() {
  elements.modalOverlay.classList.remove('active')
}

// Punishment Modal
function showPunishmentModal(type) {
  const typeLabels = {
    warn: 'Warn',
    mute: 'Mute',
    kick: 'Kick',
    ban: 'Ban'
  }
  
  const quickReasons = {
    warn: ['Spam', 'Inappropriate Language', 'Minor Rule Violation', 'First Warning'],
    mute: ['Spam', 'Toxicity', 'Harassment', 'Advertising'],
    kick: ['AFK', 'Disruptive Behavior', 'Ignoring Warnings'],
    ban: ['Cheating/Hacking', 'Severe Harassment', 'Ban Evasion', 'Exploiting']
  }
  
  const showDuration = type === 'mute' || type === 'ban'
  
  const content = `
    <form id="punishment-form">
      <div class="form-group">
        <label class="form-label">Reason</label>
        <textarea class="form-textarea" id="punishment-reason" placeholder="Enter reason..." required></textarea>
        <div class="quick-reasons">
          ${quickReasons[type].map(r => `<button type="button" class="quick-reason" data-reason="${r}">${r}</button>`).join('')}
        </div>
      </div>
      
      ${showDuration ? `
        <div class="form-group">
          <label class="form-label">Duration</label>
          <select class="form-select" id="punishment-duration">
            <option value="">Permanent</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="360">6 hours</option>
            <option value="1440">1 day</option>
            <option value="4320">3 days</option>
            <option value="10080">1 week</option>
            <option value="43200">30 days</option>
          </select>
        </div>
      ` : ''}
      
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn ${type === 'ban' || type === 'kick' ? 'btn-danger' : 'btn-primary'}">${typeLabels[type]} Player</button>
      </div>
    </form>
  `
  
  openModal(`${typeLabels[type]} ${currentTarget.player_name}`, content)
  
  // Setup form handlers
  setTimeout(() => {
    // Quick reasons
    document.querySelectorAll('.quick-reason').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('punishment-reason').value = btn.dataset.reason
      })
    })
    
    // Form submit
    document.getElementById('punishment-form').addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const reason = document.getElementById('punishment-reason').value
      const durationEl = document.getElementById('punishment-duration')
      const duration = durationEl ? (durationEl.value ? parseInt(durationEl.value) : null) : null
      
      await window.api.createPunishment({
        player_id: currentTarget.id,
        type: type,
        reason: reason,
        duration: duration
      })
      
      showNotification(`${currentTarget.player_name} has been ${type}${type === 'ban' ? 'ned' : type === 'warn' ? 'ed' : 'ed'}!`, type === 'ban' ? 'danger' : 'success')
      
      // Refresh player data
      currentTarget = await window.api.getPlayerById(currentTarget.id)
      updateTargetDisplay()
      
      closeModal()
    })
  }, 100)
}

// Player List Modal
async function showPlayerListModal() {
  await loadPlayers()
  
  const content = `
    <div class="player-list">
      ${players.length === 0 ? '<div class="search-no-results">No players in database</div>' : 
        players.map(p => `
          <div class="list-item" data-id="${p.id}">
            <div class="list-item-icon">${p.player_name.substring(0, 2).toUpperCase()}</div>
            <div class="list-item-content">
              <div class="list-item-title">${p.player_name}</div>
              <div class="list-item-subtitle">${p.rank} • Level ${p.level}</div>
            </div>
            <span class="list-item-badge ${p.is_banned ? 'banned' : p.status}">${p.is_banned ? 'Banned' : capitalizeFirst(p.status)}</span>
          </div>
        `).join('')
      }
    </div>
  `
  
  openModal('Player List', content)
  
  // Add click handlers
  setTimeout(() => {
    document.querySelectorAll('.player-list .list-item').forEach(el => {
      el.addEventListener('click', () => {
        const playerId = parseInt(el.dataset.id)
        const player = players.find(p => p.id === playerId)
        if (player) {
          targetPlayer(player)
          closeModal()
        }
      })
    })
  }, 100)
}

// Punishments Modal
async function showPunishmentsModal() {
  const punishments = await window.api.getPunishments()
  
  const content = `
    <div class="punishments-list">
      ${punishments.length === 0 ? '<div class="search-no-results">No punishments recorded</div>' :
        punishments.map(p => `
          <div class="list-item">
            <div class="list-item-icon">${p.type === 'ban' ? '🚫' : p.type === 'mute' ? '🔇' : p.type === 'kick' ? '👢' : '⚠️'}</div>
            <div class="list-item-content">
              <div class="list-item-title">${p.player_name || 'Unknown'}</div>
              <div class="list-item-subtitle">${p.reason}</div>
            </div>
            <span class="list-item-badge ${p.type}">${capitalizeFirst(p.type)}</span>
          </div>
        `).join('')
      }
    </div>
  `
  
  openModal('Punishments', content)
}

// Activity Modal
async function showActivityModal() {
  const activities = await window.api.getActivityLog()
  
  const content = `
    <div class="activity-list">
      ${activities.length === 0 ? '<div class="search-no-results">No activity recorded</div>' :
        activities.map(a => `
          <div class="list-item">
            <div class="list-item-icon">${getActivityIcon(a.action_type)}</div>
            <div class="list-item-content">
              <div class="list-item-title">${a.player_name || 'System'}</div>
              <div class="list-item-subtitle">${a.details || a.action_type}</div>
            </div>
            <span class="list-item-badge">${formatTimeAgo(a.timestamp)}</span>
          </div>
        `).join('')
      }
    </div>
  `
  
  openModal('Activity Log', content)
}

// Notes Modal
async function showNotesModal() {
  if (!currentTarget) return
  
  const notes = await window.api.getNotes(currentTarget.id)
  
  const content = `
    <div class="notes-section">
      <form id="add-note-form" style="margin-bottom: 16px;">
        <div class="form-group" style="margin-bottom: 8px;">
          <textarea class="form-textarea" id="new-note" placeholder="Add a note about this player..." rows="2"></textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Add Note</button>
      </form>
      
      <div class="notes-list">
        ${notes.length === 0 ? '<div class="search-no-results">No notes for this player</div>' :
          notes.map(n => `
            <div class="list-item">
              <div class="list-item-icon">📝</div>
              <div class="list-item-content">
                <div class="list-item-subtitle">${n.content}</div>
              </div>
              <span class="list-item-badge">${formatTimeAgo(n.created_at)}</span>
            </div>
          `).join('')
        }
      </div>
    </div>
  `
  
  openModal(`Notes - ${currentTarget.player_name}`, content)
  
  // Form handler
  setTimeout(() => {
    document.getElementById('add-note-form').addEventListener('submit', async (e) => {
      e.preventDefault()
      const noteContent = document.getElementById('new-note').value.trim()
      if (noteContent) {
        await window.api.createNote(currentTarget.id, noteContent)
        showNotesModal() // Refresh
        showNotification('Note added!', 'success')
      }
    })
  }, 100)
}

// History Modal
async function showHistoryModal() {
  if (!currentTarget) return
  
  const punishments = await window.api.getPunishments(currentTarget.id)
  
  const content = `
    <div class="history-list">
      ${punishments.length === 0 ? '<div class="search-no-results">No punishment history</div>' :
        punishments.map(p => `
          <div class="list-item">
            <div class="list-item-icon">${p.type === 'ban' ? '🚫' : p.type === 'mute' ? '🔇' : p.type === 'kick' ? '👢' : '⚠️'}</div>
            <div class="list-item-content">
              <div class="list-item-title">${capitalizeFirst(p.type)}</div>
              <div class="list-item-subtitle">${p.reason}</div>
            </div>
            <span class="list-item-badge ${p.type}">${formatTimeAgo(p.issued_at)}</span>
          </div>
        `).join('')
      }
    </div>
  `
  
  openModal(`History - ${currentTarget.player_name}`, content)
}

// Inventory Modal (placeholder)
function showInventoryModal() {
  const content = `
    <div class="search-no-results">
      <p>Inventory viewing will be available when connected to Hytale.</p>
      <p style="margin-top: 8px; font-size: 12px; color: var(--text-muted);">This feature requires game integration.</p>
    </div>
  `
  
  openModal(`Inventory - ${currentTarget.player_name}`, content)
}

// ==========================================
// NOTIFICATIONS
// ==========================================

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div')
  notification.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === 'danger' ? 'var(--accent-danger)' : type === 'success' ? 'var(--accent-success)' : 'var(--accent-primary)'};
    color: white;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 2000;
    animation: slideInRight 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  `
  notification.textContent = message
  
  // Add animation keyframes if not exists
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style')
    style.id = 'notification-styles'
    style.textContent = `
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
      }
    `
    document.head.appendChild(style)
  }
  
  document.body.appendChild(notification)
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease'
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function capitalizeFirst(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

function formatPlaytime(minutes) {
  if (!minutes) return '0h'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Unknown'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateStr)
}

function getActivityIcon(type) {
  const icons = {
    join: '🟢',
    leave: '🔴',
    chat: '💬',
    command: '⚡',
    punishment: '⚖️',
    note: '📝'
  }
  return icons[type] || '📋'
}

// ==========================================
// START APPLICATION
// ==========================================

document.addEventListener('DOMContentLoaded', init)
