import { useState } from 'react'
import { 
  Sun, 
  Moon, 
  Monitor,
  Bell,
  Keyboard,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  AlertTriangle
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { Button, Input, Modal } from '../components/ui'

// Settings Section
function SettingsSection({ title, description, children }) {
  return (
    <div className="card p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold dark:text-white text-slate-900">{title}</h3>
        {description && (
          <p className="text-sm dark:text-slate-400 text-slate-500 mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

// Setting Item
function SettingItem({ icon: Icon, title, description, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b last:border-0 dark:border-dark-border border-light-border">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="p-2 rounded-lg dark:bg-dark-tertiary bg-light-tertiary">
            <Icon className="h-5 w-5 dark:text-slate-400 text-slate-500" />
          </div>
        )}
        <div>
          <p className="font-medium dark:text-slate-200 text-slate-700">{title}</p>
          {description && (
            <p className="text-sm dark:text-slate-400 text-slate-500">{description}</p>
          )}
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}

// Theme Option
function ThemeOption({ icon: Icon, label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-accent-primary dark:bg-accent-primary/10 bg-accent-primary/5'
          : 'border-transparent dark:bg-dark-tertiary bg-light-tertiary dark:hover:bg-dark-border hover:bg-slate-200'
      }`}
    >
      <Icon className={`h-6 w-6 ${selected ? 'text-accent-primary' : 'dark:text-slate-400 text-slate-500'}`} />
      <span className={`text-sm font-medium ${selected ? 'text-accent-primary' : 'dark:text-slate-300 text-slate-600'}`}>
        {label}
      </span>
    </button>
  )
}

// Keyboard Shortcut Item
function ShortcutItem({ keys, action }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm dark:text-slate-300 text-slate-600">{action}</span>
      <div className="flex gap-1">
        {keys.map((key, i) => (
          <span key={i}>
            <kbd className="px-2 py-1 rounded text-xs dark:bg-dark-border dark:text-slate-300 bg-slate-200 text-slate-600">
              {key}
            </kbd>
            {i < keys.length - 1 && <span className="mx-1 dark:text-slate-500 text-slate-400">+</span>}
          </span>
        ))}
      </div>
    </div>
  )
}

function Settings() {
  const { theme, setTheme, isDark } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null })

  const shortcuts = [
    { keys: ['/', 'Ctrl', 'K'], action: 'Focus search' },
    { keys: ['Esc'], action: 'Close modal / Clear selection' },
    { keys: ['↑', '↓'], action: 'Navigate list' },
    { keys: ['W'], action: 'Warn selected player' },
    { keys: ['M'], action: 'Mute selected player' },
    { keys: ['B'], action: 'Ban selected player' },
    { keys: ['N'], action: 'Add note' },
    { keys: ['Ctrl', 'D'], action: 'Toggle dark/light mode' },
    { keys: ['?'], action: 'Show shortcuts' },
  ]

  const handleExportData = () => {
    console.log('Exporting data...')
    // Will implement data export
  }

  const handleImportData = () => {
    console.log('Importing data...')
    // Will implement data import
  }

  const handleClearData = () => {
    setConfirmModal({ isOpen: true, action: 'clear' })
  }

  const confirmAction = () => {
    if (confirmModal.action === 'clear') {
      console.log('Clearing data...')
      // Will implement data clear
    }
    setConfirmModal({ isOpen: false, action: null })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold dark:text-white text-slate-900">Settings</h1>
        <p className="text-sm dark:text-slate-400 text-slate-500 mt-1">
          Customize your moderation tool experience
        </p>
      </div>

      {/* Appearance */}
      <SettingsSection title="Appearance" description="Customize how the app looks">
        <div className="grid grid-cols-3 gap-4">
          <ThemeOption
            icon={Moon}
            label="Dark"
            selected={theme === 'dark'}
            onClick={() => setTheme('dark')}
          />
          <ThemeOption
            icon={Sun}
            label="Light"
            selected={theme === 'light'}
            onClick={() => setTheme('light')}
          />
          <ThemeOption
            icon={Monitor}
            label="System"
            selected={theme === 'system'}
            onClick={() => setTheme('system')}
          />
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title="Notifications" description="Configure notification preferences">
        <SettingItem
          icon={Bell}
          title="Enable Notifications"
          description="Show desktop notifications for important events"
        >
          <button
            onClick={() => setNotifications(!notifications)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              notifications ? 'bg-accent-primary' : 'dark:bg-dark-border bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                notifications ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </SettingItem>
      </SettingsSection>

      {/* Keyboard Shortcuts */}
      <SettingsSection title="Keyboard Shortcuts" description="Quick actions for power users">
        <div className="divide-y dark:divide-dark-border divide-light-border">
          {shortcuts.map((shortcut, index) => (
            <ShortcutItem key={index} {...shortcut} />
          ))}
        </div>
      </SettingsSection>

      {/* Data Management */}
      <SettingsSection title="Data Management" description="Export, import, or clear your data">
        <div className="space-y-4">
          <SettingItem
            icon={Download}
            title="Export Data"
            description="Download all your data as a JSON file"
          >
            <Button variant="secondary" size="sm" icon={Download} onClick={handleExportData}>
              Export
            </Button>
          </SettingItem>

          <SettingItem
            icon={Upload}
            title="Import Data"
            description="Import data from a JSON file"
          >
            <Button variant="secondary" size="sm" icon={Upload} onClick={handleImportData}>
              Import
            </Button>
          </SettingItem>

          <SettingItem
            icon={Trash2}
            title="Clear All Data"
            description="Permanently delete all data"
          >
            <Button variant="danger" size="sm" icon={Trash2} onClick={handleClearData}>
              Clear
            </Button>
          </SettingItem>
        </div>
      </SettingsSection>

      {/* About */}
      <SettingsSection title="About">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-purple flex items-center justify-center">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-semibold dark:text-white text-slate-900">Hytale Moderation Tool</p>
            <p className="text-sm dark:text-slate-400 text-slate-500">Version 1.0.0</p>
          </div>
        </div>
      </SettingsSection>

      {/* Confirm Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null })}
        title="Confirm Action"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <p className="text-sm text-red-400">
              This action cannot be undone. All data will be permanently deleted.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmModal({ isOpen: false, action: null })}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmAction}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Settings
