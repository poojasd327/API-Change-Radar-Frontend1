import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Radio,
  LayoutDashboard,
  Server,
  Activity,
  AlertTriangle,
  Globe,
  Menu,
  X,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

import { AuthContext } from '@/context/AuthContext';

const DRAWER_WIDTH = 260;

export const DashboardLayout = ({ onLogout: propOnLogout, userEmail: propUserEmail }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const authContext = useContext(AuthContext);

  const onLogout = propOnLogout || authContext?.logout;
  const userEmail =
    propUserEmail || authContext?.user?.email || 'user@apichangeradar.local';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Endpoints', href: '/endpoints', icon: Server },
    { name: 'Check History', href: '/checks', icon: Activity },
    { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
    { name: 'Public Status Page', href: '/status-page', icon: Globe },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
          }}
        >
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              bgcolor: 'rgba(37, 99, 235, 0.1)',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Radio size={20} />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}
            >
              APIChange{' '}
              <Box component="span" sx={{ color: '#2563eb' }}>
                Radar
              </Box>
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
            >
              Admin Portal
            </Typography>
          </Box>
        </Link>
      </Box>

      {/* Navigation Links */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
              <NavLink
                to={item.href}
                onClick={() => isMobile && setMobileOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  textDecoration: 'none',
                  borderRadius: 8,
                  padding: '8px 12px',
                  backgroundColor: isActive ? '#eff6ff' : 'transparent',
                  color: isActive ? '#2563eb' : '#64748b',
                  borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.15s ease',
                })}
              >
                <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                  <Icon size={18} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 'inherit' }}>
                      {item.name}
                    </Typography>
                  }
                />
              </NavLink>
            </ListItem>
          );
        })}
      </List>

      {/* Individual User Account Section */}
      <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', overflow: 'hidden' }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
              }}
            >
              <UserIcon size={16} />
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography
                variant="body2"
                noWrap
                sx={{
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  color: 'text.primary',
                }}
              >
                {userEmail}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}
              >
                Individual Account
              </Typography>
            </Box>
          </Stack>
          {onLogout && (
            <IconButton
              size="small"
              onClick={onLogout}
              aria-label="Log out"
              sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
            >
              <LogOut size={16} />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid #e2e8f0',
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none',
              }}
            >
              <Radio size={20} color="#2563eb" />
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: 'text.primary' }}
              >
                APIChange Radar
              </Typography>
            </Link>
            <IconButton
              color="inherit"
              edge="end"
              onClick={handleDrawerToggle}
              aria-label="menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar Navigation */}
      <Box component="nav" sx={{ width: { lg: DRAWER_WIDTH }, flexShrink: { lg: 0 } }}>
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: '1px solid #e2e8f0',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop permanent drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: '1px solid #e2e8f0',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, md: 4 },
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: 7, lg: 0 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

DashboardLayout.propTypes = {
  onLogout: PropTypes.func,
  userEmail: PropTypes.string,
};
