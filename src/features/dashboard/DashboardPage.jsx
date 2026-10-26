import React, { useMemo } from 'react';
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
  Skeleton,
} from '@mui/material';
import {
  Server,
  Activity,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  FileCode,
  Plus,
} from 'lucide-react';
import { useEndpoints } from '@/hooks/useEndpoints';
import { useChecksHistory } from '@/hooks/useChecks';
import { useIncidents } from '@/hooks/useIncidents';
import { useContracts } from '@/hooks/useContracts';

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
    bg: 'rgba(239, 68, 68, 0.15)',
    text: '#f87171',
    border: 'rgba(239, 68, 68, 0.4)',
  },
};

function formatTimestamp(isoStr) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return isNaN(d.getTime())
      ? isoStr
      : d.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) +
          ' ' +
          d.toLocaleDateString();
  } catch {
    return isoStr;
  }
}

function MetricCard({ title, value, subtitle, icon, color, isLoading, isError }) {
  return (
    <Card
      sx={{
        p: 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        '&:hover': {
          borderColor: color ? `${color}60` : '#cbd5e1',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 1.5,
        }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {title}
        </Typography>
        <Box
          sx={{
            p: 1,
            borderRadius: 1.5,
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>

      {isLoading ? (
        <Skeleton variant="text" width={60} height={40} />
      ) : isError ? (
        <Typography variant="body2" sx={{ color: 'error.main', fontStyle: 'italic' }}>
          Unavailable
        </Typography>
      ) : (
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}
        >
          {value}
        </Typography>
      )}

      {isLoading ? (
        <Skeleton variant="text" width={100} height={20} />
      ) : (
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}
        >
          {subtitle}
        </Typography>
      )}
    </Card>
  );
}

export const DashboardPage = () => {
  // 1. Fetch user endpoints
  const endpointsQuery = useEndpoints({ limit: 100 });
  const endpoints = useMemo(() => {
    if (Array.isArray(endpointsQuery.data?.data)) return endpointsQuery.data.data;
    if (Array.isArray(endpointsQuery.data?.endpoints))
      return endpointsQuery.data.endpoints;
    return [];
  }, [endpointsQuery.data]);

  // 2. Fetch recent check runs
  const recentChecksQuery = useChecksHistory({ limit: 6 });
  const recentChecks = useMemo(() => {
    if (Array.isArray(recentChecksQuery.data?.data)) return recentChecksQuery.data.data;
    if (Array.isArray(recentChecksQuery.data?.checks))
      return recentChecksQuery.data.checks;
    return [];
  }, [recentChecksQuery.data]);

  // 3. Fetch open incidents
  const openIncidentsQuery = useIncidents({ status: 'open', limit: 5 });
  const openIncidents = useMemo(() => {
    if (Array.isArray(openIncidentsQuery.data?.data)) return openIncidentsQuery.data.data;
    if (Array.isArray(openIncidentsQuery.data?.incidents))
      return openIncidentsQuery.data.incidents;
    return [];
  }, [openIncidentsQuery.data]);

  // 4. Fetch contracts
  const contractsQuery = useContracts({ limit: 100 });
  const contracts = useMemo(() => {
    if (Array.isArray(contractsQuery.data?.data)) return contractsQuery.data.data;
    if (Array.isArray(contractsQuery.data?.contracts))
      return contractsQuery.data.contracts;
    return [];
  }, [contractsQuery.data]);

  // --- Derived Metrics ---
  const totalEndpoints = endpointsQuery.data?.pagination?.total ?? endpoints.length;
  const activeEndpoints = endpoints.filter((e) => e.isActive).length;
  const inactiveEndpoints = totalEndpoints - activeEndpoints;

  const healthyEndpointsCount = endpoints.filter(
    (e) => e.latestCheck?.status === 'healthy'
  ).length;
  const failingEndpointsCount = endpoints.filter(
    (e) => e.latestCheck?.status === 'failed'
  ).length;
  const uncheckedEndpointsCount = endpoints.filter((e) => !e.latestCheck).length;

  const totalOpenIncidents =
    openIncidentsQuery.data?.pagination?.total ?? openIncidents.length;

  const approvedActiveContractsCount = contracts.filter(
    (c) => c.isApproved && c.isActive
  ).length;
  const pendingContractsCount = contracts.filter((c) => !c.isApproved).length;

  const isAnyFetching =
    endpointsQuery.isFetching ||
    recentChecksQuery.isFetching ||
    openIncidentsQuery.isFetching ||
    contractsQuery.isFetching;

  const handleRefreshAll = () => {
    endpointsQuery.refetch();
    recentChecksQuery.refetch();
    openIncidentsQuery.refetch();
    contractsQuery.refetch();
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
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Real-time API monitoring metrics, active contracts, and incident tracking.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleRefreshAll}
            disabled={isAnyFetching}
            startIcon={
              <RefreshCw size={14} className={isAnyFetching ? 'animate-spin' : ''} />
            }
          >
            Refresh
          </Button>
          <Button
            component={Link}
            to="/endpoints"
            variant="contained"
            size="small"
            startIcon={<Plus size={16} />}
          >
            Add Endpoint
          </Button>
        </Stack>
      </Box>

      {/* 1. Summary Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: 2,
        }}
      >
        {/* Total Monitored Endpoints */}
        <MetricCard
          title="Monitored Endpoints"
          value={totalEndpoints}
          subtitle={`${activeEndpoints} actively monitored`}
          icon={<Server size={20} color="#38bdf8" />}
          color="#38bdf8"
          isLoading={endpointsQuery.isLoading}
          isError={endpointsQuery.isError}
        />

        {/* Active Endpoints */}
        <MetricCard
          title="Active Monitoring"
          value={activeEndpoints}
          subtitle={
            inactiveEndpoints > 0 ? `${inactiveEndpoints} paused` : 'All endpoints active'
          }
          icon={<Activity size={20} color="#34d399" />}
          color="#34d399"
          isLoading={endpointsQuery.isLoading}
          isError={endpointsQuery.isError}
        />

        {/* Healthy Endpoints */}
        <MetricCard
          title="Healthy Endpoints"
          value={healthyEndpointsCount}
          subtitle={
            failingEndpointsCount > 0
              ? `${failingEndpointsCount} failing checks`
              : uncheckedEndpointsCount > 0
                ? `${uncheckedEndpointsCount} pending first check`
                : 'All checks passing'
          }
          icon={<CheckCircle2 size={20} color="#10b981" />}
          color="#10b981"
          isLoading={endpointsQuery.isLoading}
          isError={endpointsQuery.isError}
        />

        {/* Open Incidents */}
        <MetricCard
          title="Open Incidents"
          value={totalOpenIncidents}
          subtitle={totalOpenIncidents === 0 ? 'Zero active breaches' : 'Action required'}
          icon={
            <AlertTriangle
              size={20}
              color={totalOpenIncidents > 0 ? '#f87171' : '#fbbf24'}
            />
          }
          color={totalOpenIncidents > 0 ? '#f87171' : '#fbbf24'}
          isLoading={openIncidentsQuery.isLoading}
          isError={openIncidentsQuery.isError}
        />

        {/* Active Contracts */}
        <MetricCard
          title="Active Contracts"
          value={approvedActiveContractsCount}
          subtitle={
            pendingContractsCount > 0
              ? `${pendingContractsCount} pending approval`
              : 'Enforcing JSON schemas'
          }
          icon={<ShieldCheck size={20} color="#a78bfa" />}
          color="#a78bfa"
          isLoading={contractsQuery.isLoading}
          isError={contractsQuery.isError}
        />
      </Box>

      {/* 2. Middle Row: Recent Checks & Active Incidents */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' },
          gap: 3,
        }}
      >
        {/* Recent API Checks Table */}
        <Card>
          <CardHeader
            title={
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Clock size={18} color="#38bdf8" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent API Checks
                </Typography>
              </Stack>
            }
            subheader="Latest monitoring check executions"
            action={
              <Button
                component={Link}
                to="/checks"
                size="small"
                variant="text"
                endIcon={<ArrowRight size={14} />}
                sx={{ textTransform: 'none' }}
              >
                View History
              </Button>
            }
          />
          <CardContent sx={{ pt: 0 }}>
            {recentChecksQuery.isLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 4,
                }}
              >
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                  Loading recent check runs...
                </Typography>
              </Box>
            ) : recentChecksQuery.isError ? (
              <Alert severity="error">Failed to load check history.</Alert>
            ) : recentChecks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No check runs recorded yet.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
                <Table size="small" aria-label="recent checks table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Result</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>HTTP</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Latency</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Executed</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentChecks.map((check) => {
                      const isHealthy = check.status === 'healthy';
                      const methodColor =
                        METHOD_COLORS[check.endpoint?.method] || METHOD_COLORS.GET;

                      return (
                        <TableRow
                          key={check._id || check.id}
                          sx={{
                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                          }}
                        >
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Chip
                              size="small"
                              icon={
                                isHealthy ? (
                                  <CheckCircle2 size={13} color="#059669" />
                                ) : (
                                  <XCircle size={13} color="#e11d48" />
                                )
                              }
                              label={
                                isHealthy ? 'HEALTHY' : check.failureType || 'FAILED'
                              }
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.68rem',
                                color: isHealthy ? '#059669' : '#e11d48',
                                backgroundColor: isHealthy
                                  ? 'rgba(16, 185, 129, 0.12)'
                                  : 'rgba(239, 68, 68, 0.12)',
                                border: `1px solid ${
                                  isHealthy
                                    ? 'rgba(16, 185, 129, 0.3)'
                                    : 'rgba(239, 68, 68, 0.3)'
                                }`,
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={0.8}
                              sx={{ alignItems: 'center' }}
                            >
                              {check.endpoint?.method && (
                                <Chip
                                  size="small"
                                  label={check.endpoint.method}
                                  sx={{
                                    fontSize: '0.62rem',
                                    height: 18,
                                    fontWeight: 700,
                                    backgroundColor: methodColor.bg,
                                    color: methodColor.text,
                                  }}
                                />
                              )}
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 500,
                                  color: 'text.primary',
                                  maxWidth: 160,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {check.endpoint?.name || 'Monitored API'}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell
                            sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                          >
                            {check.httpStatus ? (
                              <Chip
                                size="small"
                                label={check.httpStatus}
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  backgroundColor:
                                    check.httpStatus >= 200 && check.httpStatus < 300
                                      ? 'rgba(16, 185, 129, 0.12)'
                                      : 'rgba(239, 68, 68, 0.12)',
                                  color:
                                    check.httpStatus >= 200 && check.httpStatus < 300
                                      ? '#34d399'
                                      : '#f87171',
                                }}
                              />
                            ) : (
                              '—'
                            )}
                          </TableCell>

                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography
                              variant="caption"
                              sx={{ fontFamily: 'monospace' }}
                            >
                              {check.responseTimeMs != null
                                ? `${check.responseTimeMs}ms`
                                : '—'}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary' }}
                            >
                              {formatTimestamp(check.checkedAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Active Incidents Section */}
        <Card>
          <CardHeader
            title={
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <AlertTriangle size={18} color="#f87171" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Active Incidents
                </Typography>
              </Stack>
            }
            subheader={`${totalOpenIncidents} open alert${totalOpenIncidents === 1 ? '' : 's'}`}
            action={
              <Button
                component={Link}
                to="/incidents"
                size="small"
                variant="text"
                endIcon={<ArrowRight size={14} />}
                sx={{ textTransform: 'none' }}
              >
                View Incidents
              </Button>
            }
          />
          <CardContent sx={{ pt: 0 }}>
            {openIncidentsQuery.isLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 4,
                }}
              >
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                  Loading active incidents...
                </Typography>
              </Box>
            ) : openIncidentsQuery.isError ? (
              <Alert severity="error">Failed to load incidents.</Alert>
            ) : openIncidents.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 4,
                  px: 2,
                  borderRadius: 2,
                  border: '1px dashed #cbd5e1',
                  backgroundColor: '#f8fafc',
                }}
              >
                <ShieldCheck size={36} color="#10b981" style={{ marginBottom: 8 }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: 'text.primary' }}
                >
                  All Systems Operational
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
                >
                  No open contract breach incidents. All monitored endpoints are meeting
                  schema SLAs.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {openIncidents.map((incident) => (
                  <Box
                    key={incident._id || incident.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: 'text.primary' }}
                      >
                        {incident.endpoint?.name || 'Monitored Endpoint'}
                      </Typography>
                      <Chip
                        size="small"
                        label={`OPEN • ${incident.occurrenceCount}x`}
                        sx={{
                          fontSize: '0.65rem',
                          height: 18,
                          fontWeight: 700,
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          color: '#e11d48',
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: '#b91c1c', display: 'block', fontWeight: 500 }}
                    >
                      {incident.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
                    >
                      Last seen: {formatTimestamp(incident.lastSeenAt)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* 3. Bottom Row: Monitored Endpoints Overview */}
      <Card>
        <CardHeader
          title={
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Server size={18} color="#38bdf8" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Monitored Endpoints Overview
              </Typography>
            </Stack>
          }
          subheader="Configuration, contract enforcement, and latest health status"
          action={
            <Button
              component={Link}
              to="/endpoints"
              size="small"
              variant="text"
              endIcon={<ArrowRight size={14} />}
              sx={{ textTransform: 'none' }}
            >
              Manage Endpoints
            </Button>
          }
        />
        <CardContent sx={{ pt: 0 }}>
          {endpointsQuery.isLoading ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
              }}
            >
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                Loading endpoints overview...
              </Typography>
            </Box>
          ) : endpointsQuery.isError ? (
            <Alert severity="error">Failed to load endpoints overview.</Alert>
          ) : endpoints.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                No endpoints registered yet.
              </Typography>
              <Button
                component={Link}
                to="/endpoints"
                variant="outlined"
                size="small"
                startIcon={<Plus size={14} />}
              >
                Add Your First Endpoint
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
              <Table size="small" aria-label="endpoints overview table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Monitoring</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contract Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Latest Check Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {endpoints.map((ep) => {
                    const methodColor = METHOD_COLORS[ep.method] || METHOD_COLORS.GET;
                    const isHealthy = ep.latestCheck?.status === 'healthy';
                    const hasRun = Boolean(ep.latestCheck);

                    return (
                      <TableRow
                        key={ep._id || ep.id}
                        sx={{
                          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                        }}
                      >
                        {/* Endpoint Name & Method */}
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ alignItems: 'center' }}
                            >
                              <Chip
                                size="small"
                                label={ep.method || 'GET'}
                                sx={{
                                  fontSize: '0.65rem',
                                  height: 18,
                                  fontWeight: 700,
                                  backgroundColor: methodColor.bg,
                                  color: methodColor.text,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color: 'text.primary' }}
                              >
                                {ep.name}
                              </Typography>
                            </Stack>
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: 'monospace',
                                color: 'text.secondary',
                                wordBreak: 'break-all',
                              }}
                            >
                              {ep.url}
                            </Typography>
                          </Stack>
                        </TableCell>

                        {/* Monitoring Active / Paused */}
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Chip
                            size="small"
                            label={ep.isActive ? 'ACTIVE' : 'PAUSED'}
                            sx={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: ep.isActive ? '#34d399' : '#94a3b8',
                              backgroundColor: ep.isActive
                                ? 'rgba(16, 185, 129, 0.12)'
                                : 'rgba(148, 163, 184, 0.12)',
                              border: `1px solid ${
                                ep.isActive
                                  ? 'rgba(16, 185, 129, 0.3)'
                                  : 'rgba(148, 163, 184, 0.3)'
                              }`,
                            }}
                          />
                        </TableCell>

                        {/* Contract Status */}
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {ep.hasActiveContract ? (
                            <Chip
                              size="small"
                              icon={<ShieldCheck size={13} color="#34d399" />}
                              label="Approved Contract"
                              sx={{
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                color: '#34d399',
                                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                              }}
                            />
                          ) : (
                            <Chip
                              size="small"
                              icon={<FileCode size={13} color="#fbbf24" />}
                              label="Pending Contract"
                              sx={{
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                color: '#fbbf24',
                                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                              }}
                            />
                          )}
                        </TableCell>

                        {/* Latest Check Status */}
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {!hasRun ? (
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                              Never checked
                            </Typography>
                          ) : isHealthy ? (
                            <Stack
                              direction="row"
                              spacing={0.8}
                              sx={{ alignItems: 'center' }}
                            >
                              <CheckCircle2 size={14} color="#34d399" />
                              <Typography
                                variant="body2"
                                sx={{ color: '#34d399', fontWeight: 600 }}
                              >
                                Healthy
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
                              >
                                ({ep.latestCheck.responseTimeMs}ms)
                              </Typography>
                            </Stack>
                          ) : (
                            <Stack
                              direction="row"
                              spacing={0.8}
                              sx={{ alignItems: 'center' }}
                            >
                              <XCircle size={14} color="#f87171" />
                              <Typography
                                variant="body2"
                                sx={{ color: '#f87171', fontWeight: 600 }}
                              >
                                Failing: {ep.latestCheck.failureType || 'Error'}
                              </Typography>
                            </Stack>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <Button
                            component={Link}
                            to="/endpoints"
                            size="small"
                            variant="outlined"
                            sx={{
                              textTransform: 'none',
                              fontSize: '0.72rem',
                              py: 0.25,
                              px: 1,
                            }}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};
