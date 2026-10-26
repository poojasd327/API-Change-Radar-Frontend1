import { describe, it, expect } from 'vitest';
import { env, API_ROUTES } from './env';

describe('Environment Configuration', () => {
  it('loads and validates VITE_API_BASE_URL', () => {
    expect(env.VITE_API_BASE_URL).toBeDefined();
    expect(typeof env.VITE_API_BASE_URL).toBe('string');
    expect(env.VITE_API_BASE_URL.startsWith('http')).toBe(true);
  });

  it('ensures trailing slash is removed from VITE_API_BASE_URL', () => {
    expect(env.VITE_API_BASE_URL.endsWith('/')).toBe(false);
  });

  it('loads and validates all backend API endpoint route paths in env', () => {
    const endpointKeys = [
      'VITE_API_HEALTH',
      'VITE_API_AUTH_REGISTER',
      'VITE_API_AUTH_LOGIN',
      'VITE_API_AUTH_ME',
      'VITE_API_AUTH_LOGOUT',
      'VITE_API_ENDPOINTS',
      'VITE_API_CHECKS_HISTORY',
      'VITE_API_CHECKS_LATEST',
      'VITE_API_CHECKS_MOCK_PRODUCT',
      'VITE_API_INCIDENTS',
      'VITE_API_STATUS_PAGE',
      'VITE_API_STATUS_PAGE_ME',
      'VITE_API_STATUS_PAGE_SERVICES',
      'VITE_API_STATUS_PAGE_REGENERATE_SLUG',
      'VITE_API_PUBLIC_STATUS',
    ];

    for (const key of endpointKeys) {
      expect(env[key], `Expected ${key} to be defined in env`).toBeDefined();
      expect(typeof env[key]).toBe('string');
      expect(env[key].startsWith('/')).toBe(true);
    }
  });

  it('exports structured API_ROUTES matching env endpoint values', () => {
    expect(API_ROUTES.health).toBe(env.VITE_API_HEALTH);
    expect(API_ROUTES.auth.register).toBe(env.VITE_API_AUTH_REGISTER);
    expect(API_ROUTES.auth.login).toBe(env.VITE_API_AUTH_LOGIN);
    expect(API_ROUTES.auth.me).toBe(env.VITE_API_AUTH_ME);
    expect(API_ROUTES.auth.logout).toBe(env.VITE_API_AUTH_LOGOUT);
    expect(API_ROUTES.endpoints).toBe(env.VITE_API_ENDPOINTS);
    expect(API_ROUTES.checks.history).toBe(env.VITE_API_CHECKS_HISTORY);
    expect(API_ROUTES.checks.latest).toBe(env.VITE_API_CHECKS_LATEST);
    expect(API_ROUTES.checks.mockProduct).toBe(env.VITE_API_CHECKS_MOCK_PRODUCT);
    expect(API_ROUTES.incidents).toBe(env.VITE_API_INCIDENTS);
    expect(API_ROUTES.statusPage.base).toBe(env.VITE_API_STATUS_PAGE);
    expect(API_ROUTES.statusPage.me).toBe(env.VITE_API_STATUS_PAGE_ME);
    expect(API_ROUTES.statusPage.services).toBe(env.VITE_API_STATUS_PAGE_SERVICES);
    expect(API_ROUTES.statusPage.regenerateSlug).toBe(
      env.VITE_API_STATUS_PAGE_REGENERATE_SLUG
    );
    expect(API_ROUTES.publicStatus).toBe(env.VITE_API_PUBLIC_STATUS);
  });
});
