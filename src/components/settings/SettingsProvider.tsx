import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTheme } from 'next-themes';

export interface GameSettings {
  theme: 'light' | 'dark' | 'system';
  animationSpeed: 'slow' | 'normal' | 'fast';
  soundEnabled: boolean;
  showAIThoughts: boolean;
  compactMode: boolean;
  reducedMotion: boolean;
}

interface SettingsContextType {
  settings: GameSettings;
  updateSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  resetSettings: () => void;
}

const defaultSettings: GameSettings = {
  theme: 'system',
  animationSpeed: 'normal',
  soundEnabled: true,
  showAIThoughts: true,
  compactMode: false,
  reducedMotion: false,
};

const SettingsContext = createContext<SettingsContextType | null>(null);

const STORAGE_KEY = 'game-settings';

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { setTheme } = useTheme();
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return defaultSettings;
  });

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }
  }, []);

  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  // Sync theme with next-themes
  useEffect(() => {
    setTheme(settings.theme);
  }, [settings.theme, setTheme]);

  // Apply animation speed to CSS
  useEffect(() => {
    const root = document.documentElement;
    const speeds = {
      slow: '1.5',
      normal: '1',
      fast: '0.5',
    };
    root.style.setProperty('--animation-speed', speeds[settings.animationSpeed]);
  }, [settings.animationSpeed]);

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsProvider;
