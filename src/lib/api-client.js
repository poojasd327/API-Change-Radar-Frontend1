import axios from 'axios';
import { env } from './env';

let authTokenGetter = null;
let unauthorizedHandler = null;

export const setAuthTokenGetter = (getter) => {
  authTokenGetter = getter;
};

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (authTokenGetter) {
      const token = authTokenGetter();
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError = !error.response;
    const statusCode = error.response?.status;
    const backendMessage = error.response?.data?.message;

    let userFriendlyMessage = 'An unexpected error occurred.';

    if (isNetworkError) {
      userFriendlyMessage = `Unable to connect to APIChange Radar backend at ${env.VITE_API_BASE_URL}. Ensure the backend service is running.`;
    } else if (backendMessage && typeof backendMessage === 'string') {
      userFriendlyMessage = backendMessage;
    } else if (statusCode === 401) {
      userFriendlyMessage = 'Your session has expired or you are not authenticated.';
    } else if (statusCode === 403) {
      userFriendlyMessage = 'You do not have permission to access this resource.';
    } else if (statusCode === 404) {
      userFriendlyMessage = 'The requested resource was not found.';
    } else if (statusCode && statusCode >= 500) {
      userFriendlyMessage = 'The backend encountered an internal server error.';
    }

    // Trigger global unauthorized handler on 401, but NOT on login credential failures
    if (statusCode === 401 && !error.config?.url?.includes(env.VITE_API_AUTH_LOGIN)) {
      if (unauthorizedHandler) {
        unauthorizedHandler();
      }
    }

    const structuredError = {
      message: userFriendlyMessage,
      statusCode,
      code: error.code,
      isNetworkError,
      data: error.response?.data,
    };

    if (import.meta.env.DEV) {
      console.warn('[API Client Error]', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status: statusCode ?? 'Network / Offline',
        message: userFriendlyMessage,
      });
    }

    return Promise.reject(structuredError);
  }
);
