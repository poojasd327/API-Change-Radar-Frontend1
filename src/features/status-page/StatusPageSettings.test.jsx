import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/theme/theme';
import { StatusPageSettings } from './StatusPageSettings';
import * as useStatusPageModule from '@/hooks/useStatusPage';
import * as useEndpointsModule from '@/hooks/useEndpoints';

vi.mock('@/hooks/useStatusPage');
vi.mock('@/hooks/useEndpoints');

const renderWithProviders = (ui) => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>
  );
};

describe('StatusPageSettings', () => {
  const mockRefetch = vi.fn();
  const mockCreateMutateAsync = vi.fn();
  const mockUpdateMutateAsync = vi.fn();
  const mockUpdateServicesMutateAsync = vi.fn();
  const mockRegenerateSlugMutateAsync = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockRefetch.mockReset();
    mockCreateMutateAsync.mockReset();
    mockUpdateMutateAsync.mockReset();
    mockUpdateServicesMutateAsync.mockReset();
    mockRegenerateSlugMutateAsync.mockReset();

    vi.mocked(useStatusPageModule.useCreateStatusPage).mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      isPending: false,
    });
    vi.mocked(useStatusPageModule.useUpdateStatusPage).mockReturnValue({
      mutateAsync: mockUpdateMutateAsync,
      isPending: false,
    });
    vi.mocked(useStatusPageModule.useUpdateStatusPageServices).mockReturnValue({
      mutateAsync: mockUpdateServicesMutateAsync,
      isPending: false,
    });
    vi.mocked(useStatusPageModule.useRegenerateSlug).mockReturnValue({
      mutateAsync: mockRegenerateSlugMutateAsync,
      isPending: false,
    });

    vi.mocked(useEndpointsModule.useEndpoints).mockReturnValue({
      data: {
        data: [
          {
            _id: 'ep-1',
            name: 'Public Catalog Service',
            url: 'https://api.example.com/v1/products',
            isActive: true,
          },
          {
            _id: 'ep-2',
            name: 'Internal Billing API',
            url: 'https://api.example.com/v1/billing',
            isActive: false,
          },
        ],
      },
      isLoading: false,
    });
  });

  it('renders loading state when status page query is pending', () => {
    vi.mocked(useStatusPageModule.useMyStatusPage).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders(<StatusPageSettings />);

    expect(screen.getByTestId('status-page-loading')).toBeInTheDocument();
    expect(screen.getByText(/Loading status page configuration.../i)).toBeInTheDocument();
  });

  it('renders creation form when status page is not found (404)', async () => {
    vi.mocked(useStatusPageModule.useMyStatusPage).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { statusCode: 404, message: 'Status page not found for this account' },
      refetch: mockRefetch,
      isFetching: false,
    });

    mockCreateMutateAsync.mockResolvedValueOnce({
      _id: 'sp-1',
      title: 'Acme Status',
      slug: 'acme123',
    });

    renderWithProviders(<StatusPageSettings />);

    expect(screen.getByTestId('create-status-page-card')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Create Your Public Status Page/i })
    ).toBeInTheDocument();

    const titleInput = screen
      .getByTestId('create-status-page-title-input')
      .querySelector('input');
    const descInput = screen
      .getByTestId('create-status-page-desc-input')
      .querySelector('textarea');
    const createBtn = screen.getByTestId('create-status-page-btn');

    fireEvent.change(titleInput, { target: { value: 'Acme Global Status' } });
    fireEvent.change(descInput, { target: { value: 'Live uptime for Acme Cloud' } });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith({
        title: 'Acme Global Status',
        description: 'Live uptime for Acme Cloud',
      });
    });
  });

  it('renders active status page management view with slug and public URL', () => {
    vi.mocked(useStatusPageModule.useMyStatusPage).mockReturnValue({
      data: {
        _id: 'sp-1',
        slug: 'abc123def456',
        title: 'Production API Status',
        description: 'Current real-time operational status',
        isPublished: true,
        selectedEndpoints: ['ep-1'],
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    renderWithProviders(<StatusPageSettings />);

    expect(screen.getByTestId('status-page-overview-card')).toBeInTheDocument();
    expect(screen.getByTestId('status-page-visibility-chip')).toHaveTextContent(
      'Published & Live'
    );
    expect(screen.getByTestId('public-status-url-text')).toHaveTextContent(
      '/status/abc123def456'
    );
    expect(screen.getByTestId('view-public-page-btn')).toBeInTheDocument();
  });

  it('toggles publishing switch and invokes updateStatusPage mutation', async () => {
    vi.mocked(useStatusPageModule.useMyStatusPage).mockReturnValue({
      data: {
        _id: 'sp-1',
        slug: 'abc123def456',
        title: 'Production API Status',
        description: '',
        isPublished: false,
        selectedEndpoints: [],
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    mockUpdateMutateAsync.mockResolvedValueOnce({ isPublished: true });

    renderWithProviders(<StatusPageSettings />);

    const publishSwitch = screen.getByTestId('publish-switch').querySelector('input');
    expect(publishSwitch).not.toBeChecked();

    fireEvent.click(publishSwitch);

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith({ isPublished: true });
    });
  });

  it('updates branding settings when Save Branding Settings is clicked', async () => {
    vi.mocked(useStatusPageModule.useMyStatusPage).mockReturnValue({
      data: {
        _id: 'sp-1',
        slug: 'abc123def456',
        title: 'Old Title',
        description: 'Old Description',
        isPublished: true,
        selectedEndpoints: [],
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    mockUpdateMutateAsync.mockResolvedValueOnce({});

    renderWithProviders(<StatusPageSettings />);

    const titleInput = screen
      .getByTestId('status-page-title-input')
      .querySelector('input');
    const descInput = screen
      .getByTestId('status-page-desc-input')
      .querySelector('textarea');
    const saveBtn = screen.getByTestId('save-branding-btn');

    fireEvent.change(titleInput, { target: { value: 'New Brand Title' } });
    fireEvent.change(descInput, { target: { value: 'New Brand Description' } });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
        title: 'New Brand Title',
        description: 'New Brand Description',
      });
    });
  });

  it('selects eligible endpoint and disables inactive endpoint with tooltip', async () => {
    vi.mocked(useStatusPageModule.useMyStatusPage).mockReturnValue({
      data: {
        _id: 'sp-1',
        slug: 'abc123def456',
        title: 'Status Page',
        description: '',
        isPublished: true,
        selectedEndpoints: [],
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    mockUpdateServicesMutateAsync.mockResolvedValueOnce({});

    renderWithProviders(<StatusPageSettings />);

    // ep-1 is active (enabled)
    const ep1Checkbox = screen
      .getByTestId('endpoint-checkbox-ep-1')
      .querySelector('input');
    expect(ep1Checkbox).not.toBeDisabled();
    expect(ep1Checkbox).not.toBeChecked();

    // ep-2 is inactive (disabled)
    const ep2Checkbox = screen
      .getByTestId('endpoint-checkbox-ep-2')
      .querySelector('input');
    expect(ep2Checkbox).toBeDisabled();

    // Toggle ep-1 and save
    fireEvent.click(ep1Checkbox);
    expect(ep1Checkbox).toBeChecked();

    const saveServicesBtn = screen.getByTestId('save-services-btn');
    fireEvent.click(saveServicesBtn);

    await waitFor(() => {
      expect(mockUpdateServicesMutateAsync).toHaveBeenCalledWith({
        endpointIds: ['ep-1'],
      });
    });
  });
});
