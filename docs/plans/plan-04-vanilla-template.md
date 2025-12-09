# Plan 04: Vanilla Template

**Project:** electron-license-kit
**Phase:** 4 of 5
**Estimated Tasks:** 15
**Depends on:** Plan 03 (Utility Modules)

---

## Overview

Create the vanilla template - a ready-to-use Electron app scaffold that:
- Uses electron-license-kit for all core functionality
- Has a beautiful, themeable UI
- Includes CI/CD with GitHub Actions
- Is easy to customize via app.config.ts

---

## Prerequisites

- Plans 01-03 completed
- NPM package builds successfully

---

## Tasks

### Task 1: Create Template Directory Structure

**Location:** `templates/vanilla/`

Create the following structure:

```
templates/vanilla/
├── src/
│   ├── main/
│   ├── renderer/
│   │   ├── js/
│   │   └── styles/
│   └── core/
├── assets/
├── .github/
│   └── workflows/
└── (config files)
```

**Commands:**
```bash
mkdir -p templates/vanilla/src/main
mkdir -p templates/vanilla/src/renderer/js
mkdir -p templates/vanilla/src/renderer/styles
mkdir -p templates/vanilla/src/core
mkdir -p templates/vanilla/assets
mkdir -p templates/vanilla/.github/workflows
```

**Verification:** Run `ls -la templates/vanilla/` - all directories exist.

---

### Task 2: Create app.config.ts

**File:** `templates/vanilla/app.config.ts`

```typescript
/**
 * Application Configuration
 * Customize your app's branding, colors, and settings here.
 */

import { defineConfig } from 'electron-license-kit';

export default defineConfig({
  // App Identity
  app: {
    name: 'My Electron App',
    id: 'com.example.myapp',
    version: '1.0.0',
    description: 'A beautiful Electron app built with electron-license-kit',
    author: 'Your Name',
    website: 'https://example.com',
  },

  // Branding Assets
  branding: {
    logo: './assets/logo.png',
    logoLight: './assets/logo-light.png',
    logoDark: './assets/logo-dark.png',
  },

  // Theme Colors - Customize your app's look!
  theme: {
    // Primary brand color
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    primaryText: '#ffffff',

    // Backgrounds
    background: '#0a0a0f',
    backgroundSecondary: '#111118',
    backgroundTertiary: '#1a1a24',

    // Text
    text: '#ffffff',
    textSecondary: '#a1a1aa',
    textTertiary: '#71717a',

    // Semantic colors
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // Borders
    border: '#27272a',
    divider: '#3f3f46',

    // Titlebar
    titlebar: {
      background: '#0a0a0f',
      text: '#ffffff',
      buttonHover: '#27272a',
      buttonClose: '#ef4444',
    },
  },

  // License Settings
  license: {
    keyPrefix: 'APP',
    keyPattern: /^APP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/,
    offlineGraceDays: 3,
    checkIntervalHours: 24,
  },

  // Supabase - Set these in .env file
  supabase: {
    tableName: 'licenses',
    claimFunction: 'claim_license',
  },

  // Window Settings
  window: {
    width: 900,
    height: 650,
    minWidth: 700,
    minHeight: 500,
    frame: false,
    resizable: true,
  },

  // Feature Flags
  features: {
    autoUpdater: true,
    crashReporter: true,
    singleInstance: true,
    devTools: process.env.NODE_ENV === 'development',
  },
});
```

**Verification:** File exists and TypeScript syntax is valid.

---

### Task 3: Create Main Process Entry Point

**File:** `templates/vanilla/src/main/index.ts`

