import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { AuthContext } from '@/context/AuthContext';

describe('AuthLayout', () => {
  it('redirects authenticated users to dashboard', () => {
    const authValue = {
      isAuthenticated: true,
      isLoading: false,
    };

    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<div>Login Form</div>} />
            </Route>
            <Route path="/dashboard" element={<div>Dashboard Screen</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.queryByText('Login Form')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard Screen')).toBeInTheDocument();
  });

  it('renders loading indicator while session is restoring', () => {
    const authValue = {
      isAuthenticated: false,
      isLoading: true,
    };

    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<div>Login Form</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('auth-layout-loading')).toBeInTheDocument();
    expect(screen.queryByText('Login Form')).not.toBeInTheDocument();
  });

  it('renders outlet form when visitor is unauthenticated', () => {
    const authValue = {
      isAuthenticated: false,
      isLoading: false,
    };

    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<div>Login Form Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Login Form Content')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent(/APIChange/i);
  });
});
