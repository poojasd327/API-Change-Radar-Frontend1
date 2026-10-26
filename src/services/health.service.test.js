import { describe, it, expect, vi, beforeEach } from 'vitest';
import { healthService } from './health.service';
import { apiClient } from '@/lib/api-client';
import { env } from '@/lib/env';

describe('healthService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getHealth successfully retrieves health data', async () => {
    const mockHealth = {
      status: 'ok',
      message: 'APIChange Radar service is running',
      timestamp: '2026-10-23T10:00:00.000Z',
      uptime: 124,
      environment: 'development',
    };

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockHealth });

    const result = await healthService.getHealth();
    expect(apiClient.get).toHaveBeenCalledWith(env.VITE_API_HEALTH);
    expect(result).toEqual(mockHealth);
  });

  it('getHealth catches and re-throws when request fails', async () => {
    const mockError = new Error('Service unavailable');
    vi.spyOn(apiClient, 'get').mockRejectedValueOnce(mockError);

    await expect(healthService.getHealth()).rejects.toThrow('Service unavailable');
  });
});
