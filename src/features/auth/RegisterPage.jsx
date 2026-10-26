import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { UserPlus, ArrowLeft, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      errors.name = 'Full name is required';
    } else if (trimmedName.length < 2 || trimmedName.length > 50) {
      errors.name = 'Name must be between 2 and 50 characters';
    }

    if (!trimmedEmail) {
      errors.email = 'Email address is required';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
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
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      // On successful registration, user and token are established in central auth state.
      // Navigate directly to the protected dashboard.
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMessage(
        err.message || 'Registration failed. Please check your information.'
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
          <UserPlus size={20} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Create Account
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Individual developer registration for APIChange Radar
        </Typography>
      </Box>

      {/* Error Feedback */}
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
          {errorMessage.toLowerCase().includes('already registered') && (
            <Box sx={{ mt: 1 }}>
              <Link
                to="/login"
                style={{ color: '#60a5fa', textDecoration: 'underline', fontWeight: 600 }}
              >
                Sign in with this email instead
              </Link>
            </Box>
          )}
        </Alert>
      )}

      {/* Name Input */}
      <TextField
        label="Full Name"
        type="text"
        fullWidth
        autoComplete="name"
        autoFocus
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (fieldErrors.name) {
            setFieldErrors((prev) => ({ ...prev, name: undefined }));
          }
        }}
        error={Boolean(fieldErrors.name)}
        helperText={fieldErrors.name || '2-50 characters'}
        disabled={isSubmitting}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <User size={18} color="#94a3b8" />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Email Input */}
      <TextField
        label="Email Address"
        type="email"
        fullWidth
        autoComplete="email"
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
        autoComplete="new-password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (fieldErrors.password) {
            setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }
        }}
        error={Boolean(fieldErrors.password)}
        helperText={fieldErrors.password || `Minimum ${MIN_PASSWORD_LENGTH} characters`}
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
            <UserPlus size={18} />
          )
        }
        sx={{ py: 1.2, fontWeight: 600 }}
      >
        {isSubmitting ? 'Creating account...' : 'Create Account'}
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

      {/* Link to Login */}
      <Typography
        variant="caption"
        sx={{ textAlign: 'center', color: 'text.secondary', display: 'block' }}
      >
        Already have an account?{' '}
        <Link
          to="/login"
          style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}
        >
          Sign In
        </Link>
      </Typography>
    </Stack>
  );
};
