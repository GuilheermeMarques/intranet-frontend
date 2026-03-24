'use client';

import { useTheme as useAppTheme } from '@/contexts/ThemeContext';
import menuData from '@/mocks/menu.json';
import {
  AccountCircle,
  AttachMoney,
  DarkMode,
  Dashboard,
  ExpandLess,
  ExpandMore,
  Inventory,
  Label,
  LightMode,
  Logout,
  Menu,
  People,
  PriorityHigh,
  Settings,
  ShoppingCart,
  Support,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Collapse,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu as MuiMenu,
  MenuItem,
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

// Mapear ícones
const iconMap: Record<string, React.ReactNode> = {
  Dashboard: <Dashboard />,
  Inventory: <Inventory />,
  Support: <Support />,
  AttachMoney: <AttachMoney />,
  ShoppingCart: <ShoppingCart />,
  People: <People />,
  PriorityHigh: <PriorityHigh />,
  Label: <Label />,
};

// Usar dados do mock
const menuItems: MenuItem[] = menuData.menuItems.map((item) => ({
  ...item,
  icon: iconMap[item.icon as keyof typeof iconMap] || <Dashboard />,
  children: item.children?.map((child) => ({
    ...child,
    icon: iconMap[child.icon as keyof typeof iconMap] || <Dashboard />,
  })),
}));

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
  const { mode, toggleTheme } = useAppTheme();
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const isExpanded = expanded || hoverExpanded;
  const drawerWidth = isExpanded ? 280 : 80;
  /** Drawer temporário (mobile) aberto: sempre layout expandido e largura total */
  const showExpandedUi = isExpanded || open;
  const innerDrawerWidth = open ? 280 : drawerWidth;

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

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleSettings = () => {
    router.push('/settings');
    handleUserMenuClose();
    onClose();
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
              justifyContent: showExpandedUi ? 'initial' : 'center',
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
                mr: showExpandedUi ? 3 : 'auto',
                justifyContent: 'center',
                color: isActive ? 'primary.contrastText' : 'primary.main',
              }}
            >
              {item.icon}
            </ListItemIcon>
            {showExpandedUi && (
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

        {hasChildren && showExpandedUi && (
          <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const themeToggleButton = (
    <IconButton
      color="inherit"
      onClick={toggleTheme}
      aria-label={mode === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
      size={showExpandedUi ? 'medium' : 'small'}
      sx={{
        color: 'text.primary',
      }}
    >
      {mode === 'dark' ? <LightMode /> : <DarkMode />}
    </IconButton>
  );

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
        width: innerDrawerWidth,
      }}
    >
      {/* Topo: marca + tema + recolher */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          minHeight: 64,
          ...(showExpandedUi
            ? { flexDirection: 'row' }
            : { flexDirection: 'column', gap: 0.5, py: 1.5 }),
        }}
      >
        {showExpandedUi ? (
          <>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={600} color="primary.main" noWrap>
                Intranet
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Sistema Corporativo
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {themeToggleButton}
              <IconButton
                onClick={onToggle}
                aria-label="Recolher menu"
                sx={{
                  p: 1,
                  borderRadius: 1,
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Menu />
              </IconButton>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h6" fontWeight={600} color="primary.main">
              I
            </Typography>
            {themeToggleButton}
          </>
        )}
      </Box>

      {/* Itens de navegação */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>{menuItems.map((item) => renderMenuItem(item))}</List>
      </Box>

      {/* Rodapé: usuário + copyright */}
      <Box
        sx={{
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleUserMenuOpen}
            aria-label="Menu da conta"
            aria-controls={userMenuAnchor ? 'sidebar-user-menu' : undefined}
            aria-haspopup="true"
            sx={{
              minHeight: 56,
              justifyContent: showExpandedUi ? 'flex-start' : 'center',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: showExpandedUi ? 40 : 0,
                justifyContent: 'center',
                color: 'primary.main',
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <AccountCircle />
              </Avatar>
            </ListItemIcon>
            {showExpandedUi && (
              <ListItemText
                primary="Conta"
                secondary="Perfil e sair"
                slotProps={{
                  primary: { fontSize: '0.875rem', fontWeight: 600 },
                  secondary: { fontSize: '0.75rem' },
                }}
              />
            )}
          </ListItemButton>
        </ListItem>
        <MuiMenu
          id="sidebar-user-menu"
          anchorEl={userMenuAnchor}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          slotProps={{
            paper: { sx: { ml: 1 } },
          }}
        >
          <MenuItem onClick={handleSettings}>
            <Settings sx={{ mr: 1, fontSize: 20 }} />
            Configurações
          </MenuItem>
          <MenuItem onClick={handleUserMenuClose}>
            <Logout sx={{ mr: 1, fontSize: 20 }} />
            Sair
          </MenuItem>
        </MuiMenu>

        <Box sx={{ px: 2, pb: 1.5, pt: 0 }}>
          {showExpandedUi ? (
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              © 2024 Intranet Corporativa
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              © 2024
            </Typography>
          )}
        </Box>
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
          keepMounted: true,
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
            zIndex: theme.zIndex.drawer,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
}
