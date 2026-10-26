import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/theme/theme';
import { LoginPage } from './LoginPage';
import * as useAuthModule from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth');

const renderWithProviders = (ui) => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/login']}>{ui}</MemoryRouter>
    </ThemeProvider>
  );
};

describe('LoginPage', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  });

  it('renders login form with email, password, and submit controls', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole('heading', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Sign In$/i })).toBeInTheDocument();
    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
  });

  it('validates required fields before submitting', async () => {
    renderWithProviders(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: /^Sign In$/i }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('validates email format before submitting', async () => {
    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'not-an-email' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Sign In$/i }));

    expect(
      await screen.findByText('Please enter a valid email address')
    ).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login and handles 401 error message gracefully', async () => {
    mockLogin.mockRejectedValueOnce({
      message: 'Invalid email or password',
      statusCode: 401,
    });

    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'wrong-password' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Sign In$/i }));

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'wrong-password',
    });

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });

  it('toggles password visibility when eye icon is clicked', () => {
    renderWithProviders(<LoginPage />);

    const passwordInput = screen.getByLabelText(/^Password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByRole('button', { name: /Show password/i });
    fireEvent.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: /Hide password/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('calls login and succeeds without error display', async () => {
    mockLogin.mockResolvedValueOnce({
      message: 'Login successful',
      token: 'jwt-xyz',
      user: { id: 'u1', email: 'alice@example.com' },
    });

    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'StrongPassword123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Sign In$/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'alice@example.com',
        password: 'StrongPassword123!',
      });
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
