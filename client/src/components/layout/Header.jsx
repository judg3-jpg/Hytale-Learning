import { useState, useEffect } from 'react'
import { Search, Sun, Moon, Bell, Command } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

function Header() {
  const { theme, toggleTheme, isDark } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus search on "/" or Ctrl+K
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && !isSearchFocused) {
        e.preventDefault()
        document.getElementById('search-input')?.focus()
      }
      
      // Toggle theme on Ctrl+D
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault()
        toggleTheme()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchFocused, toggleTheme])

  return (
    <header className="flex h-16 items-center justify-between border-b px-6 transition-colors duration-200 dark:bg-dark-secondary dark:border-dark-border bg-light-secondary border-light-border">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-slate-400 text-slate-500" />
          <input
            id="search-input"
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="input pl-10 pr-20"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded px-2 py-1 text-xs dark:bg-dark-border dark:text-slate-400 bg-slate-200 text-slate-500">
              <Command className="h-3 w-3" />
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* Notifications */}
        <button className="btn-ghost p-2.5 rounded-lg relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-danger" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn-ghost p-2.5 rounded-lg"
          title={`Switch to ${isDark ? 'light' : 'dark'} mode (Ctrl+D)`}
        >
          {isDark ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* User Avatar */}
        <div className="ml-2 flex items-center gap-3 pl-4 border-l dark:border-dark-border border-light-border">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent-primary to-accent-purple flex items-center justify-center">
            <span className="text-sm font-semibold text-white">A</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium dark:text-white text-slate-900">Admin</p>
            <p className="text-xs dark:text-slate-400 text-slate-500">Moderator</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
