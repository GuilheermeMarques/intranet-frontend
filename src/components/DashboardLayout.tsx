'use client';

import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Header } from './Header';
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

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
      <Header
        onMenuClick={handleDrawerToggle}
        sidebarExpanded={sidebarExpanded}
        sidebarHoverExpanded={sidebarHoverExpanded}
      />
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
          mt: '64px', // Height of AppBar
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
          transition: 'width 0.3s ease, margin-left 0.3s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
