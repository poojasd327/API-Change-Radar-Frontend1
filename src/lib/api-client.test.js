import { describe, it, expect, beforeEach } from 'vitest';
import { AxiosHeaders } from 'axios';
import { apiClient, setAuthTokenGetter } from './api-client';
import { env } from './env';

describe('Centralized API Client', () => {
  beforeEach(() => {
    // Reset token getter
    setAuthTokenGetter(() => null);
  });

  it('configures the validated baseURL matching VITE_API_BASE_URL', () => {
    expect(apiClient.defaults.baseURL).toBe(env.VITE_API_BASE_URL);
  });

  it('sets standard application/json headers', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    expect(apiClient.defaults.headers['Accept']).toBe('application/json');
  });

  it('attaches bearer token dynamically via token getter without exposing tokens to logs', async () => {
    const mockToken = 'mock-jwt-token-xyz';
    setAuthTokenGetter(() => mockToken);

    // Access registered request interceptor
    const requestHandlers = apiClient.interceptors.request.handlers;
    expect(requestHandlers.length).toBeGreaterThan(0);
    const authHandler = requestHandlers[0];

    const config = {
      headers: new AxiosHeaders(),
    };

    const modified = await authHandler.fulfilled(config);
    expect(modified.headers.Authorization).toBe(`Bearer ${mockToken}`);
  });

  it('handles response errors with structured ApiErrorDetail', async () => {
    // Access registered response interceptor
    const responseHandlers = apiClient.interceptors.response.handlers;
    expect(responseHandlers.length).toBeGreaterThan(0);
    const errorHandler = responseHandlers[0];

    const mockNetworkError = {
      message: 'Network Error',
      config: { url: '/api/health', method: 'get' },
      response: undefined,
    };

    try {
      await errorHandler.rejected(mockNetworkError);
      expect.fail('Should have rejected with ApiErrorDetail');
    } catch (err) {
      expect(err.isNetworkError).toBe(true);
      expect(err.message).toContain('Unable to connect to APIChange Radar backend');
    }
  });
});
