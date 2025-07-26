import { createTheme, PaletteMode } from '@mui/material/styles';

interface ColorScheme {
  primary: string;
  secondary: string;
}

export const getTheme = (mode: PaletteMode, colorScheme: ColorScheme) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: colorScheme.primary,
        light: colorScheme.primary + '20',
        dark: colorScheme.primary + '80',
        contrastText: '#ffffff',
      },
      secondary: {
        main: colorScheme.secondary,
        light: colorScheme.secondary + '20',
        dark: colorScheme.secondary + '80',
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#2c3e50' : '#ffffff',
        secondary: mode === 'light' ? '#7f8c8d' : '#b0b0b0',
      },
      divider: mode === 'light' ? '#e0e0e0' : '#333333',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: colorScheme.primary,
              },
              '&.Mui-focused fieldset': {
                borderColor: colorScheme.primary,
              },
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow:
              mode === 'light' ? '0 8px 32px rgba(0, 0, 0, 0.1)' : '0 8px 32px rgba(0, 0, 0, 0.3)',
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
            color: mode === 'light' ? '#2c3e50' : '#ffffff',
            boxShadow: mode === 'light' ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
            borderRight: mode === 'light' ? '1px solid #e0e0e0' : '1px solid #333333',
          },
        },
      },
    },
  });
