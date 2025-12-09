# Plan 02: NPM Package Core Modules

**Project:** electron-license-kit
**Phase:** 2 of 5
**Estimated Tasks:** 15
**Depends on:** Plan 01 (Monorepo Setup)

---

## Overview

Implement the core modules of electron-license-kit:
- **Branding Module** - Theme configuration and CSS variable generation
- **License Module** - Supabase auth, license validation, HWID
- **Storage Module** - AES-256-GCM encrypted storage
- **Window Module** - Window creation, controls, single instance
- **Security Module** - CSP, navigation guard, IPC validation

---

## Prerequisites

- Plan 01 completed (monorepo structure exists)
- Run `cd C:\DEV\electron-license-kit && pnpm install`

---

## Tasks

### Task 1: Create Types File

**File:** `packages/core/src/types.ts`

```typescript
/**
 * Core type definitions for electron-license-kit
 */

// =============================================================================
// APP CONFIG TYPES
// =============================================================================

export interface AppIdentity {
  name: string;
  id: string;
  version: string;
  description?: string;
  author?: string;
  website?: string;
}

export interface BrandingAssets {
  logo?: string;
  logoLight?: string;
  logoDark?: string;
  splashScreen?: string;
}

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryText: string;
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  border: string;
  divider: string;
  titlebar: {
    background: string;
    text: string;
    buttonHover: string;
    buttonClose: string;
  };
}

export interface LicenseConfig {
  keyPrefix: string;
  keyPattern: RegExp;
  offlineGraceDays: number;
  checkIntervalHours: number;
}

export interface SupabaseConfig {
  url?: string;
  anonKey?: string;
  tableName: string;
  claimFunction: string;
}

export interface WindowSettings {
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  frame: boolean;
  resizable: boolean;
}

export interface FeatureFlags {
  autoUpdater: boolean;
  crashReporter: boolean;
  singleInstance: boolean;
  devTools: boolean;
}

export interface AppConfig {
  app: AppIdentity;
  branding: BrandingAssets;
  theme: ThemeColors;
  license: LicenseConfig;
  supabase: SupabaseConfig;
  window: WindowSettings;
  features: FeatureFlags;
}

// =============================================================================
// LICENSE TYPES
// =============================================================================

export interface LicenseData {
  email: string;
  tier: string;
  expiresAt: string | null;
  lastCheck: string;
  hwid: string;
}

export interface LicenseStatus {
  email: string;
  tier: string;
  daysRemaining: number | null;
  isLifetime: boolean;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
  };
  license: {
    id: string;
    license_key: string;
    tier: string;
    status: string;
    hwid: string;
    expires_at: string | null;
  };
}

export interface ValidationResult {
  valid: boolean;
  license?: LicenseData;
  user?: { id: string; email: string };
  source?: 'online' | 'cache';
  error?: string;
}

export interface LicenseServiceConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  licenseKeyPattern?: RegExp;
  tableName?: string;
  claimRpcName?: string;
  appName?: string;
}

export interface LicenseCacheConfig {
  cacheDir?: string;
  cacheFileName?: string;
  maxAgeDays?: number;
  appName?: string;
}

// =============================================================================
// STORAGE TYPES
// =============================================================================

export interface SecureStorageConfig {
  storageDir?: string;
  fileName: string;
  encryptionKey?: Buffer;
  appName?: string;
}

export interface EncryptedData {
  iv: string;
  data: string;
  tag: string;
}

// =============================================================================
// WINDOW TYPES
// =============================================================================

export interface WindowConfig {
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  frame?: boolean;
  backgroundColor?: string;
  preloadPath: string;
  htmlPath: string;
  devTools?: boolean;
}

export interface SingleInstanceConfig {
  onSecondInstance?: (argv: string[]) => void;
}

// =============================================================================
// SECURITY TYPES
// =============================================================================

export interface SecurityPolicyConfig {
  allowedExternalDomains?: string[];
  enableDevTools?: boolean;
}

// =============================================================================
// HWID TYPES
// =============================================================================

export interface HWIDComponents {
  machineId: string;
  platform: string;
  arch: string;
  cpuModel: string;
}
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 2: Create Branding Module - defineConfig

**File:** `packages/core/src/branding/define-config.ts`

```typescript
/**
 * Branding configuration helper
 */

import type { AppConfig, ThemeColors } from '../types';

/**
 * Default dark theme
 */
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

/**
 * Default app configuration
 */
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

