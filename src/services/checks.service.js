import { apiClient } from '@/lib/api-client';
import { env } from '@/lib/env';

/**
 * Checks Service communicating with APIChange Radar check history and execution API.
 */
export const checksService = {
  /**
   * Fetch paginated check audit logs.
   * Target endpoint: GET VITE_API_CHECKS_HISTORY
   * @param {Object} [params]
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   * @returns {Promise<{ checks: Array, pagination: Object }>}
   */
  getCheckHistory: async (params = {}) => {
    try {
      const response = await apiClient.get(env.VITE_API_CHECKS_HISTORY, { params });
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[checksService.getCheckHistory]', error);
      }
      throw error;
    }
  },

  /**
   * Fetch the most recent check run for the authenticated user.
   * Target endpoint: GET VITE_API_CHECKS_LATEST
   * @returns {Promise<{ check: Object }>}
   */
  getLatestCheck: async () => {
    try {
      const response = await apiClient.get(env.VITE_API_CHECKS_LATEST);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[checksService.getLatestCheck]', error);
      }
      throw error;
    }
  },

  /**
   * Trigger immediate check on mock product demo endpoint.
   * Target endpoint: POST VITE_API_CHECKS_MOCK_PRODUCT
   * @param {Object} [payload]
   * @param {string} [payload.scenario]
   * @param {number} [payload.delay]
   * @param {number} [payload.timeoutMs]
   * @returns {Promise<Object>}
   */
  runMockCheck: async (payload = {}) => {
    try {
      const response = await apiClient.post(env.VITE_API_CHECKS_MOCK_PRODUCT, payload);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[checksService.runMockCheck]', error);
      }
      throw error;
    }
  },
};