```typescript
/**
 * Main Process Entry Point
 * Built with electron-license-kit
 */

import { app, BrowserWindow } from 'electron';
import path from 'path';
import {
  createMainWindow,
  registerWindowControls,
  enforceSingleInstance,
  setupSecurityPolicy,
  createLogger,
  CrashReporter,
  AutoUpdater,
  registerUpdaterHandlers,
  injectTheme,
  loadEnvFiles,
} from 'electron-license-kit';
import { registerIpcHandlers } from './ipc-handlers';
import appConfig from '../../app.config';

// Load environment variables
loadEnvFiles(path.join(__dirname, '../..'), app.isPackaged);

// Initialize crash reporter early
const crashReporter = new CrashReporter({ appName: appConfig.app.name });
crashReporter.initialize();
crashReporter.rotateLogs();
crashReporter.cleanOldCrashReports();
crashReporter.log('info', `${appConfig.app.name} v${appConfig.app.version} starting...`);

// Enforce single instance
if (appConfig.features.singleInstance && !enforceSingleInstance()) {
  crashReporter.log('info', 'Another instance running, quitting...');
  app.quit();
  process.exit(0);
}

// Create logger
const logger = createLogger({
  appName: appConfig.app.name,
  level: app.isPackaged ? 'info' : 'debug',
});

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  logger.info('Creating main window');

  mainWindow = createMainWindow({
    ...appConfig.window,
    backgroundColor: appConfig.theme.background,
    preloadPath: path.join(__dirname, 'preload.js'),
    htmlPath: path.join(__dirname, '../renderer/index.html'),
    devTools: appConfig.features.devTools,
  });

  // Inject theme CSS variables
  mainWindow.webContents.on('dom-ready', () => {
    if (mainWindow) {
      void injectTheme(mainWindow, appConfig.theme);
    }
  });

  // Register window controls
  registerWindowControls(mainWindow);

  // Setup security
  setupSecurityPolicy(mainWindow, {
    allowedExternalDomains: ['github.com', 'supabase.co'],
    enableDevTools: appConfig.features.devTools,
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  logger.info('Main window created');
}

// Register IPC handlers
registerIpcHandlers(appConfig);
registerUpdaterHandlers();

// App ready
app.whenReady().then(() => {
  createWindow();

  // Initialize auto-updater in production
  if (app.isPackaged && appConfig.features.autoUpdater) {
    const updater = new AutoUpdater();
    if (updater.initialize({ checkInterval: 5000 })) {
      logger.info('Auto-updater initialized');
    }
  }

  // macOS: recreate window on activate
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows closed (except macOS)
app.on('window-all-closed', () => {
  logger.info('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean shutdown
app.on('before-quit', () => {
  crashReporter.log('info', 'Application exiting normally');
});
```

**Verification:** TypeScript syntax is valid.

---

### Task 4: Create Preload Script

**File:** `templates/vanilla/src/main/preload.ts`

```typescript
/**
 * Preload Script
 * Exposes safe APIs to the renderer process
 */

import { contextBridge, ipcRenderer } from 'electron';

// Type definitions for renderer
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}

const electronAPI = {
  // =========================================================================
  // Window Controls
  // =========================================================================
  minimizeWindow: (): void => ipcRenderer.send('window-minimize'),
  maximizeWindow: (): void => ipcRenderer.send('window-maximize'),
  closeWindow: (): void => ipcRenderer.send('window-close'),

  // =========================================================================
  // Authentication
  // =========================================================================
  login: (email: string, password: string): Promise<unknown> =>
    ipcRenderer.invoke('auth-login', email, password),

  register: (email: string, password: string, licenseKey: string): Promise<unknown> =>
    ipcRenderer.invoke('auth-register', email, password, licenseKey),

  validateLicense: (): Promise<unknown> =>
    ipcRenderer.invoke('auth-validate'),

  logout: (): Promise<void> =>
    ipcRenderer.invoke('auth-logout'),

  resetPassword: (email: string): Promise<boolean> =>
    ipcRenderer.invoke('auth-reset-password', email),

  getLicenseStatus: (): Promise<unknown> =>
    ipcRenderer.invoke('auth-get-status'),

  // =========================================================================
  // Updates
  // =========================================================================
  getVersion: (): Promise<{ version: string; isPackaged: boolean }> =>
    ipcRenderer.invoke('get-version'),

  checkForUpdates: (): Promise<{ updateAvailable: boolean; version?: string }> =>
    ipcRenderer.invoke('check-for-updates'),

  downloadUpdate: (): Promise<boolean> =>
    ipcRenderer.invoke('download-update'),

  installUpdate: (): Promise<void> =>
    ipcRenderer.invoke('install-update'),

  onUpdateStatus: (callback: (status: unknown) => void): void => {
    ipcRenderer.on('update-status', (_event, status) => callback(status));
  },

  // =========================================================================
  // External Links
  // =========================================================================
  openExternal: (url: string): Promise<boolean> =>
    ipcRenderer.invoke('open-external', url),

  // =========================================================================
  // App Info
  // =========================================================================
  getAppInfo: (): Promise<{ name: string; version: string }> =>
    ipcRenderer.invoke('get-app-info'),

  // =========================================================================
  // Custom APIs - Add your own below!
  // =========================================================================
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
```

