'use client';

import { ThemeProvider as CustomThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { getTheme } from '@/lib/theme';
import { CssBaseline } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { mode, isLoaded, colorScheme } = useTheme();
  const theme = getTheme(mode, colorScheme);

  // Só renderiza quando o tema estiver carregado para evitar hidratação
  if (!isLoaded) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <CustomThemeProvider>
      <ThemeWrapper>{children}</ThemeWrapper>
    </CustomThemeProvider>
  );
}
