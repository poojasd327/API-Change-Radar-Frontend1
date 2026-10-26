import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  authService,
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  TOKEN_STORAGE_KEY,
} from './auth.service';
import { apiClient } from '@/lib/api-client';
import { env } from '@/lib/env';

describe('authService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Session Storage Token Management', () => {
    it('sets, gets, and clears token in sessionStorage', () => {
      expect(getStoredToken()).toBeNull();

      setStoredToken('test-jwt-token');
      expect(getStoredToken()).toBe('test-jwt-token');
      expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBe('test-jwt-token');

      clearStoredToken();
      expect(getStoredToken()).toBeNull();
      expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    });

    it('clears token when setStoredToken is called with null or empty', () => {
      setStoredToken('test-jwt-token');
      expect(getStoredToken()).toBe('test-jwt-token');

      setStoredToken(null);
      expect(getStoredToken()).toBeNull();
    });
  });

  describe('API Calls', () => {
    it('register calls POST VITE_API_AUTH_REGISTER with payload and returns data', async () => {
      const mockResponse = {
        data: {
          message: 'User registered successfully',
          user: { id: 'user-1', name: 'Alice', email: 'alice@example.com' },
          token: 'jwt-123',
        },
      };

      vi.spyOn(apiClient, 'post').mockResolvedValueOnce(mockResponse);

      const result = await authService.register({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'password123',
      });

      expect(apiClient.post).toHaveBeenCalledWith(env.VITE_API_AUTH_REGISTER, {
        name: 'Alice',
        email: 'alice@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('login calls POST VITE_API_AUTH_LOGIN with credentials and returns data', async () => {
      const mockResponse = {
        data: {
          message: 'Login successful',
          user: { id: 'user-1', email: 'alice@example.com' },
          token: 'jwt-123',
        },
      };

      vi.spyOn(apiClient, 'post').mockResolvedValueOnce(mockResponse);

      const result = await authService.login({
        email: 'alice@example.com',
        password: 'password123',
      });

      expect(apiClient.post).toHaveBeenCalledWith(env.VITE_API_AUTH_LOGIN, {
        email: 'alice@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('getCurrentUser calls GET VITE_API_AUTH_ME and returns profile data', async () => {
      const mockResponse = {
        data: {
          user: { id: 'user-1', email: 'alice@example.com', name: 'Alice' },
        },
      };

      vi.spyOn(apiClient, 'get').mockResolvedValueOnce(mockResponse);

      const result = await authService.getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith(env.VITE_API_AUTH_ME);
      expect(result).toEqual(mockResponse.data);
    });

    it('logout calls POST VITE_API_AUTH_LOGOUT and resolves even if request fails', async () => {
      vi.spyOn(apiClient, 'post').mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.logout();

      expect(apiClient.post).toHaveBeenCalledWith(env.VITE_API_AUTH_LOGOUT);
      expect(result).toEqual({ message: 'Logged out locally' });
    });
  });
});
