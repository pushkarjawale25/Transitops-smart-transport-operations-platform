import { useState } from 'react'
import { Bell, Sun, Moon, Search, ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/helpers'

const NOTIFICATIONS = [
  { id: 1, type: 'warning', message: "Driver Pradeep Sharma's license expired", time: '2h ago' },
  { id: 2, type: 'info', message: 'Trip T005 is ready for dispatch', time: '3h ago' },
  { id: 3, type: 'warning', message: "Driver Ganesh Joshi's license expires in 6 days", time: '5h ago' },
  { id: 4, type: 'success', message: 'Maintenance M001 completed for V004', time: '1d ago' },
]

export function Navbar({ title }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showNotif, setShowNotif] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
      <h1 className="text-base font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(s => !s); setShowProfile(false) }}
            className="relative w-9 h-9 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {showNotif && (
            <div className="absolute right-0 top-11 w-80 bg-card rounded-xl border border-border shadow-xl z-50 animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold">Notifications</p>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{NOTIFICATIONS.length}</span>
              </div>
              <div className="divide-y divide-border max-h-72 overflow-y-auto">
                {NOTIFICATIONS.map(n => (
                  <div key={n.id} className="px-4 py-3 hover:bg-accent/50 transition-colors">
                    <p className="text-sm text-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(s => !s); setShowNotif(false) }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
              {user?.avatar}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-foreground leading-tight">{user?.name}</p>
              <p className="text-xs text-muted-foreground leading-tight">{user?.role}</p>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
          {showProfile && (
            <div className="absolute right-0 top-11 w-48 bg-card rounded-xl border border-border shadow-xl z-50 animate-fade-in p-1">
              <button
                onClick={() => { navigate('/settings'); setShowProfile(false) }}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
              >Settings</button>
              <button
                onClick={() => { logout(); navigate('/login') }}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
              >Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
