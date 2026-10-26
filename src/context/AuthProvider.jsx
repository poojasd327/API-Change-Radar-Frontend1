import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from './auth-context-base';
import {
  authService,
  getStoredToken,
  setStoredToken,
  clearStoredToken,
} from '@/services/auth.service';
import { setUnauthorizedHandler } from '@/lib/api-client';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [restorationError, setRestorationError] = useState(null);

  /**
   * Restore user session on application startup if a token is present in sessionStorage.
   *
   * FAULT-TOLERANCE INVARIANT:
   * 1. 401 Unauthorized => Token is expired/invalid; clear session and redirect.
   * 2. Network / 503 error => Backend is temporarily unreachable; DO NOT silently
   *    destroy the session or treat user as logged out. Retain token and allow retry.
   */
  const restoreSession = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      setRestorationError(null);
      return;
    }

    setIsLoading(true);
    setRestorationError(null);

    try {
      const data = await authService.getCurrentUser();
      setUser(data.user);
      setRestorationError(null);
    } catch (err) {
      if (err.statusCode === 401) {
        // Expired or invalid token => clear session
        clearStoredToken();
        setUser(null);
        setRestorationError(null);
      } else {
        // Temporary network failure or 503 => retain token, surface retryable error
        setRestorationError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Wire up global 401 handler for subsequent API requests
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearStoredToken();
      setUser(null);
    });
  }, []);

  // Run restoration once on mount
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /**
   * Authenticate with email & password.
   */
  const login = useCallback(async ({ email, password }) => {
    const data = await authService.login({ email, password });
    if (data.token) {
      setStoredToken(data.token);
    }
    setUser(data.user);
    setRestorationError(null);
    return data;
  }, []);

  /**
   * Register a new individual user account.
   */
  const register = useCallback(async ({ name, email, password }) => {
    const data = await authService.register({ name, email, password });
    if (data.token) {
      setStoredToken(data.token);
    }
    setUser(data.user);
    setRestorationError(null);
    return data;
  }, []);

  /**
   * Log out current user session.
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearStoredToken();
      setUser(null);
      setRestorationError(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      restorationError,
      login,
      register,
      logout,
      retryRestoration: restoreSession,
    }),
    [user, isLoading, restorationError, login, register, logout, restoreSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
