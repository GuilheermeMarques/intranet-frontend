'use client';

import { PaletteMode } from '@mui/material';
import * as React from 'react';

interface ColorScheme {
  primary: string;
  secondary: string;
}

interface ThemeContextType {
  mode: PaletteMode;
  toggleTheme: () => void;
  isLoaded: boolean;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = React.useState<PaletteMode>('light');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [colorScheme, setColorScheme] = React.useState<ColorScheme>({
    primary: '#667eea',
    secondary: '#764ba2',
  });

  React.useEffect(() => {
    // Recuperar preferência salva no localStorage
    const savedMode = localStorage.getItem('theme-mode') as PaletteMode;
    const savedColorScheme = localStorage.getItem('theme-colors');

    if (savedMode) {
      setMode(savedMode);
    } else {
      // Verificar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? 'dark' : 'light');
    }

    if (savedColorScheme) {
      setColorScheme(JSON.parse(savedColorScheme));
    }

    setIsLoaded(true);
  }, []);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  const handleSetColorScheme = (scheme: ColorScheme) => {
    setColorScheme(scheme);
    localStorage.setItem('theme-colors', JSON.stringify(scheme));
  };

  const value = {
    mode,
    toggleTheme,
    isLoaded,
    colorScheme,
    setColorScheme: handleSetColorScheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
