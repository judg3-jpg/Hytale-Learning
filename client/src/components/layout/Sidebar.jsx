import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  VolumeX, 
  Ban, 
  FileText, 
  ScrollText, 
  Settings,
  Shield
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Players', href: '/players', icon: Users },
  { name: 'Punishments', href: '/punishments', icon: Ban },
  { name: 'Activity Log', href: '/activity', icon: ScrollText },
]

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
]

function Sidebar() {
  return (
    <aside className="flex w-64 flex-col border-r transition-colors duration-200 dark:bg-dark-secondary dark:border-dark-border bg-light-secondary border-light-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b dark:border-dark-border border-light-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-primary to-accent-purple">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold dark:text-white text-slate-900">Hytale</h1>
          <p className="text-xs dark:text-slate-400 text-slate-500">Moderation Tool</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider dark:text-slate-500 text-slate-400">
          Main
        </div>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-accent-primary text-white'
                  : 'dark:text-slate-300 dark:hover:bg-dark-tertiary text-slate-600 hover:bg-light-tertiary'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}

        {/* Divider */}
        <div className="my-4 border-t dark:border-dark-border border-light-border" />

        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider dark:text-slate-500 text-slate-400">
          System
        </div>
        {secondaryNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-accent-primary text-white'
                  : 'dark:text-slate-300 dark:hover:bg-dark-tertiary text-slate-600 hover:bg-light-tertiary'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-4 dark:border-dark-border border-light-border">
        <div className="rounded-lg p-3 dark:bg-dark-tertiary bg-light-tertiary">
          <p className="text-xs dark:text-slate-400 text-slate-500">
            Version 1.0.0
          </p>
          <p className="text-xs dark:text-slate-500 text-slate-400 mt-1">
            Press <kbd className="px-1.5 py-0.5 rounded dark:bg-dark-border bg-slate-200 text-xs">?</kbd> for shortcuts
          </p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
