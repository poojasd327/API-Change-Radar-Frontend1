import { describe, it, expect, vi, beforeEach } from 'vitest';
import { endpointsService } from './endpoints.service';
import { apiClient } from '@/lib/api-client';
import { env } from '@/lib/env';

describe('endpointsService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getEndpoints calls GET with query parameters and returns data', async () => {
    const mockData = {
      endpoints: [
        { id: 'ep-1', name: 'User Service API', url: 'https://api.example.com/users' },
      ],
      pagination: { total: 1, page: 1, limit: 20 },
    };

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockData });

    const result = await endpointsService.getEndpoints({ page: 1, limit: 10 });
    expect(apiClient.get).toHaveBeenCalledWith(env.VITE_API_ENDPOINTS, {
      params: { page: 1, limit: 10 },
    });
    expect(result).toEqual(mockData);
  });

  it('getEndpointById calls GET with endpoint ID and returns data', async () => {
    const mockEndpoint = {
      endpoint: { id: 'ep-123', name: 'Order Service' },
    };

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockEndpoint });

    const result = await endpointsService.getEndpointById('ep-123');
    expect(apiClient.get).toHaveBeenCalledWith(`${env.VITE_API_ENDPOINTS}/ep-123`);
    expect(result).toEqual(mockEndpoint);
  });

  it('createEndpoint calls POST with payload and returns new endpoint', async () => {
    const payload = {
      name: 'Auth API',
      url: 'https://auth.example.com/v1',
      method: 'POST',
      isActive: true,
    };
    const mockResponse = {
      message: 'Endpoint created',
      endpoint: { id: 'ep-456', ...payload },
    };

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockResponse });

    const result = await endpointsService.createEndpoint(payload);
    expect(apiClient.post).toHaveBeenCalledWith(env.VITE_API_ENDPOINTS, payload);
    expect(result).toEqual(mockResponse);
  });

  it('updateEndpoint calls PATCH with payload and returns updated endpoint', async () => {
    const payload = { name: 'Updated Auth API', isActive: false };
    const mockResponse = {
      message: 'Endpoint updated',
      endpoint: { id: 'ep-456', ...payload },
    };

    vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({ data: mockResponse });

    const result = await endpointsService.updateEndpoint('ep-456', payload);
    expect(apiClient.patch).toHaveBeenCalledWith(
      `${env.VITE_API_ENDPOINTS}/ep-456`,
      payload
    );
    expect(result).toEqual(mockResponse);
  });

  it('catches and rethrows errors properly', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('Network error'));
    await expect(endpointsService.getEndpoints()).rejects.toThrow('Network error');
  });
});
