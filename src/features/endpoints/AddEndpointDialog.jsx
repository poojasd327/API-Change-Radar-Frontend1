import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Box,
  Stack,
  Typography,
  IconButton,
} from '@mui/material';
import { Plus, Server, X } from 'lucide-react';
import { useCreateEndpoint } from '@/hooks/useEndpoints';

const SUPPORTED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export const AddEndpointDialog = ({ open, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [isActive, setIsActive] = useState(true);

  // Client-side field validation errors
  const [errors, setErrors] = useState({});
  // Backend / network error message
  const [backendError, setBackendError] = useState(null);
  // Success feedback message
  const [successMessage, setSuccessMessage] = useState(null);

  const createEndpointMutation = useCreateEndpoint();

  const resetForm = () => {
    setName('');
    setUrl('');
    setMethod('GET');
    setIsActive(true);
    setErrors({});
    setBackendError(null);
    setSuccessMessage(null);
  };

  const handleClose = () => {
    if (createEndpointMutation.isPending) return;
    resetForm();
    onClose();
  };

  const validateForm = () => {
    const newErrors = {};

    // 1. Validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Endpoint name is required';
    } else if (trimmedName.length > 200) {
      newErrors.name = 'Endpoint name must not exceed 200 characters';
    }

    // 2. Validate URL
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      newErrors.url = 'Endpoint URL is required';
    } else {
      try {
        const parsed = new URL(trimmedUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          newErrors.url = 'Endpoint URL must use http:// or https:// protocol';
        }
      } catch {
        newErrors.url =
          'Please enter a valid URL (e.g. https://api.example.com/v1/users)';
      }
    }

    // 3. Validate method
    if (!SUPPORTED_METHODS.includes(method)) {
      newErrors.method = `Method must be one of: ${SUPPORTED_METHODS.join(', ')}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    // Explicitly assemble ONLY fields permitted by backend contract
    const payload = {
      name: name.trim(),
      url: url.trim(),
      method,
      isActive,
    };

    try {
      const response = await createEndpointMutation.mutateAsync(payload);
      setSuccessMessage(
        response?.message || 'Endpoint registered successfully. List has been updated.'
      );

      if (onSuccess) {
        onSuccess(response);
      }

      // Automatically reset and close dialog after brief confirmation
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      setBackendError(
        err?.message ||
          'Failed to create endpoint. Please check your connection or input.'
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      data-testid="add-endpoint-dialog"
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 2.5,
            p: 0.5,
          },
        },
      }}
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Header */}
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1,
            pt: 2.5,
            px: 3,
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: 'rgba(37, 99, 235, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Server size={20} color="#2563eb" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Register Monitored Endpoint
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                POST /api/endpoints • SSRF validated & scoped to your account
              </Typography>
            </Box>
          </Stack>
          <IconButton
            size="small"
            onClick={handleClose}
            disabled={createEndpointMutation.isPending}
            sx={{ color: 'text.secondary' }}
            aria-label="close dialog"
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>

        {/* Form Body */}
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Stack spacing={2.5}>
            {/* Success feedback */}
            {successMessage && (
              <Alert severity="success" data-testid="add-endpoint-success">
                {successMessage}
              </Alert>
            )}

            {/* Backend error feedback */}
            {backendError && (
              <Alert severity="error" data-testid="add-endpoint-error">
                {backendError}
              </Alert>
            )}

            {/* Field: Name */}
            <TextField
              label="Endpoint Name"
              required
              fullWidth
              size="medium"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
              error={Boolean(errors.name)}
              helperText={
                errors.name ||
                'Descriptive name for this API service (1 to 200 characters)'
              }
              placeholder="e.g. User Authentication Service"
              disabled={createEndpointMutation.isPending}
              slotProps={{
                htmlInput: {
                  'data-testid': 'endpoint-name-input',
                  maxLength: 200,
                },
              }}
            />

            {/* Field: URL */}
            <TextField
              label="Endpoint URL"
              required
              fullWidth
              size="medium"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (errors.url) setErrors((prev) => ({ ...prev, url: null }));
              }}
              error={Boolean(errors.url)}
              helperText={errors.url || 'Full public HTTP or HTTPS URL to monitor'}
              placeholder="https://api.example.com/v1/auth"
              disabled={createEndpointMutation.isPending}
              slotProps={{
                htmlInput: {
                  'data-testid': 'endpoint-url-input',
                },
              }}
            />

            {/* Row: Method & Active switch */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ alignItems: 'flex-start' }}
            >
              <FormControl sx={{ minWidth: 150 }} error={Boolean(errors.method)}>
                <InputLabel id="method-select-label">HTTP Method</InputLabel>
                <Select
                  labelId="method-select-label"
                  id="method-select"
                  value={method}
                  label="HTTP Method"
                  onChange={(e) => setMethod(e.target.value)}
                  disabled={createEndpointMutation.isPending}
                  data-testid="endpoint-method-select"
                >
                  {SUPPORTED_METHODS.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ pt: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      color="primary"
                      disabled={createEndpointMutation.isPending}
                      data-testid="endpoint-active-switch"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Active Monitoring
                    </Typography>
                  }
                />
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', pl: 1 }}
                >
                  Enable automated checks once contract is registered
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </DialogContent>

        {/* Footer Actions */}
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={createEndpointMutation.isPending}
            data-testid="cancel-endpoint-btn"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={createEndpointMutation.isPending}
            startIcon={
              createEndpointMutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Plus size={16} />
              )
            }
            data-testid="submit-endpoint-btn"
          >
            {createEndpointMutation.isPending ? 'Registering...' : 'Register Endpoint'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

AddEndpointDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};
