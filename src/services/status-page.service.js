import { apiClient } from '@/lib/api-client';
import { env } from '@/lib/env';

/**
 * Status Page Service communicating with APIChange Radar Status Page & Public Status API.
 */
export const statusPageService = {
  /**
   * Create the initial status page for the authenticated user.
   * Target endpoint: POST VITE_API_STATUS_PAGE
   * @param {Object} [payload]
   * @param {string} [payload.title] - Status page title
   * @param {string} [payload.description] - Description or company bio
   * @returns {Promise<{ message: string, statusPage: Object }>}
   */
  createStatusPage: async (payload = {}) => {
    try {
      const response = await apiClient.post(env.VITE_API_STATUS_PAGE, payload);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[statusPageService.createStatusPage]', error);
      }
      throw error;
    }
  },

  /**
   * Fetch current user's status page configuration.
   * Target endpoint: GET VITE_API_STATUS_PAGE_ME
   * @returns {Promise<{ statusPage: Object }>}
   */
  getMyStatusPage: async () => {
    try {
      const response = await apiClient.get(env.VITE_API_STATUS_PAGE_ME);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[statusPageService.getMyStatusPage]', error);
      }
      throw error;
    }
  },

  /**
   * Update status page metadata or publishing status.
   * Target endpoint: PATCH VITE_API_STATUS_PAGE_ME
   * @param {Object} payload
   * @param {string} [payload.title]
   * @param {string} [payload.description]
   * @param {boolean} [payload.isPublished]
   * @returns {Promise<{ message: string, statusPage: Object }>}
   */
  updateStatusPage: async (payload) => {
    try {
      const response = await apiClient.patch(env.VITE_API_STATUS_PAGE_ME, payload);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[statusPageService.updateStatusPage]', error);
      }
      throw error;
    }
  },

  /**
   * Update the list of published endpoint services for public status.
   * Target endpoint: PUT VITE_API_STATUS_PAGE_SERVICES
   * @param {Object} payload
   * @param {string[]} payload.endpointIds - Array of monitored endpoint IDs
   * @returns {Promise<{ message: string, statusPage: Object }>}
   */
  updateServices: async ({ endpointIds }) => {
    try {
      const response = await apiClient.put(env.VITE_API_STATUS_PAGE_SERVICES, {
        endpointIds,
      });
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[statusPageService.updateServices]', error);
      }
      throw error;
    }
  },

  /**
   * Regenerate the public URL slug.
   * Target endpoint: POST VITE_API_STATUS_PAGE_REGENERATE_SLUG
   * @returns {Promise<{ message: string, slug: string }>}
   */
  regenerateSlug: async () => {
    try {
      const response = await apiClient.post(env.VITE_API_STATUS_PAGE_REGENERATE_SLUG);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[statusPageService.regenerateSlug]', error);
      }
      throw error;
    }
  },

  /**
   * Fetch public read-only status for published status page by slug.
   * Target endpoint: GET VITE_API_PUBLIC_STATUS/:slug
   * @param {string} slug - Status page URL slug
   * @returns {Promise<{ status: string, services: Array, updatedAt: string }>}
   */
  getPublicStatus: async (slug) => {
    try {
      const response = await apiClient.get(`${env.VITE_API_PUBLIC_STATUS}/${slug}`);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[statusPageService.getPublicStatus]', error);
      }
      throw error;
    }
  },
};
