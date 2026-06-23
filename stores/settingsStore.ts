import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '@/lib/i18n';

type Theme = 'light' | 'dark' | 'system';

interface SettingsState {
  theme: Theme;
  notifications: boolean;
  autoBackup: boolean;
  userName: string;
  language: Language;

  loadSettings: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  setNotifications: (enabled: boolean) => Promise<void>;
  setAutoBackup: (enabled: boolean) => Promise<void>;
  setUserName: (name: string) => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'system',
  notifications: true,
  autoBackup: true,
  userName: '',
  language: 'fr',

  loadSettings: async () => {
    try {
      const settings = await AsyncStorage.getItem('aerolife-settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        set(parsed);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  },

  setTheme: async (theme) => {
    set({ theme });
    const current = await AsyncStorage.getItem('aerolife-settings');
    const settings = current ? JSON.parse(current) : {};
    await AsyncStorage.setItem('aerolife-settings', JSON.stringify({ ...settings, theme }));
  },

  setNotifications: async (notifications) => {
    set({ notifications });
    const current = await AsyncStorage.getItem('aerolife-settings');
    const settings = current ? JSON.parse(current) : {};
    await AsyncStorage.setItem('aerolife-settings', JSON.stringify({ ...settings, notifications }));
  },

  setAutoBackup: async (autoBackup) => {
    set({ autoBackup });
    const current = await AsyncStorage.getItem('aerolife-settings');
    const settings = current ? JSON.parse(current) : {};
    await AsyncStorage.setItem('aerolife-settings', JSON.stringify({ ...settings, autoBackup }));
  },

  setUserName: async (userName) => {
    set({ userName });
    const current = await AsyncStorage.getItem('aerolife-settings');
    const settings = current ? JSON.parse(current) : {};
    await AsyncStorage.setItem('aerolife-settings', JSON.stringify({ ...settings, userName }));
  },

  setLanguage: async (language) => {
    set({ language });
    const current = await AsyncStorage.getItem('aerolife-settings');
    const settings = current ? JSON.parse(current) : {};
    await AsyncStorage.setItem('aerolife-settings', JSON.stringify({ ...settings, language }));
  },
}));
