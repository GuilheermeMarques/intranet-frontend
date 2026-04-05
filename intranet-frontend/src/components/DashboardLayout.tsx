'use client';

import { Menu as MenuIcon } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [sidebarHoverExpanded, setSidebarHoverExpanded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedExpanded = localStorage.getItem('sidebar-expanded');
    if (savedExpanded !== null) {
      setSidebarExpanded(savedExpanded === 'true');
    }
    setIsLoaded(true);
  }, []);

  const handleSidebarToggle = () => {
    const newExpanded = !sidebarExpanded;
    setSidebarExpanded(newExpanded);
    localStorage.setItem('sidebar-expanded', newExpanded.toString());
  };

  const handleSidebarHoverChange = (isHoverExpanded: boolean) => {
    setSidebarHoverExpanded(isHoverExpanded);
  };

  const isSidebarExpanded = sidebarExpanded || sidebarHoverExpanded;
  const sidebarWidth = isSidebarExpanded ? 280 : 80;

  // Don't render until loaded to prevent hydration issues
  if (!isLoaded) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <IconButton
        color="inherit"
        aria-label="Abrir menu"
        onClick={() => setSidebarOpen(true)}
        sx={{
          display: { xs: 'inline-flex', md: 'none' },
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          boxShadow: 2,
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <MenuIcon />
      </IconButton>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        expanded={sidebarExpanded}
        onToggle={handleSidebarToggle}
        onHoverChange={handleSidebarHoverChange}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100vw - ${sidebarWidth}px)` },
          ml: { md: `${sidebarWidth}px` },
          pt: { xs: 7, md: 0 },
          backgroundColor: 'background.default',
          minHeight: '100vh',
          transition: 'width 0.3s ease, margin-left 0.3s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
