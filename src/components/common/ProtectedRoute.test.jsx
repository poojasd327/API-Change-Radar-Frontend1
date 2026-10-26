import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthContext } from '@/context/AuthContext';

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to the specified login path', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={false} redirectPath="/login">
                <div>Protected Dashboard Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Dashboard Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={true} redirectPath="/login">
                <div>Protected Dashboard Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Dashboard Content')).toBeInTheDocument();
  });

  it('renders loading state when session verification is in progress', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute isLoading={true}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-route-loading')).toBeInTheDocument();
    expect(screen.getByText(/Verifying authenticated session.../i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders temporary backend unreachable error state with retry button', () => {
    const mockRetry = vi.fn();
    const mockLogout = vi.fn();

    const authValue = {
      isAuthenticated: false,
      isLoading: false,
      restorationError: { message: 'Network offline' },
      retryRestoration: mockRetry,
      logout: mockLogout,
    };

    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('protected-route-error')).toBeInTheDocument();
    expect(screen.getByText(/Backend Connection Unavailable/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry Connection/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In Anew/i })).toBeInTheDocument();
  });
});
