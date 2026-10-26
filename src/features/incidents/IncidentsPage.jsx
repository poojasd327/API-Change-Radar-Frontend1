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
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { env } from '@/lib/env';
import { useIncidents } from '@/hooks/useIncidents';

export const IncidentsPage = () => {
  const { data, isLoading, error, refetch, isFetching } = useIncidents({
    page: 1,
    limit: 10,
  });

  return (
    <Stack spacing={3}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
            Incident Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage contract breach incidents, triage alerts, and mark issues as resolved.
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
              <AlertTriangle size={20} color="#fbbf24" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Incident Feed
              </Typography>
            </Stack>
          }
          subheader={`Target backend route: ${env.VITE_API_INCIDENTS}`}
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
                Fetching incidents from {env.VITE_API_INCIDENTS}...
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              {error.message || 'Unable to fetch incidents from backend.'}
            </Alert>
          ) : (
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Connected to {env.VITE_API_INCIDENTS}. Total incidents:{' '}
                {data?.incidents?.length ?? 0}.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};
