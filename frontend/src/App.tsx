import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { DataProvider } from '@/context/DataContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { LoginPage } from '@/pages/LoginPage';
import { Toaster } from '@/components/ui/toaster';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { VehiclesPage } from '@/pages/VehiclesPage';
import { DriversPage } from '@/pages/DriversPage';
import { TripsPage } from '@/pages/TripsPage';
import { MaintenancePage } from '@/pages/MaintenancePage';
import { FuelLogsPage } from '@/pages/FuelLogsPage';
import { ExpensesPage } from '@/pages/ExpensesPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import type { Role } from '@/types';
import type { ReactNode } from 'react';

/*
  ProtectedRoute checks:
  1. Auth is still loading → show spinner
  2. User not logged in   → redirect to /login
  3. Role not allowed     → redirect to /dashboard
*/
function ProtectedRoute({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/*
  AnyAuthRoute — wraps routes accessible to any authenticated user (dashboard, settings).
*/
function AnyAuthRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Toaster />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected routes (wrapped by DashboardLayout for sidebar + topbar) */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<AnyAuthRoute><DashboardPage /></AnyAuthRoute>} />
                <Route path="/vehicles"    element={<ProtectedRoute roles={['Fleet Manager', 'Dispatcher', 'Safety Officer']}><VehiclesPage /></ProtectedRoute>} />
                <Route path="/drivers"     element={<ProtectedRoute roles={['Fleet Manager', 'Dispatcher', 'Safety Officer']}><DriversPage /></ProtectedRoute>} />
                <Route path="/trips"       element={<ProtectedRoute roles={['Fleet Manager', 'Dispatcher']}><TripsPage /></ProtectedRoute>} />
                <Route path="/maintenance" element={<ProtectedRoute roles={['Fleet Manager', 'Safety Officer']}><MaintenancePage /></ProtectedRoute>} />
                <Route path="/fuel"        element={<ProtectedRoute roles={['Fleet Manager', 'Financial Analyst']}><FuelLogsPage /></ProtectedRoute>} />
                <Route path="/expenses"    element={<ProtectedRoute roles={['Fleet Manager', 'Financial Analyst']}><ExpensesPage /></ProtectedRoute>} />
                <Route path="/reports"     element={<ProtectedRoute roles={['Fleet Manager', 'Financial Analyst']}><ReportsPage /></ProtectedRoute>} />
                <Route path="/settings"    element={<AnyAuthRoute><SettingsPage /></AnyAuthRoute>} />
              </Route>

              {/* Anything else → go to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