/**
 * Type-safe configuration helper
 * Merges user config with defaults
 */
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
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 3: Create Branding Module - Theme Presets

**File:** `packages/core/src/branding/presets.ts`

```typescript
/**
 * Built-in theme presets
 */

import type { ThemeColors } from '../types';

export const darkPreset: Partial<ThemeColors> = {
  primary: '#6366f1',
  primaryHover: '#4f46e5',
  primaryText: '#ffffff',
  background: '#0a0a0f',
  backgroundSecondary: '#111118',
  backgroundTertiary: '#1a1a24',
  text: '#ffffff',
  textSecondary: '#a1a1aa',
  textTertiary: '#71717a',
  border: '#27272a',
  divider: '#3f3f46',
};

export const lightPreset: Partial<ThemeColors> = {
  primary: '#4f46e5',
  primaryHover: '#4338ca',
  primaryText: '#ffffff',
  background: '#ffffff',
  backgroundSecondary: '#f4f4f5',
  backgroundTertiary: '#e4e4e7',
  text: '#18181b',
  textSecondary: '#52525b',
  textTertiary: '#a1a1aa',
  border: '#e4e4e7',
  divider: '#d4d4d8',
};

export const midnightPreset: Partial<ThemeColors> = {
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  primaryText: '#ffffff',
  background: '#0f172a',
  backgroundSecondary: '#1e293b',
  backgroundTertiary: '#334155',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',
  border: '#334155',
  divider: '#475569',
};

export const forestPreset: Partial<ThemeColors> = {
  primary: '#22c55e',
  primaryHover: '#16a34a',
  primaryText: '#ffffff',
  background: '#0a0f0a',
  backgroundSecondary: '#111811',
  backgroundTertiary: '#1a241a',
  text: '#f0fdf4',
  textSecondary: '#86efac',
  textTertiary: '#4ade80',
  border: '#27372a',
  divider: '#3f4f46',
};

export const presets = {
  dark: darkPreset,
  light: lightPreset,
  midnight: midnightPreset,
  forest: forestPreset,
} as const;
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 4: Create Branding Module - CSS Generator

**File:** `packages/core/src/branding/css-generator.ts`

```typescript
/**
 * Generates CSS variables from theme configuration
 */

import type { ThemeColors } from '../types';

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

/**
 * Generate CSS variables string from theme
 */
export function generateCSSVariables(theme: ThemeColors): string {
  return `:root {
  /* Primary */
  --elk-primary: ${theme.primary};
  --elk-primary-hover: ${theme.primaryHover};
  --elk-primary-text: ${theme.primaryText};
  --elk-primary-rgb: ${hexToRgb(theme.primary)};

  /* Backgrounds */
  --elk-bg: ${theme.background};
  --elk-bg-secondary: ${theme.backgroundSecondary};
  --elk-bg-tertiary: ${theme.backgroundTertiary};

  /* Text */
  --elk-text: ${theme.text};
  --elk-text-secondary: ${theme.textSecondary};
  --elk-text-tertiary: ${theme.textTertiary};

  /* Semantic */
  --elk-success: ${theme.success};
  --elk-warning: ${theme.warning};
  --elk-error: ${theme.error};
  --elk-info: ${theme.info};

  /* Border */
  --elk-border: ${theme.border};
  --elk-divider: ${theme.divider};

  /* Titlebar */
  --elk-titlebar-bg: ${theme.titlebar.background};
  --elk-titlebar-text: ${theme.titlebar.text};
  --elk-titlebar-btn-hover: ${theme.titlebar.buttonHover};
  --elk-titlebar-btn-close: ${theme.titlebar.buttonClose};

  /* Computed */
  --elk-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
  --elk-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.5);
  --elk-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --elk-radius-sm: 4px;
  --elk-radius-md: 8px;
  --elk-radius-lg: 12px;
  --elk-radius-full: 9999px;
}`;
}

/**
 * Generate a <style> tag with CSS variables
 */
export function generateStyleTag(theme: ThemeColors): string {
  return `<style id="elk-theme">\n${generateCSSVariables(theme)}\n</style>`;
}
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 5: Create Branding Module - Theme Injector

**File:** `packages/core/src/branding/theme-injector.ts`

