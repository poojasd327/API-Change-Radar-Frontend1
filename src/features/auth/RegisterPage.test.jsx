import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/theme/theme';
import { RegisterPage } from './RegisterPage';
import * as useAuthModule from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth');

const renderWithProviders = (ui) => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/register']}>{ui}</MemoryRouter>
    </ThemeProvider>
  );
};

describe('RegisterPage', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      register: mockRegister,
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  });

  it('renders registration form with name, email, password fields', () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByRole('heading', { name: /Create Account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Create Account$/i })).toBeInTheDocument();
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
  });

  it('validates name length (2 to 50 chars) before submitting', async () => {
    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'A' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'StrongPass123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Create Account$/i }));

    expect(
      await screen.findByText('Name must be between 2 and 50 characters')
    ).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('validates minimum password length (8 chars) before submitting', async () => {
    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'Alice Smith' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'short' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Create Account$/i }));

    expect(
      await screen.findByText('Password must be at least 8 characters long')
    ).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('handles duplicate email (409 Conflict) and renders link to login', async () => {
    mockRegister.mockRejectedValueOnce({
      message: 'Email is already registered',
      statusCode: 409,
    });

    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'Alice Smith' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'StrongPassword123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Create Account$/i }));

    expect(await screen.findByText('Email is already registered')).toBeInTheDocument();
    expect(screen.getByText('Sign in with this email instead')).toBeInTheDocument();
  });

  it('calls register and succeeds without error display', async () => {
    mockRegister.mockResolvedValueOnce({
      message: 'User registered successfully',
      token: 'jwt-registered',
      user: { id: 'u2', email: 'alice@example.com', name: 'Alice Smith' },
    });

    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'Alice Smith' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'StrongPassword123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Create Account$/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'StrongPassword123!',
      });
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
