import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/theme/theme';
import { PublicStatusPage } from './PublicStatusPage';
import * as useStatusPageModule from '@/hooks/useStatusPage';

vi.mock('@/hooks/useStatusPage');

const renderWithProviders = (slug = 'demo-slug') => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[`/status/${slug}`]}>
        <Routes>
          <Route path="/status/:slug" element={<PublicStatusPage />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe('PublicStatusPage', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockRefetch.mockReset();
  });

  it('renders loading state when public status is fetching', () => {
    vi.mocked(useStatusPageModule.usePublicStatus).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders('test-slug');

    expect(screen.getByTestId('public-status-loading')).toBeInTheDocument();
    expect(screen.getByText(/Loading live service status.../i)).toBeInTheDocument();
  });

  it('renders status page unavailable card when status page is not found or private', () => {
    vi.mocked(useStatusPageModule.usePublicStatus).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'Status page not found or is currently private' },
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders('non-existent');

    expect(screen.getByTestId('public-status-error')).toBeInTheDocument();
    expect(screen.getByText('Status Page Unavailable')).toBeInTheDocument();
    expect(
      screen.getByText(/Status page not found or is currently private/i)
    ).toBeInTheDocument();
  });

  it('renders live operational status page with services and 24h uptime', () => {
    vi.mocked(useStatusPageModule.usePublicStatus).mockReturnValue({
      data: {
        title: 'Acme Cloud Status',
        description: 'Real-time performance and uptime transparency',
        systemStatus: 'operational',
        updatedAt: '2026-10-26T12:00:00.000Z',
        services: [
          {
            name: 'Public Catalog Service',
            status: 'operational',
            uptimePercentage24h: 99.95,
            lastCheckedAt: '2026-10-26T11:58:00.000Z',
            recentChecks: [
              { status: 'operational', timestamp: '2026-10-26T11:58:00.000Z' },
              { status: 'operational', timestamp: '2026-10-26T11:53:00.000Z' },
            ],
          },
        ],
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders('acme-cloud');

    expect(screen.getByTestId('public-status-title')).toHaveTextContent(
      'Acme Cloud Status'
    );
    expect(screen.getByTestId('public-status-description')).toHaveTextContent(
      'Real-time performance and uptime transparency'
    );
    expect(screen.getByTestId('public-system-status-banner')).toHaveTextContent(
      'All Systems Operational'
    );
    expect(screen.getByText('Public Catalog Service')).toBeInTheDocument();
    expect(screen.getByText('99.95% uptime (24h)')).toBeInTheDocument();
    expect(screen.getByText('Operational')).toBeInTheDocument();
  });

  it('renders degraded banner when systemStatus is degraded', () => {
    vi.mocked(useStatusPageModule.usePublicStatus).mockReturnValue({
      data: {
        title: 'Acme Cloud Status',
        description: null,
        systemStatus: 'degraded',
        updatedAt: '2026-10-26T12:00:00.000Z',
        services: [
          {
            name: 'Billing API',
            status: 'degraded',
            uptimePercentage24h: 95.0,
            lastCheckedAt: '2026-10-26T11:58:00.000Z',
            recentChecks: [],
          },
        ],
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders('acme-cloud');

    expect(screen.getByTestId('public-system-status-banner')).toHaveTextContent(
      'Active Service Degradation'
    );
    expect(screen.getByText('Degraded')).toBeInTheDocument();
  });

  it('triggers refetch when Refresh button is clicked', () => {
    vi.mocked(useStatusPageModule.usePublicStatus).mockReturnValue({
      data: {
        title: 'Status',
        systemStatus: 'operational',
        services: [],
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders('demo');

    const refreshBtn = screen.getByTestId('public-status-refresh-btn');
    fireEvent.click(refreshBtn);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
