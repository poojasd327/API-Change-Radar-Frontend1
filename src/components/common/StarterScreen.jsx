import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button as MuiButton,
  Chip,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import {
  Radio,
  Server,
  Activity,
  AlertTriangle,
  Globe,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { useHealth } from '@/hooks/useHealth';
import { env } from '@/lib/env';
import { AuthContext } from '@/context/AuthContext';

export const StarterScreen = () => {
  const { data: health, isLoading, error, refetch, isFetching } = useHealth();
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated ?? false;
  const user = authContext?.user ?? null;

  return (
    <Box
      sx={{ minHeight: '100vh', position: 'relative', py: { xs: 6, md: 8 } }}
      className="radar-grid"
    >
      <Container maxWidth="lg">
        {/* Header / Brand */}
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', mb: 6 }}>
          <Chip
            icon={<Radio size={14} className="animate-pulse" />}
            label="Stage 4 — Admin Portal Environment Setup (MUI + React JSX)"
            size="small"
            sx={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderColor: 'rgba(59, 130, 246, 0.25)',
              borderWidth: 1,
              borderStyle: 'solid',
              color: '#60a5fa',
              py: 0.5,
              px: 1,
            }}
          />

          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
              fontWeight: 800,
              color: 'text.primary',
            }}
          >
            APIChange{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(to right, #60a5fa, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Radar
            </Box>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              maxWidth: 680,
              color: 'text.secondary',
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              lineHeight: 1.6,
            }}
          >
            A private developer dashboard to monitor API contracts in real-time, detect
            schema drift before it breaks downstream consumers, triage incidents, and
            publish public status pages.
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: 'wrap', justifyContent: 'center', pt: 1 }}
          >
            <Chip
              label="JavaScript (JSX)"
              size="small"
              variant="outlined"
              sx={{ borderColor: 'rgba(255,255,255,0.1)' }}
            />
            <Chip
              label="MUI v6"
              size="small"
              variant="outlined"
              sx={{ borderColor: 'rgba(255,255,255,0.1)' }}
            />
            <Chip
              label="React 18 + Vite"
              size="small"
              variant="outlined"
              sx={{ borderColor: 'rgba(255,255,255,0.1)' }}
            />
            <Chip
              label="TanStack Query v5"
              size="small"
              variant="outlined"
              sx={{ borderColor: 'rgba(255,255,255,0.1)' }}
            />
            <Chip
              label="Vitest + RTL"
              size="small"
              variant="outlined"
              sx={{ borderColor: 'rgba(255,255,255,0.1)' }}
            />
          </Stack>

          {/* Quick Authentication Actions */}
          <Box sx={{ pt: 2 }}>
            {isAuthenticated ? (
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Chip
                  color="primary"
                  variant="outlined"
                  label={`Signed in as ${user?.email || 'Individual Account'}`}
                  size="small"
                />
                <MuiButton
                  component={Link}
                  to="/dashboard"
                  variant="contained"
                  size="small"
                >
                  Open Dashboard
                </MuiButton>
              </Stack>
            ) : (
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <MuiButton component={Link} to="/login" variant="contained" size="small">
                  Sign In
                </MuiButton>
                <MuiButton
                  component={Link}
                  to="/register"
                  variant="outlined"
                  size="small"
                >
                  Create Account
                </MuiButton>
              </Stack>
            )}
          </Box>
        </Stack>

        {/* Main Grid: Backend Health Connection Monitor */}
        <Grid container spacing={4}>
          {/* Health Status Card */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                title={
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#60a5fa',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Server size={18} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontSize: '1.05rem', fontWeight: 600 }}
                      >
                        Backend Connection Status
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Live probe targeting verified endpoint:{' '}
                        <code style={{ color: '#60a5fa', fontFamily: 'monospace' }}>
                          GET {env.VITE_API_HEALTH}
                        </code>
                      </Typography>
                    </Box>
                  </Stack>
                }
                action={
                  <MuiButton
                    variant="outlined"
                    size="small"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    startIcon={
                      <RefreshCw
                        size={14}
                        className={isFetching ? 'animate-spin text-blue-400' : ''}
                      />
                    }
                    sx={{ mt: { xs: 1, sm: 0 } }}
                  >
                    Re-test
                  </MuiButton>
                }
                sx={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  p: { xs: 2.5, sm: 3 },
                }}
              />

              <CardContent sx={{ p: { xs: 2.5, sm: 3 }, flexGrow: 1 }}>
                {isLoading ? (
                  <Box
                    data-testid="health-loading"
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
                      Probing backend health endpoint...
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontFamily: 'monospace', mt: 0.5 }}
                    >
                      {env.VITE_API_BASE_URL}
                      {env.VITE_API_HEALTH}
                    </Typography>
                  </Box>
                ) : health && health.status === 'ok' ? (
                  <Box data-testid="health-success">
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <CheckCircle2 color="#34d399" size={24} />
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ color: '#34d399', fontWeight: 600 }}
                          >
                            Backend Connected & Operational
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: 'rgba(52, 211, 153, 0.8)' }}
                          >
                            {health.message}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip
                        label="ONLINE"
                        size="small"
                        color="success"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </Box>

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 1.5,
                            border: '1px solid rgba(255,255,255,0.06)',
                            bgcolor: 'rgba(0,0,0,0.2)',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Environment
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 0.5,
                              fontWeight: 600,
                              fontFamily: 'monospace',
                              textTransform: 'capitalize',
                            }}
                          >
                            {health.environment}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 1.5,
                            border: '1px solid rgba(255,255,255,0.06)',
                            bgcolor: 'rgba(0,0,0,0.2)',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Server Uptime
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ mt: 0.5, fontWeight: 600, fontFamily: 'monospace' }}
                          >
                            {health.uptime}s
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 1.5,
                            border: '1px solid rgba(255,255,255,0.06)',
                            bgcolor: 'rgba(0,0,0,0.2)',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Verified At
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 0.5,
                              fontWeight: 500,
                              fontFamily: 'monospace',
                              color: 'text.secondary',
                            }}
                          >
                            {new Date(health.timestamp).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Box data-testid="health-disconnected">
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        backgroundColor: 'rgba(244, 63, 94, 0.08)',
                        border: '1px solid rgba(244, 63, 94, 0.25)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                      }}
                    >
                      <XCircle
                        color="#fb7185"
                        size={24}
                        style={{ marginTop: 2, flexShrink: 0 }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: 'center', mb: 0.5 }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ color: '#fb7185', fontWeight: 600 }}
                          >
                            Backend Unavailable (Offline)
                          </Typography>
                          <Chip
                            label="OFFLINE"
                            size="small"
                            color="error"
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        </Stack>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(251, 113, 133, 0.9)',
                            display: 'block',
                            lineHeight: 1.5,
                          }}
                        >
                          The frontend cannot reach the backend server at{' '}
                          <code style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                            {env.VITE_API_BASE_URL}
                          </code>
                          .
                        </Typography>
                        {error?.message && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(251, 113, 133, 0.75)',
                              display: 'block',
                              mt: 0.5,
                              fontFamily: 'monospace',
                            }}
                          >
                            Cause: {error.message}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        borderRadius: 1.5,
                        border: '1px solid rgba(255,255,255,0.06)',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center', mb: 1 }}
                      >
                        <Terminal size={14} color="#60a5fa" />
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: 'text.secondary' }}
                        >
                          How to start the backend:
                        </Typography>
                      </Stack>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
                      >
                        The backend runs in a separate repository on port 5001. Open a
                        terminal tab and run:
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          backgroundColor: '#000000',
                          border: '1px solid rgba(255,255,255,0.06)',
                          color: '#93c5fd',
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          overflowX: 'auto',
                          m: 0,
                        }}
                      >
                        cd /Users/poojasd/Desktop/Ptojects/APIChange_radar_backend && npm
                        run dev
                      </Box>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Environment Config Card */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <CardHeader
                  title={
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <ShieldCheck size={18} color="#60a5fa" />
                      <Typography
                        variant="h6"
                        sx={{ fontSize: '1.05rem', fontWeight: 600 }}
                      >
                        Environment Config
                      </Typography>
                    </Stack>
                  }
                  subheader="Runtime parameters"
                  sx={{
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    p: { xs: 2.5, sm: 3 },
                  }}
                />

                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Frontend Port:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                      >
                        3000 (Vite HMR)
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Backend API Target:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          color: '#60a5fa',
                          wordBreak: 'break-all',
                        }}
                      >
                        {env.VITE_API_BASE_URL}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Component Library:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Material-UI (MUI v6)
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Target Repository:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                      >
                        api-change-radar-admin
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Box>

              <Box sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#34d399' }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Frontend ready for Stage 5 auth integration
                  </Typography>
                </Stack>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Route Architecture Grid */}
        <Box sx={{ mt: 8 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Application Route Architecture
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Foundational routes configured in React Router ready for milestone
              implementation
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              {
                title: 'Login & Registration',
                path: '/login',
                desc: 'Individual user authentication with JWT bearer token verification.',
                badge: 'Public Route',
                icon: ShieldCheck,
              },
              {
                title: 'Dashboard Overview',
                path: '/dashboard',
                desc: 'Summary metrics, health breakdown, and active alerts across monitored APIs.',
                badge: 'Protected Route',
                icon: Activity,
              },
              {
                title: 'Endpoint Management',
                path: '/endpoints',
                desc: 'Register and configure API endpoints to monitor for contract drift.',
                badge: 'Protected Route',
                icon: Server,
              },
              {
                title: 'Check History',
                path: '/checks',
                desc: 'Inspect detailed check logs, response times, and schema diff payloads.',
                badge: 'Protected Route',
                icon: RefreshCw,
              },
              {
                title: 'Incident Management',
                path: '/incidents',
                desc: 'Track and resolve detected breaking contract changes and outages.',
                badge: 'Protected Route',
                icon: AlertTriangle,
              },
              {
                title: 'Public Status Page',
                path: '/status-page',
                desc: 'Configure settings for your standalone public status page.',
                badge: 'Protected Route',
                icon: Globe,
              },
            ].map((route) => {
              const Icon = route.icon;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={route.path}>
                  <Card
                    sx={{
                      p: 2.5,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      '&:hover': {
                        borderColor: 'rgba(59, 130, 246, 0.4)',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
                      },
                    }}
                  >
                    <Box>
                      <Stack
                        direction="row"
                        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1.5,
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: '#60a5fa',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Icon size={16} />
                        </Box>
                        <Chip
                          label={route.badge}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      </Stack>

                      <Typography
                        variant="subtitle1"
                        sx={{ mt: 1.5, fontWeight: 600, color: 'text.primary' }}
                      >
                        {route.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.8rem',
                          mt: 0.5,
                          lineHeight: 1.5,
                        }}
                      >
                        {route.desc}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        mt: 2.5,
                        pt: 1.5,
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <Stack
                        direction="row"
                        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                        >
                          {route.path}
                        </Typography>
                        <Link
                          to={route.path}
                          style={{
                            color: '#60a5fa',
                            textDecoration: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          Preview <ExternalLink size={12} />
                        </Link>
                      </Stack>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.08)' }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            APIChange Radar Admin Portal &bull; Environment Setup &bull; MUI v6 &bull;
            JavaScript &bull; Separate repository:{' '}
            <code style={{ color: 'inherit', fontFamily: 'monospace' }}>
              api-change-radar-admin
            </code>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