```typescript
/**
 * Injects theme CSS variables into BrowserWindow
 */

import type { BrowserWindow } from 'electron';
import type { ThemeColors } from '../types';
import { generateCSSVariables } from './css-generator';

/**
 * Inject theme CSS variables into a BrowserWindow
 * Call this after window content is loaded
 */
export async function injectTheme(
  window: BrowserWindow,
  theme: ThemeColors
): Promise<void> {
  const css = generateCSSVariables(theme);

  await window.webContents.executeJavaScript(`
    (function() {
      // Remove existing theme style if present
      const existing = document.getElementById('elk-theme');
      if (existing) existing.remove();

      // Create and inject new style
      const style = document.createElement('style');
      style.id = 'elk-theme';
      style.textContent = ${JSON.stringify(css)};
      document.head.appendChild(style);
    })();
  `);
}

/**
 * Inject theme when DOM is ready (use in preload or main)
 */
export function injectThemeOnReady(
  window: BrowserWindow,
  theme: ThemeColors
): void {
  window.webContents.on('dom-ready', () => {
    void injectTheme(window, theme);
  });
}
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 6: Create Branding Module Index

**File:** `packages/core/src/branding/index.ts`

```typescript
/**
 * Branding module - Theme configuration and CSS generation
 */

export { defineConfig, defaultConfig, defaultTheme } from './define-config';
export { presets } from './presets';
export { generateCSSVariables, generateStyleTag } from './css-generator';
export { injectTheme, injectThemeOnReady } from './theme-injector';
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 7: Create License Module - HWID Generator

**File:** `packages/core/src/license/hwid-generator.ts`

