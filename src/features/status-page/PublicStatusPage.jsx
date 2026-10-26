import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  Button,
  Tooltip,
  Divider,
  Paper,
} from '@mui/material';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  ArrowLeft,
  RefreshCw,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { usePublicStatus } from '@/hooks/useStatusPage';

export const PublicStatusPage = () => {
  const { slug } = useParams();
  const { data, isLoading, error, refetch, isFetching } = usePublicStatus(slug);

  const getSystemStatusConfig = (status) => {
    switch (status) {
      case 'operational':
        return {
          title: 'All Systems Operational',
          color: '#059669',
          bgColor: '#f0fdf4',
          borderColor: '#bbf7d0',
          icon: <CheckCircle2 size={24} color="#059669" />,
        };
      case 'degraded':
        return {
          title: 'Active Service Degradation',
          color: '#d97706',
          bgColor: '#fffbeb',
          borderColor: '#fde68a',
          icon: <AlertTriangle size={24} color="#d97706" />,
        };
      case 'major_outage':
        return {
          title: 'Major Service Outage',
          color: '#dc2626',
          bgColor: '#fef2f2',
          borderColor: '#fecaca',
          icon: <AlertOctagon size={24} color="#dc2626" />,
        };
      case 'unknown':
      default:
        return {
          title: 'System Status Unknown',
          color: '#64748b',
          bgColor: '#f8fafc',
          borderColor: '#e2e8f0',
          icon: <HelpCircle size={24} color="#64748b" />,
        };
    }
  };

  const getServiceStatusChip = (status) => {
    switch (status) {
      case 'operational':
        return (
          <Chip
            size="small"
            icon={<CheckCircle2 size={12} color="#059669" />}
            label="Operational"
            sx={{
              bgcolor: 'rgba(16, 185, 129, 0.08)',
              color: '#059669',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontWeight: 600,
            }}
          />
        );
      case 'degraded':
        return (
          <Chip
            size="small"
            icon={<AlertTriangle size={12} color="#d97706" />}
            label="Degraded"
            sx={{
              bgcolor: 'rgba(245, 158, 11, 0.08)',
              color: '#d97706',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              fontWeight: 600,
            }}
          />
        );
      case 'major_outage':
        return (
          <Chip
            size="small"
            icon={<AlertOctagon size={12} color="#dc2626" />}
            label="Major Outage"
            sx={{
              bgcolor: 'rgba(239, 68, 68, 0.08)',
              color: '#dc2626',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              fontWeight: 600,
            }}
          />
        );
      case 'unknown':
      default:
        return (
          <Chip
            size="small"
            icon={<HelpCircle size={12} color="#64748b" />}
            label="Unknown"
            sx={{
              bgcolor: '#f1f5f9',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              fontWeight: 600,
            }}
          />
        );
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#ffffff',
        color: 'text.primary',
        py: { xs: 4, sm: 6 },
        px: { xs: 2, sm: 3 },
      }}
      data-testid="public-status-page"
    >
      <Container maxWidth="md">
        {/* Navigation Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                p: 0.8,
                bgcolor: 'rgba(37, 99, 235, 0.08)',
                border: '1px solid rgba(37, 99, 235, 0.25)',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Globe size={20} color="#2563eb" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              APIChange Radar
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => refetch()}
              disabled={isFetching}
              startIcon={
                <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              }
              data-testid="public-status-refresh-btn"
            >
              Refresh
            </Button>
            <Button
              component={Link}
              to="/dashboard"
              variant="text"
              size="small"
              startIcon={<ArrowLeft size={16} />}
              sx={{ color: 'text.secondary' }}
            >
              Dashboard
            </Button>
          </Stack>
        </Box>

        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 12,
            }}
            data-testid="public-status-loading"
          >
            <CircularProgress size={36} sx={{ color: '#3b82f6', mb: 2 }} />
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Loading live service status...
            </Typography>
          </Box>
        ) : error || !data ? (
          <Card
            sx={{
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              p: 4,
              textAlign: 'center',
            }}
            data-testid="public-status-error"
          >
            <Box sx={{ mb: 2 }}>
              <AlertOctagon size={44} color="#f43f5e" style={{ margin: '0 auto' }} />
            </Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}
            >
              Status Page Unavailable
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {error?.message ||
                'This status page does not exist or has been made private by its administrator.'}
            </Typography>
            <Button
              component={Link}
              to="/"
              variant="outlined"
              size="small"
              startIcon={<ArrowLeft size={16} />}
            >
              Return Home
            </Button>
          </Card>
        ) : (
          <Stack spacing={3.5} data-testid="public-status-content">
            {/* Header / Branding */}
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}
                data-testid="public-status-title"
              >
                {data.title || 'Service Status'}
              </Typography>
              {data.description && (
                <Typography
                  variant="body1"
                  sx={{ color: 'text.secondary', mb: 1 }}
                  data-testid="public-status-description"
                >
                  {data.description}
                </Typography>
              )}
              {data.updatedAt && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Last updated {new Date(data.updatedAt).toLocaleString()}
                </Typography>
              )}
            </Box>

            {/* Overall System Status Hero Banner */}
            {(() => {
              const config = getSystemStatusConfig(data.systemStatus);
              return (
                <Paper
                  sx={{
                    p: 2.5,
                    bgcolor: config.bgColor,
                    border: `1px solid ${config.borderColor}`,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                  data-testid="public-system-status-banner"
                >
                  {config.icon}
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: config.color, lineHeight: 1.2 }}
                    >
                      {config.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Automated real-time contract compliance and API heartbeat checks
                    </Typography>
                  </Box>
                </Paper>
              );
            })()}

            {/* Monitored Services List */}
            <Card
              sx={{
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  p: 2.5,
                  bgcolor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <ShieldCheck size={18} color="#2563eb" />
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: 'text.primary' }}
                  >
                    Monitored Services & APIs
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {data.services?.length || 0} published service
                  {data.services?.length === 1 ? '' : 's'}
                </Typography>
              </Box>

              <CardContent sx={{ p: 0 }}>
                {!data.services || data.services.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No individual services have been selected for publication yet.
                    </Typography>
                  </Box>
                ) : (
                  <Stack divider={<Divider sx={{ borderColor: '#f1f5f9' }} />}>
                    {data.services.map((service, index) => (
                      <Box
                        key={service.name || index}
                        sx={{
                          p: 2.5,
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          justifyContent: 'space-between',
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          gap: 2,
                        }}
                        data-testid={`public-service-row-${index}`}
                      >
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}
                          >
                            {service.name}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={2}
                            sx={{ alignItems: 'center' }}
                          >
                            {service.uptimePercentage24h !== null && (
                              <Typography
                                variant="caption"
                                sx={{ color: '#059669', fontWeight: 600 }}
                              >
                                {service.uptimePercentage24h}% uptime (24h)
                              </Typography>
                            )}
                            {service.lastCheckedAt && (
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary' }}
                              >
                                Checked{' '}
                                {new Date(service.lastCheckedAt).toLocaleTimeString()}
                              </Typography>
                            )}
                          </Stack>
                        </Box>

                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                          {/* Recent Check Indicators */}
                          {service.recentChecks && service.recentChecks.length > 0 && (
                            <Stack
                              direction="row"
                              spacing={0.5}
                              sx={{ alignItems: 'center' }}
                            >
                              {service.recentChecks.slice(0, 10).map((chk, cIdx) => (
                                <Tooltip
                                  key={cIdx}
                                  title={`${chk.status} at ${new Date(chk.timestamp).toLocaleTimeString()}`}
                                >
                                  <Box
                                    sx={{
                                      width: 6,
                                      height: 18,
                                      borderRadius: 0.5,
                                      bgcolor:
                                        chk.status === 'operational'
                                          ? '#10b981'
                                          : chk.status === 'degraded'
                                            ? '#f59e0b'
                                            : '#f43f5e',
                                    }}
                                  />
                                </Tooltip>
                              ))}
                            </Stack>
                          )}

                          {getServiceStatusChip(service.status)}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>

            {/* Public Footer */}
            <Box sx={{ textAlign: 'center', pt: 3 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Powered by <strong style={{ color: '#2563eb' }}>APIChange Radar</strong> —
                Automated Contract & Drift Monitoring
              </Typography>
            </Box>
          </Stack>
        )}
      </Container>
    </Box>
  );
};
