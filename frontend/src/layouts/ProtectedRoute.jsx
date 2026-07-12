import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute({ requiredPermission }) {
  const { user, hasPermission } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}
