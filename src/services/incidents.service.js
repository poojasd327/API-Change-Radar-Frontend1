import { apiClient } from '@/lib/api-client';
import { env } from '@/lib/env';

/**
 * Incidents Service communicating with APIChange Radar incident management API.
 */
export const incidentsService = {
  /**
   * Fetch user's incidents with optional filtering by status and pagination.
   * Target endpoint: GET VITE_API_INCIDENTS
   * @param {Object} [params]
   * @param {'open'|'resolved'} [params.status]
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   * @returns {Promise<{ incidents: Array, pagination: Object }>}
   */
  getIncidents: async (params = {}) => {
    try {
      const response = await apiClient.get(env.VITE_API_INCIDENTS, { params });
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[incidentsService.getIncidents]', error);
      }
      throw error;
    }
  },

  /**
   * Fetch a single incident by its MongoDB ID.
   * Target endpoint: GET VITE_API_INCIDENTS/:id
   * @param {string} id - Incident MongoDB ID
   * @returns {Promise<{ incident: Object }>}
   */
  getIncidentById: async (id) => {
    try {
      const response = await apiClient.get(`${env.VITE_API_INCIDENTS}/${id}`);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[incidentsService.getIncidentById]', error);
      }
      throw error;
    }
  },
};