**Verification:** TypeScript syntax is valid.

---

### Task 5: Create IPC Handlers

**File:** `templates/vanilla/src/main/ipc-handlers.ts`

```typescript
/**
 * IPC Handlers
 * Register custom IPC handlers here
 */

import { ipcMain } from 'electron';
import {
  LicenseService,
  type AppConfig,
} from 'electron-license-kit';

let licenseService: LicenseService | null = null;

export function registerIpcHandlers(appConfig: AppConfig): void {
  // Initialize license service if Supabase is configured
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    licenseService = new LicenseService({
      supabaseUrl,
      supabaseAnonKey: supabaseKey,
      licenseKeyPattern: appConfig.license.keyPattern,
      tableName: appConfig.supabase.tableName,
      claimRpcName: appConfig.supabase.claimFunction,
      appName: appConfig.app.name,
    });
  }

  // =========================================================================
  // Auth Handlers
  // =========================================================================

  ipcMain.handle('auth-login', async (_event, email: string, password: string) => {
    if (!licenseService) {
      throw new Error('License service not configured. Check .env file.');
    }
    return licenseService.login(email, password);
  });

  ipcMain.handle('auth-register', async (_event, email: string, password: string, licenseKey: string) => {
    if (!licenseService) {
      throw new Error('License service not configured. Check .env file.');
    }
    return licenseService.register(email, password, licenseKey);
  });

  ipcMain.handle('auth-validate', async () => {
    if (!licenseService) {
      return { valid: false, error: 'License service not configured' };
    }
    return licenseService.validate();
  });

  ipcMain.handle('auth-logout', async () => {
    if (licenseService) {
      await licenseService.logout();
    }
  });

  ipcMain.handle('auth-reset-password', async (_event, email: string) => {
    if (!licenseService) {
      throw new Error('License service not configured');
    }
    return licenseService.resetPassword(email);
  });

  ipcMain.handle('auth-get-status', () => {
    if (!licenseService) {
      return null;
    }
    return licenseService.getStatus();
  });

  // =========================================================================
  // App Info
  // =========================================================================

  ipcMain.handle('get-app-info', () => ({
    name: appConfig.app.name,
    version: appConfig.app.version,
  }));

  // =========================================================================
  // Custom Handlers - Add your own below!
  // =========================================================================
}
```

**Verification:** TypeScript syntax is valid.

---

### Task 6: Create Main HTML File

