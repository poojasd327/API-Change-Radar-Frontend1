import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Box, Paper, Typography, Button, Stack, Alert } from '@mui/material';
import { RefreshCw, LogIn, AlertCircle } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';

/**
 * ProtectedRoute Component
 *
 * NOTE ON ARCHITECTURAL SECURITY:
 * Client-side route guarding provides UX-level flow control (redirecting unauthenticated
 * visitors away from private dashboard views). It DOES NOT replace backend authorization.
 * All actual data, monitored endpoints, and incident actions are strictly secured by
 * the Node.js backend using JWT bearer token verification.
 */
export const ProtectedRoute = ({
  isAuthenticated: propIsAuthenticated,
  isLoading: propIsLoading,
  redirectPath = '/login',
  children,
}) => {
  const location = useLocation();
  const authContext = useContext(AuthContext);

  const isAuthenticated =
    propIsAuthenticated !== undefined
      ? propIsAuthenticated
      : (authContext?.isAuthenticated ?? false);

  const isLoading =
    propIsLoading !== undefined ? propIsLoading : (authContext?.isLoading ?? false);

  const restorationError = authContext?.restorationError ?? null;
  const retryRestoration = authContext?.retryRestoration ?? null;
  const logout = authContext?.logout ?? null;

  // 1. Session verification loading state
  if (isLoading) {
    return (
      <Box
        data-testid="protected-route-loading"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '3px solid rgba(59, 130, 246, 0.2)',
              borderTopColor: '#3b82f6',
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Verifying authenticated session...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // 2. Network / backend temporary unreachable state on startup
  // Do NOT silently log the user out; allow retrying connection to the backend.
  if (restorationError && !isAuthenticated) {
    return (
      <Box
        data-testid="protected-route-error"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
        }}
        className="radar-grid"
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            maxWidth: 480,
            width: '100%',
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <Stack spacing={3}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  display: 'flex',
                }}
              >
                <AlertCircle size={22} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Backend Connection Unavailable
              </Typography>
            </Stack>

            <Alert severity="warning" variant="outlined" sx={{ fontSize: '0.85rem' }}>
              Your session token is retained, but the frontend could not reach the
              APIChange Radar backend at{' '}
              <strong>
                {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}
              </strong>
              .
            </Alert>

            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
            >
              Ensure the Node.js backend server is running, then click Retry to resume
              your session.
            </Typography>

            <Stack direction="row" spacing={2}>
              {retryRestoration && (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={retryRestoration}
                  startIcon={<RefreshCw size={16} />}
                >
                  Retry Connection
                </Button>
              )}
              {logout && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={logout}
                  startIcon={<LogIn size={16} />}
                >
                  Sign In Anew
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // 3. Unauthenticated state => redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // 4. Authenticated state => render content
  return children ? <>{children}</> : <Outlet />;
};

ProtectedRoute.propTypes = {
  isAuthenticated: PropTypes.bool,
  isLoading: PropTypes.bool,
  redirectPath: PropTypes.string,
  children: PropTypes.node,
};
