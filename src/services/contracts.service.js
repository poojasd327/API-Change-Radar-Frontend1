import { apiClient } from '@/lib/api-client';
import { env } from '@/lib/env';

/**
 * Contracts Service communicating with APIChange Radar contract management API.
 */
export const contractsService = {
  /**
   * Fetch paginated contracts for the authenticated user, optionally filtered by endpointId.
   * Target endpoint: GET VITE_API_CONTRACTS
   * @param {Object} [params]
   * @param {string} [params.endpointId]
   * @param {boolean} [params.isApproved]
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   * @returns {Promise<{ data: Array, pagination: Object }>}
   */
  getContracts: async (params = {}) => {
    try {
      const response = await apiClient.get(env.VITE_API_CONTRACTS, { params });
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[contractsService.getContracts]', error);
      }
      throw error;
    }
  },

  /**
   * Fetch a single contract by its MongoDB ObjectId.
   * Target endpoint: GET VITE_API_CONTRACTS/:id
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getContractById: async (id) => {
    try {
      const response = await apiClient.get(`${env.VITE_API_CONTRACTS}/${id}`);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[contractsService.getContractById]', error);
      }
      throw error;
    }
  },

  /**
   * Register a new contract draft for an endpoint in pending approval status.
   * Target endpoint: POST VITE_API_CONTRACTS
   * @param {Object} payload
   * @param {string} payload.endpointId
   * @param {string} payload.name
   * @param {Object} payload.schema
   * @returns {Promise<{ message: string, contract: Object }>}
   */
  createContract: async (payload) => {
    try {
      const response = await apiClient.post(env.VITE_API_CONTRACTS, payload);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[contractsService.createContract]', error);
      }
      throw error;
    }
  },

  /**
   * Validate a JSON Schema structure and optional sample data.
   * Target endpoint: POST VITE_API_CONTRACTS/validate
   * @param {Object} payload
   * @param {Object} payload.schema
   * @param {Object} [payload.sampleData]
   * @returns {Promise<{ valid: boolean, schemaValid: boolean, schemaErrors: Array, sampleValid: boolean, sampleErrors: Array }>}
   */
  validateContract: async (payload) => {
    try {
      const response = await apiClient.post(
        `${env.VITE_API_CONTRACTS}/validate`,
        payload
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[contractsService.validateContract]', error);
      }
      throw error;
    }
  },

  /**
   * Infer a draft JSON Schema from sample JSON response data.
   * Target endpoint: POST VITE_API_CONTRACTS/infer
   * @param {Object} payload
   * @param {Object} payload.sampleData
   * @param {string} [payload.title]
   * @returns {Promise<{ schema: Object }>}
   */
  inferContract: async (payload) => {
    try {
      const response = await apiClient.post(`${env.VITE_API_CONTRACTS}/infer`, payload);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[contractsService.inferContract]', error);
      }
      throw error;
    }
  },

  /**
   * Explicitly approve and activate a contract for automated monitoring.
   * Target endpoint: POST VITE_API_CONTRACTS/:id/approve
   * @param {string} id
   * @returns {Promise<{ message: string, contract: Object }>}
   */
  approveContract: async (id) => {
    try {
      const response = await apiClient.post(`${env.VITE_API_CONTRACTS}/${id}/approve`);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[contractsService.approveContract]', error);
      }
      throw error;
    }
  },

  /**
   * Deactivate a contract.
   * Target endpoint: POST VITE_API_CONTRACTS/:id/deactivate
   * @param {string} id
   * @returns {Promise<{ message: string, contract: Object }>}
   */
  deactivateContract: async (id) => {
    try {
      const response = await apiClient.post(`${env.VITE_API_CONTRACTS}/${id}/deactivate`);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[contractsService.deactivateContract]', error);
      }
      throw error;
    }
  },
};
