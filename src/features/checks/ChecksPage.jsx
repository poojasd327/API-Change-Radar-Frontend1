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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Activity,
  Play,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Server,
  Zap,
} from 'lucide-react';
import { env } from '@/lib/env';
import { useChecksHistory, useRunMockCheck } from '@/hooks/useChecks';

const SCENARIOS = [
  {
    value: 'healthy',
    label: 'Standard Contract (Healthy 200 OK)',
    description: 'Complies with all JSON schema rules and returns 200 OK.',
  },
  {
    value: 'missing-price',
    label: 'Schema Violation: Missing Property',
    description: 'Omits the required "price" property from response payload.',
  },
  {
    value: 'wrong-price-type',
    label: 'Schema Violation: Wrong Data Type',
    description: 'Returns "price" as a string instead of expected number.',
  },
  {
    value: 'server-error',
    label: 'HTTP Error: Upstream 500 Failure',
    description: 'Simulates internal server error with HTTP 500 status code.',
  },
  {
    value: 'slow',
    label: 'Latency: Slow Response Time',
    description: 'Delays response to test response time measurement and timeouts.',
  },
];

export const ChecksPage = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  // Manual Check Form State
  const [scenario, setScenario] = useState('healthy');
  const [delay, setDelay] = useState(500);
  const [timeoutMs, setTimeoutMs] = useState(3000);
  const [lastResult, setLastResult] = useState(null);
  const [checkError, setCheckError] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useChecksHistory({
    page,
    limit,
  });

  const runMockCheckMutation = useRunMockCheck();

  // Normalize checks list from backend response: { data: [...], pagination: { ... } }
  const checks = useMemo(() => {
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.checks)) return data.checks;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  const pagination = data?.pagination || {
    total: checks.length,
    page,
    limit,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const metrics = useMemo(() => {
    const total = pagination.total ?? checks.length;
    const healthyCount = checks.filter(
      (c) => c.status === 'healthy' || c.status === 'pass'
    ).length;
    const failedCount = checks.filter(
      (c) => c.status === 'failed' || c.status === 'fail'
    ).length;
    return { total, healthyCount, failedCount };
  }, [checks, pagination.total]);

  const handlePageChange = (_event, value) => {
    setPage(value);
  };

  const handleRunCheck = async (e) => {
    e.preventDefault();
    setCheckError(null);

    const payload = {};
    if (scenario !== 'healthy') {
      payload.scenario = scenario;
    }
    if (scenario === 'slow') {
      payload.delay = Number(delay);
    }
    if (Number(timeoutMs) > 0) {
      payload.timeoutMs = Number(timeoutMs);
    }

    try {
      const result = await runMockCheckMutation.mutateAsync(payload);
      setLastResult(result);
    } catch (err) {
      setCheckError(
        err?.message || 'Failed to execute manual API check against backend.'
      );
    }
  };

  return (
    <Stack spacing={3}>
      {/* Top Header */}
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
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            API Checks & Change Detection
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Execute manual contract verifications, test failure scenarios, and review
            persisted audit history.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Button
            component={Link}
            to="/endpoints"
            variant="outlined"
            size="small"
            startIcon={<Server size={16} />}
          >
            Endpoints
          </Button>
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

      {/* Manual Check Controller Panel */}
      <Card
        variant="outlined"
        sx={{
          bgcolor: '#ffffff',
          borderColor: '#e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          borderRadius: 2,
        }}
      >
        <CardHeader
          title={
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Zap size={20} color="#2563eb" />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Manual API Check Runner
              </Typography>
            </Stack>
          }
          subheader={
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
            >
              Target API: POST {env.VITE_API_CHECKS_MOCK_PRODUCT} • Scoped to your account
            </Typography>
          }
        />
        <CardContent sx={{ pt: 1 }}>
          <Box component="form" onSubmit={handleRunCheck}>
            <Stack spacing={2.5}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                sx={{ alignItems: 'flex-start' }}
              >
                {/* Scenario Selector */}
                <FormControl sx={{ minWidth: { xs: '100%', md: 340 } }}>
                  <InputLabel id="scenario-select-label">Test Scenario</InputLabel>
                  <Select
                    labelId="scenario-select-label"
                    id="scenario-select"
                    value={scenario}
                    label="Test Scenario"
                    onChange={(e) => setScenario(e.target.value)}
                    disabled={runMockCheckMutation.isPending}
                    data-testid="scenario-select"
                  >
                    {SCENARIOS.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {s.label}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', display: 'block' }}
                          >
                            {s.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Optional Delay (for slow scenario) */}
                {scenario === 'slow' && (
                  <TextField
                    label="Delay (ms)"
                    type="number"
                    size="medium"
                    value={delay}
                    onChange={(e) => setDelay(e.target.value)}
                    disabled={runMockCheckMutation.isPending}
                    helperText="Clamped 50–2000ms"
                    sx={{ width: { xs: '100%', sm: 160 } }}
                    slotProps={{
                      htmlInput: {
                        min: 50,
                        max: 2000,
                        'data-testid': 'delay-input',
                      },
                    }}
                  />
                )}

                {/* Timeout */}
                <TextField
                  label="Timeout (ms)"
                  type="number"
                  size="medium"
                  value={timeoutMs}
                  onChange={(e) => setTimeoutMs(e.target.value)}
                  disabled={runMockCheckMutation.isPending}
                  helperText="Default: 3000ms (max 10000ms)"
                  sx={{ width: { xs: '100%', sm: 180 } }}
                  slotProps={{
                    htmlInput: {
                      min: 50,
                      max: 10000,
                      'data-testid': 'timeout-input',
                    },
                  }}
                />

                {/* Trigger Button */}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={runMockCheckMutation.isPending}
                  startIcon={
                    runMockCheckMutation.isPending ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Play size={16} />
                    )
                  }
                  data-testid="execute-check-btn"
                  sx={{ height: 56, px: 3, fontWeight: 600 }}
                >
                  {runMockCheckMutation.isPending ? 'Executing Check...' : 'Run Check'}
                </Button>
              </Stack>

              {/* Error Alert */}
              {checkError && (
                <Alert
                  severity="error"
                  data-testid="check-error-alert"
                  onClose={() => setCheckError(null)}
                >
                  {checkError}
                </Alert>
              )}

              {/* Execution Result Box */}
              {lastResult && (
                <Paper
                  variant="outlined"
                  data-testid="check-result-card"
                  sx={{
                    p: 2.5,
                    bgcolor: lastResult.status === 'healthy' ? '#f0fdf4' : '#fef2f2',
                    borderColor: lastResult.status === 'healthy' ? '#bbf7d0' : '#fecaca',
                    borderRadius: 2,
                  }}
                >
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 1.5,
                      }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        {lastResult.status === 'healthy' ? (
                          <Chip
                            icon={<CheckCircle2 size={16} color="#059669" />}
                            label="Check Passed • Healthy"
                            sx={{
                              bgcolor: 'rgba(16, 185, 129, 0.1)',
                              color: '#059669',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              fontWeight: 700,
                            }}
                          />
                        ) : (
                          <Chip
                            icon={<XCircle size={16} color="#dc2626" />}
                            label="Check Failed • Contract Violation"
                            sx={{
                              bgcolor: 'rgba(239, 68, 68, 0.1)',
                              color: '#dc2626',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              fontWeight: 700,
                            }}
                          />
                        )}

                        {lastResult.failureType && (
                          <Chip
                            size="small"
                            label={lastResult.failureType}
                            sx={{
                              bgcolor: 'rgba(245, 158, 11, 0.1)',
                              color: '#d97706',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              fontFamily: 'monospace',
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Stack>

                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
                      >
                        Run ID: {lastResult.checkRunId || 'Persisted in MongoDB'}
                      </Typography>
                    </Box>

                    {/* Result Details Grid */}
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr 1fr',
                          sm: 'repeat(4, 1fr)',
                        },
                        gap: 2,
                        pt: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Response Time
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600, color: 'text.primary' }}
                        >
                          {lastResult.responseTimeMs}ms
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          HTTP Status
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color:
                              lastResult.httpStatus && lastResult.httpStatus < 400
                                ? '#059669'
                                : '#dc2626',
                          }}
                        >
                          {lastResult.httpStatus
                            ? `HTTP ${lastResult.httpStatus}`
                            : 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Schema Valid
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: lastResult.schemaValid ? '#059669' : '#dc2626',
                          }}
                        >
                          {lastResult.schemaValid ? 'Valid' : 'Violation'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Execution Timestamp
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            fontWeight: 500,
                            color: 'text.primary',
                          }}
                        >
                          {new Date(lastResult.checkedAt).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Errors List */}
                    {Array.isArray(lastResult.errors) && lastResult.errors.length > 0 && (
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: '#fff1f2',
                          border: '1px solid #ffe4e6',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: '#b91c1c',
                            display: 'block',
                            mb: 0.5,
                          }}
                        >
                          Detected Schema / Contract Violations:
                        </Typography>
                        <Stack spacing={0.5}>
                          {lastResult.errors.map((errStr, idx) => (
                            <Typography
                              key={idx}
                              variant="body2"
                              sx={{
                                color: '#b91c1c',
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                              }}
                            >
                              • {errStr}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Check History Logs Table */}
      <Card
        variant="outlined"
        sx={{
          bgcolor: '#ffffff',
          borderColor: '#e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          borderRadius: 2,
        }}
      >
        <CardHeader
          title={
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Activity size={20} color="#2563eb" />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Check Run Audit Logs
              </Typography>
            </Stack>
          }
          subheader={
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
            >
              Target API: GET {env.VITE_API_CHECKS_HISTORY}
            </Typography>
          }
          action={
            !isLoading &&
            !isError &&
            checks.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: { xs: 1, sm: 0 } }}>
                <Chip
                  size="small"
                  label={`Total: ${metrics.total}`}
                  sx={{
                    bgcolor: '#f1f5f9',
                    color: 'text.secondary',
                    border: '1px solid #e2e8f0',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  size="small"
                  label={`Healthy: ${metrics.healthyCount}`}
                  sx={{
                    bgcolor: 'rgba(16, 185, 129, 0.08)',
                    color: '#059669',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  size="small"
                  label={`Failed: ${metrics.failedCount}`}
                  sx={{
                    bgcolor: 'rgba(239, 68, 68, 0.08)',
                    color: '#dc2626',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    fontWeight: 600,
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
              data-testid="checks-loading"
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
                Fetching check history from backend...
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontFamily: 'monospace', mt: 0.5 }}
              >
                GET {env.VITE_API_CHECKS_HISTORY}
              </Typography>
            </Box>
          )}

          {/* 2. Error State */}
          {!isLoading && isError && (
            <Alert
              severity="error"
              data-testid="checks-error"
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
                  : 'Unable to Load Check History'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {error?.message ||
                  `Could not fetch check logs from ${env.VITE_API_BASE_URL}.`}
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

          {/* 3. Empty State (0 records) */}
          {!isLoading && !isError && checks.length === 0 && (
            <Box
              data-testid="checks-empty"
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
                <Activity size={28} color="#60a5fa" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                No Check Runs Found
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', maxWidth: 440, mx: 'auto', mt: 1, mb: 2 }}
              >
                No audit logs exist for your account yet. Use the Manual API Check Runner
                above to execute your first contract verification.
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontFamily: 'monospace',
                  display: 'block',
                }}
              >
                Verified backend response: 0 records returned from GET{' '}
                {env.VITE_API_CHECKS_HISTORY}
              </Typography>
            </Box>
          )}

          {/* 4. Populated State (Checks Table) */}
          {!isLoading && !isError && checks.length > 0 && (
            <Box data-testid="checks-history-table">
              <TableContainer
                component={Paper}
                sx={{ bgcolor: 'transparent', boxShadow: 'none' }}
              >
                <Table aria-label="check history table">
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: '#f8fafc',
                        '& th': {
                          borderColor: '#e2e8f0',
                          color: '#475569',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        },
                      }}
                    >
                      <TableCell>Endpoint / Contract</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Failure Classification</TableCell>
                      <TableCell>HTTP Status</TableCell>
                      <TableCell>Response Time</TableCell>
                      <TableCell>Schema</TableCell>
                      <TableCell>Checked At</TableCell>
                      <TableCell align="right">Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {checks.map((chk) => {
                      const isHealthy = chk.status === 'healthy' || chk.status === 'pass';
                      const isExpanded = expandedRowId === chk._id;

                      return (
                        <React.Fragment key={chk._id}>
                          <TableRow
                            data-testid={`check-row-${chk._id}`}
                            sx={{
                              '& td': { borderColor: '#f1f5f9' },
                              '&:hover': { bgcolor: '#f8fafc' },
                            }}
                          >
                            {/* Endpoint & Contract Name */}
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color: 'text.primary' }}
                              >
                                {chk.endpoint?.name || 'Monitored API'}
                              </Typography>
                              <Tooltip title={chk.endpoint?.url || ''} placement="top">
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'text.secondary',
                                    fontFamily: 'monospace',
                                    display: 'block',
                                    maxWidth: 220,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {chk.endpoint?.url || '—'}
                                </Typography>
                              </Tooltip>
                              {chk.contract && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#2563eb',
                                    fontSize: '0.7rem',
                                    fontWeight: 500,
                                  }}
                                >
                                  Contract: {chk.contract.name} (v{chk.contract.version})
                                </Typography>
                              )}
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                              {isHealthy ? (
                                <Chip
                                  size="small"
                                  icon={<CheckCircle2 size={12} color="#059669" />}
                                  label="Healthy"
                                  sx={{
                                    bgcolor: 'rgba(16, 185, 129, 0.08)',
                                    color: '#059669',
                                    border: '1px solid rgba(16, 185, 129, 0.25)',
                                    fontWeight: 600,
                                  }}
                                />
                              ) : (
                                <Chip
                                  size="small"
                                  icon={<XCircle size={12} color="#dc2626" />}
                                  label="Failed"
                                  sx={{
                                    bgcolor: 'rgba(239, 68, 68, 0.08)',
                                    color: '#dc2626',
                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                            </TableCell>

                            {/* Failure Classification */}
                            <TableCell>
                              {chk.failureType ? (
                                <Chip
                                  size="small"
                                  label={chk.failureType}
                                  sx={{
                                    bgcolor: 'rgba(245, 158, 11, 0.08)',
                                    color: '#d97706',
                                    border: '1px solid rgba(245, 158, 11, 0.25)',
                                    fontFamily: 'monospace',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                  }}
                                />
                              ) : (
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'text.secondary' }}
                                >
                                  None
                                </Typography>
                              )}
                            </TableCell>

                            {/* HTTP Status */}
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'monospace',
                                  color:
                                    chk.httpStatus && chk.httpStatus < 400
                                      ? '#059669'
                                      : '#dc2626',
                                  fontWeight: 600,
                                }}
                              >
                                {chk.httpStatus ? `HTTP ${chk.httpStatus}` : '—'}
                              </Typography>
                            </TableCell>

                            {/* Response Time */}
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'monospace',
                                  color: 'text.secondary',
                                }}
                              >
                                {chk.responseTimeMs !== undefined
                                  ? `${chk.responseTimeMs}ms`
                                  : '—'}
                              </Typography>
                            </TableCell>

                            {/* Schema Validity */}
                            <TableCell>
                              {chk.schemaValid === true ? (
                                <Chip
                                  size="small"
                                  icon={<ShieldCheck size={10} color="#059669" />}
                                  label="Valid"
                                  sx={{
                                    bgcolor: 'rgba(16, 185, 129, 0.08)',
                                    color: '#059669',
                                    border: '1px solid rgba(16, 185, 129, 0.25)',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                  }}
                                />
                              ) : chk.schemaValid === false ? (
                                <Chip
                                  size="small"
                                  icon={<ShieldAlert size={10} color="#dc2626" />}
                                  label="Violation"
                                  sx={{
                                    bgcolor: 'rgba(239, 68, 68, 0.08)',
                                    color: '#dc2626',
                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                  }}
                                />
                              ) : (
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'text.secondary' }}
                                >
                                  —
                                </Typography>
                              )}
                            </TableCell>

                            {/* Checked At */}
                            <TableCell>
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary' }}
                              >
                                {chk.checkedAt
                                  ? new Date(chk.checkedAt).toLocaleString()
                                  : '—'}
                              </Typography>
                            </TableCell>

                            {/* Expand / Details Toggle */}
                            <TableCell align="right">
                              {Array.isArray(chk.errors) && chk.errors.length > 0 ? (
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    setExpandedRowId(isExpanded ? null : chk._id)
                                  }
                                  aria-label="expand row"
                                  sx={{ color: 'text.secondary' }}
                                >
                                  {isExpanded ? (
                                    <ChevronUp size={16} />
                                  ) : (
                                    <ChevronDown size={16} />
                                  )}
                                </IconButton>
                              ) : (
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'text.secondary' }}
                                >
                                  —
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* Expanded Error Details */}
                          {Array.isArray(chk.errors) && chk.errors.length > 0 && (
                            <TableRow>
                              <TableCell colSpan={8} sx={{ py: 0, bgcolor: '#fef2f2' }}>
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                  <Box sx={{ py: 2, px: 2 }}>
                                    <Stack spacing={1}>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 600,
                                          color: '#b91c1c',
                                        }}
                                      >
                                        Violations & Diagnostics:
                                      </Typography>
                                      {chk.errors.map((err, i) => (
                                        <Typography
                                          key={i}
                                          variant="body2"
                                          sx={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.8rem',
                                            color: '#b91c1c',
                                          }}
                                        >
                                          • {err}
                                        </Typography>
                                      ))}
                                    </Stack>
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
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
