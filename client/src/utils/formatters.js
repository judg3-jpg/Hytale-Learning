/**
 * Format a date to a readable string (12-hour format)
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return 'N/A'
  
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format a date with time (12-hour format)
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(date) {
  if (!date) return 'N/A'
  
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format time only (12-hour format)
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted time string
 */
export function formatTime(date) {
  if (!date) return 'N/A'
  
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format a relative time string (e.g., "2 hours ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return 'N/A'
  
  const d = new Date(date)
  const now = new Date()
  const diffMs = now - d
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffSecs < 60) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffWeeks < 4) return `${diffWeeks}w ago`
  if (diffMonths < 12) return `${diffMonths}mo ago`
  
  return formatDate(date)
}

/**
 * Format playtime from minutes to readable format
 * @param {number} minutes - Total minutes played
 * @returns {string} Formatted playtime string
 */
export function formatPlaytime(minutes) {
  if (!minutes || minutes <= 0) return '0m'
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

/**
 * Format duration for punishments
 * @param {number|null} minutes - Duration in minutes, null for permanent
 * @returns {string} Formatted duration string
 */
export function formatDuration(minutes) {
  if (minutes === null || minutes === undefined) return 'Permanent'
  if (minutes <= 0) return 'Permanent'
  
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`
  
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''}`
  
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''}`
  
  const months = Math.floor(days / 30)
  return `${months} month${months !== 1 ? 's' : ''}`
}

/**
 * Truncate a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated string
 */
export function truncate(str, length = 30) {
  if (!str) return ''
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

/**
 * Mask an IP address for privacy
 * @param {string} ip - The IP address to mask
 * @returns {string} Masked IP address
 */
export function maskIP(ip) {
  if (!ip) return 'N/A'
  const parts = ip.split('.')
  if (parts.length !== 4) return ip
  return `${parts[0]}.${parts[1]}.xxx.xxx`
}

/**
 * Get initials from a player name
 * @param {string} name - The player name
 * @returns {string} Initials (up to 2 characters)
 */
export function getInitials(name) {
  if (!name) return '?'
  return name.slice(0, 2).toUpperCase()
}
