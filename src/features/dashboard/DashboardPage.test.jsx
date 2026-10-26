import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/theme/theme';
import { DashboardPage } from './DashboardPage';
import * as useEndpointsModule from '@/hooks/useEndpoints';
import * as useChecksModule from '@/hooks/useChecks';
import * as useIncidentsModule from '@/hooks/useIncidents';
import * as useContractsModule from '@/hooks/useContracts';

vi.mock('@/hooks/useEndpoints');
vi.mock('@/hooks/useChecks');
vi.mock('@/hooks/useIncidents');
vi.mock('@/hooks/useContracts');

const renderWithProviders = (ui) => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>
  );
};

describe('DashboardPage', () => {
  const mockEndpointsRefetch = vi.fn();
  const mockChecksRefetch = vi.fn();
  const mockIncidentsRefetch = vi.fn();
  const mockContractsRefetch = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading skeletons and spinners while data is fetching', () => {
    vi.mocked(useEndpointsModule.useEndpoints).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      refetch: mockEndpointsRefetch,
      isFetching: true,
    });
    vi.mocked(useChecksModule.useChecksHistory).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      refetch: mockChecksRefetch,
      isFetching: true,
    });
    vi.mocked(useIncidentsModule.useIncidents).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      refetch: mockIncidentsRefetch,
      isFetching: true,
    });
    vi.mocked(useContractsModule.useContracts).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      refetch: mockContractsRefetch,
      isFetching: true,
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    expect(screen.getByText(/Loading recent check runs/i)).toBeInTheDocument();
    expect(screen.getByText(/Loading active incidents/i)).toBeInTheDocument();
    expect(screen.getByText(/Loading endpoints overview/i)).toBeInTheDocument();
  });

  it('renders live metric values and data tables accurately', () => {
    const mockEndpoints = [
      {
        _id: 'ep-1',
        name: 'GitHub Status API',
        url: 'https://www.githubstatus.com/api/v2/status.json',
        method: 'GET',
        isActive: true,
        hasActiveContract: true,
        latestCheck: {
          status: 'healthy',
          responseTimeMs: 45,
          checkedAt: '2026-10-26T10:00:00.000Z',
        },
      },
      {
        _id: 'ep-2',
        name: 'Inventory API',
        url: 'https://api.example.com/inventory',
        method: 'POST',
        isActive: false,
        hasActiveContract: false,
        latestCheck: {
          status: 'failed',
          failureType: 'SCHEMA_VIOLATION',
          responseTimeMs: 120,
          checkedAt: '2026-10-26T09:50:00.000Z',
        },
      },
    ];

    const mockChecks = [
      {
        _id: 'chk-1',
        status: 'healthy',
        httpStatus: 200,
        responseTimeMs: 45,
        checkedAt: '2026-10-26T10:00:00.000Z',
        endpoint: {
          _id: 'ep-1',
          name: 'GitHub Status API',
          method: 'GET',
        },
      },
    ];

    const mockIncidents = [
      {
        _id: 'inc-1',
        status: 'open',
        failureType: 'SCHEMA_VIOLATION',
        title: 'Schema drift on Inventory API',
        occurrenceCount: 2,
        lastSeenAt: '2026-10-26T09:50:00.000Z',
        endpoint: {
          _id: 'ep-2',
          name: 'Inventory API',
        },
      },
    ];

    const mockContracts = [
      {
        _id: 'ct-1',
        name: 'GitHub Status Contract v1',
        isApproved: true,
        isActive: true,
        version: 1,
      },
      {
        _id: 'ct-2',
        name: 'Inventory Contract Draft',
        isApproved: false,
        isActive: false,
        version: 1,
      },
    ];

    vi.mocked(useEndpointsModule.useEndpoints).mockReturnValue({
      data: { data: mockEndpoints, pagination: { total: 2 } },
      isLoading: false,
      isError: false,
      refetch: mockEndpointsRefetch,
      isFetching: false,
    });
    vi.mocked(useChecksModule.useChecksHistory).mockReturnValue({
      data: { data: mockChecks, pagination: { total: 1 } },
      isLoading: false,
      isError: false,
      refetch: mockChecksRefetch,
      isFetching: false,
    });
    vi.mocked(useIncidentsModule.useIncidents).mockReturnValue({
      data: { data: mockIncidents, pagination: { total: 1 } },
      isLoading: false,
      isError: false,
      refetch: mockIncidentsRefetch,
      isFetching: false,
    });
    vi.mocked(useContractsModule.useContracts).mockReturnValue({
      data: { data: mockContracts, pagination: { total: 2 } },
      isLoading: false,
      isError: false,
      refetch: mockContractsRefetch,
      isFetching: false,
    });

    renderWithProviders(<DashboardPage />);

    // Metric Cards
    expect(screen.getByText('Monitored Endpoints')).toBeInTheDocument();
    expect(screen.getByText('Active Monitoring')).toBeInTheDocument();
    expect(screen.getByText('Healthy Endpoints')).toBeInTheDocument();
    expect(screen.getByText('Open Incidents')).toBeInTheDocument();
    expect(screen.getByText('Active Contracts')).toBeInTheDocument();

    // Endpoints Overview Table
    expect(screen.getAllByText('GitHub Status API').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Inventory API').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('PAUSED')).toBeInTheDocument();
    expect(screen.getByText('Approved Contract')).toBeInTheDocument();
    expect(screen.getByText('Pending Contract')).toBeInTheDocument();

    // Recent Checks Table
    expect(screen.getByText('HEALTHY')).toBeInTheDocument();
    expect(screen.getByText('45ms')).toBeInTheDocument();

    // Active Incidents Card
    expect(screen.getByText('OPEN • 2x')).toBeInTheDocument();
    expect(screen.getByText('Schema drift on Inventory API')).toBeInTheDocument();
  });

  it('renders clean empty states when user has no endpoints or incidents', () => {
    vi.mocked(useEndpointsModule.useEndpoints).mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isLoading: false,
      isError: false,
      refetch: mockEndpointsRefetch,
      isFetching: false,
    });
    vi.mocked(useChecksModule.useChecksHistory).mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isLoading: false,
      isError: false,
      refetch: mockChecksRefetch,
      isFetching: false,
    });
    vi.mocked(useIncidentsModule.useIncidents).mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isLoading: false,
      isError: false,
      refetch: mockIncidentsRefetch,
      isFetching: false,
    });
    vi.mocked(useContractsModule.useContracts).mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isLoading: false,
      isError: false,
      refetch: mockContractsRefetch,
      isFetching: false,
    });

    renderWithProviders(<DashboardPage />);

    // Metric counts are 0
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(4);

    // Empty states
    expect(screen.getByText('All Systems Operational')).toBeInTheDocument();
    expect(screen.getByText(/No check runs recorded yet/i)).toBeInTheDocument();
    expect(screen.getByText(/No endpoints registered yet/i)).toBeInTheDocument();
    expect(screen.getByText('Add Your First Endpoint')).toBeInTheDocument();
  });

  it('renders error alert and unavailable message when queries fail', () => {
    vi.mocked(useEndpointsModule.useEndpoints).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      refetch: mockEndpointsRefetch,
      isFetching: false,
    });
    vi.mocked(useChecksModule.useChecksHistory).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      refetch: mockChecksRefetch,
      isFetching: false,
    });
    vi.mocked(useIncidentsModule.useIncidents).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      refetch: mockIncidentsRefetch,
      isFetching: false,
    });
    vi.mocked(useContractsModule.useContracts).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      refetch: mockContractsRefetch,
      isFetching: false,
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getAllByText('Unavailable').length).toBeGreaterThan(0);
    expect(screen.getByText('Failed to load check history.')).toBeInTheDocument();
    expect(screen.getByText('Failed to load incidents.')).toBeInTheDocument();
    expect(screen.getByText('Failed to load endpoints overview.')).toBeInTheDocument();
  });

  it('triggers refetch on all queries when clicking the Refresh button', () => {
    vi.mocked(useEndpointsModule.useEndpoints).mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isLoading: false,
      isError: false,
      refetch: mockEndpointsRefetch,
      isFetching: false,
    });
    vi.mocked(useChecksModule.useChecksHistory).mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isLoading: false,
      isError: false,
      refetch: mockChecksRefetch,
      isFetching: false,
    });
    vi.mocked(useIncidentsModule.useIncidents).mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isLoading: false,
      isError: false,
      refetch: mockIncidentsRefetch,
      isFetching: false,
    });
    vi.mocked(useContractsModule.useContracts).mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isLoading: false,
      isError: false,
      refetch: mockContractsRefetch,
      isFetching: false,
    });

    renderWithProviders(<DashboardPage />);

    const refreshBtn = screen.getByRole('button', { name: /^Refresh$/i });
    fireEvent.click(refreshBtn);

    expect(mockEndpointsRefetch).toHaveBeenCalledTimes(1);
    expect(mockChecksRefetch).toHaveBeenCalledTimes(1);
    expect(mockIncidentsRefetch).toHaveBeenCalledTimes(1);
    expect(mockContractsRefetch).toHaveBeenCalledTimes(1);
  });

  it('provides navigation links to Endpoints, Checks, and Incidents', () => {
    vi.mocked(useEndpointsModule.useEndpoints).mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isLoading: false,
      isError: false,
      refetch: mockEndpointsRefetch,
      isFetching: false,
    });
    vi.mocked(useChecksModule.useChecksHistory).mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isLoading: false,
      isError: false,
      refetch: mockChecksRefetch,
      isFetching: false,
    });
    vi.mocked(useIncidentsModule.useIncidents).mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isLoading: false,
      isError: false,
      refetch: mockIncidentsRefetch,
      isFetching: false,
    });
    vi.mocked(useContractsModule.useContracts).mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isLoading: false,
      isError: false,
      refetch: mockContractsRefetch,
      isFetching: false,
    });

    renderWithProviders(<DashboardPage />);

    const addEndpointBtn = screen.getByRole('link', { name: /Add Endpoint/i });
    expect(addEndpointBtn).toHaveAttribute('href', '/endpoints');

    const viewHistoryBtn = screen.getByRole('link', { name: /View History/i });
    expect(viewHistoryBtn).toHaveAttribute('href', '/checks');

    const viewIncidentsBtn = screen.getByRole('link', { name: /View Incidents/i });
    expect(viewIncidentsBtn).toHaveAttribute('href', '/incidents');

    const manageEndpointsBtn = screen.getByRole('link', { name: /Manage Endpoints/i });
    expect(manageEndpointsBtn).toHaveAttribute('href', '/endpoints');
  });
});
