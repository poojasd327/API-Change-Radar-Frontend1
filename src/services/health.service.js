import { apiClient } from '@/lib/api-client';
import { env } from '@/lib/env';

export const healthService = {
  /**
   * Probe backend service health.
   * Target endpoint: GET VITE_API_HEALTH
   * @returns {Promise<{ status: string, message: string, timestamp: string, uptime: number, environment: string }>}
   */
  getHealth: async () => {
    try {
      const response = await apiClient.get(env.VITE_API_HEALTH);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[healthService.getHealth]', error);
      }
      throw error;
    }
  },
};
