import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Truck, Users, Route, Wrench, Fuel,
  Receipt, BarChart3, Settings, LogOut, ChevronLeft,
  ChevronRight, Zap
} from 'lucide-react'
import { useAuth, ROLE_PERMISSIONS } from '@/context/AuthContext'
import { cn } from '@/utils/helpers'

const ALL_NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { key: 'vehicles', label: 'Vehicles', icon: Truck, path: '/vehicles' },
  { key: 'drivers', label: 'Drivers', icon: Users, path: '/drivers' },
  { key: 'trips', label: 'Trips', icon: Route, path: '/trips' },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench, path: '/maintenance' },
  { key: 'fuel', label: 'Fuel Logs', icon: Fuel, path: '/fuel' },
  { key: 'expenses', label: 'Expenses', icon: Receipt, path: '/expenses' },
  { key: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
  { key: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
]

export function Sidebar({ collapsed, onToggle }) {
  const { user, logout, hasPermission } = useAuth()
  const navigate = useNavigate()

  const navItems = ALL_NAV.filter(item => hasPermission(item.key))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className={cn(
      'relative flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out h-full',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-border', collapsed && 'justify-center px-2')}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <Zap className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-foreground leading-tight">TransitOps</p>
            <p className="text-xs text-muted-foreground">Smart Transport</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ key, label, icon: Icon, path }) => (
          <NavLink
            key={key}
            to={path}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-border p-2">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.avatar}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium',
            'text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center hover:bg-accent transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  )
}
