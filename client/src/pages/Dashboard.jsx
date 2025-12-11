import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  Ban, 
  TrendingUp,
  Clock,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { Badge, Button } from '../components/ui'
import { formatRelativeTime, formatPlaytime } from '../utils/formatters'
import { PUNISHMENT_TYPE_COLORS, PLAYER_STATUS_COLORS } from '../utils/constants'

// Stat Card Component
function StatCard({ icon: Icon, label, value, trend, color }) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    amber: 'bg-amber-500/20 text-amber-400',
    red: 'bg-red-500/20 text-red-400',
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm dark:text-slate-400 text-slate-500">{label}</p>
          <p className="text-3xl font-bold mt-1 dark:text-white text-slate-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
              <TrendingUp className="h-3 w-3" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

// Recent Activity Item
function RecentActivityItem({ type, player, action, time }) {
  const typeIcons = {
    warn: AlertTriangle,
    mute: AlertCircle,
    ban: Ban,
    note: Clock,
  }
  
  const Icon = typeIcons[type] || AlertCircle

  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`p-2 rounded-lg ${
        type === 'ban' ? 'bg-red-500/20 text-red-400' :
        type === 'warn' ? 'bg-amber-500/20 text-amber-400' :
        type === 'mute' ? 'bg-cyan-500/20 text-cyan-400' :
        'bg-slate-500/20 text-slate-400'
      }`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm dark:text-slate-200 text-slate-700 truncate">
          <span className="font-medium">{action}</span> {player}
        </p>
        <p className="text-xs dark:text-slate-500 text-slate-400">{time}</p>
      </div>
    </div>
  )
}

// Player Needing Attention Card
function AttentionPlayer({ name, reason, detail, severity }) {
  const severityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-amber-500',
    low: 'border-l-cyan-500',
  }

  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg border-l-4 ${severityColors[severity]} dark:bg-dark-tertiary bg-light-tertiary`}>
      <div className="flex-1 min-w-0">
        <p className="font-medium dark:text-white text-slate-900">{name}</p>
        <p className="text-sm dark:text-slate-400 text-slate-500">{reason}</p>
        <p className="text-xs dark:text-slate-500 text-slate-400 mt-1">{detail}</p>
      </div>
      <Link to={`/players/${name}`}>
        <Button variant="secondary" size="sm">
          View
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}

function Dashboard() {
  // Mock data - will be replaced with API calls
  const stats = {
    totalPlayers: 1247,
    onlineNow: 89,
    warnedToday: 23,
    activeBans: 12,
  }

  const recentActivity = [
    { type: 'ban', player: 'Cheater123', action: 'Banned', time: '2 minutes ago' },
    { type: 'warn', player: 'ToxicGamer', action: 'Warned', time: '15 minutes ago' },
    { type: 'mute', player: 'Spammer99', action: 'Muted', time: '32 minutes ago' },
    { type: 'note', player: 'SuspiciousPlayer', action: 'Note added to', time: '1 hour ago' },
    { type: 'warn', player: 'RuleBreaker', action: 'Warned', time: '2 hours ago' },
  ]

  const playersNeedingAttention = [
    { name: 'ToxicGamer', reason: '5 warnings in 24 hours', detail: 'Last warning: 2 hours ago', severity: 'high' },
    { name: 'BanEvader99', reason: 'Possible alt account', detail: 'Same HWID as BannedUser', severity: 'high' },
    { name: 'TempBanned1', reason: 'Ban expires soon', detail: 'Expires in 30 minutes', severity: 'medium' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold dark:text-white text-slate-900">Dashboard</h1>
        <p className="text-sm dark:text-slate-400 text-slate-500 mt-1">
          Overview of your moderation activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Players"
          value={stats.totalPlayers.toLocaleString()}
          color="blue"
        />
        <StatCard
          icon={UserCheck}
          label="Online Now"
          value={stats.onlineNow}
          trend="+12 from yesterday"
          color="green"
        />
        <StatCard
          icon={AlertTriangle}
          label="Warned Today"
          value={stats.warnedToday}
          color="amber"
        />
        <StatCard
          icon={Ban}
          label="Active Bans"
          value={stats.activeBans}
          color="red"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold dark:text-white text-slate-900">
              Recent Actions
            </h2>
            <Link to="/activity">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="divide-y dark:divide-dark-border divide-light-border">
            {recentActivity.map((activity, index) => (
              <RecentActivityItem key={index} {...activity} />
            ))}
          </div>
        </div>

        {/* Players Needing Attention */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold dark:text-white text-slate-900">
              Needs Attention
            </h2>
            <Badge variant="danger" dot>
              {playersNeedingAttention.length} players
            </Badge>
          </div>
          <div className="space-y-3">
            {playersNeedingAttention.map((player, index) => (
              <AttentionPlayer key={index} {...player} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold dark:text-white text-slate-900 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/players">
            <Button variant="secondary" icon={Users}>
              View All Players
            </Button>
          </Link>
          <Link to="/punishments">
            <Button variant="secondary" icon={Ban}>
              Active Punishments
            </Button>
          </Link>
          <Link to="/activity">
            <Button variant="secondary" icon={Clock}>
              Activity Log
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
