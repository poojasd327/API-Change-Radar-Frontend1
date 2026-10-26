import { describe, it, expect, vi, beforeEach } from 'vitest';
import { incidentsService } from './incidents.service';
import { apiClient } from '@/lib/api-client';
import { env } from '@/lib/env';

describe('incidentsService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getIncidents calls GET with filters and returns incidents', async () => {
    const mockData = {
      incidents: [
        {
          id: 'inc-1',
          title: 'Schema Drift on /users',
          status: 'open',
          severity: 'high',
        },
      ],
      pagination: { total: 1, page: 1, limit: 10 },
    };

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockData });

    const result = await incidentsService.getIncidents({
      status: 'open',
      page: 1,
      limit: 10,
    });
    expect(apiClient.get).toHaveBeenCalledWith(env.VITE_API_INCIDENTS, {
      params: { status: 'open', page: 1, limit: 10 },
    });
    expect(result).toEqual(mockData);
  });

  it('getIncidentById calls GET with incident ID and returns details', async () => {
    const mockIncident = {
      incident: { id: 'inc-101', title: 'Removed field: price' },
    };

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockIncident });

    const result = await incidentsService.getIncidentById('inc-101');
    expect(apiClient.get).toHaveBeenCalledWith(`${env.VITE_API_INCIDENTS}/inc-101`);
    expect(result).toEqual(mockIncident);
  });

  it('catches and rethrows errors properly', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('Incident not found'));
    await expect(incidentsService.getIncidentById('missing')).rejects.toThrow(
      'Incident not found'
    );
  });
});