**File:** `templates/vanilla/src/renderer/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">
  <title>My Electron App</title>
  <link rel="stylesheet" href="styles/theme.css">
  <link rel="stylesheet" href="styles/main.css">
  <link rel="stylesheet" href="styles/titlebar.css">
  <link rel="stylesheet" href="styles/auth.css">
</head>
<body>
  <!-- Custom Titlebar -->
  <div class="titlebar">
    <div class="titlebar-drag">
      <span class="titlebar-title">My Electron App</span>
    </div>
    <div class="titlebar-controls">
      <button class="titlebar-btn" id="btn-minimize" title="Minimize">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect fill="currentColor" width="10" height="1" x="1" y="6"/>
        </svg>
      </button>
      <button class="titlebar-btn" id="btn-maximize" title="Maximize">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect stroke="currentColor" fill="none" width="9" height="9" x="1.5" y="1.5"/>
        </svg>
      </button>
      <button class="titlebar-btn titlebar-btn-close" id="btn-close" title="Close">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path stroke="currentColor" stroke-width="1.2" d="M2,2 L10,10 M10,2 L2,10"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- Main Content -->
  <main class="app-content">
    <!-- Auth View (shown when not logged in) -->
    <div id="auth-view" class="view">
      <div class="auth-container">
        <div class="auth-logo">
          <img src="../assets/logo.png" alt="Logo" width="64" height="64">
        </div>
        <h1 class="auth-title">Welcome</h1>
        <p class="auth-subtitle">Sign in to continue</p>

        <!-- Login Form -->
        <form id="login-form" class="auth-form">
          <div class="form-group">
            <label for="login-email">Email</label>
            <input type="email" id="login-email" placeholder="you@example.com" required>
          </div>
          <div class="form-group">
            <label for="login-password">Password</label>
            <input type="password" id="login-password" placeholder="Your password" required>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Sign In</button>
        </form>

        <div class="auth-links">
          <a href="#" id="show-register">Create account</a>
          <span class="separator">|</span>
          <a href="#" id="show-reset">Forgot password?</a>
        </div>

        <!-- Register Form (hidden by default) -->
        <form id="register-form" class="auth-form hidden">
          <div class="form-group">
            <label for="register-email">Email</label>
            <input type="email" id="register-email" placeholder="you@example.com" required>
          </div>
          <div class="form-group">
            <label for="register-password">Password</label>
            <input type="password" id="register-password" placeholder="Min 8 characters" required minlength="8">
          </div>
          <div class="form-group">
            <label for="register-license">License Key</label>
            <input type="text" id="register-license" placeholder="APP-XXXX-XXXX-XXXX" required>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Create Account</button>
        </form>

        <div id="register-links" class="auth-links hidden">
          <a href="#" id="show-login">Already have an account? Sign in</a>
        </div>

        <!-- Error Message -->
        <div id="auth-error" class="auth-error hidden"></div>
      </div>
    </div>

    <!-- App View (shown when logged in) -->
    <div id="app-view" class="view hidden">
      <div class="app-header">
        <h1>Welcome to Your App!</h1>
        <p class="text-secondary">You are logged in.</p>
      </div>

      <div class="app-card">
        <h2>License Status</h2>
        <div id="license-info">
          <p>Loading...</p>
        </div>
      </div>

      <div class="app-card">
        <h2>Your Content Here</h2>
        <p class="text-secondary">
          This is where your app's main content goes.
          Edit <code>src/renderer/index.html</code> to customize.
        </p>
      </div>

      <div class="app-footer">
        <button id="btn-logout" class="btn btn-secondary">Sign Out</button>
      </div>
    </div>
  </main>

  <script src="js/titlebar.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

**Verification:** HTML syntax is valid.

---

### Task 7: Create Theme CSS (Base)

**File:** `templates/vanilla/src/renderer/styles/theme.css`

```css
/**
 * Theme CSS Variables
 * These are injected by electron-license-kit from app.config.ts
 * This file provides fallback defaults
 */

:root {
  /* Primary */
  --elk-primary: #6366f1;
  --elk-primary-hover: #4f46e5;
  --elk-primary-text: #ffffff;
  --elk-primary-rgb: 99, 102, 241;

  /* Backgrounds */
  --elk-bg: #0a0a0f;
  --elk-bg-secondary: #111118;
  --elk-bg-tertiary: #1a1a24;

  /* Text */
  --elk-text: #ffffff;
  --elk-text-secondary: #a1a1aa;
  --elk-text-tertiary: #71717a;

  /* Semantic */
  --elk-success: #22c55e;
  --elk-warning: #f59e0b;
  --elk-error: #ef4444;
  --elk-info: #3b82f6;

  /* Border */
  --elk-border: #27272a;
  --elk-divider: #3f3f46;

  /* Titlebar */
  --elk-titlebar-bg: #0a0a0f;
  --elk-titlebar-text: #ffffff;
  --elk-titlebar-btn-hover: #27272a;
  --elk-titlebar-btn-close: #ef4444;

  /* Computed */
  --elk-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
  --elk-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.5);
  --elk-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --elk-radius-sm: 4px;
  --elk-radius-md: 8px;
  --elk-radius-lg: 12px;
  --elk-radius-full: 9999px;
}
```

**Verification:** CSS syntax is valid.

---

### Task 8: Create Main CSS

**File:** `templates/vanilla/src/renderer/styles/main.css`

```css
/**
 * Main Styles
 */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--elk-text);
  background: var(--elk-bg);
  overflow: hidden;
}

