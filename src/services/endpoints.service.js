import { apiClient } from '@/lib/api-client';
import { env } from '@/lib/env';

/**
 * Endpoints Service communicating with APIChange Radar monitored endpoints API.
 */
export const endpointsService = {
  /**
   * List paginated endpoints for the authenticated user.
   * Target endpoint: GET VITE_API_ENDPOINTS
   * @param {Object} [params]
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   * @param {boolean|string} [params.isActive]
   * @returns {Promise<{ endpoints: Array, pagination: Object }>}
   */
  getEndpoints: async (params = {}) => {
    try {
      const response = await apiClient.get(env.VITE_API_ENDPOINTS, { params });
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[endpointsService.getEndpoints]', error);
      }
      throw error;
    }
  },

  /**
   * Fetch a single monitored endpoint by its MongoDB ID.
   * Target endpoint: GET VITE_API_ENDPOINTS/:id
   * @param {string} id - Endpoint MongoDB ID
   * @returns {Promise<{ endpoint: Object }>}
   */
  getEndpointById: async (id) => {
    try {
      const response = await apiClient.get(`${env.VITE_API_ENDPOINTS}/${id}`);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[endpointsService.getEndpointById]', error);
      }
      throw error;
    }
  },

  /**
   * Register a new monitored API endpoint.
   * Target endpoint: POST VITE_API_ENDPOINTS
   * @param {Object} payload
   * @param {string} payload.name - Descriptive name (2-50 chars)
   * @param {string} payload.url - Valid HTTP/HTTPS URL
   * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} [payload.method='GET'] - HTTP method
   * @param {boolean} [payload.isActive=true] - Initial active monitoring state
   * @returns {Promise<{ message: string, endpoint: Object }>}
   */
  createEndpoint: async (payload) => {
    try {
      const response = await apiClient.post(env.VITE_API_ENDPOINTS, payload);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[endpointsService.createEndpoint]', error);
      }
      throw error;
    }
  },

  /**
   * Update an existing endpoint's settings (name or active state).
   * Target endpoint: PATCH VITE_API_ENDPOINTS/:id
   * @param {string} id - Endpoint MongoDB ID
   * @param {Object} payload
   * @param {string} [payload.name]
   * @param {boolean} [payload.isActive]
   * @returns {Promise<{ message: string, endpoint: Object }>}
   */
  updateEndpoint: async (id, payload) => {
    try {
      const response = await apiClient.patch(`${env.VITE_API_ENDPOINTS}/${id}`, payload);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[endpointsService.updateEndpoint]', error);
      }
      throw error;
    }
  },
};
