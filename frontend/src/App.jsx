import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { AppProvider } from '@/context/AppContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { AppLayout } from '@/layouts/AppLayout'
import { ProtectedRoute } from '@/layouts/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import VehiclesPage from '@/pages/VehiclesPage'
import DriversPage from '@/pages/DriversPage'
import TripsPage from '@/pages/TripsPage'
import MaintenancePage from '@/pages/MaintenancePage'
import FuelPage from '@/pages/FuelPage'
import ExpensesPage from '@/pages/ExpensesPage'
import ReportsPage from '@/pages/ReportsPage'
import SettingsPage from '@/pages/SettingsPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Protected App Shell */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route element={<ProtectedRoute requiredPermission="vehicles" />}>
                    <Route path="/vehicles" element={<VehiclesPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="drivers" />}>
                    <Route path="/drivers" element={<DriversPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="trips" />}>
                    <Route path="/trips" element={<TripsPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="maintenance" />}>
                    <Route path="/maintenance" element={<MaintenancePage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="fuel" />}>
                    <Route path="/fuel" element={<FuelPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="expenses" />}>
                    <Route path="/expenses" element={<ExpensesPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredPermission="reports" />}>
                    <Route path="/reports" element={<ReportsPage />} />
                  </Route>
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
