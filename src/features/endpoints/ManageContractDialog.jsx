import React, { useState, useEffect, useMemo } from 'react';
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
  Alert,
  CircularProgress,
  Box,
  Stack,
  Typography,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Paper,
  Divider,
} from '@mui/material';
import {
  FileCode,
  ShieldCheck,
  ShieldAlert,
  X,
  Sparkles,
  Check,
  Eye,
  Plus,
} from 'lucide-react';
import {
  useContracts,
  useCreateContract,
  useValidateContract,
  useInferContract,
  useApproveContract,
} from '@/hooks/useContracts';

const DEFAULT_SAMPLE_JSON = JSON.stringify(
  {
    page: {
      id: 'kctbh9vrtdwd',
      name: 'GitHub',
      url: 'https://www.githubstatus.com',
    },
    status: {
      indicator: 'none',
      description: 'All Systems Operational',
    },
  },
  null,
  2
);

export const ManageContractDialog = ({
  open,
  onClose,
  endpoint,
  endpoints = [],
  onSuccess,
}) => {
  const [selectedEndpointId, setSelectedEndpointId] = useState('');
  const [tabIndex, setTabIndex] = useState(0); // 0: Define Contract, 1: Saved Contracts & Approval

  // Form State
  const [contractName, setContractName] = useState('');
  const [schemaText, setSchemaText] = useState('');
  const [sampleText, setSampleText] = useState(DEFAULT_SAMPLE_JSON);
  const [validationResult, setValidationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [expandedContractId, setExpandedContractId] = useState(null);

  // Sync selected endpoint when dialog opens or endpoint prop changes
  useEffect(() => {
    if (endpoint?._id) {
      setSelectedEndpointId(endpoint._id);
      setContractName(`${endpoint.name} Contract`);
    } else if (endpoints.length > 0 && !selectedEndpointId) {
      setSelectedEndpointId(endpoints[0]._id);
      setContractName(`${endpoints[0].name} Contract`);
    }
  }, [endpoint, endpoints, open, selectedEndpointId]);

  // Query existing contracts for the selected endpoint
  const {
    data: contractsData,
    isLoading: isLoadingContracts,
    refetch: refetchContracts,
  } = useContracts(
    { endpointId: selectedEndpointId },
    { enabled: Boolean(selectedEndpointId) && open }
  );

  const contracts = useMemo(() => {
    if (Array.isArray(contractsData?.data)) return contractsData.data;
    if (Array.isArray(contractsData)) return contractsData;
    return [];
  }, [contractsData]);

  // Mutations
  const createMutation = useCreateContract();
  const validateMutation = useValidateContract();
  const inferMutation = useInferContract();
  const approveMutation = useApproveContract();

  const activeEndpoint = useMemo(() => {
    return endpoints.find((ep) => ep._id === selectedEndpointId) || endpoint || null;
  }, [endpoints, endpoint, selectedEndpointId]);

  const resetForm = () => {
    setValidationResult(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleClose = () => {
    if (createMutation.isPending || approveMutation.isPending) return;
    resetForm();
    onClose();
  };

  // 1. Infer Schema from Example JSON
  const handleInferSchema = async () => {
    setErrorMessage(null);
    setValidationResult(null);

    let parsedSample;
    try {
      parsedSample = JSON.parse(sampleText);
    } catch {
      setErrorMessage(
        'Invalid JSON in example response. Please check syntax before inferring.'
      );
      return;
    }

    try {
      const res = await inferMutation.mutateAsync({
        sampleData: parsedSample,
        title: contractName || 'Monitored API Contract',
      });
      if (res?.schema) {
        setSchemaText(JSON.stringify(res.schema, null, 2));
        setSuccessMessage(
          'Schema successfully inferred from your example response! You can now review, validate, and save it.'
        );
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to infer schema from sample data.');
    }
  };

  // 2. Validate Schema Structure & Sample
  const handleValidateSchema = async () => {
    setErrorMessage(null);
    setValidationResult(null);

    let parsedSchema;
    try {
      parsedSchema = JSON.parse(schemaText);
    } catch {
      setErrorMessage('Schema must be valid JSON before validating.');
      return;
    }

    let parsedSample;
    if (sampleText.trim()) {
      try {
        parsedSample = JSON.parse(sampleText);
      } catch {
        // Sample is optional for validation
      }
    }

    try {
      const res = await validateMutation.mutateAsync({
        schema: parsedSchema,
        sampleData: parsedSample,
      });
      setValidationResult(res);
      if (res.valid) {
        setSuccessMessage(
          'Schema structure is 100% valid according to Ajv JSON Schema rules.'
        );
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Schema validation failed.');
    }
  };

  // 3. Save Contract as Draft (Pending Approval)
  const handleSaveContract = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedEndpointId) {
      setErrorMessage('Please select an endpoint for this contract.');
      return;
    }

    if (!contractName.trim()) {
      setErrorMessage('Contract name is required.');
      return;
    }

    let parsedSchema;
    try {
      parsedSchema = JSON.parse(schemaText);
    } catch {
      setErrorMessage('Schema must be valid JSON.');
      return;
    }

    try {
      const res = await createMutation.mutateAsync({
        endpointId: selectedEndpointId,
        name: contractName.trim(),
        schema: parsedSchema,
      });

      setSuccessMessage(
        res?.message ||
          'Contract created in Pending Approval status. Review and approve below to activate automated monitoring.'
      );
      refetchContracts();
      setTabIndex(1); // Switch to Saved Contracts tab so user can review and approve
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to save contract.');
    }
  };

  // 4. Explicit User Approval Action
  const handleApprove = async (contractId) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await approveMutation.mutateAsync(contractId);
      setSuccessMessage(
        res?.message ||
          'Contract approved! Automated monitoring will now evaluate against this contract.'
      );
      refetchContracts();
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to approve contract.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      data-testid="manage-contract-dialog"
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
            <FileCode size={20} color="#2563eb" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              API Contract Management
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Define JSON Schema contracts, validate rules, and approve for monitoring
            </Typography>
          </Box>
        </Stack>
        <IconButton
          size="small"
          onClick={handleClose}
          disabled={createMutation.isPending || approveMutation.isPending}
          sx={{ color: 'text.secondary' }}
          aria-label="close dialog"
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 1 }}>
        <Stack spacing={2.5}>
          {/* Endpoint Selector & Readiness Status */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 2,
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
            >
              <FormControl sx={{ minWidth: { xs: '100%', sm: 300 } }}>
                <InputLabel id="select-endpoint-label">Monitored Endpoint</InputLabel>
                <Select
                  labelId="select-endpoint-label"
                  id="endpoint-select"
                  value={selectedEndpointId}
                  label="Monitored Endpoint"
                  onChange={(e) => {
                    setSelectedEndpointId(e.target.value);
                    const ep = endpoints.find((x) => x._id === e.target.value);
                    if (ep) setContractName(`${ep.name} Contract`);
                    resetForm();
                  }}
                  data-testid="contract-endpoint-select"
                >
                  {endpoints.map((ep) => (
                    <MenuItem key={ep._id} value={ep._id}>
                      {ep.name} ({ep.method || 'GET'})
                    </MenuItem>
                  ))}
                  {endpoints.length === 0 && endpoint && (
                    <MenuItem value={endpoint._id}>
                      {endpoint.name} ({endpoint.method || 'GET'})
                    </MenuItem>
                  )}
                </Select>
              </FormControl>

              {activeEndpoint && (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Status:
                  </Typography>
                  {activeEndpoint.hasActiveContract ? (
                    <Chip
                      size="small"
                      icon={<ShieldCheck size={14} color="#10b981" />}
                      label="Contract Approved"
                      sx={{
                        bgcolor: 'rgba(16, 185, 129, 0.12)',
                        color: '#34d399',
                        fontWeight: 600,
                      }}
                    />
                  ) : (
                    <Chip
                      size="small"
                      icon={<ShieldAlert size={14} color="#f59e0b" />}
                      label="Pending Contract"
                      sx={{
                        bgcolor: 'rgba(245, 158, 11, 0.12)',
                        color: '#fbbf24',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Stack>
              )}
            </Stack>
          </Paper>

          {/* Feedback alerts */}
          {successMessage && (
            <Alert
              severity="success"
              data-testid="contract-success-alert"
              onClose={() => setSuccessMessage(null)}
            >
              {successMessage}
            </Alert>
          )}

          {errorMessage && (
            <Alert
              severity="error"
              data-testid="contract-error-alert"
              onClose={() => setErrorMessage(null)}
            >
              {errorMessage}
            </Alert>
          )}

          {/* Navigation Tabs */}
          <Tabs
            value={tabIndex}
            onChange={(_e, v) => {
              setTabIndex(v);
              resetForm();
            }}
            sx={{
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              '& .MuiTab-root': { fontWeight: 600 },
            }}
          >
            <Tab
              label="1. Define & Validate Contract"
              data-testid="tab-define-contract"
            />
            <Tab
              label={`2. Saved Contracts & Approval (${contracts.length})`}
              data-testid="tab-saved-contracts"
            />
          </Tabs>

          {/* TAB 0: Define & Validate Contract */}
          {tabIndex === 0 && (
            <Box component="form" onSubmit={handleSaveContract}>
              <Stack spacing={2.5}>
                {/* Contract Name */}
                <TextField
                  label="Contract Name"
                  required
                  fullWidth
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  placeholder="e.g. GitHub Status Schema v1"
                  helperText="Descriptive label for this contract version"
                  slotProps={{
                    htmlInput: {
                      'data-testid': 'contract-name-input',
                    },
                  }}
                />

                {/* Example JSON response inference box */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(59, 130, 246, 0.03)',
                    borderColor: 'rgba(59, 130, 246, 0.2)',
                    borderRadius: 2,
                  }}
                >
                  <Stack spacing={1.5}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Step A: Example API Response (Optional inference helper)
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={
                          inferMutation.isPending ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <Sparkles size={14} />
                          )
                        }
                        onClick={handleInferSchema}
                        disabled={inferMutation.isPending || !sampleText.trim()}
                        data-testid="infer-schema-btn"
                      >
                        {inferMutation.isPending
                          ? 'Inferring...'
                          : 'Generate Schema from JSON'}
                      </Button>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Paste a real response from this API. APIChange Radar will
                      automatically infer standard JSON Schema properties.
                    </Typography>
                    <TextField
                      multiline
                      minRows={4}
                      maxRows={6}
                      fullWidth
                      value={sampleText}
                      onChange={(e) => setSampleText(e.target.value)}
                      placeholder='{ "status": "UP", "data": ... }'
                      slotProps={{
                        htmlInput: {
                          style: {
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                          },
                          'data-testid': 'sample-json-input',
                        },
                      }}
                    />
                  </Stack>
                </Paper>

                {/* JSON Schema Definition */}
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Step B: Expected JSON Schema Contract (Ajv Draft-07 compliant)
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      onClick={handleValidateSchema}
                      disabled={validateMutation.isPending || !schemaText.trim()}
                      data-testid="validate-contract-btn"
                    >
                      {validateMutation.isPending ? 'Validating...' : 'Validate Schema'}
                    </Button>
                  </Box>
                  <TextField
                    multiline
                    required
                    minRows={7}
                    maxRows={12}
                    fullWidth
                    value={schemaText}
                    onChange={(e) => setSchemaText(e.target.value)}
                    placeholder='{ "$schema": "http://json-schema.org/draft-07/schema#", "type": "object", "required": ["status"], "properties": { "status": { "type": "string" } } }'
                    helperText="Define strict object types, required fields, and data types"
                    slotProps={{
                      htmlInput: {
                        style: {
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                        },
                        'data-testid': 'schema-json-input',
                      },
                    }}
                  />
                </Box>

                {/* Validation Diagnostics */}
                {validationResult && (
                  <Alert
                    severity={validationResult.valid ? 'success' : 'error'}
                    data-testid="validation-diagnostics"
                  >
                    {validationResult.valid ? (
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Schema is syntactically valid! Ready to save.
                      </Typography>
                    ) : (
                      <Stack spacing={0.5}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Schema validation errors:
                        </Typography>
                        {validationResult.schemaErrors?.map((err, i) => (
                          <Typography
                            key={i}
                            variant="caption"
                            sx={{ fontFamily: 'monospace', display: 'block' }}
                          >
                            • {err}
                          </Typography>
                        ))}
                      </Stack>
                    )}
                  </Alert>
                )}

                {/* Submit button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={createMutation.isPending || !schemaText.trim()}
                    startIcon={
                      createMutation.isPending ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <Plus size={16} />
                      )
                    }
                    data-testid="save-contract-btn"
                  >
                    {createMutation.isPending
                      ? 'Saving Contract...'
                      : 'Save Contract (Pending Approval)'}
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}

          {/* TAB 1: Saved Contracts & Approval Workflow */}
          {tabIndex === 1 && (
            <Stack spacing={2}>
              {isLoadingContracts ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : contracts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    No contracts saved for this endpoint yet
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Switch to the &quot;Define &amp; Validate Contract&quot; tab to create
                    your first contract.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2} data-testid="saved-contracts-list">
                  {contracts.map((c) => {
                    const isExpanded = expandedContractId === c._id;
                    const isApprovedActive = c.isApproved && c.isActive;

                    return (
                      <Paper
                        key={c._id}
                        variant="outlined"
                        data-testid={`contract-card-${c._id}`}
                        sx={{
                          p: 2.5,
                          bgcolor: isApprovedActive
                            ? 'rgba(16, 185, 129, 0.04)'
                            : 'rgba(255, 255, 255, 0.02)',
                          borderColor: isApprovedActive
                            ? 'rgba(16, 185, 129, 0.3)'
                            : 'rgba(255, 255, 255, 0.08)',
                          borderRadius: 2,
                        }}
                      >
                        <Stack spacing={1.5}>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: { xs: 'column', sm: 'row' },
                              justifyContent: 'space-between',
                              alignItems: { xs: 'flex-start', sm: 'center' },
                              gap: 1.5,
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1.5}
                              sx={{ alignItems: 'center' }}
                            >
                              <Chip
                                size="small"
                                label={`v${c.version || 1}`}
                                sx={{
                                  fontFamily: 'monospace',
                                  fontWeight: 700,
                                  bgcolor: 'rgba(59, 130, 246, 0.15)',
                                  color: '#60a5fa',
                                }}
                              />
                              <Box>
                                <Typography
                                  variant="subtitle1"
                                  sx={{ fontWeight: 600, color: 'text.primary' }}
                                >
                                  {c.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'text.secondary' }}
                                >
                                  Created{' '}
                                  {c.createdAt
                                    ? new Date(c.createdAt).toLocaleDateString()
                                    : 'recently'}
                                </Typography>
                              </Box>
                            </Stack>

                            <Stack
                              direction="row"
                              spacing={1.5}
                              sx={{ alignItems: 'center' }}
                            >
                              {isApprovedActive ? (
                                <Chip
                                  size="small"
                                  icon={<ShieldCheck size={14} color="#10b981" />}
                                  label="Approved & Active"
                                  sx={{
                                    bgcolor: 'rgba(16, 185, 129, 0.15)',
                                    color: '#34d399',
                                    fontWeight: 600,
                                  }}
                                />
                              ) : (
                                <Chip
                                  size="small"
                                  icon={<ShieldAlert size={14} color="#f59e0b" />}
                                  label="Pending Approval"
                                  sx={{
                                    bgcolor: 'rgba(245, 158, 11, 0.15)',
                                    color: '#fbbf24',
                                    fontWeight: 600,
                                  }}
                                />
                              )}

                              {/* Explicit Approval Action */}
                              {!isApprovedActive && (
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  startIcon={
                                    approveMutation.isPending ? (
                                      <CircularProgress size={14} color="inherit" />
                                    ) : (
                                      <Check size={14} />
                                    )
                                  }
                                  onClick={() => handleApprove(c._id)}
                                  disabled={approveMutation.isPending}
                                  data-testid={`approve-contract-btn-${c._id}`}
                                >
                                  Approve Contract
                                </Button>
                              )}
                            </Stack>
                          </Box>

                          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />

                          {/* Toggle view schema */}
                          <Box>
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<Eye size={14} />}
                              onClick={() =>
                                setExpandedContractId(isExpanded ? null : c._id)
                              }
                              sx={{ color: 'text.secondary' }}
                            >
                              {isExpanded ? 'Hide Schema' : 'Inspect JSON Schema'}
                            </Button>
                            {isExpanded && (
                              <Box
                                component="pre"
                                sx={{
                                  mt: 1,
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  bgcolor: 'rgba(0, 0, 0, 0.3)',
                                  border: '1px solid rgba(255, 255, 255, 0.06)',
                                  fontSize: '0.75rem',
                                  overflowX: 'auto',
                                  color: '#e2e8f0',
                                }}
                              >
                                {JSON.stringify(c.schema, null, 2)}
                              </Box>
                            )}
                          </Box>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button variant="outlined" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ManageContractDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  endpoint: PropTypes.object,
  endpoints: PropTypes.array,
  onSuccess: PropTypes.func,
};