/* Layout */
.app-content {
  height: calc(100% - 32px);
  overflow-y: auto;
  padding: 24px;
}

.view {
  max-width: 800px;
  margin: 0 auto;
}

.hidden {
  display: none !important;
}

/* Typography */
h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}

.text-secondary {
  color: var(--elk-text-secondary);
}

code {
  background: var(--elk-bg-tertiary);
  padding: 2px 6px;
  border-radius: var(--elk-radius-sm);
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

/* Cards */
.app-card {
  background: var(--elk-bg-secondary);
  border: 1px solid var(--elk-border);
  border-radius: var(--elk-radius-lg);
  padding: 20px;
  margin-bottom: 16px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--elk-radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--elk-primary);
  color: var(--elk-primary-text);
}

.btn-primary:hover:not(:disabled) {
  background: var(--elk-primary-hover);
}

.btn-secondary {
  background: var(--elk-bg-tertiary);
  color: var(--elk-text);
  border: 1px solid var(--elk-border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--elk-bg-secondary);
}

.btn-block {
  width: 100%;
}

/* Forms */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: var(--elk-text-secondary);
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--elk-text);
  background: var(--elk-bg-tertiary);
  border: 1px solid var(--elk-border);
  border-radius: var(--elk-radius-md);
  outline: none;
  transition: border-color 0.15s ease;
}

.form-group input:focus {
  border-color: var(--elk-primary);
}

.form-group input::placeholder {
  color: var(--elk-text-tertiary);
}

/* App Header/Footer */
.app-header {
  margin-bottom: 24px;
}

.app-footer {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--elk-divider);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--elk-bg);
}

::-webkit-scrollbar-thumb {
  background: var(--elk-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--elk-divider);
}
```

**Verification:** CSS syntax is valid.

---

### Task 9: Create Titlebar CSS

**File:** `templates/vanilla/src/renderer/styles/titlebar.css`

```css
/**
 * Custom Titlebar Styles
 */

.titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  background: var(--elk-titlebar-bg);
  color: var(--elk-titlebar-text);
  user-select: none;
  -webkit-app-region: drag;
}

.titlebar-drag {
  flex: 1;
  display: flex;
  align-items: center;
  padding-left: 12px;
}

.titlebar-title {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.9;
}

.titlebar-controls {
  display: flex;
  -webkit-app-region: no-drag;
}

.titlebar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 32px;
  background: transparent;
  border: none;
  color: var(--elk-titlebar-text);
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.titlebar-btn:hover {
  background: var(--elk-titlebar-btn-hover);
}

.titlebar-btn-close:hover {
  background: var(--elk-titlebar-btn-close);
  color: white;
}

.titlebar-btn svg {
  width: 12px;
  height: 12px;
}
```

**Verification:** CSS syntax is valid.

---

### Task 10: Create Auth CSS

**File:** `templates/vanilla/src/renderer/styles/auth.css`

```css
/**
 * Authentication Styles
 */

.auth-container {
  max-width: 360px;
  margin: 60px auto;
  padding: 32px;
  background: var(--elk-bg-secondary);
  border: 1px solid var(--elk-border);
  border-radius: var(--elk-radius-lg);
}

.auth-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.auth-logo img {
  border-radius: var(--elk-radius-md);
}

.auth-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 4px;
}

.auth-subtitle {
  text-align: center;
  color: var(--elk-text-secondary);
  margin-bottom: 24px;
}

.auth-form {
  margin-bottom: 16px;
}

.auth-links {
  text-align: center;
  margin-top: 16px;
}

.auth-links a {
  color: var(--elk-primary);
  text-decoration: none;
  font-size: 13px;
}

.auth-links a:hover {
  text-decoration: underline;
}

.auth-links .separator {
  color: var(--elk-text-tertiary);
  margin: 0 8px;
}

.auth-error {
  margin-top: 16px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--elk-error);
  border-radius: var(--elk-radius-md);
  color: var(--elk-error);
  font-size: 13px;
  text-align: center;
}
```

**Verification:** CSS syntax is valid.

---

### Task 11: Create Titlebar JS

**File:** `templates/vanilla/src/renderer/js/titlebar.ts`

```typescript
/**
 * Titlebar Controls
 */

