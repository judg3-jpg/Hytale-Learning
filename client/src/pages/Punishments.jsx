import { useState } from 'react'
import { 
  AlertTriangle, 
  VolumeX, 
  Ban, 
  Filter,
  Search,
  RotateCcw,
  Clock,
  CheckCircle
} from 'lucide-react'
import { Button, Badge, Input, Table, Modal, Textarea } from '../components/ui'
import { formatDateTime, formatDuration, formatRelativeTime } from '../utils/formatters'
import { PUNISHMENT_TYPE_COLORS, PUNISHMENT_TYPE_LABELS } from '../utils/constants'

// Punishment Type Icon
function PunishmentIcon({ type }) {
  const icons = {
    warn: AlertTriangle,
    mute: VolumeX,
    ban: Ban,
  }
  const Icon = icons[type] || AlertTriangle
  
  const colorClasses = {
    warn: 'bg-amber-500/20 text-amber-400',
    mute: 'bg-cyan-500/20 text-cyan-400',
    ban: 'bg-red-500/20 text-red-400',
  }

  return (
    <div className={`p-2 rounded-lg ${colorClasses[type]}`}>
      <Icon className="h-4 w-4" />
    </div>
  )
}

// Revoke Modal
function RevokeModal({ isOpen, onClose, punishment, onConfirm }) {
  const [reason, setReason] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onConfirm(punishment?.id, reason)
    onClose()
    setReason('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Revoke Punishment">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 rounded-lg dark:bg-dark-tertiary bg-light-tertiary">
          <p className="text-sm dark:text-slate-400 text-slate-500">You are about to revoke:</p>
          <p className="font-medium dark:text-white text-slate-900 mt-1">
            {PUNISHMENT_TYPE_LABELS[punishment?.type]} - {punishment?.playerName}
          </p>
          <p className="text-sm dark:text-slate-400 text-slate-500 mt-1">
            Reason: {punishment?.reason}
          </p>
        </div>

        <Textarea
          label="Revoke Reason"
          placeholder="Why is this punishment being revoked?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="warning">
            Revoke Punishment
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Stat Card
function StatCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    amber: 'bg-amber-500/20 text-amber-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
    red: 'bg-red-500/20 text-red-400',
    green: 'bg-green-500/20 text-green-400',
  }

  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold dark:text-white text-slate-900">{value}</p>
        <p className="text-sm dark:text-slate-400 text-slate-500">{label}</p>
      </div>
    </div>
  )
}

function Punishments() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all') // all, active, expired
  const [revokeModal, setRevokeModal] = useState({ isOpen: false, punishment: null })

  // Mock data
  const punishments = [
    { id: 1, type: 'ban', playerName: 'Cheater123', playerId: 3, reason: 'Using modified client', duration: null, isActive: true, issuedAt: new Date(Date.now() - 86400000), expiresAt: null },
    { id: 2, type: 'mute', playerName: 'ToxicGamer', playerId: 2, reason: 'Excessive toxicity in chat', duration: 1440, isActive: true, issuedAt: new Date(Date.now() - 7200000), expiresAt: new Date(Date.now() + 79200000) },
    { id: 3, type: 'warn', playerName: 'PlayerOne', playerId: 1, reason: 'Minor spam', duration: null, isActive: false, issuedAt: new Date(Date.now() - 172800000), expiresAt: null },
    { id: 4, type: 'ban', playerName: 'BanEvader99', playerId: 6, reason: 'Ban evasion', duration: null, isActive: true, issuedAt: new Date(Date.now() - 3600000), expiresAt: null },
    { id: 5, type: 'mute', playerName: 'Spammer99', playerId: 7, reason: 'Spam', duration: 60, isActive: false, issuedAt: new Date(Date.now() - 259200000), expiresAt: new Date(Date.now() - 255600000) },
    { id: 6, type: 'warn', playerName: 'ToxicGamer', playerId: 2, reason: 'Harassment', duration: null, isActive: false, issuedAt: new Date(Date.now() - 432000000), expiresAt: null },
  ]

  // Filter punishments
  const filteredPunishments = punishments.filter(p => {
    const matchesSearch = p.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.reason.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filter === 'active') return matchesSearch && p.isActive
    if (filter === 'expired') return matchesSearch && !p.isActive
    return matchesSearch
  })

  // Stats
  const stats = {
    activeWarns: punishments.filter(p => p.type === 'warn' && p.isActive).length,
    activeMutes: punishments.filter(p => p.type === 'mute' && p.isActive).length,
    activeBans: punishments.filter(p => p.type === 'ban' && p.isActive).length,
    totalExpired: punishments.filter(p => !p.isActive).length,
  }

  const handleRevoke = (id, reason) => {
    console.log('Revoking punishment:', id, reason)
    // Will integrate with API
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold dark:text-white text-slate-900">Punishments</h1>
        <p className="text-sm dark:text-slate-400 text-slate-500 mt-1">
          View and manage all player punishments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={AlertTriangle} label="Active Warns" value={stats.activeWarns} color="amber" />
        <StatCard icon={VolumeX} label="Active Mutes" value={stats.activeMutes} color="cyan" />
        <StatCard icon={Ban} label="Active Bans" value={stats.activeBans} color="red" />
        <StatCard icon={CheckCircle} label="Expired" value={stats.totalExpired} color="green" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search by player or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'active' ? 'primary' : 'secondary'}
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={filter === 'expired' ? 'primary' : 'secondary'}
            onClick={() => setFilter('expired')}
          >
            Expired
          </Button>
        </div>
      </div>

      {/* Punishments Table */}
      <div className="card overflow-hidden">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Type</Table.Head>
              <Table.Head>Player</Table.Head>
              <Table.Head>Reason</Table.Head>
              <Table.Head>Duration</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Issued</Table.Head>
              <Table.Head></Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredPunishments.map((punishment) => (
              <Table.Row key={punishment.id}>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <PunishmentIcon type={punishment.type} />
                    <span className="font-medium">
                      {PUNISHMENT_TYPE_LABELS[punishment.type]}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <span className="font-medium">{punishment.playerName}</span>
                </Table.Cell>
                <Table.Cell>
                  <span className="max-w-xs truncate block">{punishment.reason}</span>
                </Table.Cell>
                <Table.Cell>
                  {formatDuration(punishment.duration)}
                </Table.Cell>
                <Table.Cell>
                  {punishment.isActive ? (
                    <Badge variant="success" dot>Active</Badge>
                  ) : (
                    <Badge variant="default">Expired</Badge>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <div>
                    <p className="text-sm">{formatRelativeTime(punishment.issuedAt)}</p>
                    <p className="text-xs dark:text-slate-500 text-slate-400">
                      {formatDateTime(punishment.issuedAt)}
                    </p>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {punishment.isActive && punishment.type !== 'warn' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={RotateCcw}
                      onClick={() => setRevokeModal({ isOpen: true, punishment })}
                    >
                      Revoke
                    </Button>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {filteredPunishments.length === 0 && (
          <div className="text-center py-12">
            <Ban className="h-12 w-12 mx-auto mb-3 dark:text-slate-600 text-slate-300" />
            <p className="dark:text-slate-400 text-slate-500">No punishments found</p>
          </div>
        )}
      </div>

      {/* Revoke Modal */}
      <RevokeModal
        isOpen={revokeModal.isOpen}
        onClose={() => setRevokeModal({ isOpen: false, punishment: null })}
        punishment={revokeModal.punishment}
        onConfirm={handleRevoke}
      />
    </div>
  )
}

export default Punishments
