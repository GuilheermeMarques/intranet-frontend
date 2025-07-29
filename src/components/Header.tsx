'use client';

import { useTheme } from '@/contexts/ThemeContext';
import {
  AccountCircle,
  DarkMode,
  LightMode,
  Logout,
  Menu as MenuIcon,
  Settings,
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useTheme as useMuiTheme,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import React from 'react';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarExpanded?: boolean;
  sidebarHoverExpanded?: boolean;
}

export function Header({
  onMenuClick,
  sidebarExpanded = false,
  sidebarHoverExpanded = false,
}: HeaderProps) {
  const theme = useMuiTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { mode, toggleTheme } = useTheme();
  const router = useRouter();

  const isSidebarExpanded = sidebarExpanded || sidebarHoverExpanded;
  const sidebarWidth = isSidebarExpanded ? 280 : 80;

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSettings = () => {
    router.push('/settings');
    handleClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100vw - ${sidebarWidth}px)` },
        ml: { md: `${sidebarWidth}px` },
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: theme.zIndex.drawer, // Menor que o sidebar
        transition: 'width 0.3s ease, margin-left 0.3s ease',
        left: { md: 0 }, // Garante que o header começa do lado do sidebar
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Dashboard
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle Button */}
          <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>

          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <AccountCircle />
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleSettings}>
              <Settings sx={{ mr: 1 }} />
              Configurações
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Logout sx={{ mr: 1 }} />
              Sair
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
