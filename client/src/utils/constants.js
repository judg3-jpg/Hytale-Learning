// Player status options
export const PLAYER_STATUS = {
  ONLINE: 'online',
  AWAY: 'away',
  OFFLINE: 'offline',
  BANNED: 'banned',
  MUTED: 'muted',
}

export const PLAYER_STATUS_COLORS = {
  online: 'success',
  away: 'warning',
  offline: 'default',
  banned: 'danger',
  muted: 'info',
}

export const PLAYER_STATUS_LABELS = {
  online: 'Online',
  away: 'Away',
  offline: 'Offline',
  banned: 'Banned',
  muted: 'Muted',
}

// Punishment types
export const PUNISHMENT_TYPE = {
  WARN: 'warn',
  MUTE: 'mute',
  KICK: 'kick',
  BAN: 'ban',
}

export const PUNISHMENT_TYPE_COLORS = {
  warn: 'warning',
  mute: 'info',
  kick: 'default',
  ban: 'danger',
}

export const PUNISHMENT_TYPE_LABELS = {
  warn: 'Warning',
  mute: 'Mute',
  kick: 'Kick',
  ban: 'Ban',
}

export const PUNISHMENT_TYPE_ICONS = {
  warn: 'AlertTriangle',
  mute: 'VolumeX',
  kick: 'LogOut',
  ban: 'Ban',
}

// Quick punishment reasons
export const QUICK_REASONS = {
  warn: [
    'Spam',
    'Inappropriate Language',
    'Harassment',
    'Minor Rule Violation',
    'First Offense Warning',
  ],
  mute: [
    'Spam',
    'Toxicity',
    'Inappropriate Language',
    'Harassment',
    'Advertising',
  ],
  kick: [
    'AFK Too Long',
    'Disruptive Behavior',
    'Ignoring Warnings',
    'Minor Rule Violations',
  ],
  ban: [
    'Cheating/Hacking',
    'Exploiting',
    'Severe Harassment',
    'Ban Evasion',
    'Inappropriate Name',
    'Repeated Offenses',
  ],
}

// Duration presets for punishments
export const DURATION_PRESETS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '6 hours', value: 360 },
  { label: '12 hours', value: 720 },
  { label: '1 day', value: 1440 },
  { label: '3 days', value: 4320 },
  { label: '1 week', value: 10080 },
  { label: '2 weeks', value: 20160 },
  { label: '1 month', value: 43200 },
  { label: 'Permanent', value: null },
]

// Activity types
export const ACTIVITY_TYPE = {
  JOIN: 'join',
  LEAVE: 'leave',
  CHAT: 'chat',
  COMMAND: 'command',
  PUNISHMENT: 'punishment',
  NOTE: 'note',
}

export const ACTIVITY_TYPE_COLORS = {
  join: 'success',
  leave: 'default',
  chat: 'info',
  command: 'default',
  punishment: 'danger',
  note: 'warning',
}
