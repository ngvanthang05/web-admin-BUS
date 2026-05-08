import React from 'react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';

// Layout
import { Layout } from './components/Layout';

// Auth
import Login from './pages/Login';

// Pages
import Dashboard from './pages/Dashboard';
import SystemStats from './pages/SystemStats';
import { QuickStats } from './pages/QuickStats';
import { RoutesPage } from './pages/RoutesPage';
import { RouteForm } from './pages/RouteForm';
import { VehiclesPage } from './pages/VehiclesPage';
import { VehicleForm } from './pages/VehicleForm';
import { TripsPage } from './pages/TripsPage';
import TripForm from './pages/TripForm';
import TicketsPage from './pages/TicketsPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import RolesPage from './pages/RolesPage';
import PermissionsPage from './pages/PermissionsPage';
import StaffPage from './pages/StaffPage';
import StaffForm from './pages/StaffForm';


// Auth guard wrapper
function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout />;
}

const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/',
    Component: ProtectedLayout,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', Component: Dashboard },
      { path: 'stats', Component: SystemStats },
      { path: 'quick-stats', Component: QuickStats },

      // Tuyến xe
      { path: 'routes', Component: RoutesPage },
      { path: 'routes/new', Component: RouteForm },
      { path: 'routes/:id/edit', Component: RouteForm },

      // Xe
      { path: 'vehicles', Component: VehiclesPage },
      { path: 'vehicles/new', Component: VehicleForm },
      { path: 'vehicles/:id/edit', Component: VehicleForm },

      // Chuyến
      { path: 'trips', Component: TripsPage },
      { path: 'trips/new', Component: TripForm },
      { path: 'trips/:id/edit', Component: TripForm },

      // Vé / Booking
      { path: 'tickets', Component: TicketsPage },

      // Người dùng & phân quyền
      { path: 'users', Component: UsersPage },
      { path: 'users/permissions', Component: PermissionsPage },
      { path: 'permissions', Component: PermissionsPage },

      // Nhân viên
      { path: 'staff', Component: StaffPage },
      { path: 'staff/new', Component: StaffForm },
      { path: 'staff/:id/edit', Component: StaffForm },



      // Báo cáo
      { path: 'reports', Component: ReportsPage },
      { path: 'reports/detail', Component: ReportsPage },

      // Cài đặt
      { path: 'settings', Component: SettingsPage },

      // Roles
      { path: 'roles', Component: RolesPage },

      // Fallback
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
