import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/theme/theme';
import { EndpointsPage } from './EndpointsPage';
import * as useEndpointsModule from '@/hooks/useEndpoints';

// Mock useEndpoints hook
vi.mock('@/hooks/useEndpoints');

const renderWithProviders = (ui) => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>
  );
};

describe('EndpointsPage', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state when fetching endpoints', () => {
    vi.mocked(useEndpointsModule.useEndpoints).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders(<EndpointsPage />);

    expect(screen.getByTestId('endpoints-loading')).toBeInTheDocument();
    expect(
      screen.getByText(/Fetching monitored endpoints from backend.../i)
    ).toBeInTheDocument();
  });

  it('renders error state with retry button on network or backend failure', () => {
    const error = {
      message: 'Unable to connect to APIChange Radar backend at http://localhost:5001',
      statusCode: 503,
      isNetworkError: true,
    };

    vi.mocked(useEndpointsModule.useEndpoints).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders(<EndpointsPage />);

    expect(screen.getByTestId('endpoints-error')).toBeInTheDocument();
    expect(screen.getByText(error.message)).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /^Retry$/i });
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders unauthorized error with sign in link when 401 occurs', () => {
    const error = {
      message: 'Your session has expired or you are not authenticated.',
      statusCode: 401,
    };

    vi.mocked(useEndpointsModule.useEndpoints).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders(<EndpointsPage />);

    expect(screen.getByTestId('endpoints-error')).toBeInTheDocument();
    expect(screen.getByText(/Session Expired or Unauthorized/i)).toBeInTheDocument();
    const loginLink = screen.getByRole('link', { name: /Go to Sign In/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.getAttribute('href')).toBe('/login');
  });

  it('renders empty state when backend returns zero endpoints', () => {
    vi.mocked(useEndpointsModule.useEndpoints).mockReturnValue({
      data: {
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders(<EndpointsPage />);

    expect(screen.getByTestId('endpoints-empty')).toBeInTheDocument();
    expect(screen.getByText(/No Monitored Endpoints Found/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Your account does not have any monitored API endpoints registered yet/i
      )
    ).toBeInTheDocument();
  });

  it('renders endpoints table with correct backend fields when data is present', () => {
    const mockEndpoints = [
      {
        _id: 'ep-001',
        name: 'User Authentication API',
        url: 'https://api.example.com/v1/auth',
        method: 'POST',
        isActive: true,
        hasActiveContract: true,
        latestCheck: {
          status: 'pass',
          httpStatus: 200,
          responseTimeMs: 84,
          checkedAt: '2026-10-26T10:00:00.000Z',
        },
        createdAt: '2026-10-25T08:00:00.000Z',
      },
      {
        _id: 'ep-002',
        name: 'Billing Invoices API',
        url: 'https://api.example.com/v1/invoices',
        method: 'GET',
        isActive: false,
        hasActiveContract: false,
        latestCheck: {
          status: 'fail',
          failureType: 'contract_drift',
          httpStatus: 200,
          responseTimeMs: 240,
          checkedAt: '2026-10-26T10:05:00.000Z',
        },
        createdAt: '2026-10-25T09:00:00.000Z',
      },
    ];

    vi.mocked(useEndpointsModule.useEndpoints).mockReturnValue({
      data: {
        data: mockEndpoints,
        pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders(<EndpointsPage />);

    expect(screen.getByTestId('endpoints-list')).toBeInTheDocument();

    // Check summary chips
    expect(screen.getByText('Total: 2')).toBeInTheDocument();
    expect(screen.getByText('Active: 1')).toBeInTheDocument();
    expect(screen.getByText('Contracts: 1')).toBeInTheDocument();

    // Row 1 assertions
    expect(screen.getByTestId('endpoint-row-ep-001')).toBeInTheDocument();
    expect(screen.getByText('User Authentication API')).toBeInTheDocument();
    expect(screen.getByText('https://api.example.com/v1/auth')).toBeInTheDocument();
    expect(screen.getByText('POST')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Pass')).toBeInTheDocument();
    expect(screen.getByText(/84ms/)).toBeInTheDocument();

    // Row 2 assertions
    expect(screen.getByTestId('endpoint-row-ep-002')).toBeInTheDocument();
    expect(screen.getByText('Billing Invoices API')).toBeInTheDocument();
    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByText('Paused')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('contract_drift')).toBeInTheDocument();
  });

  it('triggers refetch when header Refresh button is clicked', () => {
    vi.mocked(useEndpointsModule.useEndpoints).mockReturnValue({
      data: {
        data: [],
        pagination: { total: 0 },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders(<EndpointsPage />);

    const refreshBtn = screen.getByRole('button', { name: /^Refresh$/i });
    fireEvent.click(refreshBtn);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
