import { z } from 'zod';

const endpointPath = (defaultPath) =>
  z
    .string()
    .min(1)
    .default(defaultPath)
    .transform((val) => {
      const trimmed = val.trim();
      return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    });

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string({
      required_error: 'VITE_API_BASE_URL environment variable is required.',
    })
    .url('VITE_API_BASE_URL must be a valid URL (e.g. http://localhost:5001)')
    .transform((val) => val.replace(/\/+$/, '')),

  // Health
  VITE_API_HEALTH: endpointPath('/api/health'),

  // Auth & Profile
  VITE_API_AUTH_REGISTER: endpointPath('/api/auth/register'),
  VITE_API_AUTH_LOGIN: endpointPath('/api/auth/login'),
  VITE_API_AUTH_ME: endpointPath('/api/auth/me'),
  VITE_API_AUTH_LOGOUT: endpointPath('/api/auth/logout'),

  // Endpoints
  VITE_API_ENDPOINTS: endpointPath('/api/endpoints'),

  // Checks
  VITE_API_CHECKS_HISTORY: endpointPath('/api/checks/history'),
  VITE_API_CHECKS_LATEST: endpointPath('/api/checks/history/latest'),
  VITE_API_CHECKS_MOCK_PRODUCT: endpointPath('/api/checks/mock-product'),

  // Incidents
  VITE_API_INCIDENTS: endpointPath('/api/incidents'),

  // Status Page Management
  VITE_API_STATUS_PAGE: endpointPath('/api/status-page'),
  VITE_API_STATUS_PAGE_ME: endpointPath('/api/status-page/me'),
  VITE_API_STATUS_PAGE_SERVICES: endpointPath('/api/status-page/me/services'),
  VITE_API_STATUS_PAGE_REGENERATE_SLUG: endpointPath(
    '/api/status-page/me/regenerate-slug'
  ),

  // Public Status
  VITE_API_PUBLIC_STATUS: endpointPath('/api/public/status'),
});

function validateEnv() {
  const result = envSchema.safeParse({
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_API_HEALTH: import.meta.env.VITE_API_HEALTH,
    VITE_API_AUTH_REGISTER: import.meta.env.VITE_API_AUTH_REGISTER,
    VITE_API_AUTH_LOGIN: import.meta.env.VITE_API_AUTH_LOGIN,
    VITE_API_AUTH_ME: import.meta.env.VITE_API_AUTH_ME,
    VITE_API_AUTH_LOGOUT: import.meta.env.VITE_API_AUTH_LOGOUT,
    VITE_API_ENDPOINTS: import.meta.env.VITE_API_ENDPOINTS,
    VITE_API_CHECKS_HISTORY: import.meta.env.VITE_API_CHECKS_HISTORY,
    VITE_API_CHECKS_LATEST: import.meta.env.VITE_API_CHECKS_LATEST,
    VITE_API_CHECKS_MOCK_PRODUCT: import.meta.env.VITE_API_CHECKS_MOCK_PRODUCT,
    VITE_API_INCIDENTS: import.meta.env.VITE_API_INCIDENTS,
    VITE_API_STATUS_PAGE: import.meta.env.VITE_API_STATUS_PAGE,
    VITE_API_STATUS_PAGE_ME: import.meta.env.VITE_API_STATUS_PAGE_ME,
    VITE_API_STATUS_PAGE_SERVICES: import.meta.env.VITE_API_STATUS_PAGE_SERVICES,
    VITE_API_STATUS_PAGE_REGENERATE_SLUG: import.meta.env
      .VITE_API_STATUS_PAGE_REGENERATE_SLUG,
    VITE_API_PUBLIC_STATUS: import.meta.env.VITE_API_PUBLIC_STATUS,
  });

  if (!result.success) {
    const formattedErrors = result.error.errors
      .map((err) => `  - [${err.path.join('.') || 'VITE_API_BASE_URL'}]: ${err.message}`)
      .join('\n');

    const errorMessage = `
=============================================================
❌ Invalid or Missing Frontend Environment Configuration:
${formattedErrors}

Please ensure you have a .env file configured based on .env.example:
  VITE_API_BASE_URL=http://localhost:5001
=============================================================
`;
    console.error(errorMessage);

    if (import.meta.env.DEV) {
      throw new Error(`Environment validation failed:\n${formattedErrors}`);
    }

    return {
      VITE_API_BASE_URL: 'http://localhost:5001',
      VITE_API_HEALTH: '/api/health',
      VITE_API_AUTH_REGISTER: '/api/auth/register',
      VITE_API_AUTH_LOGIN: '/api/auth/login',
      VITE_API_AUTH_ME: '/api/auth/me',
      VITE_API_AUTH_LOGOUT: '/api/auth/logout',
      VITE_API_ENDPOINTS: '/api/endpoints',
      VITE_API_CHECKS_HISTORY: '/api/checks/history',
      VITE_API_CHECKS_LATEST: '/api/checks/history/latest',
      VITE_API_CHECKS_MOCK_PRODUCT: '/api/checks/mock-product',
      VITE_API_INCIDENTS: '/api/incidents',
      VITE_API_STATUS_PAGE: '/api/status-page',
      VITE_API_STATUS_PAGE_ME: '/api/status-page/me',
      VITE_API_STATUS_PAGE_SERVICES: '/api/status-page/me/services',
      VITE_API_STATUS_PAGE_REGENERATE_SLUG: '/api/status-page/me/regenerate-slug',
      VITE_API_PUBLIC_STATUS: '/api/public/status',
    };
  }

  return result.data;
}

export const env = validateEnv();

export const API_ROUTES = {
  health: env.VITE_API_HEALTH,
  auth: {
    register: env.VITE_API_AUTH_REGISTER,
    login: env.VITE_API_AUTH_LOGIN,
    me: env.VITE_API_AUTH_ME,
    logout: env.VITE_API_AUTH_LOGOUT,
  },
  endpoints: env.VITE_API_ENDPOINTS,
  checks: {
    history: env.VITE_API_CHECKS_HISTORY,
    latest: env.VITE_API_CHECKS_LATEST,
    mockProduct: env.VITE_API_CHECKS_MOCK_PRODUCT,
  },
  incidents: env.VITE_API_INCIDENTS,
  statusPage: {
    base: env.VITE_API_STATUS_PAGE,
    me: env.VITE_API_STATUS_PAGE_ME,
    services: env.VITE_API_STATUS_PAGE_SERVICES,
    regenerateSlug: env.VITE_API_STATUS_PAGE_REGENERATE_SLUG,
  },
  publicStatus: env.VITE_API_PUBLIC_STATUS,
};
