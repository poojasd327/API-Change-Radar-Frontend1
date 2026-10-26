import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardHeader,
  CardContent,
  Stack,
} from '@mui/material';
import { LayoutDashboard, ArrowLeft } from 'lucide-react';

export const DashboardPage = () => {
  return (
    <Stack spacing={3}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Aggregate monitoring metrics, endpoint health, and active incidents.
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/"
          variant="outlined"
          size="small"
          startIcon={<ArrowLeft size={16} />}
        >
          Starter Screen
        </Button>
      </Box>

      <Card>
        <CardHeader
          title={
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <LayoutDashboard size={20} color="#60a5fa" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Dashboard Foundation
              </Typography>
            </Stack>
          }
          subheader="This protected route is reserved for Stage 5/6 full dashboard UI implementation."
        />
        <CardContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            MUI layout, responsive sidebar navigation, and client route protection are
            active and functioning.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
};
