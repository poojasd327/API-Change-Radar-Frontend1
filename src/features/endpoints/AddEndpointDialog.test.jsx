import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/theme/theme';
import { AddEndpointDialog } from './AddEndpointDialog';
import * as useEndpointsModule from '@/hooks/useEndpoints';

vi.mock('@/hooks/useEndpoints');

const renderWithTheme = (ui) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('AddEndpointDialog', () => {
  const mockMutateAsync = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useEndpointsModule.useCreateEndpoint).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('renders all form fields when open', () => {
    renderWithTheme(
      <AddEndpointDialog open={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    expect(screen.getByTestId('add-endpoint-dialog')).toBeInTheDocument();
    expect(screen.getByText('Register Monitored Endpoint')).toBeInTheDocument();
    expect(screen.getByLabelText(/Endpoint Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Endpoint URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/HTTP Method/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Active Monitoring/i)).toBeInTheDocument();
    expect(screen.getByTestId('submit-endpoint-btn')).toHaveTextContent(
      'Register Endpoint'
    );
    expect(screen.getByTestId('cancel-endpoint-btn')).toBeInTheDocument();
  });

  it('validates required fields before submitting', async () => {
    renderWithTheme(
      <AddEndpointDialog open={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    fireEvent.click(screen.getByTestId('submit-endpoint-btn'));

    expect(await screen.findByText('Endpoint name is required')).toBeInTheDocument();
    expect(await screen.findByText('Endpoint URL is required')).toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('validates URL protocol format', async () => {
    renderWithTheme(
      <AddEndpointDialog open={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    fireEvent.change(screen.getByLabelText(/Endpoint Name/i), {
      target: { value: 'Payment API' },
    });
    fireEvent.change(screen.getByLabelText(/Endpoint URL/i), {
      target: { value: 'ftp://api.example.com' },
    });

    fireEvent.click(screen.getByTestId('submit-endpoint-btn'));

    expect(
      await screen.findByText('Endpoint URL must use http:// or https:// protocol')
    ).toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('submits valid payload matching backend contract', async () => {
    mockMutateAsync.mockResolvedValueOnce({
      _id: 'ep-999',
      name: 'Users API',
      url: 'https://api.example.com/v1/users',
      method: 'POST',
      isActive: true,
      message: 'Endpoint created successfully.',
    });

    renderWithTheme(
      <AddEndpointDialog open={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    fireEvent.change(screen.getByLabelText(/Endpoint Name/i), {
      target: { value: 'Users API' },
    });
    fireEvent.change(screen.getByLabelText(/Endpoint URL/i), {
      target: { value: 'https://api.example.com/v1/users' },
    });

    fireEvent.click(screen.getByTestId('submit-endpoint-btn'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'Users API',
        url: 'https://api.example.com/v1/users',
        method: 'GET',
        isActive: true,
      });
    });

    expect(await screen.findByText('Endpoint created successfully.')).toBeInTheDocument();
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('displays backend error message when submission fails', async () => {
    mockMutateAsync.mockRejectedValueOnce({
      message: "An endpoint with URL 'https://api.example.com/v1/users' already exists",
      statusCode: 409,
    });

    renderWithTheme(
      <AddEndpointDialog open={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    fireEvent.change(screen.getByLabelText(/Endpoint Name/i), {
      target: { value: 'Duplicate API' },
    });
    fireEvent.change(screen.getByLabelText(/Endpoint URL/i), {
      target: { value: 'https://api.example.com/v1/users' },
    });

    fireEvent.click(screen.getByTestId('submit-endpoint-btn'));

    expect(
      await screen.findByText(
        "An endpoint with URL 'https://api.example.com/v1/users' already exists"
      )
    ).toBeInTheDocument();
  });

  it('closes dialog when cancel button is clicked', () => {
    renderWithTheme(
      <AddEndpointDialog open={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    fireEvent.click(screen.getByTestId('cancel-endpoint-btn'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