document.addEventListener('DOMContentLoaded', () => {
  const btnMinimize = document.getElementById('btn-minimize');
  const btnMaximize = document.getElementById('btn-maximize');
  const btnClose = document.getElementById('btn-close');

  btnMinimize?.addEventListener('click', () => {
    window.electronAPI.minimizeWindow();
  });

  btnMaximize?.addEventListener('click', () => {
    window.electronAPI.maximizeWindow();
  });

  btnClose?.addEventListener('click', () => {
    window.electronAPI.closeWindow();
  });
});
```

**Verification:** TypeScript syntax is valid.

---

### Task 12: Create Auth JS

**File:** `templates/vanilla/src/renderer/js/auth.ts`

```typescript
/**
 * Authentication UI Logic
 */

// Elements
const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const registerForm = document.getElementById('register-form') as HTMLFormElement;
const authError = document.getElementById('auth-error');

// Show/hide form toggles
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const showReset = document.getElementById('show-reset');
const registerLinks = document.getElementById('register-links');
const authLinks = document.querySelector('.auth-links:not(#register-links)');

// State
let isLoading = false;

function showError(message: string): void {
  if (authError) {
    authError.textContent = message;
    authError.classList.remove('hidden');
  }
}

function hideError(): void {
  authError?.classList.add('hidden');
}

function setLoading(loading: boolean): void {
  isLoading = loading;
  const buttons = document.querySelectorAll('.auth-form button');
  buttons.forEach((btn) => {
    (btn as HTMLButtonElement).disabled = loading;
  });
}

function showAppView(): void {
  authView?.classList.add('hidden');
  appView?.classList.remove('hidden');
  void loadLicenseInfo();
}

function showAuthView(): void {
  appView?.classList.add('hidden');
  authView?.classList.remove('hidden');
}

async function loadLicenseInfo(): Promise<void> {
  const licenseInfo = document.getElementById('license-info');
  if (!licenseInfo) return;

  try {
    const status = await window.electronAPI.getLicenseStatus();
    if (status) {
      const s = status as { email: string; tier: string; isLifetime: boolean; daysRemaining: number | null };
      licenseInfo.innerHTML = `
        <p><strong>Email:</strong> ${s.email}</p>
        <p><strong>Tier:</strong> ${s.tier}</p>
        <p><strong>Status:</strong> ${s.isLifetime ? 'Lifetime' : `${s.daysRemaining ?? 0} days remaining`}</p>
      `;
    } else {
      licenseInfo.innerHTML = '<p class="text-secondary">No license info available</p>';
    }
  } catch {
    licenseInfo.innerHTML = '<p class="text-secondary">Failed to load license info</p>';
  }
}

// Form submissions
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isLoading) return;

  hideError();
  setLoading(true);

  const email = (document.getElementById('login-email') as HTMLInputElement).value;
  const password = (document.getElementById('login-password') as HTMLInputElement).value;

  try {
    await window.electronAPI.login(email, password);
    showAppView();
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Login failed');
  } finally {
    setLoading(false);
  }
});

registerForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isLoading) return;

  hideError();
  setLoading(true);

  const email = (document.getElementById('register-email') as HTMLInputElement).value;
  const password = (document.getElementById('register-password') as HTMLInputElement).value;
  const licenseKey = (document.getElementById('register-license') as HTMLInputElement).value;

  try {
    await window.electronAPI.register(email, password, licenseKey);
    showAppView();
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Registration failed');
  } finally {
    setLoading(false);
  }
});

// Toggle between login/register
showRegister?.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm?.classList.add('hidden');
  registerForm?.classList.remove('hidden');
  authLinks?.classList.add('hidden');
  registerLinks?.classList.remove('hidden');
  hideError();
});

showLogin?.addEventListener('click', (e) => {
  e.preventDefault();
  registerForm?.classList.add('hidden');
  loginForm?.classList.remove('hidden');
  registerLinks?.classList.add('hidden');
  authLinks?.classList.remove('hidden');
  hideError();
});

