import React, { useContext } from 'react';
import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  CircularProgress,
} from '@mui/material';
import { Radio } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';

export const AuthLayout = () => {
  const authContext = useContext(AuthContext);
  const location = useLocation();

  const isAuthenticated = authContext?.isAuthenticated ?? false;
  const isLoading = authContext?.isLoading ?? false;

  // 1. Show clean loading state while restoring session
  if (isLoading) {
    return (
      <Box
        data-testid="auth-layout-loading"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress size={32} />
      </Box>
    );
  }

  // 2. Redirect authenticated users away from public auth pages to dashboard
  if (isAuthenticated) {
    const fromPath = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={fromPath} replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
      }}
      className="radar-grid"
    >
      <Container maxWidth="xs">
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', mb: 4 }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
            }}
          >
            <Box
              sx={{
                p: 1.2,
                borderRadius: 2,
                bgcolor: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Radio size={22} className="animate-pulse" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
              APIChange{' '}
              <Box component="span" sx={{ color: '#2563eb' }}>
                Radar
              </Box>
            </Typography>
          </Link>
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'text.secondary',
            }}
          >
            Admin Portal Authentication
          </Typography>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Outlet />
        </Paper>

        <Typography
          variant="caption"
          sx={{ display: 'block', textAlign: 'center', mt: 4, color: 'text.secondary' }}
        >
          &copy; {new Date().getFullYear()} APIChange Radar. Private Admin Dashboard.
        </Typography>
      </Container>
    </Box>
  );
};
