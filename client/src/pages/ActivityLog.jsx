import { useState } from 'react'
import { 
  Search, 
  Filter,
  LogIn,
  LogOut,
  MessageSquare,
  Terminal,
  AlertTriangle,
  FileText,
  Calendar,
  Clock
} from 'lucide-react'
import { Button, Input, Badge } from '../components/ui'
import { formatDateTime, formatRelativeTime } from '../utils/formatters'
import { ACTIVITY_TYPE_COLORS } from '../utils/constants'

// Activity Icon
function ActivityIcon({ type }) {
  const icons = {
    join: LogIn,
    leave: LogOut,
    chat: MessageSquare,
    command: Terminal,
    punishment: AlertTriangle,
    note: FileText,
  }
  
  const Icon = icons[type] || Clock
  
  const colorClasses = {
    join: 'bg-green-500/20 text-green-400',
    leave: 'bg-slate-500/20 text-slate-400',
    chat: 'bg-cyan-500/20 text-cyan-400',
    command: 'bg-slate-500/20 text-slate-400',
    punishment: 'bg-red-500/20 text-red-400',
    note: 'bg-amber-500/20 text-amber-400',
  }

  return (
    <div className={`p-2 rounded-lg ${colorClasses[type]}`}>
      <Icon className="h-4 w-4" />
    </div>
  )
}

// Activity Item
function ActivityItem({ activity }) {
  const typeLabels = {
    join: 'joined the server',
    leave: 'left the server',
    chat: 'sent a message',
    command: 'used a command',
    punishment: 'received a punishment',
    note: 'had a note added',
  }

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl transition-colors dark:hover:bg-dark-tertiary hover:bg-light-tertiary">
      <ActivityIcon type={activity.type} />
      <div className="flex-1 min-w-0">
        <p className="dark:text-slate-200 text-slate-700">
          <span className="font-medium">{activity.playerName}</span>{' '}
          <span className="dark:text-slate-400 text-slate-500">{typeLabels[activity.type]}</span>
        </p>
        {activity.details && (
          <p className="text-sm dark:text-slate-400 text-slate-500 mt-1 truncate">
            {activity.details}
          </p>
        )}
        <p className="text-xs dark:text-slate-500 text-slate-400 mt-1">
          {formatRelativeTime(activity.timestamp)} • {formatDateTime(activity.timestamp)}
        </p>
      </div>
      <Badge variant={ACTIVITY_TYPE_COLORS[activity.type]}>
        {activity.type}
      </Badge>
    </div>
  )
}

// Date Separator
function DateSeparator({ date }) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex-1 h-px dark:bg-dark-border bg-light-border" />
      <div className="flex items-center gap-2 text-sm dark:text-slate-400 text-slate-500">
        <Calendar className="h-4 w-4" />
        {date}
      </div>
      <div className="flex-1 h-px dark:bg-dark-border bg-light-border" />
    </div>
  )
}

function ActivityLog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  // Mock data
  const activities = [
    { id: 1, type: 'punishment', playerName: 'Cheater123', details: 'Banned for: Using modified client', timestamp: new Date(Date.now() - 120000) },
    { id: 2, type: 'join', playerName: 'ProGamer99', details: null, timestamp: new Date(Date.now() - 300000) },
    { id: 3, type: 'chat', playerName: 'PlayerOne', details: 'Hello everyone!', timestamp: new Date(Date.now() - 600000) },
    { id: 4, type: 'punishment', playerName: 'ToxicGamer', details: 'Muted for: Excessive toxicity', timestamp: new Date(Date.now() - 1800000) },
    { id: 5, type: 'leave', playerName: 'CasualPlayer', details: null, timestamp: new Date(Date.now() - 3600000) },
    { id: 6, type: 'command', playerName: 'ProGamer99', details: '/help', timestamp: new Date(Date.now() - 7200000) },
    { id: 7, type: 'note', playerName: 'SuspiciousPlayer', details: 'Possible alt account', timestamp: new Date(Date.now() - 10800000) },
    { id: 8, type: 'join', playerName: 'NewPlayer123', details: null, timestamp: new Date(Date.now() - 86400000) },
    { id: 9, type: 'punishment', playerName: 'Spammer99', details: 'Warned for: Spam', timestamp: new Date(Date.now() - 90000000) },
    { id: 10, type: 'leave', playerName: 'NewPlayer123', details: null, timestamp: new Date(Date.now() - 172800000) },
  ]

  const activityTypes = ['all', 'join', 'leave', 'chat', 'command', 'punishment', 'note']

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (activity.details?.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = typeFilter === 'all' || activity.type === typeFilter
    return matchesSearch && matchesType
  })

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(activity)
    return groups
  }, {})

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold dark:text-white text-slate-900">Activity Log</h1>
        <p className="text-sm dark:text-slate-400 text-slate-500 mt-1">
          Monitor all player and moderation activity
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search by player or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {activityTypes.map((type) => (
            <Button
              key={type}
              variant={typeFilter === type ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTypeFilter(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="card p-2">
        {Object.entries(groupedActivities).length > 0 ? (
          Object.entries(groupedActivities).map(([date, dateActivities], index) => (
            <div key={date}>
              {index > 0 && <DateSeparator date={date} />}
              {index === 0 && <DateSeparator date={date} />}
              <div className="space-y-1">
                {dateActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto mb-3 dark:text-slate-600 text-slate-300" />
            <p className="dark:text-slate-400 text-slate-500">No activity found</p>
          </div>
        )}
      </div>

      {/* Load More */}
      {Object.keys(groupedActivities).length > 0 && (
        <div className="flex justify-center">
          <Button variant="secondary">
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}

export default ActivityLog