showReset?.addEventListener('click', async (e) => {
  e.preventDefault();
  const email = prompt('Enter your email address:');
  if (email) {
    try {
      await window.electronAPI.resetPassword(email);
      alert('Password reset email sent. Check your inbox.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to send reset email');
    }
  }
});

// Logout
document.getElementById('btn-logout')?.addEventListener('click', async () => {
  await window.electronAPI.logout();
  showAuthView();
});

// Check auth on startup
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const result = await window.electronAPI.validateLicense();
    const r = result as { valid: boolean };
    if (r.valid) {
      showAppView();
    }
  } catch {
    // Stay on auth view
  }
});
```

**Verification:** TypeScript syntax is valid.

---

### Task 13: Create App JS

**File:** `templates/vanilla/src/renderer/js/app.ts`

```typescript
/**
 * Main Application Logic
 * Add your custom app code here!
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Get app info
  try {
    const info = await window.electronAPI.getAppInfo();
    const titleEl = document.querySelector('.titlebar-title');
    if (titleEl) {
      titleEl.textContent = info.name;
    }
    document.title = info.name;
  } catch {
    // Ignore
  }

  // Check for updates
  try {
    const version = await window.electronAPI.getVersion();
    if (version.isPackaged) {
      const update = await window.electronAPI.checkForUpdates();
      if (update.updateAvailable) {
        console.log(`Update available: ${update.version}`);
        // You could show a notification here
      }
    }
  } catch {
    // Ignore update check errors
  }
});

// Listen for update status
window.electronAPI.onUpdateStatus((status) => {
  console.log('Update status:', status);
});
```

**Verification:** TypeScript syntax is valid.

---

### Task 14: Create Package.json and Config Files

**File:** `templates/vanilla/package.json`

```json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "description": "Built with electron-license-kit",
  "main": "dist/main/index.js",
  "author": "Your Name",
  "license": "MIT",
  "scripts": {
    "start": "tsc && electron .",
    "dev": "tsc && electron . --dev",
    "build": "tsc && electron-builder --win",
    "build:portable": "tsc && electron-builder --win portable",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.{ts,css,html}\"",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "electron-license-kit": "^0.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1",
    "electron-updater": "^6.1.7",
    "typescript": "^5.3.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "prettier": "^3.1.0"
  },
  "build": {
    "appId": "com.example.myapp",
    "productName": "My Electron App",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "assets/**/*",
      "app.config.js"
    ],
    "extraResources": [
      {
        "from": ".env.production",
        "to": ".env",
        "filter": ["**/*"]
      }
    ],
    "win": {
      "target": ["nsis", "portable"],
      "icon": "assets/logo.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

**Verification:** JSON syntax is valid.

---

### Task 15: Create Additional Config Files

**File:** `templates/vanilla/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "lib": ["ES2022", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": false
  },
  "include": ["src/**/*", "app.config.ts"],
  "exclude": ["node_modules", "dist", "release"]
}
```

**File:** `templates/vanilla/.env.example`

```env
# Supabase Configuration
# Get these from your Supabase project settings
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Development
NODE_ENV=development
```

**File:** `templates/vanilla/.gitignore`

```gitignore
# Dependencies
node_modules/

# Build
dist/
release/

# Environment
.env
.env.local
.env.production

# IDE
.idea/
.vscode/
*.swp

# Logs
*.log

# OS
.DS_Store
Thumbs.db
```

**File:** `templates/vanilla/.github/workflows/build.yml`

```yaml
name: Build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Build
        run: npm run build
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: electron-app
          path: release/*.exe
```

**File:** `templates/vanilla/.github/workflows/release.yml`

```yaml
name: Release

on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Release
        uses: softprops/action-gh-release@v1
        with:
          files: release/*.exe
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Verification:** All files created with valid syntax.

---

## Final Verification

1. Copy the template to a test location
2. Run `npm install`
3. Create `.env` file with Supabase credentials
4. Run `npm run typecheck` - should pass
5. Run `npm start` - app should launch

---

## Next Plan

Proceed to **Plan 05: Documentation & Open Source Setup** to create:
- README.md with badges and screenshots
- Documentation files
- CONTRIBUTING.md
- LICENSE file
- Example apps
