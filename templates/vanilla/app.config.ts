/**
 * Application Configuration
 * Customize your app's branding, colors, and settings here.
 */

import { defineConfig } from 'electron-license-kit';

export default defineConfig({
  app: {
    name: 'My Electron App',
    id: 'com.example.myapp',
    version: '1.0.0',
    description: 'A beautiful Electron app built with electron-license-kit',
    author: 'Your Name',
    website: 'https://example.com',
  },
  branding: {
    logo: './assets/logo.png',
    logoLight: './assets/logo-light.png',
    logoDark: './assets/logo-dark.png',
  },
  theme: {
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
  },
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
    width: 900,
    height: 650,
    minWidth: 700,
    minHeight: 500,
    frame: false,
    resizable: true,
  },
  features: {
    autoUpdater: true,
    crashReporter: true,
    singleInstance: true,
    devTools: process.env.NODE_ENV === 'development',
  },
});

