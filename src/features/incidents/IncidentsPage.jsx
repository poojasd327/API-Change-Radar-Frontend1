import React, { useState, useMemo } from 'react';
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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  ButtonGroup,
  Tooltip,
} from '@mui/material';
import {
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { env } from '@/lib/env';
import { useIncidents } from '@/hooks/useIncidents';

const FAILURE_TYPE_CONFIG = {
  SCHEMA_VIOLATION: {
    label: 'Schema Violation',
    color: '#f87171',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.3)',
  },
  HTTP_ERROR: {
    label: 'HTTP Error',
    color: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  NETWORK_ERROR: {
    label: 'Network Error',
    color: '#f87171',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.3)',
  },
  TIMEOUT: {
    label: 'Timeout',
    color: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.3)',
  },
};

function formatTimestamp(isoStr) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return isNaN(d.getTime()) ? isoStr : d.toLocaleString();
  } catch {
    return isoStr;
  }
}

export const IncidentsPage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryParams = useMemo(() => {
    const params = { page, limit };
    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }
    return params;
  }, [statusFilter, page, limit]);

  const { data, isLoading, error, refetch, isFetching } = useIncidents(queryParams);

  // Normalize response data: backend returns { data: [...], pagination: { total, totalPages, ... } }
  const incidents = useMemo(() => {
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.incidents)) return data.incidents;
    return [];
  }, [data]);

  const totalIncidents = data?.pagination?.total ?? incidents.length;
  const totalPages =
    data?.pagination?.totalPages ?? (Math.ceil(totalIncidents / limit) || 1);

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setPage(1);
  };

  return (
    <Stack spacing={3}>
      {/* Top Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Incident Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Contract breach alerts, scheduled failure tracking, and automatic recovery
            lifecycle.
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

      {/* Main Incident Card */}
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
          subheader={`Connected to ${env.VITE_API_INCIDENTS} • ${totalIncidents} incident${totalIncidents === 1 ? '' : 's'} recorded`}
          action={
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <ButtonGroup size="small" variant="outlined">
                <Button
                  onClick={() => handleFilterChange('all')}
                  variant={statusFilter === 'all' ? 'contained' : 'outlined'}
                  sx={{ textTransform: 'none' }}
                >
                  All
                </Button>
                <Button
                  onClick={() => handleFilterChange('open')}
                  variant={statusFilter === 'open' ? 'contained' : 'outlined'}
                  color="error"
                  sx={{ textTransform: 'none' }}
                >
                  Open
                </Button>
                <Button
                  onClick={() => handleFilterChange('resolved')}
                  variant={statusFilter === 'resolved' ? 'contained' : 'outlined'}
                  color="success"
                  sx={{ textTransform: 'none' }}
                >
                  Resolved
                </Button>
              </ButtonGroup>

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
            </Stack>
          }
        />

        <CardContent>
          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                py: 6,
                justifyContent: 'center',
              }}
            >
              <CircularProgress size={28} />
              <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                Fetching incidents from {env.VITE_API_INCIDENTS}...
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message || 'Unable to fetch incidents from backend.'}
            </Alert>
          ) : incidents.length === 0 ? (
            /* Clean, Informative Empty State */
            <Box
              sx={{
                textAlign: 'center',
                py: 6,
                px: 2,
                borderRadius: 2,
                border: '1px dashed #cbd5e1',
                backgroundColor: '#f8fafc',
              }}
            >
              <ShieldCheck size={44} color="#10b981" style={{ marginBottom: 12 }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}
              >
                {statusFilter === 'all'
                  ? 'No Incidents Recorded'
                  : `No ${statusFilter.toUpperCase()} Incidents Found`}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', maxWidth: 520, mx: 'auto', mb: 2 }}
              >
                {statusFilter === 'all'
                  ? 'All monitored endpoints with approved contracts are operating within healthy contract thresholds. The background scheduler records incidents automatically when scheduled runs fail.'
                  : `There are currently no incidents matching the '${statusFilter}' status filter.`}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'inline-block',
                  color: 'text.secondary',
                  backgroundColor: '#f1f5f9',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                }}
              >
                Connected to {env.VITE_API_INCIDENTS} • Total: {totalIncidents}
              </Typography>
            </Box>
          ) : (
            /* Rich Incidents Table */
            <Stack spacing={2}>
              <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
                <Table size="small" aria-label="incidents feed table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Endpoint & Method</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Failure Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Incident Title & Details
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Occurrences</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Last Seen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {incidents.map((incident) => {
                      const failureMeta = FAILURE_TYPE_CONFIG[incident.failureType] || {
                        label: incident.failureType || 'Error',
                        color: '#fbbf24',
                        bg: 'rgba(245, 158, 11, 0.15)',
                        border: 'rgba(245, 158, 11, 0.3)',
                      };

                      const isOpen = incident.status === 'open';

                      return (
                        <TableRow
                          key={incident._id || incident.id}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.02)',
                            },
                          }}
                        >
                          {/* Status Chip */}
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Chip
                              size="small"
                              icon={
                                isOpen ? (
                                  <AlertTriangle size={14} color="#f87171" />
                                ) : (
                                  <CheckCircle2 size={14} color="#34d399" />
                                )
                              }
                              label={isOpen ? 'OPEN' : 'RESOLVED'}
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                color: isOpen ? '#f87171' : '#34d399',
                                backgroundColor: isOpen
                                  ? 'rgba(239, 68, 68, 0.12)'
                                  : 'rgba(16, 185, 129, 0.12)',
                                border: `1px solid ${
                                  isOpen
                                    ? 'rgba(239, 68, 68, 0.3)'
                                    : 'rgba(16, 185, 129, 0.3)'
                                }`,
                              }}
                            />
                          </TableCell>

                          {/* Endpoint Info */}
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: 'center' }}
                              >
                                {incident.endpoint?.method && (
                                  <Chip
                                    size="small"
                                    label={incident.endpoint.method}
                                    sx={{
                                      fontSize: '0.65rem',
                                      height: 18,
                                      fontWeight: 700,
                                      backgroundColor: 'rgba(2, 132, 199, 0.15)',
                                      color: '#38bdf8',
                                    }}
                                  />
                                )}
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600, color: 'text.primary' }}
                                >
                                  {incident.endpoint?.name || 'Monitored Endpoint'}
                                </Typography>
                              </Stack>
                              {incident.endpoint?.url && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: 'monospace',
                                    color: 'text.secondary',
                                    wordBreak: 'break-all',
                                  }}
                                >
                                  {incident.endpoint.url}
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>

                          {/* Failure Type */}
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Chip
                              size="small"
                              label={failureMeta.label}
                              sx={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color: failureMeta.color,
                                backgroundColor: failureMeta.bg,
                                border: `1px solid ${failureMeta.border}`,
                              }}
                            />
                          </TableCell>

                          {/* Title & Description */}
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {incident.title}
                              </Typography>
                              {incident.description && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'text.secondary',
                                    fontFamily: 'monospace',
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  {incident.description}
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>

                          {/* Occurrence Count */}
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Tooltip
                              title={`Failure recorded ${incident.occurrenceCount} time${
                                incident.occurrenceCount === 1 ? '' : 's'
                              }`}
                            >
                              <Chip
                                size="small"
                                label={`${incident.occurrenceCount}x`}
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.72rem',
                                  backgroundColor: '#f1f5f9',
                                  color: '#334155',
                                }}
                              />
                            </Tooltip>
                          </TableCell>

                          {/* Timestamps */}
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Stack spacing={0.5}>
                              <Stack
                                direction="row"
                                spacing={0.5}
                                sx={{ alignItems: 'center' }}
                              >
                                <Clock size={12} color="#94a3b8" />
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'text.primary' }}
                                >
                                  {formatTimestamp(incident.lastSeenAt)}
                                </Typography>
                              </Stack>
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', fontSize: '0.68rem' }}
                              >
                                First: {formatTimestamp(incident.firstSeenAt)}
                              </Typography>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, val) => setPage(val)}
                    color="primary"
                    size="small"
                  />
                </Box>
              )}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};
