/**
 * Branding configuration helper
 */

import type { AppConfig, ThemeColors } from '../types';

export const defaultTheme: ThemeColors = {
  primary: '#6366f1',
  primaryHover: '#4f46e5',
  primaryText: '#ffffff',
  background: '#0a0a0f',
  backgroundSecondary: '#111118',
  backgroundTertiary: '#1a1a24',
  text: '#ffffff',
  textSecondary: '#a1a1aa',
  textTertiary: '#71717a',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  border: '#27272a',
  divider: '#3f3f46',
  titlebar: {
    background: '#0a0a0f',
    text: '#ffffff',
    buttonHover: '#27272a',
    buttonClose: '#ef4444',
  },
};

export const defaultConfig: AppConfig = {
  app: {
    name: 'My App',
    id: 'com.example.myapp',
    version: '1.0.0',
  },
  branding: {},
  theme: defaultTheme,
  license: {
    keyPrefix: 'APP',
    keyPattern: /^APP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/,
    offlineGraceDays: 3,
    checkIntervalHours: 24,
  },
  supabase: {
    tableName: 'licenses',
    claimFunction: 'claim_license',
  },
  window: {
    width: 800,
    height: 600,
    minWidth: 700,
    minHeight: 500,
    frame: false,
    resizable: true,
  },
  features: {
    autoUpdater: true,
    crashReporter: true,
    singleInstance: true,
    devTools: false,
  },
};

export function defineConfig(config: Partial<AppConfig>): AppConfig {
  return {
    app: { ...defaultConfig.app, ...config.app },
    branding: { ...defaultConfig.branding, ...config.branding },
    theme: {
      ...defaultConfig.theme,
      ...config.theme,
      titlebar: {
        ...defaultConfig.theme.titlebar,
        ...config.theme?.titlebar,
      },
    },
    license: { ...defaultConfig.license, ...config.license },
    supabase: { ...defaultConfig.supabase, ...config.supabase },
    window: { ...defaultConfig.window, ...config.window },
    features: { ...defaultConfig.features, ...config.features },
  };
}

