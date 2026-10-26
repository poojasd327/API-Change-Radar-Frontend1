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
import { Activity, ArrowLeft, RefreshCw } from 'lucide-react';
import { env } from '@/lib/env';
import { useChecksHistory } from '@/hooks/useChecks';

export const ChecksPage = () => {
  const { data, isLoading, error, refetch, isFetching } = useChecksHistory({
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
            Check History
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Audit logs of automated health checks, response times, and detected contract
            drifts.
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
              <Activity size={20} color="#60a5fa" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Check History Logs
              </Typography>
            </Stack>
          }
          subheader={`Target backend route: ${env.VITE_API_CHECKS_HISTORY}`}
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
                Fetching check logs from {env.VITE_API_CHECKS_HISTORY}...
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              {error.message || 'Unable to fetch check logs from backend.'}
            </Alert>
          ) : (
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Connected to {env.VITE_API_CHECKS_HISTORY}. Logged checks:{' '}
                {data?.checks?.length ?? 0}.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};
