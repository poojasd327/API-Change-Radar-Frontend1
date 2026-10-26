import React, { useState, useEffect } from 'react';
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
  TextField,
  Switch,
  FormControlLabel,
  Checkbox,
  Chip,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Globe,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  Plus,
  Save,
  RotateCw,
} from 'lucide-react';
import {
  useMyStatusPage,
  useCreateStatusPage,
  useUpdateStatusPage,
  useUpdateStatusPageServices,
  useRegenerateSlug,
} from '@/hooks/useStatusPage';
import { useEndpoints } from '@/hooks/useEndpoints';

export const StatusPageSettings = () => {
  // Query status page
  const {
    data: statusPageData,
    isLoading: isLoadingStatusPage,
    error: statusPageError,
    refetch: refetchStatusPage,
    isFetching: isFetchingStatusPage,
  } = useMyStatusPage();

  // Query user's registered endpoints for service publishing
  const { data: endpointsData, isLoading: isLoadingEndpoints } = useEndpoints({
    limit: 100,
  });

  // Mutations
  const createStatusPageMutation = useCreateStatusPage();
  const updateStatusPageMutation = useUpdateStatusPage();
  const updateServicesMutation = useUpdateStatusPageServices();
  const regenerateSlugMutation = useRegenerateSlug();

  // Creation form state
  const [createTitle, setCreateTitle] = useState('Service Status');
  const [createDescription, setCreateDescription] = useState(
    'Real-time system availability and API monitoring status.'
  );

  // Settings form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [selectedEndpointIds, setSelectedEndpointIds] = useState([]);

  // UI state
  const [copied, setCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Normalize status page object
  const statusPage =
    statusPageData?.statusPage || (statusPageData?._id ? statusPageData : null);

  // Sync state when statusPage loads or updates
  useEffect(() => {
    if (statusPage) {
      setTitle(statusPage.title || 'Service Status');
      setDescription(statusPage.description || '');
      setIsPublished(Boolean(statusPage.isPublished));

      // Extract endpoint IDs from selectedEndpoints (which might be populated objects or IDs)
      const ids = (statusPage.selectedEndpoints || []).map((item) =>
        typeof item === 'object' && item !== null && item._id ? item._id : String(item)
      );
      setSelectedEndpointIds(ids);
    }
  }, [statusPage]);

  // All user endpoints
  const endpoints = endpointsData?.data || [];

  // Determine if status page was not found (404)
  const isNotFound =
    !statusPage &&
    (statusPageError?.statusCode === 404 ||
      statusPageError?.status === 404 ||
      statusPageError?.response?.status === 404 ||
      (statusPageError?.message &&
        statusPageError.message.toLowerCase().includes('not found')));

  // Handler: Create Status Page
  const handleCreateStatusPage = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!createTitle.trim()) {
      setErrorMessage('Status page title is required.');
      return;
    }

    try {
      await createStatusPageMutation.mutateAsync({
        title: createTitle.trim(),
        description: createDescription.trim(),
      });
      setSuccessMessage('Status page created successfully!');
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to create status page.'
      );
    }
  };

  // Handler: Save Branding (title & description)
  const handleSaveBranding = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage('Page title cannot be empty.');
      return;
    }

    try {
      await updateStatusPageMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
      });
      setSuccessMessage('Branding settings updated successfully.');
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to update branding.'
      );
    }
  };

  // Handler: Toggle Published state
  const handleTogglePublished = async (event) => {
    const nextPublished = event.target.checked;
    setIsPublished(nextPublished);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await updateStatusPageMutation.mutateAsync({
        isPublished: nextPublished,
      });
      setSuccessMessage(
        nextPublished
          ? 'Status page is now PUBLIC and live!'
          : 'Status page has been set to DRAFT (private).'
      );
    } catch (err) {
      setIsPublished(!nextPublished); // revert
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to update visibility.'
      );
    }
  };

  // Handler: Toggle endpoint selection
  const handleToggleEndpoint = (epId) => {
    setSelectedEndpointIds((prev) =>
      prev.includes(epId) ? prev.filter((id) => id !== epId) : [...prev, epId]
    );
  };

  // Handler: Save Selected Services
  const handleSaveServices = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await updateServicesMutation.mutateAsync({
        endpointIds: selectedEndpointIds,
      });
      setSuccessMessage('Published services updated successfully.');
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to update services.'
      );
    }
  };

  // Handler: Regenerate Slug
  const handleRegenerateSlug = async () => {
    if (
      !window.confirm(
        'Regenerating the public slug will invalidate all existing public links. Are you sure?'
      )
    ) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await regenerateSlugMutation.mutateAsync();
      setSuccessMessage(
        `Public slug regenerated successfully! New slug: ${res.slug || res.statusPage?.slug}`
      );
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to regenerate slug.'
      );
    }
  };

  // Handler: Copy public URL
  const publicUrl = statusPage?.slug
    ? `${window.location.origin}/status/${statusPage.slug}`
    : '';

  const handleCopyUrl = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Stack spacing={3} data-testid="status-page-settings-container">
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
            Public Status Page Settings
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Configure title, branding, visibility, and published services for public
            transparency.
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
            onClick={() => refetchStatusPage()}
            disabled={isFetchingStatusPage}
            startIcon={
              <RefreshCw
                size={14}
                className={isFetchingStatusPage ? 'animate-spin' : ''}
              />
            }
            data-testid="refresh-status-page-btn"
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Global Alerts */}
      {successMessage && (
        <Alert
          severity="success"
          onClose={() => setSuccessMessage(null)}
          data-testid="status-page-success-alert"
        >
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert
          severity="error"
          onClose={() => setErrorMessage(null)}
          data-testid="status-page-error-alert"
        >
          {errorMessage}
        </Alert>
      )}

      {/* Main Content Areas */}
      {isLoadingStatusPage ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 8,
            justifyContent: 'center',
          }}
          data-testid="status-page-loading"
        >
          <CircularProgress size={32} sx={{ color: '#3b82f6', mr: 2 }} />
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Loading status page configuration...
          </Typography>
        </Box>
      ) : isNotFound ? (
        /* Create Status Page Card */
        <Card
          sx={{
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
          }}
          data-testid="create-status-page-card"
        >
          <CardHeader
            title={
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Globe size={22} color="#2563eb" />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Create Your Public Status Page
                </Typography>
              </Stack>
            }
            subheader="You do not have a public status page configured yet. Create one to share live service availability with your users."
          />
          <CardContent>
            <Box
              component="form"
              onSubmit={handleCreateStatusPage}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              <TextField
                label="Status Page Title"
                required
                fullWidth
                size="small"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                inputProps={{ maxLength: 100 }}
                helperText={`${createTitle.length}/100 characters (e.g. Acme API Status)`}
                data-testid="create-status-page-title-input"
              />

              <TextField
                label="Description / Bio"
                fullWidth
                multiline
                rows={3}
                size="small"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                inputProps={{ maxLength: 500 }}
                helperText={`${createDescription.length}/500 characters`}
                data-testid="create-status-page-desc-input"
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={createStatusPageMutation.isPending}
                  startIcon={
                    createStatusPageMutation.isPending ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Plus size={16} />
                    )
                  }
                  data-testid="create-status-page-btn"
                >
                  {createStatusPageMutation.isPending
                    ? 'Creating...'
                    : 'Create Status Page'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : statusPage ? (
        /* Status Page Management Sections */
        <Stack spacing={3} data-testid="status-page-management-view">
          {/* Card 1: Public URL & Visibility Controls */}
          <Card
            sx={{
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
            }}
            data-testid="status-page-overview-card"
          >
            <CardHeader
              title={
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
                    <Globe size={20} color="#2563eb" />
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: 'text.primary' }}
                    >
                      Status Page Visibility & Public URL
                    </Typography>
                  </Stack>
                  <Chip
                    size="small"
                    icon={
                      isPublished ? (
                        <Check size={12} color="#10b981" />
                      ) : (
                        <ShieldAlert size={12} color="#f59e0b" />
                      )
                    }
                    label={isPublished ? 'Published & Live' : 'Draft (Unpublished)'}
                    sx={{
                      bgcolor: isPublished
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(245, 158, 11, 0.1)',
                      color: isPublished ? '#34d399' : '#fbbf24',
                      border: `1px solid ${isPublished ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                      fontWeight: 600,
                    }}
                    data-testid="status-page-visibility-chip"
                  />
                </Box>
              }
              subheader="Share your live public status URL with customers and stakeholders."
            />
            <CardContent>
              <Stack spacing={3}>
                {/* Public Link Box */}
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 1.5,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2,
                  }}
                >
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Public URL (Slug: {statusPage.slug})
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        color: '#2563eb',
                        wordBreak: 'break-all',
                        fontWeight: 600,
                      }}
                      data-testid="public-status-url-text"
                    >
                      {publicUrl}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleCopyUrl}
                      startIcon={copied ? <Check size={14} /> : <Copy size={14} />}
                      data-testid="copy-public-url-btn"
                    >
                      {copied ? 'Copied!' : 'Copy Link'}
                    </Button>
                    <Button
                      component={Link}
                      to={`/status/${statusPage.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="contained"
                      size="small"
                      startIcon={<ExternalLink size={14} />}
                      data-testid="view-public-page-btn"
                    >
                      View Live Page
                    </Button>
                  </Stack>
                </Paper>

                {/* Controls: Publish Switch & Regenerate Slug */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2,
                    pt: 1,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isPublished}
                        onChange={handleTogglePublished}
                        disabled={updateStatusPageMutation.isPending}
                        data-testid="publish-switch"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Publish status page publicly
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          When enabled, anyone with the public link can view uptime
                          without logging in.
                        </Typography>
                      </Box>
                    }
                  />

                  <Button
                    variant="outlined"
                    color="warning"
                    size="small"
                    onClick={handleRegenerateSlug}
                    disabled={regenerateSlugMutation.isPending}
                    startIcon={
                      regenerateSlugMutation.isPending ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <RotateCw size={14} />
                      )
                    }
                    data-testid="regenerate-slug-btn"
                  >
                    Regenerate Slug
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Card 2: Branding Settings */}
          <Card
            sx={{
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
            }}
            data-testid="status-page-branding-card"
          >
            <CardHeader
              title={
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Status Page Branding
                </Typography>
              }
              subheader="Configure the title and description displayed on your public status page."
            />
            <CardContent>
              <Stack spacing={2.5}>
                <TextField
                  label="Display Title"
                  required
                  fullWidth
                  size="small"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  inputProps={{ maxLength: 100 }}
                  helperText={`${title.length}/100 characters`}
                  data-testid="status-page-title-input"
                />

                <TextField
                  label="Description / Bio"
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  inputProps={{ maxLength: 500 }}
                  helperText={`${description.length}/500 characters`}
                  data-testid="status-page-desc-input"
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSaveBranding}
                    disabled={updateStatusPageMutation.isPending}
                    startIcon={
                      updateStatusPageMutation.isPending ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <Save size={14} />
                      )
                    }
                    data-testid="save-branding-btn"
                  >
                    Save Branding Settings
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Card 3: Monitored Services Selection */}
          <Card
            sx={{
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
            }}
            data-testid="status-page-services-card"
          >
            <CardHeader
              title={
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Published Services & Endpoints
                </Typography>
              }
              subheader="Select which of your monitored endpoints should appear publicly. Only active endpoints are eligible."
              action={
                <Chip
                  size="small"
                  label={`${selectedEndpointIds.length} of ${endpoints.length} selected`}
                  sx={{
                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    fontWeight: 600,
                  }}
                  data-testid="selected-services-count-chip"
                />
              }
            />
            <CardContent sx={{ p: 0 }}>
              {isLoadingEndpoints ? (
                <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              ) : endpoints.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    No monitored endpoints found in your account.
                  </Typography>
                  <Button
                    component={Link}
                    to="/endpoints"
                    variant="outlined"
                    size="small"
                  >
                    Register Monitored Endpoint
                  </Button>
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                        <TableRow>
                          <TableCell padding="checkbox">
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', px: 1 }}
                            >
                              Publish
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            Endpoint Name
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            Target URL
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {endpoints.map((ep) => {
                          const isSelected = selectedEndpointIds.includes(ep._id);
                          const isEligible = ep.isActive;

                          return (
                            <TableRow
                              key={ep._id}
                              hover
                              sx={{
                                opacity: isEligible ? 1 : 0.6,
                              }}
                              data-testid={`service-row-${ep._id}`}
                            >
                              <TableCell padding="checkbox">
                                <Tooltip
                                  title={
                                    isEligible
                                      ? isSelected
                                        ? 'Unpublish this endpoint'
                                        : 'Publish this endpoint'
                                      : 'Inactive endpoints cannot be published'
                                  }
                                >
                                  <span>
                                    <Checkbox
                                      checked={isSelected}
                                      disabled={!isEligible}
                                      onChange={() => handleToggleEndpoint(ep._id)}
                                      size="small"
                                      data-testid={`endpoint-checkbox-${ep._id}`}
                                    />
                                  </span>
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 600, color: 'text.primary' }}
                                >
                                  {ep.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily: 'monospace',
                                    color: 'text.secondary',
                                    fontSize: '0.8rem',
                                  }}
                                >
                                  {ep.url}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={ep.isActive ? 'Active' : 'Inactive'}
                                  sx={{
                                    bgcolor: ep.isActive
                                      ? 'rgba(16, 185, 129, 0.1)'
                                      : 'rgba(244, 63, 94, 0.1)',
                                    color: ep.isActive ? '#34d399' : '#fb7185',
                                    fontSize: '0.72rem',
                                    fontWeight: 500,
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'flex-start' }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSaveServices}
                      disabled={updateServicesMutation.isPending}
                      startIcon={
                        updateServicesMutation.isPending ? (
                          <CircularProgress size={14} color="inherit" />
                        ) : (
                          <Save size={14} />
                        )
                      }
                      data-testid="save-services-btn"
                    >
                      Save Published Services
                    </Button>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Stack>
      ) : (
        <Alert severity="error">
          {statusPageError?.message || 'Failed to load status page settings.'}
        </Alert>
      )}
    </Stack>
  );
};
