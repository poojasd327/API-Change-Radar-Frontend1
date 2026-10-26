import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { LogIn, ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email: email.trim(),
        password,
      });

      // Redirect to the originally requested route, or default to /dashboard
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      // Backend error response or network error
      setErrorMessage(
        err.message || 'Authentication failed. Please check your credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={3} component="form" onSubmit={handleSubmit} noValidate>
      {/* Brand Header */}
      <Box sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            mx: 'auto',
            width: 44,
            height: 44,
            borderRadius: '50%',
            bgcolor: 'rgba(59, 130, 246, 0.1)',
            color: '#60a5fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1.5,
          }}
        >
          <LogIn size={20} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
          Sign In
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Individual developer account access for APIChange Radar
        </Typography>
      </Box>

      {/* Backend & Network Error Display */}
      {errorMessage && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{
            fontSize: '0.85rem',
            bgcolor: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Email Input */}
      <TextField
        label="Email Address"
        type="email"
        fullWidth
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (fieldErrors.email) {
            setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }
        }}
        error={Boolean(fieldErrors.email)}
        helperText={fieldErrors.email}
        disabled={isSubmitting}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Mail size={18} color="#94a3b8" />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Password Input */}
      <TextField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        fullWidth
        autoComplete="current-password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (fieldErrors.password) {
            setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }
        }}
        error={Boolean(fieldErrors.password)}
        helperText={fieldErrors.password}
        disabled={isSubmitting}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Lock size={18} color="#94a3b8" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                  size="small"
                  sx={{ color: '#94a3b8' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={isSubmitting}
        startIcon={
          isSubmitting ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <LogIn size={18} />
          )
        }
        sx={{ py: 1.2, fontWeight: 600 }}
      >
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>

      {/* Return to Starter Screen */}
      <Button
        component={Link}
        to="/"
        variant="text"
        fullWidth
        size="small"
        startIcon={<ArrowLeft size={16} />}
        sx={{ color: 'text.secondary' }}
      >
        Back to Starter Screen
      </Button>

      {/* Link to Register */}
      <Typography
        variant="caption"
        sx={{ textAlign: 'center', color: 'text.secondary', display: 'block' }}
      >
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}
        >
          Create Account
        </Link>
      </Typography>
    </Stack>
  );
};
