import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardHeader,
  CardContent,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Globe, ArrowLeft, RefreshCw } from 'lucide-react';
import { env } from '@/lib/env';
import { useMyStatusPage } from '@/hooks/useStatusPage';

export const StatusPageSettings = () => {
  const { data, isLoading, error, refetch, isFetching } = useMyStatusPage();

  return (
    <Stack spacing={3}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
            Public Status Page Settings
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Configure branding, visibility, and published endpoints for public
            transparency.
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/"
          variant="outlined"
          size="small"
          startIcon={<ArrowLeft size={16} />}
        >
          Starter Screen
        </Button>
      </Box>

      <Card>
        <CardHeader
          title={
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Globe size={20} color="#60a5fa" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Status Page Configuration
              </Typography>
            </Stack>
          }
          subheader={`Target backend route: ${env.VITE_API_STATUS_PAGE_ME}`}
          action={
            <Button
              variant="outlined"
              size="small"
              onClick={() => refetch()}
              disabled={isFetching}
              startIcon={
                <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              }
            >
              Refresh
            </Button>
          }
        />
        <CardContent>
          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                py: 4,
                justifyContent: 'center',
              }}
            >
              <CircularProgress size={28} />
              <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                Fetching status page configuration from {env.VITE_API_STATUS_PAGE_ME}...
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              {error.message ||
                'No active status page configured yet. You can create one below.'}
            </Alert>
          ) : (
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Connected to {env.VITE_API_STATUS_PAGE_ME}. Current slug:{' '}
                <strong>{data?.statusPage?.slug || 'Not generated'}</strong>.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};
