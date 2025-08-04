import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  theme: 'light' | 'dark';
  language: 'pt-BR' | 'en-US';
  sidebarExpanded: boolean;
  notifications: boolean;
  autoSave: boolean;
  itemsPerPage: number;
}

interface SettingsActions {
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'pt-BR' | 'en-US') => void;
  setSidebarExpanded: (expanded: boolean) => void;
  setNotifications: (enabled: boolean) => void;
  setAutoSave: (enabled: boolean) => void;
  setItemsPerPage: (count: number) => void;
  reset: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

const initialState: SettingsState = {
  theme: 'light',
  language: 'pt-BR',
  sidebarExpanded: false,
  notifications: true,
  autoSave: true,
  itemsPerPage: 20,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialState,

      setTheme: (theme) => set({ theme }),

      setLanguage: (language) => set({ language }),

      setSidebarExpanded: (sidebarExpanded) => set({ sidebarExpanded }),

      setNotifications: (notifications) => set({ notifications }),

      setAutoSave: (autoSave) => set({ autoSave }),

      setItemsPerPage: (itemsPerPage) => set({ itemsPerPage }),

      reset: () => set(initialState),
    }),
    {
      name: 'settings-storage',
    },
  ),
);
