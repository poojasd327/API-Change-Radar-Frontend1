import { describe, it, expect, vi, beforeEach } from 'vitest';
import { statusPageService } from './status-page.service';
import { apiClient } from '@/lib/api-client';
import { env } from '@/lib/env';

describe('statusPageService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('createStatusPage calls POST and returns created page', async () => {
    const payload = { title: 'Acme Status', description: 'System health' };
    const mockResponse = { message: 'Created', statusPage: { id: 'sp-1', ...payload } };

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockResponse });

    const result = await statusPageService.createStatusPage(payload);
    expect(apiClient.post).toHaveBeenCalledWith(env.VITE_API_STATUS_PAGE, payload);
    expect(result).toEqual(mockResponse);
  });

  it('getMyStatusPage calls GET and returns user status page configuration', async () => {
    const mockResponse = { statusPage: { id: 'sp-1', title: 'Acme Status' } };

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockResponse });

    const result = await statusPageService.getMyStatusPage();
    expect(apiClient.get).toHaveBeenCalledWith(env.VITE_API_STATUS_PAGE_ME);
    expect(result).toEqual(mockResponse);
  });

  it('updateStatusPage calls PATCH and returns updated configuration', async () => {
    const payload = { isPublished: true };
    const mockResponse = { statusPage: { id: 'sp-1', isPublished: true } };

    vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({ data: mockResponse });

    const result = await statusPageService.updateStatusPage(payload);
    expect(apiClient.patch).toHaveBeenCalledWith(env.VITE_API_STATUS_PAGE_ME, payload);
    expect(result).toEqual(mockResponse);
  });

  it('updateServices calls PUT with endpoint IDs and returns updated status page', async () => {
    const payload = { endpointIds: ['ep-1', 'ep-2'] };
    const mockResponse = { statusPage: { id: 'sp-1', endpointIds: payload.endpointIds } };

    vi.spyOn(apiClient, 'put').mockResolvedValueOnce({ data: mockResponse });

    const result = await statusPageService.updateServices(payload);
    expect(apiClient.put).toHaveBeenCalledWith(
      env.VITE_API_STATUS_PAGE_SERVICES,
      payload
    );
    expect(result).toEqual(mockResponse);
  });

  it('regenerateSlug calls POST and returns new slug', async () => {
    const mockResponse = { message: 'Slug updated', slug: 'acme-status-987' };

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockResponse });

    const result = await statusPageService.regenerateSlug();
    expect(apiClient.post).toHaveBeenCalledWith(env.VITE_API_STATUS_PAGE_REGENERATE_SLUG);
    expect(result).toEqual(mockResponse);
  });

  it('getPublicStatus calls GET with slug and returns public health summary', async () => {
    const mockPublic = {
      status: 'operational',
      services: [{ name: 'Core API', status: 'operational' }],
      updatedAt: '2026-10-23T10:00:00.000Z',
    };

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockPublic });

    const result = await statusPageService.getPublicStatus('acme-status');
    expect(apiClient.get).toHaveBeenCalledWith(
      `${env.VITE_API_PUBLIC_STATUS}/acme-status`
    );
    expect(result).toEqual(mockPublic);
  });

  it('catches and rethrows errors properly', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('Status page not found'));
    await expect(statusPageService.getMyStatusPage()).rejects.toThrow(
      'Status page not found'
    );
  });
});
