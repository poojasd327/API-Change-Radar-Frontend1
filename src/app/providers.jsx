import React from 'react';
import PropTypes from 'prop-types';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { queryClient } from '@/lib/query-client';
import { theme } from '@/theme/theme';
import { AuthProvider } from '@/context/AuthContext';

export const Providers = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

Providers.propTypes = {
  children: PropTypes.node.isRequired,
};
