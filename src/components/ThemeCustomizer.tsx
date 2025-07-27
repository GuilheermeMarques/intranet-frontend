'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Close, Palette, Refresh } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
  useTheme as useMuiTheme,
} from '@mui/material';
import { useState } from 'react';

interface ColorOption {
  name: string;
  primary: string;
  secondary: string;
  label: string;
}

const colorOptions: ColorOption[] = [
  {
    name: 'purple',
    primary: '#667eea',
    secondary: '#764ba2',
    label: 'Roxo',
  },
  {
    name: 'blue',
    primary: '#2196f3',
    secondary: '#1976d2',
    label: 'Azul',
  },
  {
    name: 'green',
    primary: '#4caf50',
    secondary: '#388e3c',
    label: 'Verde',
  },
  {
    name: 'orange',
    primary: '#ff9800',
    secondary: '#f57c00',
    label: 'Laranja',
  },
  {
    name: 'red',
    primary: '#f44336',
    secondary: '#d32f2f',
    label: 'Vermelho',
  },
  {
    name: 'teal',
    primary: '#009688',
    secondary: '#00796b',
    label: 'Teal',
  },
];

interface ThemeCustomizerProps {
  open: boolean;
  onClose: () => void;
}

export function ThemeCustomizer({ open, onClose }: ThemeCustomizerProps) {
  const theme = useMuiTheme();
  const { mode, toggleTheme, colorScheme, setColorScheme } = useTheme();
  const [selectedColor, setSelectedColor] = useState(() => {
    // Encontrar a cor atual baseada no colorScheme
    const currentColor = colorOptions.find((option) => option.primary === colorScheme.primary);
    return currentColor?.name || 'purple';
  });

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    const colorOption = colorOptions.find((option) => option.name === colorName);
    if (colorOption) {
      setColorScheme({
        primary: colorOption.primary,
        secondary: colorOption.secondary,
      });
    }
  };

  const handleReset = () => {
    const defaultColor = colorOptions.find((option) => option.name === 'purple');
    if (defaultColor) {
      setSelectedColor('purple');
      setColorScheme({
        primary: defaultColor.primary,
        secondary: defaultColor.secondary,
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: theme.palette.mode === 'dark' ? '#44475a' : '#ffffff', // Dracula selection
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Personalizar Tema
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Customize e visualize em tempo real
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={handleReset}
            size="small"
            sx={{
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'action.selected' },
            }}
          >
            <Refresh />
          </IconButton>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Seção Theming */}
          <Card
            sx={{
              mb: 3,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <CardContent sx={{ py: 1, px: 2 }}>
              <Typography variant="body2" fontWeight={500}>
                Theming
              </Typography>
            </CardContent>
          </Card>

          {/* Seleção de Cor Primária */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Cor Primária
            </Typography>
            <Grid container spacing={1}>
              {colorOptions.map((color) => (
                <Grid key={color.name}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1,
                      bgcolor: color.primary,
                      border: selectedColor === color.name ? 3 : 1,
                      borderColor: selectedColor === color.name ? 'white' : 'divider',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        transition: 'transform 0.2s',
                      },
                    }}
                    onClick={() => handleColorSelect(color.name)}
                  >
                    {color.name === 'custom' && <Palette sx={{ color: 'white', fontSize: 20 }} />}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      textAlign: 'center',
                      mt: 0.5,
                      color: selectedColor === color.name ? 'primary.main' : 'text.secondary',
                      fontWeight: selectedColor === color.name ? 600 : 400,
                    }}
                  >
                    {color.label}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Preview do Tema */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Preview
            </Typography>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Button variant="contained" size="small">
                    Botão Primário
                  </Button>
                  <Button variant="outlined" size="small">
                    Botão Secundário
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Este é um exemplo de como o tema ficará com a cor selecionada.
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Ações */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={onClose}>
              Aplicar Tema
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
