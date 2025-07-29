'use client';

import { useTheme } from '@/contexts/ThemeContext';
import themeData from '@/mocks/theme.json';
import { Palette } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
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

// Usar dados do mock
const colorOptions: ColorOption[] = themeData.colorOptions;

interface ThemeCustomizerProps {
  open: boolean;
  onClose: () => void;
}

export function ThemeCustomizer({ open, onClose }: ThemeCustomizerProps) {
  const theme = useMuiTheme();
  const { colorScheme, setColorScheme } = useTheme();
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
          background: theme.palette.mode === 'dark' ? '#44475a' : '#ffffff',
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
          <Button onClick={handleReset} size="small">
            Resetar
          </Button>
          <Button onClick={onClose} size="small">
            Fechar
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Seção Theming */}
          <Box
            sx={{
              mb: 3,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography variant="body2" fontWeight={500}>
              Theming
            </Typography>
          </Box>

          {/* Seleção de Cor Primária */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Cor Primária
            </Typography>
            <FormControl>
              <RadioGroup
                row
                value={selectedColor}
                onChange={(e) => handleColorSelect(e.target.value)}
              >
                {colorOptions.map((color) => (
                  <FormControlLabel
                    key={color.name}
                    value={color.name}
                    control={<Radio />}
                    label={
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
                      >
                        {color.name === 'custom' && (
                          <Palette sx={{ color: 'white', fontSize: 20 }} />
                        )}
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Preview */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Preview
            </Typography>
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: 2,
                p: 3,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Este é um exemplo de como o tema ficará com a cor selecionada.
              </Typography>
            </Box>
          </Box>

          {/* Ações */}
          <DialogActions>
            <Button variant="outlined" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={onClose}>
              Aplicar Tema
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
