import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0ea5e9',
      light: '#38bdf8',
      dark: '#0284c7',
      contrastText: '#ffffff',
    },
    background: {
      default: '#030712',
      paper: '#0f172a',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
    error: {
      main: '#f43f5e',
      light: '#fb7185',
      dark: '#e11d48',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    info: {
      main: '#38bdf8',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#030712',
          backgroundImage:
            'radial-gradient(at 10% 10%, rgba(37, 99, 235, 0.08) 0px, transparent 50%), radial-gradient(at 90% 90%, rgba(14, 165, 233, 0.06) 0px, transparent 50%)',
          color: '#f8fafc',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
        },
        contained: {
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
        },
      },
    },
  },
});
