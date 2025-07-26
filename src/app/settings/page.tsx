'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
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
  useTheme as useMuiTheme,
} from '@mui/material';
import React, { useState } from 'react';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: () => void;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'theme',
    title: 'Personalização',
    description: 'Customize cores e aparência da interface',
    icon: <Palette />,
  },
  {
    id: 'notifications',
    title: 'Notificações',
    description: 'Configure alertas e notificações',
    icon: <Notifications />,
  },
  {
    id: 'security',
    title: 'Segurança',
    description: 'Configurações de senha e privacidade',
    icon: <Security />,
  },
  {
    id: 'language',
    title: 'Idioma',
    description: 'Altere o idioma da interface',
    icon: <Language />,
  },
  {
    id: 'storage',
    title: 'Armazenamento',
    description: 'Gerencie dados e cache',
    icon: <Storage />,
  },
  {
    id: 'help',
    title: 'Ajuda',
    description: 'Suporte e documentação',
    icon: <Help />,
  },
];

export default function SettingsPage() {
  const theme = useMuiTheme();
  const [themeCustomizerOpen, setThemeCustomizerOpen] = useState(false);

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
                  Usuário Exemplo
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  usuario@exemplo.com
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Último Login
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  Hoje às 14:30
                </Typography>
              </Box>
              <Button variant="outlined" fullWidth>
                Editar Perfil
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <ThemeCustomizer open={themeCustomizerOpen} onClose={() => setThemeCustomizerOpen(false)} />
    </DashboardLayout>
  );
}
