import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checksService } from './checks.service';
import { apiClient } from '@/lib/api-client';
import { env } from '@/lib/env';

describe('checksService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getCheckHistory calls GET with pagination and returns check logs', async () => {
    const mockData = {
      checks: [{ id: 'chk-1', status: 'healthy', responseTimeMs: 42 }],
      pagination: { total: 1, page: 1, limit: 20 },
    };

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockData });

    const result = await checksService.getCheckHistory({ page: 1, limit: 20 });
    expect(apiClient.get).toHaveBeenCalledWith(env.VITE_API_CHECKS_HISTORY, {
      params: { page: 1, limit: 20 },
    });
    expect(result).toEqual(mockData);
  });

  it('getLatestCheck calls GET and returns the latest check run', async () => {
    const mockCheck = {
      check: { id: 'chk-latest', status: 'breaking_change_detected' },
    };

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockCheck });

    const result = await checksService.getLatestCheck();
    expect(apiClient.get).toHaveBeenCalledWith(env.VITE_API_CHECKS_LATEST);
    expect(result).toEqual(mockCheck);
  });

  it('runMockCheck calls POST with options and returns run result', async () => {
    const payload = { scenario: 'schema_drift', delay: 100 };
    const mockResponse = { success: true, result: { driftDetected: true } };

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockResponse });

    const result = await checksService.runMockCheck(payload);
    expect(apiClient.post).toHaveBeenCalledWith(
      env.VITE_API_CHECKS_MOCK_PRODUCT,
      payload
    );
    expect(result).toEqual(mockResponse);
  });

  it('catches and rethrows errors properly', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('Server error'));
    await expect(checksService.getCheckHistory()).rejects.toThrow('Server error');
  });
});
