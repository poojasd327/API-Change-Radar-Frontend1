import { apiClient, setAuthTokenGetter } from '@/lib/api-client';
import { env } from '@/lib/env';

/**
 * Storage key for client-side JWT persistence.
 *
 * SECURITY & ARCHITECTURAL DISCLOSURE:
 * For this initial local implementation, we use `sessionStorage` for storing the JWT access token.
 * Note that any JavaScript-accessible client storage (localStorage or sessionStorage) can be accessed
 * by script execution if a Cross-Site Scripting (XSS) vulnerability exists. It is therefore NOT fully
 * impervious to XSS unlike HttpOnly, Secure, SameSite cookies.
 *
 * Current Backend Status:
 * The backend REST API verified in BACKEND_INTEGRATION.md returns tokens in JSON bodies and expects
 * standard `Authorization: Bearer <token>` headers; it does not currently set HttpOnly cookies.
 *
 * Security Invariants:
 * 1. User passwords are NEVER cached, persisted, or stored in client storage.
 * 2. Tokens, passwords, and sensitive credentials are NEVER logged to console.
 * 3. Session tokens are scoped per browser tab/session via sessionStorage.
 */
export const TOKEN_STORAGE_KEY = 'apichangeradar_session_token';

/**
 * Retrieve the active JWT token from session storage.
 * @returns {string|null}
 */
export const getStoredToken = () => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // In restricted iframe or private browsing environments, fail safely
  }
  return null;
};

/**
 * Persist the active JWT token into session storage.
 * @param {string} token
 */
export const setStoredToken = (token) => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (token) {
        window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
  } catch {
    // Fail safely
  }
};

/**
 * Remove the active JWT token from session storage.
 */
export const clearStoredToken = () => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Fail safely
  }
};

// Wire up API client token getter so every authorized request sends Bearer token
setAuthTokenGetter(getStoredToken);

/**
 * Auth Service communicating with APIChange Radar backend.
 */
export const authService = {
  /**
   * Register a new individual user.
   * Target endpoint: POST VITE_API_AUTH_REGISTER
   * @param {Object} payload
   * @param {string} payload.name
   * @param {string} payload.email
   * @param {string} payload.password
   * @returns {Promise<{ message: string, user: Object, token: string }>}
   */
  register: async ({ name, email, password }) => {
    try {
      const response = await apiClient.post(env.VITE_API_AUTH_REGISTER, {
        name,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[authService.register]', error);
      }
      throw error;
    }
  },

  /**
   * Authenticate user credentials.
   * Target endpoint: POST VITE_API_AUTH_LOGIN
   * @param {Object} payload
   * @param {string} payload.email
   * @param {string} payload.password
   * @returns {Promise<{ message: string, user: Object, token: string }>}
   */
  login: async ({ email, password }) => {
    try {
      const response = await apiClient.post(env.VITE_API_AUTH_LOGIN, {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[authService.login]', error);
      }
      throw error;
    }
  },

  /**
   * Fetch current authenticated user profile.
   * Target endpoint: GET VITE_API_AUTH_ME
   * @returns {Promise<{ user: Object }>}
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get(env.VITE_API_AUTH_ME);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[authService.getCurrentUser]', error);
      }
      throw error;
    }
  },

  /**
   * Notify backend of logout.
   * Target endpoint: POST VITE_API_AUTH_LOGOUT
   *
   * NOTE ON STATELESS JWT LOGOUT:
   * As documented in BACKEND_INTEGRATION.md, the backend logout route provides confirmation
   * but does not maintain a server-side token revocation blocklist for stateless JWTs.
   * The client MUST discard the token locally.
   * @returns {Promise<{ message: string }>}
   */
  logout: async () => {
    try {
      const response = await apiClient.post(env.VITE_API_AUTH_LOGOUT);
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(
          '[authService.logout] Remote logout failed, proceeding locally:',
          error
        );
      }
      // Even if network or server fails, client must proceed with session destruction
      return { message: 'Logged out locally' };
    }
  },
};