```typescript
/**
 * Hardware ID Generator
 * Creates a unique, consistent identifier for the machine
 */

import * as crypto from 'crypto';
import * as os from 'os';
import { machineIdSync } from 'node-machine-id';
import type { HWIDComponents } from '../types';

/**
 * Get the machine ID (primary identifier)
 */
function getMachineId(): string {
  try {
    return machineIdSync({ original: true });
  } catch {
    // Fallback if machine-id fails
    return os.hostname() + os.userInfo().username;
  }
}

/**
 * Get CPU model string
 */
function getCPUModel(): string {
  const cpus = os.cpus();
  return cpus.length > 0 ? cpus[0].model : 'unknown';
}

/**
 * Get hardware components for HWID generation
 */
export function getHWIDComponents(): HWIDComponents {
  return {
    machineId: getMachineId(),
    platform: os.platform(),
    arch: os.arch(),
    cpuModel: getCPUModel(),
  };
}

/**
 * Generate a consistent Hardware ID for this machine
 * Returns SHA256 hash of combined hardware identifiers
 */
export function generateHWID(): string {
  const components = getHWIDComponents();

  // Combine components into a single string
  const combined = [
    components.machineId,
    components.platform,
    components.arch,
    components.cpuModel,
  ].join('|');

  // Hash to create consistent, fixed-length identifier
  const hash = crypto.createHash('sha256');
  hash.update(combined);

  return hash.digest('hex');
}
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 8: Create Storage Module - Secure Storage

**File:** `packages/core/src/storage/secure-storage.ts`

```typescript
/**
 * Secure Storage - AES-256-GCM encrypted local storage
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { SecureStorageConfig, EncryptedData } from '../types';
import { generateHWID } from '../license/hwid-generator';

const ALGORITHM = 'aes-256-gcm';

export class SecureStorage<T> {
  private readonly storageDir: string;
  private readonly filePath: string;
  private readonly encryptionKey: Buffer;

  constructor(config: SecureStorageConfig) {
    const appName = config.appName ?? 'ElectronApp';
    this.storageDir =
      config.storageDir ??
      path.join(os.homedir(), 'AppData', 'Roaming', appName);
    this.filePath = path.join(this.storageDir, config.fileName);
    this.encryptionKey = config.encryptionKey ?? this.deriveKey();
  }

  /**
   * Derive encryption key from HWID (machine-specific)
   */
  private deriveKey(): Buffer {
    const hwid = generateHWID();
    return crypto.createHash('sha256').update(hwid).digest();
  }

  /**
   * Encrypt data
   */
  private encrypt(data: T): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, this.encryptionKey, iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      data: encrypted,
      tag: authTag.toString('hex'),
    };
  }

  /**
   * Decrypt data
   */
  private decrypt(encrypted: EncryptedData): T | null {
    try {
      const iv = Buffer.from(encrypted.iv, 'hex');
      const authTag = Buffer.from(encrypted.tag, 'hex');
      const decipher = crypto.createDecipheriv(
        ALGORITHM,
        this.encryptionKey,
        iv
      );
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  /**
   * Save data to encrypted storage
   */
  save(data: T): boolean {
    try {
      fs.mkdirSync(this.storageDir, { recursive: true });
      const encrypted = this.encrypt(data);
      fs.writeFileSync(this.filePath, JSON.stringify(encrypted), 'utf8');
      return true;
    } catch (error) {
      console.error('Failed to save:', error);
      return false;
    }
  }

  /**
   * Load data from encrypted storage
   */
  load(): T | null {
    try {
      if (!fs.existsSync(this.filePath)) {
        return null;
      }
      const encrypted = JSON.parse(
        fs.readFileSync(this.filePath, 'utf8')
      ) as EncryptedData;
      return this.decrypt(encrypted);
    } catch (error) {
      console.error('Failed to load:', error);
      return null;
    }
  }

  /**
   * Check if storage file exists and is valid
   */
  exists(): boolean {
    try {
      return fs.existsSync(this.filePath) && this.load() !== null;
    } catch {
      return false;
    }
  }

  /**
   * Delete the storage file
   */
  clear(): boolean {
    try {
      if (fs.existsSync(this.filePath)) {
        fs.unlinkSync(this.filePath);
      }
      return true;
    } catch (error) {
      console.error('Failed to clear:', error);
      return false;
    }
  }

  /**
   * Get the storage file path
   */
  getPath(): string {
    return this.filePath;
  }
}
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 9: Create Storage Module - Key Manager

**File:** `packages/core/src/storage/key-manager.ts`

```typescript
/**
 * Key Manager - Specialized encrypted storage for license keys
 */

import { SecureStorage } from './secure-storage';

interface KeyData {
  licenseKey: string;
  savedAt: string;
}

export class KeyManager {
  private readonly storage: SecureStorage<KeyData>;

  constructor(appName?: string) {
    this.storage = new SecureStorage<KeyData>({
      fileName: 'key.dat',
      appName,
    });
  }

  /**
   * Save license key
   */
  save(licenseKey: string): boolean {
    if (!licenseKey || typeof licenseKey !== 'string') {
      console.error('Invalid license key');
      return false;
    }

    return this.storage.save({
      licenseKey,
      savedAt: new Date().toISOString(),
    });
  }

  /**
   * Load license key
   */
  load(): string | null {
    const data = this.storage.load();
    return data?.licenseKey ?? null;
  }

  /**
   * Check if key exists
   */
  exists(): boolean {
    return this.storage.exists();
  }

  /**
   * Delete the key
   */
  clear(): boolean {
    return this.storage.clear();
  }

  /**
   * Get storage path
   */
  getKeyPath(): string {
    return this.storage.getPath();
  }
}
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 10: Create Storage Module Index

**File:** `packages/core/src/storage/index.ts`

```typescript
/**
 * Storage module - Encrypted local storage
 */

export { SecureStorage } from './secure-storage';
export { KeyManager } from './key-manager';
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 11: Create Window Module - Window Manager

**File:** `packages/core/src/window/window-manager.ts`

```typescript
/**
 * Window Manager - Create and configure BrowserWindow
 */

import { BrowserWindow, app } from 'electron';
import type { WindowConfig } from '../types';

/**
 * Create the main application window
 */
export function createMainWindow(config: WindowConfig): BrowserWindow {
  const window = new BrowserWindow({
    width: config.width ?? 800,
    height: config.height ?? 600,
    minWidth: config.minWidth ?? 700,
    minHeight: config.minHeight ?? 500,
    frame: config.frame ?? false,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: config.preloadPath,
      sandbox: true,
      webSecurity: true,
    },
    backgroundColor: config.backgroundColor ?? '#0a0a0f',
    show: false,
  });

  // Load HTML file
  void window.loadFile(config.htmlPath);

  // Show window when ready to avoid flash
  window.once('ready-to-show', () => {
    window.show();
  });

  // Open DevTools in dev mode
  const shouldOpenDevTools =
    config.devTools ?? process.argv.includes('--dev');
  if (shouldOpenDevTools && !app.isPackaged) {
    window.webContents.openDevTools();
  }

  return window;
}
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 12: Create Window Module - Window Controls

**File:** `packages/core/src/window/window-controls.ts`

```typescript
/**
 * Window Controls - IPC handlers for minimize/maximize/close
 */

import { ipcMain, BrowserWindow } from 'electron';

/**
 * Register window control IPC handlers for a window
 */
export function registerWindowControls(window: BrowserWindow): void {
  ipcMain.on('window-minimize', () => {
    if (window && !window.isDestroyed()) {
      window.minimize();
    }
  });

  ipcMain.on('window-maximize', () => {
    if (window && !window.isDestroyed()) {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    }
  });

  ipcMain.on('window-close', () => {
    if (window && !window.isDestroyed()) {
      window.close();
    }
  });
}

/**
 * Remove window control handlers (call on window close)
 */
export function unregisterWindowControls(): void {
  ipcMain.removeAllListeners('window-minimize');
  ipcMain.removeAllListeners('window-maximize');
  ipcMain.removeAllListeners('window-close');
}
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 13: Create Window Module - Single Instance

**File:** `packages/core/src/window/single-instance.ts`

```typescript
/**
 * Single Instance - Prevent multiple app instances
 */

import { app, BrowserWindow } from 'electron';
import type { SingleInstanceConfig } from '../types';

/**
 * Enforce single instance of the application
 * Returns false if another instance is already running
 */
export function enforceSingleInstance(config?: SingleInstanceConfig): boolean {
  const gotLock = app.requestSingleInstanceLock();

  if (!gotLock) {
    // Another instance exists, quit this one
    return false;
  }

  // This is the first instance
  app.on('second-instance', (_event, argv) => {
    // Someone tried to run a second instance

    // Call custom handler if provided
    if (config?.onSecondInstance) {
      config.onSecondInstance(argv);
    }

    // Focus the main window
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      const mainWindow = windows[0];
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  return true;
}
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 14: Create Window Module Index

**File:** `packages/core/src/window/index.ts`

```typescript
/**
 * Window module - Window creation and management
 */

export { createMainWindow } from './window-manager';
export {
  registerWindowControls,
  unregisterWindowControls,
} from './window-controls';
export { enforceSingleInstance } from './single-instance';
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 15: Create Security Module

**File:** `packages/core/src/security/index.ts`

```typescript
/**
 * Security module - App hardening utilities
 */

import { BrowserWindow, shell, ipcMain } from 'electron';
import type { SecurityPolicyConfig } from '../types';

/**
 * Setup security policies for a window
 */
export function setupSecurityPolicy(
  window: BrowserWindow,
  config?: SecurityPolicyConfig
): void {
  const allowedDomains = config?.allowedExternalDomains ?? [];

  // Block navigation to external URLs
  window.webContents.on('will-navigate', (event, url) => {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'file:') {
        event.preventDefault();
        console.warn(`Blocked navigation to: ${url}`);
      }
    } catch (error) {
      event.preventDefault();
      console.error(`Blocked malformed URL: ${url}`, error);
    }
  });

  // Block new window creation
  window.webContents.setWindowOpenHandler(({ url }) => {
    console.warn(`Blocked new window: ${url}`);
    return { action: 'deny' };
  });

  // Register secure external link handler
  ipcMain.handle('open-external', async (_event, url: string) => {
    try {
      const parsedUrl = new URL(url);

      // Only allow http/https
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        console.warn(`Blocked non-http URL: ${url}`);
        return false;
      }

      // Check against whitelist if provided
      if (allowedDomains.length > 0) {
        const isAllowed = allowedDomains.some(
          (domain) =>
            parsedUrl.hostname === domain ||
            parsedUrl.hostname.endsWith(`.${domain}`)
        );
        if (!isAllowed) {
          console.warn(`Blocked non-whitelisted domain: ${url}`);
          return false;
        }
      }

      await shell.openExternal(url);
      return true;
    } catch (error) {
      console.error(`Failed to open external URL: ${url}`, error);
      return false;
    }
  });
}

/**
 * Create navigation guard for a window
 */
export function createNavigationGuard(window: BrowserWindow): void {
  window.webContents.on('will-navigate', (event, url) => {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'file:') {
        event.preventDefault();
      }
    } catch {
      event.preventDefault();
    }
  });

  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
}

/**
 * Validate IPC channel against whitelist
 */
export function validateIpcChannel(
  channel: string,
  allowedChannels: string[]
): boolean {
  return allowedChannels.includes(channel);
}
```

**Verification:** Run `pnpm typecheck` - should pass.

---

## Final Verification

Run these commands:

```bash
cd packages/core

# Typecheck all modules
pnpm typecheck

# Lint all modules
pnpm lint

# Build the package
pnpm build
```

**Expected Results:**
- All commands pass without errors
- `dist/` folder contains compiled modules

---

## Next Plan

Proceed to **Plan 03: NPM Package Utility Modules** to implement:
- Logger module
- Config module
- Crash reporter module
- Auto-updater module
- License service (Supabase integration)
