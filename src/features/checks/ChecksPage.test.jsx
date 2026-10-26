import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/theme/theme';
import { ChecksPage } from './ChecksPage';
import * as useChecksModule from '@/hooks/useChecks';

vi.mock('@/hooks/useChecks');

const renderWithProviders = (ui) => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>
  );
};

describe('ChecksPage', () => {
  const mockRefetch = vi.fn();
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockRefetch.mockReset();
    mockMutateAsync.mockReset();

    // Default mock for useRunMockCheck
    vi.spyOn(useChecksModule, 'useRunMockCheck').mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('renders loading state when fetching check logs', () => {
    vi.spyOn(useChecksModule, 'useChecksHistory').mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders(<ChecksPage />);

    expect(screen.getByTestId('checks-loading')).toBeInTheDocument();
    expect(screen.getByText(/Fetching check history from backend/i)).toBeInTheDocument();
  });

  it('renders error state with retry button on network or backend failure', () => {
    vi.spyOn(useChecksModule, 'useChecksHistory').mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: { message: 'Database connection failed' },
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders(<ChecksPage />);

    expect(screen.getByTestId('checks-error')).toBeInTheDocument();
    expect(screen.getByText('Database connection failed')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('renders empty state when backend returns 0 check runs', () => {
    vi.spyOn(useChecksModule, 'useChecksHistory').mockReturnValue({
      data: { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders(<ChecksPage />);

    expect(screen.getByTestId('checks-empty')).toBeInTheDocument();
    expect(screen.getByText('No Check Runs Found')).toBeInTheDocument();
  });

  it('renders check history table with populated rows from backend contract', () => {
    const mockChecks = [
      {
        _id: 'chk-1',
        endpoint: {
          name: 'Mock Product API - Item 101',
          url: 'http://127.0.0.1:5001/mock-api/products/101',
          method: 'GET',
        },
        contract: {
          name: 'Approved Product Schema v1',
          version: 1,
        },
        status: 'healthy',
        failureType: null,
        httpStatus: 200,
        responseTimeMs: 18,
        schemaValid: true,
        errors: [],
        checkedAt: '2026-10-26T06:00:00.000Z',
      },
      {
        _id: 'chk-2',
        endpoint: {
          name: 'Mock Product API - Item 101',
          url: 'http://127.0.0.1:5001/mock-api/products/101?scenario=wrong-price-type',
          method: 'GET',
        },
        contract: {
          name: 'Approved Product Schema v1',
          version: 1,
        },
        status: 'failed',
        failureType: 'SCHEMA_VIOLATION',
        httpStatus: 200,
        responseTimeMs: 14,
        schemaValid: false,
        errors: ["Field 'price' must be of type number"],
        checkedAt: '2026-10-26T06:05:00.000Z',
      },
    ];

    vi.spyOn(useChecksModule, 'useChecksHistory').mockReturnValue({
      data: {
        data: mockChecks,
        pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders(<ChecksPage />);

    expect(screen.getByTestId('checks-history-table')).toBeInTheDocument();
    expect(screen.getByTestId('check-row-chk-1')).toBeInTheDocument();
    expect(screen.getByTestId('check-row-chk-2')).toBeInTheDocument();

    expect(screen.getByText('18ms')).toBeInTheDocument();
    expect(screen.getByText('14ms')).toBeInTheDocument();
    expect(screen.getByText('SCHEMA_VIOLATION')).toBeInTheDocument();
  });

  it('executes manual healthy check and renders execution result card', async () => {
    vi.spyOn(useChecksModule, 'useChecksHistory').mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    mockMutateAsync.mockResolvedValueOnce({
      status: 'healthy',
      failureType: null,
      httpStatus: 200,
      responseTimeMs: 25,
      schemaValid: true,
      errors: [],
      checkedAt: '2026-10-26T06:10:00.000Z',
      endpoint: 'http://127.0.0.1:5001/mock-api/products/101',
      checkRunId: 'run-12345',
    });

    renderWithProviders(<ChecksPage />);

    const runBtn = screen.getByTestId('execute-check-btn');
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ timeoutMs: 3000 });
      expect(screen.getByTestId('check-result-card')).toBeInTheDocument();
      expect(screen.getByText('Check Passed • Healthy')).toBeInTheDocument();
      expect(screen.getByText('25ms')).toBeInTheDocument();
      expect(screen.getByText('Run ID: run-12345')).toBeInTheDocument();
    });
  });

  it('executes manual check with schema violation scenario and displays error list', async () => {
    vi.spyOn(useChecksModule, 'useChecksHistory').mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    mockMutateAsync.mockResolvedValueOnce({
      status: 'failed',
      failureType: 'SCHEMA_VIOLATION',
      httpStatus: 200,
      responseTimeMs: 15,
      schemaValid: false,
      errors: ["Field 'price' must be of type number"],
      checkedAt: '2026-10-26T06:12:00.000Z',
      endpoint: 'http://127.0.0.1:5001/mock-api/products/101?scenario=wrong-price-type',
      checkRunId: 'run-broken-1',
    });

    renderWithProviders(<ChecksPage />);

    // Select scenario: wrong-price-type
    const select = screen.getByTestId('scenario-select');
    // Open MUI select
    const selectButton = select.querySelector('[role="combobox"]');
    fireEvent.mouseDown(selectButton);

    const wrongPriceOption = await screen.findByText('Schema Violation: Wrong Data Type');
    fireEvent.click(wrongPriceOption);

    const runBtn = screen.getByTestId('execute-check-btn');
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        scenario: 'wrong-price-type',
        timeoutMs: 3000,
      });
      expect(screen.getByTestId('check-result-card')).toBeInTheDocument();
      expect(screen.getByText('Check Failed • Contract Violation')).toBeInTheDocument();
      expect(
        screen.getByText("• Field 'price' must be of type number")
      ).toBeInTheDocument();
    });
  });

  it('displays backend error message when manual check execution fails', async () => {
    vi.spyOn(useChecksModule, 'useChecksHistory').mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    mockMutateAsync.mockRejectedValueOnce(
      new Error('Connection timed out to mock service')
    );

    renderWithProviders(<ChecksPage />);

    const runBtn = screen.getByTestId('execute-check-btn');
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByTestId('check-error-alert')).toBeInTheDocument();
      expect(
        screen.getByText('Connection timed out to mock service')
      ).toBeInTheDocument();
    });
  });

  it('triggers refetch when header refresh button is clicked', () => {
    vi.spyOn(useChecksModule, 'useChecksHistory').mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders(<ChecksPage />);

    const refreshBtn = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });
});
