import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container, Stack } from '@mui/material';
import { FileQuestion, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        textAlign: 'center',
      }}
      className="radar-grid"
    >
      <Container maxWidth="sm">
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa',
              mb: 1,
            }}
          >
            <FileQuestion size={32} />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, color: '#ffffff' }}>
            404 — Page Not Found
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400 }}>
            The route you requested does not exist on this portal.
          </Typography>

          <Button
            component={Link}
            to="/"
            variant="contained"
            color="primary"
            startIcon={<Home size={18} />}
            sx={{ mt: 2 }}
          >
            Back to Starter Screen
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};
