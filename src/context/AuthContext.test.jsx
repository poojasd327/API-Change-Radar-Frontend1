import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { authService, setStoredToken, getStoredToken } from '@/services/auth.service';

const TestConsumer = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    restorationError,
    login,
    register,
    logout,
    retryRestoration,
  } = useAuth();

  return (
    <div>
      <div data-testid="is-loading">{String(isLoading)}</div>
      <div data-testid="is-authenticated">{String(isAuthenticated)}</div>
      <div data-testid="user-email">{user?.email || 'none'}</div>
      <div data-testid="restoration-error">
        {restorationError ? restorationError.message : 'none'}
      </div>
      <button
        onClick={() => login({ email: 'alice@example.com', password: 'password123' })}
        data-testid="login-btn"
      >
        Login
      </button>
      <button
        onClick={() =>
          register({
            name: 'Alice',
            email: 'alice@example.com',
            password: 'password123',
          })
        }
        data-testid="register-btn"
      >
        Register
      </button>
      <button onClick={() => logout()} data-testid="logout-btn">
        Logout
      </button>
      <button onClick={() => retryRestoration()} data-testid="retry-btn">
        Retry
      </button>
    </div>
  );
};

describe('AuthContext and AuthProvider', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('initializes as unauthenticated when no token is present in sessionStorage', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user-email')).toHaveTextContent('none');
  });

  it('restores authenticated session when valid token exists on startup', async () => {
    setStoredToken('valid-existing-jwt');

    vi.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce({
      user: { id: 'user-1', email: 'restored@example.com', name: 'Restored User' },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user-email')).toHaveTextContent('restored@example.com');
  });

  it('clears token and marks unauthenticated if token is expired on startup (401)', async () => {
    setStoredToken('expired-jwt');

    const err = new Error('Authentication token has expired');
    err.statusCode = 401;
    vi.spyOn(authService, 'getCurrentUser').mockRejectedValueOnce(err);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(getStoredToken()).toBeNull();
  });

  it('retains token and sets restorationError if network is down on startup', async () => {
    setStoredToken('retained-jwt');

    const networkErr = {
      message: 'Unable to connect to backend',
      isNetworkError: true,
      statusCode: undefined,
    };
    vi.spyOn(authService, 'getCurrentUser').mockRejectedValueOnce(networkErr);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('restoration-error')).toHaveTextContent(
      'Unable to connect to backend'
    );
    // Token is safely retained for retry
    expect(getStoredToken()).toBe('retained-jwt');
  });

  it('successful login updates user, sets token, and marks authenticated', async () => {
    vi.spyOn(authService, 'login').mockResolvedValueOnce({
      message: 'Login successful',
      token: 'new-login-token',
      user: { id: 'u1', email: 'alice@example.com' },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user-email')).toHaveTextContent('alice@example.com');
    expect(getStoredToken()).toBe('new-login-token');
  });

  it('successful registration updates user, sets token, and marks authenticated', async () => {
    vi.spyOn(authService, 'register').mockResolvedValueOnce({
      message: 'User registered successfully',
      token: 'registered-jwt',
      user: { id: 'u2', email: 'alice@example.com', name: 'Alice' },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    await act(async () => {
      screen.getByTestId('register-btn').click();
    });

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user-email')).toHaveTextContent('alice@example.com');
    expect(getStoredToken()).toBe('registered-jwt');
  });

  it('logout clears user, marks unauthenticated, and discards token', async () => {
    setStoredToken('active-token');

    vi.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce({
      user: { id: 'user-1', email: 'active@example.com' },
    });
    vi.spyOn(authService, 'logout').mockResolvedValueOnce({ message: 'Logged out' });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    });

    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user-email')).toHaveTextContent('none');
    expect(getStoredToken()).toBeNull();
  });
});
