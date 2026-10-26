import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { StarterScreen } from '@/components/common/StarterScreen';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { EndpointsPage } from '@/features/endpoints/EndpointsPage';
import { ChecksPage } from '@/features/checks/ChecksPage';
import { IncidentsPage } from '@/features/incidents/IncidentsPage';
import { StatusPageSettings } from '@/features/status-page/StatusPageSettings';
import { NotFoundPage } from '@/components/common/NotFoundPage';

/**
 * Frontend route definitions.
 *
 * Route Strategy:
 * 1. Root ("/") renders the Stage 4 Starter Screen with live backend health probing.
 * 2. Public auth routes ("/login", "/register") use AuthLayout.
 * 3. Protected dashboard routes ("/dashboard", etc.) use ProtectedRoute wrapper + DashboardLayout.
 *    For Stage 4 development preview, isAuthenticated can be toggled or viewed directly.
 */

export const router = createBrowserRouter([
  {
    path: '/',
    element: <StarterScreen />,
  },
  // Public Authentication Routes
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
  // Protected Dashboard Routes
  {
    element: (
      <ProtectedRoute redirectPath="/login">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/endpoints',
        element: <EndpointsPage />,
      },
      {
        path: '/checks',
        element: <ChecksPage />,
      },
      {
        path: '/incidents',
        element: <IncidentsPage />,
      },
      {
        path: '/status-page',
        element: <StatusPageSettings />,
      },
    ],
  },
  // Catch-all
  {
    path: '/404',
    element: <NotFoundPage />,
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
]);
