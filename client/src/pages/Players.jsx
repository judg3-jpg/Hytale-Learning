import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  AlertTriangle,
  VolumeX,
  LogOut,
  Ban,
  FileText,
  User,
  Clock,
  Globe,
  HardDrive,
  Calendar,
  Activity
} from 'lucide-react'
import { Button, Badge, Input, Table, Modal, Textarea, Select } from '../components/ui'
import { formatDateTime, formatPlaytime, formatRelativeTime, maskIP, getInitials } from '../utils/formatters'
import { PLAYER_STATUS_COLORS, PLAYER_STATUS_LABELS, QUICK_REASONS, DURATION_PRESETS } from '../utils/constants'

// Player Avatar Component
function PlayerAvatar({ name, status, size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg',
  }

  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-amber-500',
    offline: 'bg-slate-500',
    banned: 'bg-red-500',
    muted: 'bg-cyan-500',
  }

  return (
    <div className="relative">
      <div className={`${sizes[size]} rounded-xl bg-gradient-to-br from-accent-primary to-accent-purple flex items-center justify-center font-semibold text-white`}>
        {getInitials(name)}
      </div>
      {status && (
        <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 dark:border-dark-secondary border-light-secondary ${statusColors[status]}`} />
      )}
    </div>
  )
}

// Action Button for player actions
function ActionButton({ icon: Icon, label, color, onClick }) {
  const colorClasses = {
    warning: 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30',
    info: 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30',
    default: 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30',
    danger: 'bg-red-500/20 text-red-400 hover:bg-red-500/30',
  }

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors ${colorClasses[color]}`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

// Punishment Modal
function PunishmentModal({ isOpen, onClose, type, playerName, onSubmit }) {
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState('')
  const [isPermanent, setIsPermanent] = useState(type === 'ban')

  const typeConfig = {
    warn: { title: 'Warn Player', icon: AlertTriangle, color: 'warning' },
    mute: { title: 'Mute Player', icon: VolumeX, color: 'info' },
    kick: { title: 'Kick Player', icon: LogOut, color: 'default' },
    ban: { title: 'Ban Player', icon: Ban, color: 'danger' },
  }

  const config = typeConfig[type] || typeConfig.warn
  const quickReasons = QUICK_REASONS[type] || []

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      type,
      reason,
      duration: isPermanent ? null : parseInt(duration),
    })
    onClose()
    setReason('')
    setDuration('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${config.title}: ${playerName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          label="Reason"
          placeholder="Enter the reason for this action..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />

        {/* Quick Reasons */}
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-slate-200 text-slate-700">
            Quick Reasons
          </label>
          <div className="flex flex-wrap gap-2">
            {quickReasons.map((qr) => (
              <button
                key={qr}
                type="button"
                onClick={() => setReason(qr)}
                className="px-3 py-1.5 text-sm rounded-lg transition-colors dark:bg-dark-tertiary dark:hover:bg-dark-border dark:text-slate-300 bg-light-tertiary hover:bg-slate-200 text-slate-600"
              >
                {qr}
              </button>
            ))}
          </div>
        </div>

        {/* Duration (for mute and ban) */}
        {(type === 'mute' || type === 'ban') && (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!isPermanent}
                  onChange={() => setIsPermanent(false)}
                  className="text-accent-primary"
                />
                <span className="text-sm dark:text-slate-200 text-slate-700">Temporary</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isPermanent}
                  onChange={() => setIsPermanent(true)}
                  className="text-accent-primary"
                />
                <span className="text-sm dark:text-slate-200 text-slate-700">Permanent</span>
              </label>
            </div>

            {!isPermanent && (
              <Select
                label="Duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                options={DURATION_PRESETS.filter(d => d.value !== null).map(d => ({
                  value: d.value.toString(),
                  label: d.label,
                }))}
                required={!isPermanent}
              />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant={config.color === 'warning' ? 'warning' : config.color === 'danger' ? 'danger' : 'primary'}>
            {config.title}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Player Detail Panel
function PlayerDetail({ player, onAction }) {
  const [activeTab, setActiveTab] = useState('info')

  const tabs = [
    { id: 'info', label: 'Info' },
    { id: 'history', label: 'History', count: player.punishmentCount },
    { id: 'notes', label: 'Notes', count: player.noteCount },
    { id: 'activity', label: 'Activity' },
  ]

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b dark:border-dark-border border-light-border">
        <div className="flex items-start gap-4">
          <PlayerAvatar name={player.name} status={player.status} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold dark:text-white text-slate-900">
                {player.name}
              </h2>
              <Badge variant={PLAYER_STATUS_COLORS[player.status]} dot>
                {PLAYER_STATUS_LABELS[player.status]}
              </Badge>
            </div>
            <p className="text-sm dark:text-slate-400 text-slate-500 mt-1">
              UUID: {player.uuid}
            </p>
            <p className="text-sm dark:text-slate-400 text-slate-500">
              First Join: {formatDateTime(player.firstJoin)} • Playtime: {formatPlaytime(player.playtime)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <ActionButton icon={AlertTriangle} label="Warn" color="warning" onClick={() => onAction('warn')} />
          <ActionButton icon={VolumeX} label="Mute" color="info" onClick={() => onAction('mute')} />
          <ActionButton icon={LogOut} label="Kick" color="default" onClick={() => onAction('kick')} />
          <ActionButton icon={Ban} label="Ban" color="danger" onClick={() => onAction('ban')} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b dark:border-dark-border border-light-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent dark:text-slate-400 text-slate-500 hover:text-accent-primary'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-accent-primary/20 text-accent-primary'
                  : 'dark:bg-dark-tertiary bg-light-tertiary'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'info' && (
          <div className="grid grid-cols-2 gap-4">
            <InfoItem icon={User} label="Player Name" value={player.name} />
            <InfoItem icon={Calendar} label="First Joined" value={formatDateTime(player.firstJoin)} />
            <InfoItem icon={Clock} label="Last Seen" value={formatRelativeTime(player.lastSeen)} />
            <InfoItem icon={Activity} label="Playtime" value={formatPlaytime(player.playtime)} />
            <InfoItem icon={Globe} label="IP Address" value={maskIP(player.ip)} />
            <InfoItem icon={HardDrive} label="Hardware ID" value={player.hwid || 'N/A'} />
            <InfoItem icon={AlertTriangle} label="Warnings" value={player.warnCount?.toString() || '0'} />
            <InfoItem icon={Ban} label="Bans" value={player.banCount?.toString() || '0'} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="text-center py-8 dark:text-slate-400 text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Punishment history will appear here</p>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <Button variant="secondary" icon={Plus} size="sm">
              Add Note
            </Button>
            <div className="text-center py-8 dark:text-slate-400 text-slate-500">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No notes yet</p>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="text-center py-8 dark:text-slate-400 text-slate-500">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Activity log will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Info Item Component
function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg dark:bg-dark-tertiary bg-light-tertiary">
      <Icon className="h-5 w-5 dark:text-slate-400 text-slate-500" />
      <div>
        <p className="text-xs dark:text-slate-500 text-slate-400">{label}</p>
        <p className="text-sm font-medium dark:text-slate-200 text-slate-700">{value}</p>
      </div>
    </div>
  )
}

function Players() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [punishmentModal, setPunishmentModal] = useState({ isOpen: false, type: null })

  // Mock data
  const players = [
    { id: 1, name: 'PlayerOne', uuid: '550e8400-e29b-41d4-a716-446655440001', status: 'online', playtime: 8640, lastSeen: new Date(), firstJoin: new Date('2025-01-15'), ip: '192.168.1.100', hwid: 'HW-ABCD-1234', punishmentCount: 3, noteCount: 2, warnCount: 2, banCount: 0 },
    { id: 2, name: 'ToxicGamer', uuid: '550e8400-e29b-41d4-a716-446655440002', status: 'muted', playtime: 5340, lastSeen: new Date(Date.now() - 3600000), firstJoin: new Date('2025-02-20'), ip: '192.168.1.101', hwid: 'HW-EFGH-5678', punishmentCount: 7, noteCount: 4, warnCount: 5, banCount: 1 },
    { id: 3, name: 'Cheater123', uuid: '550e8400-e29b-41d4-a716-446655440003', status: 'banned', playtime: 1200, lastSeen: new Date(Date.now() - 86400000), firstJoin: new Date('2025-03-10'), ip: '192.168.1.102', hwid: 'HW-IJKL-9012', punishmentCount: 5, noteCount: 1, warnCount: 2, banCount: 2 },
    { id: 4, name: 'CasualPlayer', uuid: '550e8400-e29b-41d4-a716-446655440004', status: 'offline', playtime: 12500, lastSeen: new Date(Date.now() - 172800000), firstJoin: new Date('2024-12-01'), ip: '192.168.1.103', hwid: 'HW-MNOP-3456', punishmentCount: 0, noteCount: 0, warnCount: 0, banCount: 0 },
    { id: 5, name: 'ProGamer99', uuid: '550e8400-e29b-41d4-a716-446655440005', status: 'online', playtime: 24000, lastSeen: new Date(), firstJoin: new Date('2024-11-15'), ip: '192.168.1.104', hwid: 'HW-QRST-7890', punishmentCount: 1, noteCount: 0, warnCount: 1, banCount: 0 },
  ]

  // Filter players based on search
  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Select player when clicking on row
  const handleSelectPlayer = (player) => {
    setSelectedPlayer(player)
    navigate(`/players/${player.id}`)
  }

  // Handle punishment action
  const handleAction = (type) => {
    setPunishmentModal({ isOpen: true, type })
  }

  const handlePunishmentSubmit = (data) => {
    console.log('Punishment submitted:', { player: selectedPlayer?.name, ...data })
    // Will integrate with API later
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-slate-900">Players</h1>
          <p className="text-sm dark:text-slate-400 text-slate-500 mt-1">
            Manage and monitor all players
          </p>
        </div>
        <Button icon={Plus}>Add Player</Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search players by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="secondary" icon={Filter}>
          Filters
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Player List */}
        <div className="card overflow-hidden">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Player</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Playtime</Table.Head>
                <Table.Head>Last Seen</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredPlayers.map((player) => (
                <Table.Row
                  key={player.id}
                  onClick={() => handleSelectPlayer(player)}
                  selected={selectedPlayer?.id === player.id}
                >
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <PlayerAvatar name={player.name} status={player.status} size="sm" />
                      <div>
                        <p className="font-medium">{player.name}</p>
                        {player.punishmentCount > 0 && (
                          <p className="text-xs dark:text-slate-500 text-slate-400">
                            {player.punishmentCount} punishment{player.punishmentCount !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={PLAYER_STATUS_COLORS[player.status]} dot>
                      {PLAYER_STATUS_LABELS[player.status]}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{formatPlaytime(player.playtime)}</Table.Cell>
                  <Table.Cell>{formatRelativeTime(player.lastSeen)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>

        {/* Player Detail Panel */}
        {selectedPlayer ? (
          <PlayerDetail player={selectedPlayer} onAction={handleAction} />
        ) : (
          <div className="card flex items-center justify-center p-12">
            <div className="text-center">
              <User className="h-16 w-16 mx-auto mb-4 dark:text-slate-600 text-slate-300" />
              <p className="dark:text-slate-400 text-slate-500">
                Select a player to view details
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Punishment Modal */}
      <PunishmentModal
        isOpen={punishmentModal.isOpen}
        onClose={() => setPunishmentModal({ isOpen: false, type: null })}
        type={punishmentModal.type}
        playerName={selectedPlayer?.name || ''}
        onSubmit={handlePunishmentSubmit}
      />
    </div>
  )
}

export default Players
