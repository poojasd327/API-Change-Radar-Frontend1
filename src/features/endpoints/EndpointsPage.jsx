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
  Tooltip,
} from '@mui/material';
import {
  Server,
  ServerOff,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { env } from '@/lib/env';
import { useEndpoints } from '@/hooks/useEndpoints';

const METHOD_COLORS = {
  GET: {
    bg: 'rgba(2, 132, 199, 0.15)',
    text: '#38bdf8',
    border: 'rgba(2, 132, 199, 0.4)',
  },
  POST: {
    bg: 'rgba(16, 185, 129, 0.15)',
    text: '#34d399',
    border: 'rgba(16, 185, 129, 0.4)',
  },
  PUT: {
    bg: 'rgba(245, 158, 11, 0.15)',
    text: '#fbbf24',
    border: 'rgba(245, 158, 11, 0.4)',
  },
  PATCH: {
    bg: 'rgba(168, 85, 247, 0.15)',
    text: '#c084fc',
    border: 'rgba(168, 85, 247, 0.4)',
  },
  DELETE: {
    bg: 'rgba(244, 63, 94, 0.15)',
    text: '#fb7185',
    border: 'rgba(244, 63, 94, 0.4)',
  },
};

export const EndpointsPage = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error, refetch, isFetching } = useEndpoints({
    page,
    limit,
  });

  // Backend returns { data: [...], pagination: { total, page, limit, totalPages, ... } }
  const endpoints = useMemo(() => {
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.endpoints)) return data.endpoints;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  const pagination = data?.pagination || {
    total: endpoints.length,
    page,
    limit,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const metrics = useMemo(() => {
    const total = pagination.total ?? endpoints.length;
    const activeCount = endpoints.filter((ep) => ep.isActive).length;
    const contractCount = endpoints.filter((ep) => ep.hasActiveContract).length;
    return { total, activeCount, contractCount };
  }, [endpoints, pagination.total]);

  const handlePageChange = (_event, value) => {
    setPage(value);
  };

  return (
    <Stack spacing={3}>
      {/* Header bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
            Endpoint Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Live monitored API endpoints, contract readiness, and check status.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Button
            component={Link}
            to="/dashboard"
            variant="outlined"
            size="small"
            startIcon={<ArrowLeft size={16} />}
          >
            Dashboard
          </Button>
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
      </Box>

      {/* Target backend route indicator */}
      <Card variant="outlined" sx={{ bgcolor: 'rgba(15, 23, 42, 0.6)' }}>
        <CardHeader
          title={
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Server size={20} color="#60a5fa" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Monitored Endpoints
              </Typography>
            </Stack>
          }
          subheader={
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
            >
              Target API: GET {env.VITE_API_ENDPOINTS}
            </Typography>
          }
          action={
            !isLoading &&
            !isError &&
            endpoints.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: { xs: 1, sm: 0 } }}>
                <Chip
                  size="small"
                  label={`Total: ${metrics.total}`}
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.06)', fontWeight: 500 }}
                />
                <Chip
                  size="small"
                  label={`Active: ${metrics.activeCount}`}
                  sx={{
                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                    color: '#34d399',
                    fontWeight: 500,
                  }}
                />
                <Chip
                  size="small"
                  label={`Contracts: ${metrics.contractCount}`}
                  sx={{
                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                    color: '#60a5fa',
                    fontWeight: 500,
                  }}
                />
              </Stack>
            )
          }
        />

        <CardContent sx={{ pt: 1 }}>
          {/* 1. Loading State */}
          {isLoading && (
            <Box
              data-testid="endpoints-loading"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 6,
                textAlign: 'center',
              }}
            >
              <CircularProgress size={36} color="primary" />
              <Typography variant="body2" sx={{ mt: 2, fontWeight: 500 }}>
                Fetching monitored endpoints from backend...
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontFamily: 'monospace', mt: 0.5 }}
              >
                GET {env.VITE_API_ENDPOINTS}
              </Typography>
            </Box>
          )}

          {/* 2. Error State */}
          {!isLoading && isError && (
            <Alert
              severity="error"
              data-testid="endpoints-error"
              sx={{ mb: 1 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  startIcon={
                    <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
                  }
                >
                  Retry
                </Button>
              }
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {error?.statusCode === 401
                  ? 'Session Expired or Unauthorized'
                  : 'Unable to Load Endpoints'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {error?.message ||
                  `Could not fetch monitored endpoints from ${env.VITE_API_BASE_URL}.`}
              </Typography>
              {error?.statusCode === 401 && (
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="small"
                  color="inherit"
                  sx={{ mt: 1.5 }}
                >
                  Go to Sign In
                </Button>
              )}
            </Alert>
          )}

          {/* 3. Empty State (Successful response with 0 endpoints) */}
          {!isLoading && !isError && endpoints.length === 0 && (
            <Box
              data-testid="endpoints-empty"
              sx={{
                textAlign: 'center',
                py: 6,
                px: 2,
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <ServerOff size={28} color="#60a5fa" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
                No Monitored Endpoints Found
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', maxWidth: 440, mx: 'auto', mt: 1, mb: 2 }}
              >
                Your account does not have any monitored API endpoints registered yet.
                Once registered in the backend, endpoints will appear here with contract
                verification and drift status.
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
              >
                Verified backend response: 0 records returned from GET{' '}
                {env.VITE_API_ENDPOINTS}
              </Typography>
            </Box>
          )}

          {/* 4. Populated State (Successful response with endpoints) */}
          {!isLoading && !isError && endpoints.length > 0 && (
            <Box data-testid="endpoints-list">
              <TableContainer
                component={Paper}
                sx={{ bgcolor: 'transparent', boxShadow: 'none' }}
              >
                <Table aria-label="monitored endpoints table">
                  <TableHead>
                    <TableRow
                      sx={{ '& th': { borderColor: 'rgba(255, 255, 255, 0.08)' } }}
                    >
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Endpoint
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Method
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Contract
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Latest Check
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Registered
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {endpoints.map((ep) => {
                      const methodStyle = METHOD_COLORS[ep.method] || METHOD_COLORS.GET;

                      return (
                        <TableRow
                          key={ep._id}
                          data-testid={`endpoint-row-${ep._id}`}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            '& td': { borderColor: 'rgba(255, 255, 255, 0.06)' },
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' },
                          }}
                        >
                          {/* Name and URL */}
                          <TableCell component="th" scope="row">
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: '#ffffff' }}
                            >
                              {ep.name}
                            </Typography>
                            <Tooltip title={ep.url} placement="top">
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.secondary',
                                  fontFamily: 'monospace',
                                  display: 'block',
                                  maxWidth: 260,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {ep.url}
                              </Typography>
                            </Tooltip>
                          </TableCell>

                          {/* HTTP Method */}
                          <TableCell>
                            <Chip
                              size="small"
                              label={ep.method || 'GET'}
                              sx={{
                                bgcolor: methodStyle.bg,
                                color: methodStyle.text,
                                border: `1px solid ${methodStyle.border}`,
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                              }}
                            />
                          </TableCell>

                          {/* Active / Paused */}
                          <TableCell>
                            {ep.isActive ? (
                              <Chip
                                size="small"
                                icon={<CheckCircle2 size={12} color="#10b981" />}
                                label="Active"
                                sx={{
                                  bgcolor: 'rgba(16, 185, 129, 0.1)',
                                  color: '#34d399',
                                  border: '1px solid rgba(16, 185, 129, 0.25)',
                                  fontWeight: 500,
                                }}
                              />
                            ) : (
                              <Chip
                                size="small"
                                icon={<Clock size={12} color="#94a3b8" />}
                                label="Paused"
                                sx={{
                                  bgcolor: 'rgba(148, 163, 184, 0.1)',
                                  color: '#94a3b8',
                                  border: '1px solid rgba(148, 163, 184, 0.2)',
                                  fontWeight: 500,
                                }}
                              />
                            )}
                          </TableCell>

                          {/* Contract Readiness */}
                          <TableCell>
                            {ep.hasActiveContract ? (
                              <Chip
                                size="small"
                                icon={<ShieldCheck size={12} color="#10b981" />}
                                label="Approved"
                                sx={{
                                  bgcolor: 'rgba(16, 185, 129, 0.1)',
                                  color: '#34d399',
                                  border: '1px solid rgba(16, 185, 129, 0.25)',
                                  fontWeight: 500,
                                }}
                              />
                            ) : (
                              <Tooltip title="An approved contract is required for automated contract drift checks">
                                <Chip
                                  size="small"
                                  icon={<ShieldAlert size={12} color="#f59e0b" />}
                                  label="Pending"
                                  sx={{
                                    bgcolor: 'rgba(245, 158, 11, 0.1)',
                                    color: '#fbbf24',
                                    border: '1px solid rgba(245, 158, 11, 0.25)',
                                    fontWeight: 500,
                                  }}
                                />
                              </Tooltip>
                            )}
                          </TableCell>

                          {/* Latest Check Summary */}
                          <TableCell>
                            {ep.latestCheck ? (
                              <Stack spacing={0.5}>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  sx={{ alignItems: 'center' }}
                                >
                                  {ep.latestCheck.status === 'pass' ? (
                                    <Chip
                                      size="small"
                                      icon={<CheckCircle2 size={10} color="#10b981" />}
                                      label="Pass"
                                      sx={{
                                        bgcolor: 'rgba(16, 185, 129, 0.12)',
                                        color: '#34d399',
                                        fontSize: '0.7rem',
                                        height: 20,
                                      }}
                                    />
                                  ) : (
                                    <Chip
                                      size="small"
                                      icon={<XCircle size={10} color="#f43f5e" />}
                                      label={ep.latestCheck.status || 'Fail'}
                                      sx={{
                                        bgcolor: 'rgba(244, 63, 94, 0.12)',
                                        color: '#fb7185',
                                        fontSize: '0.7rem',
                                        height: 20,
                                      }}
                                    />
                                  )}
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontFamily: 'monospace',
                                      color: 'text.secondary',
                                    }}
                                  >
                                    {ep.latestCheck.responseTimeMs !== undefined &&
                                      `${ep.latestCheck.responseTimeMs}ms`}
                                    {ep.latestCheck.httpStatus &&
                                      ` • HTTP ${ep.latestCheck.httpStatus}`}
                                  </Typography>
                                </Stack>
                                {ep.latestCheck.failureType && (
                                  <Typography
                                    variant="caption"
                                    sx={{ color: '#fb7185', fontSize: '0.7rem' }}
                                  >
                                    {ep.latestCheck.failureType}
                                  </Typography>
                                )}
                              </Stack>
                            ) : (
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary' }}
                              >
                                No check run yet
                              </Typography>
                            )}
                          </TableCell>

                          {/* Created Timestamp */}
                          <TableCell>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary' }}
                            >
                              {ep.createdAt
                                ? new Date(ep.createdAt).toLocaleDateString()
                                : '—'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination controls */}
              {pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    shape="rounded"
                    size="small"
                  />
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};
