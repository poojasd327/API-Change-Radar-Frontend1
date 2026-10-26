import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/theme/theme';
import { IncidentsPage } from './IncidentsPage';
import * as useIncidentsModule from '@/hooks/useIncidents';

vi.mock('@/hooks/useIncidents');

const renderWithProviders = (ui) => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>
  );
};

describe('IncidentsPage', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state when fetching incidents', () => {
    vi.mocked(useIncidentsModule.useIncidents).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders(<IncidentsPage />);
    expect(screen.getByText(/Fetching incidents from/i)).toBeInTheDocument();
  });

  it('renders error alert when fetching fails', () => {
    vi.mocked(useIncidentsModule.useIncidents).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to connect to incidents API'),
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders(<IncidentsPage />);
    expect(screen.getByText('Failed to connect to incidents API')).toBeInTheDocument();
  });

  it('renders clean empty state when no incidents exist', () => {
    vi.mocked(useIncidentsModule.useIncidents).mockReturnValue({
      data: {
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders(<IncidentsPage />);
    expect(screen.getByText('No Incidents Recorded')).toBeInTheDocument();
    expect(
      screen.getByText(
        /All monitored endpoints with approved contracts are operating within healthy contract thresholds/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Total: 0/i)).toBeInTheDocument();
  });

  it('renders incident feed table when incidents exist', () => {
    const mockIncident = {
      _id: 'inc-001',
      status: 'open',
      failureType: 'SCHEMA_VIOLATION',
      title: 'Schema contract violation on GitHub Status API',
      description: "Field 'status.indicator' expected string, received null",
      occurrenceCount: 3,
      firstSeenAt: '2026-10-26T10:00:00.000Z',
      lastSeenAt: '2026-10-26T10:15:00.000Z',
      endpoint: {
        _id: 'ep-001',
        name: 'GitHub Status API',
        url: 'https://www.githubstatus.com/api/v2/status.json',
        method: 'GET',
      },
      contract: {
        _id: 'ct-001',
        name: 'GitHub Status Contract v1',
        version: 1,
      },
    };

    vi.mocked(useIncidentsModule.useIncidents).mockReturnValue({
      data: {
        data: [mockIncident],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders(<IncidentsPage />);

    expect(screen.getByText('Incident Feed')).toBeInTheDocument();
    expect(screen.getByText('OPEN')).toBeInTheDocument();
    expect(screen.getByText('Schema Violation')).toBeInTheDocument();
    expect(screen.getByText('GitHub Status API')).toBeInTheDocument();
    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(
      screen.getByText('Schema contract violation on GitHub Status API')
    ).toBeInTheDocument();
    expect(
      screen.getByText("Field 'status.indicator' expected string, received null")
    ).toBeInTheDocument();
    expect(screen.getByText('3x')).toBeInTheDocument();
  });

  it('filters incidents by status when clicking Open or Resolved buttons', () => {
    const mockUseIncidents = vi.mocked(useIncidentsModule.useIncidents);
    mockUseIncidents.mockReturnValue({
      data: {
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders(<IncidentsPage />);

    // Initial query has no status filter
    expect(mockUseIncidents).toHaveBeenCalledWith({ page: 1, limit: 10 });

    // Click Open filter button
    fireEvent.click(screen.getByRole('button', { name: /^Open$/i }));
    expect(mockUseIncidents).toHaveBeenCalledWith({ page: 1, limit: 10, status: 'open' });

    // Click Resolved filter button
    fireEvent.click(screen.getByRole('button', { name: /^Resolved$/i }));
    expect(mockUseIncidents).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: 'resolved',
    });

    // Click All filter button
    fireEvent.click(screen.getByRole('button', { name: /^All$/i }));
    expect(mockUseIncidents).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('calls refetch when Refresh button is clicked', () => {
    vi.mocked(useIncidentsModule.useIncidents).mockReturnValue({
      data: {
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders(<IncidentsPage />);

    const refreshBtn = screen.getByRole('button', { name: /Refresh/i });
    fireEvent.click(refreshBtn);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
