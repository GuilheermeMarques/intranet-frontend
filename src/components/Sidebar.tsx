'use client';

import {
  AttachMoney,
  Dashboard,
  ExpandLess,
  ExpandMore,
  Inventory,
  Menu,
  People,
  ShoppingCart,
  Support,
} from '@mui/icons-material';
import {
  Box,
  Collapse,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme as useMuiTheme,
} from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  expanded?: boolean;
  onToggle?: () => void;
  onHoverChange?: (isHoverExpanded: boolean) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Dashboard />,
    href: '/home',
  },
  {
    id: 'catalog',
    label: 'Catálogo',
    icon: <Inventory />,
    href: '/catalog',
  },
  {
    id: 'tickets',
    label: 'Chamados',
    icon: <Support />,
    href: '/tickets',
  },
  {
    id: 'budgets',
    label: 'Orçamentos',
    icon: <AttachMoney />,
    href: '/budgets',
  },
  {
    id: 'sales',
    label: 'Vendas',
    icon: <ShoppingCart />,
    href: '#',
    children: [
      {
        id: 'representatives',
        label: 'Representantes',
        icon: <People />,
        href: '/sales/representatives',
      },
    ],
  },
];

export function Sidebar({
  open,
  onClose,
  expanded = false,
  onToggle,
  onHoverChange,
}: SidebarProps) {
  const theme = useMuiTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);

  const isExpanded = expanded || hoverExpanded;
  const drawerWidth = isExpanded ? 280 : 80;

  const handleSubmenuToggle = (itemId: string) => {
    setOpenSubmenus((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      handleSubmenuToggle(item.id);
    } else if (item.href && item.href !== '#') {
      router.push(item.href);
      if (open) {
        onClose();
      }
    }
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (item.href && item.href !== '#') {
      return pathname === item.href;
    }
    if (item.children) {
      return item.children.some((child) => pathname === child.href);
    }
    return false;
  };

  const handleMouseEnter = () => {
    if (!expanded) {
      setHoverExpanded(true);
      onHoverChange?.(true);
    }
  };

  const handleMouseLeave = () => {
    if (!expanded) {
      setHoverExpanded(false);
      onHoverChange?.(false);
    }
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isSubmenuOpen = openSubmenus.includes(item.id);
    const isActive = isItemActive(item);

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: isExpanded ? 'initial' : 'center',
              px: 2.5,
              pl: level > 0 ? 4 : 2.5,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              ...(isActive && {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                },
              }),
            }}
            onClick={() => handleItemClick(item)}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isExpanded ? 3 : 'auto',
                justifyContent: 'center',
                color: isActive ? 'primary.contrastText' : 'primary.main',
              }}
            >
              {item.icon}
            </ListItemIcon>
            {isExpanded && (
              <>
                <ListItemText
                  primary={item.label}
                  sx={{
                    opacity: 1,
                    '& .MuiListItemText-primary': {
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    },
                  }}
                />
                {hasChildren && (
                  <Box sx={{ ml: 'auto' }}>{isSubmenuOpen ? <ExpandLess /> : <ExpandMore />}</Box>
                )}
              </>
            )}
          </ListItemButton>
        </ListItem>

        {hasChildren && isExpanded && (
          <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawer = (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        transition: 'width 0.3s ease',
        width: drawerWidth,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          minHeight: 64,
        }}
      >
        {isExpanded ? (
          <>
            <Box>
              <Typography variant="h6" fontWeight={600} color="primary.main">
                Intranet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Sistema Corporativo
              </Typography>
            </Box>
            <IconButton
              onClick={onToggle}
              sx={{
                p: 1,
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Menu />
            </IconButton>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <Typography variant="h6" fontWeight={600} color="primary.main">
              I
            </Typography>
          </Box>
        )}
      </Box>

      {/* Menu Items */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>{menuItems.map((item) => renderMenuItem(item))}</List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        {isExpanded ? (
          <Typography variant="caption" color="text.secondary" align="center">
            © 2024 Intranet Corporativa
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary" align="center">
            © 2024
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            transition: 'width 0.3s ease',
            zIndex: theme.zIndex.drawer + 2, // Maior que o header
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
}
