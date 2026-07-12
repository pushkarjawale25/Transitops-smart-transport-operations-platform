import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const MOCK_USERS = [
  { id: 1, name: 'Arjun Mehta', email: 'fleet@transitops.com', password: 'fleet123', role: 'Fleet Manager', avatar: 'AM' },
  { id: 2, name: 'Priya Sharma', email: 'dispatch@transitops.com', password: 'dispatch123', role: 'Dispatcher', avatar: 'PS' },
  { id: 3, name: 'Rahul Verma', email: 'safety@transitops.com', password: 'safety123', role: 'Safety Officer', avatar: 'RV' },
  { id: 4, name: 'Sneha Patel', email: 'finance@transitops.com', password: 'finance123', role: 'Financial Analyst', avatar: 'SP' },
]

// Role-based nav permissions
export const ROLE_PERMISSIONS = {
  'Fleet Manager': ['dashboard', 'vehicles', 'drivers', 'trips', 'maintenance', 'fuel', 'expenses', 'reports', 'settings'],
  'Dispatcher': ['dashboard', 'vehicles', 'drivers', 'trips', 'fuel', 'settings'],
  'Safety Officer': ['dashboard', 'vehicles', 'drivers', 'maintenance', 'settings'],
  'Financial Analyst': ['dashboard', 'fuel', 'expenses', 'reports', 'settings'],
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('transitops_user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const login = (email, password) => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password)
    if (!found) throw new Error('Invalid credentials')
    const { password: _, ...safe } = found
    setUser(safe)
    localStorage.setItem('transitops_user', JSON.stringify(safe))
    return safe
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('transitops_user')
  }

  const hasPermission = (page) => {
    if (!user) return false
    return ROLE_PERMISSIONS[user.role]?.includes(page) ?? false
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { MOCK_USERS }
