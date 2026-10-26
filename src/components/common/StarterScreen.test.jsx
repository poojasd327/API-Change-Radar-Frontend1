import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/theme/theme';
import { StarterScreen } from './StarterScreen';
import * as useHealthModule from '@/hooks/useHealth';

// Mock the useHealth hook
vi.mock('@/hooks/useHealth');

const renderWithTheme = (ui) => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>
  );
};

describe('StarterScreen Component', () => {
  it('renders branding and title correctly', () => {
    vi.mocked(useHealthModule.useHealth).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    });

    renderWithTheme(<StarterScreen />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /APIChange Radar/i
    );
    expect(
      screen.getByText(/Stage 4 — Admin Portal Environment Setup/i)
    ).toBeInTheDocument();
  });

  it('renders loading state when health check is in progress', () => {
    vi.mocked(useHealthModule.useHealth).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    });

    renderWithTheme(<StarterScreen />);

    expect(screen.getByTestId('health-loading')).toBeInTheDocument();
    expect(screen.getByText(/Probing backend health endpoint/i)).toBeInTheDocument();
  });

  it('renders operational details when backend health check succeeds', () => {
    vi.mocked(useHealthModule.useHealth).mockReturnValue({
      data: {
        status: 'ok',
        message: 'APIChange Radar service is running',
        uptime: 124,
        environment: 'development',
        timestamp: '2026-10-23T06:00:00.000Z',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    });

    renderWithTheme(<StarterScreen />);

    expect(screen.getByTestId('health-success')).toBeInTheDocument();
    expect(screen.getByText('Backend Connected & Operational')).toBeInTheDocument();
    expect(screen.getByText('APIChange Radar service is running')).toBeInTheDocument();
    expect(screen.getByText('124s')).toBeInTheDocument();
  });

  it('renders clear offline state when backend connection fails', () => {
    vi.mocked(useHealthModule.useHealth).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: {
        message: 'Unable to connect to APIChange Radar backend at http://localhost:5001',
        isNetworkError: true,
      },
      refetch: vi.fn(),
      isFetching: false,
    });

    renderWithTheme(<StarterScreen />);

    expect(screen.getByTestId('health-disconnected')).toBeInTheDocument();
    expect(screen.getByText(/Backend Unavailable \(Offline\)/i)).toBeInTheDocument();
    expect(
      screen.getByText(/cd \/Users\/poojasd\/Desktop\/Ptojects\/APIChange_radar_backend/i)
    ).toBeInTheDocument();
  });
});
