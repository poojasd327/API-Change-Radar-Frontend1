import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/theme/theme';
import { ManageContractDialog } from './ManageContractDialog';
import * as useContractsModule from '@/hooks/useContracts';

vi.mock('@/hooks/useContracts');

const mockEndpoint = {
  _id: 'ep-github-1',
  name: 'GitHub Status API',
  url: 'https://www.githubstatus.com/api/v2/status.json',
  method: 'GET',
  hasActiveContract: false,
};

const renderWithTheme = (ui) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('ManageContractDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockCreateMutateAsync = vi.fn();
  const mockValidateMutateAsync = vi.fn();
  const mockInferMutateAsync = vi.fn();
  const mockApproveMutateAsync = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockOnClose.mockReset();
    mockOnSuccess.mockReset();
    mockCreateMutateAsync.mockReset();
    mockValidateMutateAsync.mockReset();
    mockInferMutateAsync.mockReset();
    mockApproveMutateAsync.mockReset();

    vi.spyOn(useContractsModule, 'useContracts').mockReturnValue({
      data: { data: [] },
      isLoading: false,
      refetch: vi.fn(),
    });

    vi.spyOn(useContractsModule, 'useCreateContract').mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      isPending: false,
    });

    vi.spyOn(useContractsModule, 'useValidateContract').mockReturnValue({
      mutateAsync: mockValidateMutateAsync,
      isPending: false,
    });

    vi.spyOn(useContractsModule, 'useInferContract').mockReturnValue({
      mutateAsync: mockInferMutateAsync,
      isPending: false,
    });

    vi.spyOn(useContractsModule, 'useApproveContract').mockReturnValue({
      mutateAsync: mockApproveMutateAsync,
      isPending: false,
    });
  });

  it('renders dialog when open with pre-selected endpoint', () => {
    renderWithTheme(
      <ManageContractDialog
        open={true}
        onClose={mockOnClose}
        endpoint={mockEndpoint}
        endpoints={[mockEndpoint]}
      />
    );

    expect(screen.getByTestId('manage-contract-dialog')).toBeInTheDocument();
    expect(screen.getByText('API Contract Management')).toBeInTheDocument();
    expect(screen.getByText('Pending Contract')).toBeInTheDocument();
  });

  it('infers schema when clicking Generate Schema from JSON button', async () => {
    const inferredSchema = {
      type: 'object',
      required: ['page', 'status'],
      properties: {
        page: { type: 'object' },
        status: { type: 'object' },
      },
    };
    mockInferMutateAsync.mockResolvedValueOnce({ schema: inferredSchema });

    renderWithTheme(
      <ManageContractDialog
        open={true}
        onClose={mockOnClose}
        endpoint={mockEndpoint}
        endpoints={[mockEndpoint]}
      />
    );

    const inferBtn = screen.getByTestId('infer-schema-btn');
    fireEvent.click(inferBtn);

    await waitFor(() => {
      expect(mockInferMutateAsync).toHaveBeenCalled();
      const schemaInput = screen.getByTestId('schema-json-input');
      expect(schemaInput.value).toContain('page');
      expect(schemaInput.value).toContain('status');
    });
  });

  it('validates schema when clicking Validate Schema button', async () => {
    mockValidateMutateAsync.mockResolvedValueOnce({
      valid: true,
      schemaValid: true,
      schemaErrors: [],
    });

    renderWithTheme(
      <ManageContractDialog
        open={true}
        onClose={mockOnClose}
        endpoint={mockEndpoint}
        endpoints={[mockEndpoint]}
      />
    );

    const schemaInput = screen.getByTestId('schema-json-input');
    fireEvent.change(schemaInput, {
      target: {
        value: JSON.stringify({ type: 'object', required: ['status'] }),
      },
    });

    const validateBtn = screen.getByTestId('validate-contract-btn');
    fireEvent.click(validateBtn);

    await waitFor(() => {
      expect(mockValidateMutateAsync).toHaveBeenCalledWith({
        schema: { type: 'object', required: ['status'] },
        sampleData: expect.anything(),
      });
      expect(screen.getByTestId('validation-diagnostics')).toBeInTheDocument();
      expect(
        screen.getByText(/Schema is syntactically valid! Ready to save./i)
      ).toBeInTheDocument();
    });
  });

  it('saves contract as pending approval and triggers mutation with endpointId', async () => {
    mockCreateMutateAsync.mockResolvedValueOnce({
      message: 'Contract created successfully',
      contract: { _id: 'c-new', name: 'GitHub Status Contract', isApproved: false },
    });

    renderWithTheme(
      <ManageContractDialog
        open={true}
        onClose={mockOnClose}
        endpoint={mockEndpoint}
        endpoints={[mockEndpoint]}
        onSuccess={mockOnSuccess}
      />
    );

    const schemaInput = screen.getByTestId('schema-json-input');
    fireEvent.change(schemaInput, {
      target: {
        value: JSON.stringify({
          type: 'object',
          properties: { test: { type: 'string' } },
        }),
      },
    });

    const saveBtn = screen.getByTestId('save-contract-btn');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith({
        endpointId: 'ep-github-1',
        name: 'GitHub Status API Contract',
        schema: { type: 'object', properties: { test: { type: 'string' } } },
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('renders saved contracts and executes explicit approval action', async () => {
    const savedContracts = [
      {
        _id: 'c-saved-1',
        name: 'GitHub Status Contract v1',
        version: 1,
        isApproved: false,
        isActive: false,
        createdAt: '2026-10-26T06:00:00.000Z',
        schema: { type: 'object' },
      },
    ];

    vi.spyOn(useContractsModule, 'useContracts').mockReturnValue({
      data: { data: savedContracts },
      isLoading: false,
      refetch: vi.fn(),
    });

    mockApproveMutateAsync.mockResolvedValueOnce({
      message: 'Contract approved successfully',
      contract: { _id: 'c-saved-1', isApproved: true, isActive: true },
    });

    renderWithTheme(
      <ManageContractDialog
        open={true}
        onClose={mockOnClose}
        endpoint={mockEndpoint}
        endpoints={[mockEndpoint]}
        onSuccess={mockOnSuccess}
      />
    );

    // Switch to Saved Contracts tab
    const tabSaved = screen.getByTestId('tab-saved-contracts');
    fireEvent.click(tabSaved);

    expect(screen.getByTestId('contract-card-c-saved-1')).toBeInTheDocument();
    expect(screen.getByText('GitHub Status Contract v1')).toBeInTheDocument();
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();

    // Click Approve Contract
    const approveBtn = screen.getByTestId('approve-contract-btn-c-saved-1');
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(mockApproveMutateAsync).toHaveBeenCalledWith('c-saved-1');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
