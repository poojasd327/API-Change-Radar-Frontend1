import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contractsService } from './contracts.service';
import { apiClient } from '@/lib/api-client';
import { env } from '@/lib/env';

describe('contractsService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getContracts calls GET /api/contracts with params', async () => {
    const mockData = {
      data: [{ _id: 'c-1', name: 'Contract 1', isApproved: false }],
      pagination: { total: 1, page: 1, limit: 20 },
    };

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockData });

    const result = await contractsService.getContracts({ endpointId: 'ep-1' });
    expect(apiClient.get).toHaveBeenCalledWith(env.VITE_API_CONTRACTS, {
      params: { endpointId: 'ep-1' },
    });
    expect(result).toEqual(mockData);
  });

  it('getContractById calls GET /api/contracts/:id', async () => {
    const mockContract = { _id: 'c-1', name: 'Contract 1' };
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockContract });

    const result = await contractsService.getContractById('c-1');
    expect(apiClient.get).toHaveBeenCalledWith(`${env.VITE_API_CONTRACTS}/c-1`);
    expect(result).toEqual(mockContract);
  });

  it('createContract calls POST /api/contracts with payload', async () => {
    const payload = {
      endpointId: 'ep-1',
      name: 'GitHub Schema',
      schema: { type: 'object' },
    };
    const mockResponse = { message: 'Created', contract: { _id: 'c-1' } };
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockResponse });

    const result = await contractsService.createContract(payload);
    expect(apiClient.post).toHaveBeenCalledWith(env.VITE_API_CONTRACTS, payload);
    expect(result).toEqual(mockResponse);
  });

  it('validateContract calls POST /api/contracts/validate with schema and sample', async () => {
    const payload = {
      schema: { type: 'object' },
      sampleData: { test: true },
    };
    const mockResponse = { valid: true };
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockResponse });

    const result = await contractsService.validateContract(payload);
    expect(apiClient.post).toHaveBeenCalledWith(
      `${env.VITE_API_CONTRACTS}/validate`,
      payload
    );
    expect(result).toEqual(mockResponse);
  });

  it('inferContract calls POST /api/contracts/infer with sample payload', async () => {
    const payload = { sampleData: { status: 'UP' } };
    const mockResponse = { schema: { type: 'object' } };
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockResponse });

    const result = await contractsService.inferContract(payload);
    expect(apiClient.post).toHaveBeenCalledWith(
      `${env.VITE_API_CONTRACTS}/infer`,
      payload
    );
    expect(result).toEqual(mockResponse);
  });

  it('approveContract calls POST /api/contracts/:id/approve', async () => {
    const mockResponse = { message: 'Approved', contract: { isApproved: true } };
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockResponse });

    const result = await contractsService.approveContract('c-1');
    expect(apiClient.post).toHaveBeenCalledWith(`${env.VITE_API_CONTRACTS}/c-1/approve`);
    expect(result).toEqual(mockResponse);
  });

  it('catches and rethrows errors', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('Network error'));
    await expect(contractsService.getContracts()).rejects.toThrow('Network error');
  });
});
