'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { ConfirmModal } from '@/components/Modal';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import settingsData from '@/mocks/settings.json';
import { Help, Language, Notifications, Palette, Security, Storage } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: () => void;
}

// Mapear ícones
const iconMap: Record<string, React.ReactNode> = {
  Palette: <Palette />,
  Notifications: <Notifications />,
  Security: <Security />,
  Language: <Language />,
  Storage: <Storage />,
  Help: <Help />,
};

// Usar dados do mock
const settingsSections: SettingsSection[] = settingsData.settingsSections.map((section) => ({
  ...section,
  icon: iconMap[section.icon] || <Help />,
}));

export default function SettingsPage() {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = useState(false);
  const [confirmEditProfileOpen, setConfirmEditProfileOpen] = useState(false);

  const handleSectionClick = (sectionId: string) => {
    switch (sectionId) {
      case 'theme':
        setThemeCustomizerOpen(true);
        break;
      default:
        console.log('Seção clicada:', sectionId);
        break;
    }
  };

  const handleEditProfile = () => {
    setConfirmEditProfileOpen(true);
  };

  const handleConfirmEditProfile = () => {
    // TODO: Implementar edição de perfil
    console.log('Editando perfil...');
    setConfirmEditProfileOpen(false);
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
          Configurações
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Gerencie suas preferências e configurações da conta.
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Configurações Gerais
              </Typography>
              <List>
                {settingsSections.map((section, index) => (
                  <React.Fragment key={section.id}>
                    <ListItem
                      onClick={() => handleSectionClick(section.id)}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'primary.main' }}>{section.icon}</ListItemIcon>
                      <ListItemText primary={section.title} secondary={section.description} />
                    </ListItem>
                    {index < settingsSections.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Informações da Conta
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Nome
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {settingsData.userInfo.name}
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {settingsData.userInfo.email}
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Último Login
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {settingsData.userInfo.lastLogin}
                </Typography>
              </Box>
              <Button variant="outlined" fullWidth onClick={handleEditProfile}>
                Editar Perfil
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <ThemeCustomizer open={themeCustomizerOpen} onClose={() => setThemeCustomizerOpen(false)} />

      <ConfirmModal
        open={confirmEditProfileOpen}
        onClose={() => setConfirmEditProfileOpen(false)}
        onConfirm={handleConfirmEditProfile}
        title="Editar Perfil"
        message="Você será redirecionado para a página de edição de perfil. Deseja continuar?"
        confirmLabel="Continuar"
        cancelLabel="Cancelar"
        confirmColor="primary"
      />
    </DashboardLayout>
  );
}
