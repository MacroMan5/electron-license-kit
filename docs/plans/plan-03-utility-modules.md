# Plan 03: NPM Package Utility Modules

**Project:** electron-license-kit
**Phase:** 3 of 5
**Estimated Tasks:** 12
**Depends on:** Plan 02 (Core Modules)

---

## Overview

Implement utility modules:
- **Logger Module** - Structured logging with file rotation
- **Config Module** - Environment and app config loading
- **Crash Module** - Error handling and crash reporting
- **Updater Module** - Auto-update wrapper
- **License Module** - Complete Supabase integration (LicenseService, LicenseCache)

---

## Prerequisites

- Plan 02 completed (core modules exist)
- Run `cd C:\DEV\electron-license-kit && pnpm install`

---

## Tasks

### Task 1: Create Logger Module

**File:** `packages/core/src/logger/index.ts`

```typescript
/**
 * Logger module - Structured logging with file rotation
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LoggerConfig {
  appName: string;
  logDir?: string;
  maxFileSize?: number;
  maxFiles?: number;
  level?: LogLevel;
  console?: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

export class Logger {
  private readonly logDir: string;
  private readonly logFile: string;
  private readonly maxFileSize: number;
  private readonly maxFiles: number;
  private readonly minLevel: number;
  private readonly enableConsole: boolean;

  constructor(config: LoggerConfig) {
    this.logDir =
      config.logDir ??
      path.join(os.homedir(), 'AppData', 'Roaming', config.appName, 'logs');
    this.logFile = path.join(this.logDir, 'app.log');
    this.maxFileSize = config.maxFileSize ?? 5 * 1024 * 1024; // 5MB
    this.maxFiles = config.maxFiles ?? 5;
    this.minLevel = LOG_LEVELS[config.level ?? 'info'];
    this.enableConsole = config.console ?? true;

    // Ensure log directory exists
    fs.mkdirSync(this.logDir, { recursive: true });
  }

  private formatMessage(level: LogLevel, message: string, meta?: object): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  private write(level: LogLevel, message: string, meta?: object): void {
    if (LOG_LEVELS[level] < this.minLevel) return;

    const formatted = this.formatMessage(level, message, meta);

    // Write to console
    if (this.enableConsole) {
      const consoleFn = level === 'error' || level === 'fatal' ? console.error : console.log;
      consoleFn(formatted);
    }

    // Write to file
    try {
      fs.appendFileSync(this.logFile, formatted + '\n');
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  debug(message: string, meta?: object): void {
    this.write('debug', message, meta);
  }

  info(message: string, meta?: object): void {
    this.write('info', message, meta);
  }

  warn(message: string, meta?: object): void {
    this.write('warn', message, meta);
  }

  error(message: string, meta?: object): void {
    this.write('error', message, meta);
  }

  fatal(message: string, meta?: object): void {
    this.write('fatal', message, meta);
  }

  /**
   * Rotate log files if current file exceeds max size
   */
  rotateLogs(): void {
    try {
      if (!fs.existsSync(this.logFile)) return;

      const stats = fs.statSync(this.logFile);
      if (stats.size < this.maxFileSize) return;

      // Rotate files
      for (let i = this.maxFiles - 1; i >= 0; i--) {
        const oldFile = i === 0 ? this.logFile : `${this.logFile}.${i}`;
        const newFile = `${this.logFile}.${i + 1}`;

        if (fs.existsSync(oldFile)) {
          if (i === this.maxFiles - 1) {
            fs.unlinkSync(oldFile);
          } else {
            fs.renameSync(oldFile, newFile);
          }
        }
      }
    } catch (error) {
      console.error('Failed to rotate logs:', error);
    }
  }

  /**
   * Get log directory path
   */
  getLogDir(): string {
    return this.logDir;
  }
}

/**
 * Create a logger instance
 */
export function createLogger(config: LoggerConfig): Logger {
  return new Logger(config);
}
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 2: Create Config Module - Env Loader

**File:** `packages/core/src/config/env-loader.ts`

```typescript
/**
 * Environment file loader
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Load and parse a .env file
 */
export function loadEnvFile(envPath: string): boolean {
  if (!fs.existsSync(envPath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      // Skip comments and empty lines
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Parse KEY=value
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        // Don't override existing env vars
        if (!(key.trim() in process.env)) {
          process.env[key.trim()] = value.trim();
        }
      }
    }
    return true;
  } catch (error) {
    console.error(`Failed to load env file: ${envPath}`, error);
    return false;
  }
}

/**
 * Load environment files in priority order
 * Returns the path of the loaded file or null if none found
 */
export function loadEnvFiles(basePath: string, isPackaged: boolean): string | null {
  const envFiles = isPackaged
    ? [
        path.join(basePath, '.env.production'),
        path.join(basePath, '.env'),
      ]
    : [
        path.join(basePath, '.env.development'),
        path.join(basePath, '.env.local'),
        path.join(basePath, '.env'),
      ];

  for (const envPath of envFiles) {
    if (loadEnvFile(envPath)) {
      return envPath;
    }
  }

  return null;
}
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 3: Create Config Module - Paths Helper

**File:** `packages/core/src/config/paths.ts`

```typescript
/**
 * Application paths helper
 */

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export interface AppPaths {
  userData: string;
  appData: string;
  logs: string;
  cache: string;
  config: string;
}

/**
 * Get standard application paths
 */
export function getAppPaths(appName: string): AppPaths {
  const appData = path.join(os.homedir(), 'AppData', 'Roaming', appName);

  const paths: AppPaths = {
    userData: appData,
    appData,
    logs: path.join(appData, 'logs'),
    cache: path.join(appData, 'cache'),
    config: path.join(appData, 'config'),
  };

  // Ensure directories exist
  for (const dir of Object.values(paths)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return paths;
}
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 4: Create Config Module - App Config Loader

**File:** `packages/core/src/config/app-config-loader.ts`

```typescript
/**
 * App configuration loader
 * Loads app.config.ts and merges with defaults
 */

import * as fs from 'fs';
import * as path from 'path';
import type { AppConfig } from '../types';
import { defineConfig, defaultConfig } from '../branding/define-config';

/**
 * Load app configuration from file
 * Falls back to defaults if file not found
 */
export function loadAppConfig(configPath?: string): AppConfig {
  const resolvedPath = configPath ?? './app.config.ts';

  // In production, config should be pre-compiled
  // For now, return defaults - user should import their config directly
  if (!fs.existsSync(resolvedPath)) {
    console.warn(`Config file not found: ${resolvedPath}, using defaults`);
    return defaultConfig;
  }

  // Note: Dynamic import of TypeScript requires compilation
  // Users should import their config directly in their app
  console.warn('Dynamic config loading not supported, import config directly');
  return defaultConfig;
}

/**
 * Re-export defineConfig for convenience
 */
export { defineConfig };
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 5: Create Config Module Index

**File:** `packages/core/src/config/index.ts`

```typescript
/**
 * Config module - Configuration loading utilities
 */

export { loadEnvFile, loadEnvFiles } from './env-loader';
export { getAppPaths, type AppPaths } from './paths';
export { loadAppConfig, defineConfig } from './app-config-loader';
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 6: Create Crash Module

**File:** `packages/core/src/crash/index.ts`

```typescript
/**
 * Crash Reporter - Error handling and crash logging
 */

import { app, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import type { LogLevel } from '../logger';

export interface CrashReporterConfig {
  appName: string;
  logDir?: string;
  maxCrashReports?: number;
  onCrash?: (report: CrashReport) => void;
}

export interface CrashReport {
  timestamp: string;
  type: string;
  message: string;
  version: string;
  platform: string;
  arch: string;
  nodeVersion: string;
  electronVersion: string;
}

export class CrashReporter {
  private readonly logDir: string;
  private readonly maxReports: number;
  private readonly onCrash?: (report: CrashReport) => void;
  private readonly appName: string;
  private initialized = false;

  constructor(config: CrashReporterConfig) {
    this.appName = config.appName;
    this.logDir = config.logDir ?? this.getDefaultLogDir();
    this.maxReports = config.maxCrashReports ?? 10;
    this.onCrash = config.onCrash;
  }

  private getDefaultLogDir(): string {
    try {
      return path.join(app.getPath('userData'), 'logs');
    } catch {
      // app not ready yet
      return path.join(process.cwd(), 'logs');
    }
  }

  /**
   * Initialize crash reporter - call early in app startup
   */
  initialize(): void {
    if (this.initialized) return;

    // Ensure log directory exists
    fs.mkdirSync(this.logDir, { recursive: true });

    // Catch uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.handleCrash('uncaughtException', error);
    });

    // Catch unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
      this.handleCrash('unhandledRejection', reason);
    });

    this.initialized = true;
    this.log('info', `${this.appName} crash reporter initialized`);
  }

  private handleCrash(type: string, error: unknown): void {
    const errorMessage =
      error instanceof Error
        ? `${error.message}\n${error.stack ?? ''}`
        : String(error);

    const report: CrashReport = {
      timestamp: new Date().toISOString(),
      type,
      message: errorMessage,
      version: app.isPackaged ? app.getVersion() : 'development',
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      electronVersion: process.versions.electron ?? 'unknown',
    };

    // Write crash report
    const crashFile = path.join(this.logDir, `crash-${Date.now()}.json`);
    try {
      fs.writeFileSync(crashFile, JSON.stringify(report, null, 2));
    } catch (writeError) {
      console.error('Failed to write crash report:', writeError);
    }

    // Log to main log file
    this.log('fatal', `[${type}] ${errorMessage}`);

    // Call custom handler
    if (this.onCrash) {
      this.onCrash(report);
    }

    // Show error dialog
    if (app.isReady()) {
      dialog.showErrorBox(
        `${this.appName} Error`,
        `An unexpected error occurred:\n\n${error instanceof Error ? error.message : String(error)}\n\nCrash report saved to:\n${crashFile}\n\nPlease restart the application.`
      );
    }

    // Exit
    app.exit(1);
  }

  /**
   * Log a message
   */
  log(level: LogLevel, message: string): void {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

    const logFile = path.join(this.logDir, 'app.log');
    try {
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error('Failed to write log:', error);
    }

    console.log(logLine.trim());
  }

  /**
   * Rotate log files
   */
  rotateLogs(): void {
    const logFile = path.join(this.logDir, 'app.log');
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 5;

    try {
      if (!fs.existsSync(logFile)) return;

      const stats = fs.statSync(logFile);
      if (stats.size < maxSize) return;

      for (let i = maxFiles - 1; i >= 0; i--) {
        const oldFile = i === 0 ? logFile : `${logFile}.${i}`;
        const newFile = `${logFile}.${i + 1}`;

        if (fs.existsSync(oldFile)) {
          if (i === maxFiles - 1) {
            fs.unlinkSync(oldFile);
          } else {
            fs.renameSync(oldFile, newFile);
          }
        }
      }
    } catch (error) {
      console.error('Failed to rotate logs:', error);
    }
  }

  /**
   * Clean old crash reports
   */
  cleanOldCrashReports(): void {
    try {
      const files = fs
        .readdirSync(this.logDir)
        .filter((f) => f.startsWith('crash-') && f.endsWith('.json'))
        .map((f) => ({
          name: f,
          path: path.join(this.logDir, f),
          time: fs.statSync(path.join(this.logDir, f)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);

      // Keep only recent reports
      for (let i = this.maxReports; i < files.length; i++) {
        fs.unlinkSync(files[i].path);
      }
    } catch (error) {
      console.error('Failed to clean crash reports:', error);
    }
  }
}

/**
 * Get or create crash reporter singleton
 */
let crashReporterInstance: CrashReporter | null = null;

export function getCrashReporter(config: CrashReporterConfig): CrashReporter {
  if (!crashReporterInstance) {
    crashReporterInstance = new CrashReporter(config);
  }
  return crashReporterInstance;
}
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 7: Create Updater Module

**File:** `packages/core/src/updater/index.ts`

```typescript
/**
 * Auto-Updater module - electron-updater wrapper
 */

import { app, BrowserWindow, ipcMain } from 'electron';

export interface UpdaterConfig {
  autoDownload?: boolean;
  autoInstallOnQuit?: boolean;
  checkInterval?: number;
}

export interface UpdateStatus {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  version?: string;
  percent?: number;
  error?: string;
}

export class AutoUpdater {
  private autoUpdater: typeof import('electron-updater').autoUpdater | null = null;
  private updateAvailable = false;
  private updateDownloaded = false;
  private enabled = false;

  /**
   * Initialize auto-updater (only works in packaged apps)
   */
  initialize(config?: UpdaterConfig): boolean {
    if (!app.isPackaged) {
      console.log('Auto-updater disabled in development mode');
      return false;
    }

    try {
      // Dynamic import to avoid errors in dev
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { autoUpdater } = require('electron-updater') as typeof import('electron-updater');
      this.autoUpdater = autoUpdater;

      this.autoUpdater.autoDownload = config?.autoDownload ?? false;
      this.autoUpdater.autoInstallOnAppQuit = config?.autoInstallOnQuit ?? true;

      this.setupEventHandlers();
      this.enabled = true;

      // Check after delay
      const checkInterval = config?.checkInterval ?? 5000;
      setTimeout(() => {
        void this.checkForUpdates();
      }, checkInterval);

      return true;
    } catch (error) {
      console.error('Failed to initialize auto-updater:', error);
      return false;
    }
  }

  private setupEventHandlers(): void {
    if (!this.autoUpdater) return;

    this.autoUpdater.on('checking-for-update', () => {
      this.notifyRenderer({ status: 'checking' });
    });

    this.autoUpdater.on('update-available', (info) => {
      this.updateAvailable = true;
      this.notifyRenderer({
        status: 'available',
        version: info.version,
      });
    });

    this.autoUpdater.on('update-not-available', (info) => {
      this.updateAvailable = false;
      this.notifyRenderer({
        status: 'not-available',
        version: info.version,
      });
    });

    this.autoUpdater.on('download-progress', (progress) => {
      this.notifyRenderer({
        status: 'downloading',
        percent: progress.percent,
      });
    });

    this.autoUpdater.on('update-downloaded', (info) => {
      this.updateDownloaded = true;
      this.notifyRenderer({
        status: 'downloaded',
        version: info.version,
      });
    });

    this.autoUpdater.on('error', (error) => {
      this.notifyRenderer({
        status: 'error',
        error: error.message,
      });
    });
  }

  private notifyRenderer(status: UpdateStatus): void {
    const windows = BrowserWindow.getAllWindows();
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send('update-status', status);
      }
    }
  }

  async checkForUpdates(): Promise<{ updateAvailable: boolean; version?: string }> {
    if (!this.enabled || !this.autoUpdater) {
      return { updateAvailable: false };
    }

    try {
      const result = await this.autoUpdater.checkForUpdates();
      return {
        updateAvailable: this.updateAvailable,
        version: result?.updateInfo?.version,
      };
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return { updateAvailable: false };
    }
  }

  async downloadUpdate(): Promise<boolean> {
    if (!this.enabled || !this.autoUpdater || !this.updateAvailable) {
      return false;
    }

    try {
      await this.autoUpdater.downloadUpdate();
      return true;
    } catch (error) {
      console.error('Failed to download update:', error);
      return false;
    }
  }

  installUpdate(): void {
    if (!this.enabled || !this.autoUpdater || !this.updateDownloaded) {
      return;
    }

    this.autoUpdater.quitAndInstall(false, true);
  }

  getStatus(): { enabled: boolean; updateAvailable: boolean; updateDownloaded: boolean } {
    return {
      enabled: this.enabled,
      updateAvailable: this.updateAvailable,
      updateDownloaded: this.updateDownloaded,
    };
  }
}

/**
 * Register auto-updater IPC handlers
 */
export function registerUpdaterHandlers(): void {
  const updater = new AutoUpdater();

  ipcMain.handle('get-version', () => ({
    version: app.getVersion(),
    isPackaged: app.isPackaged,
  }));

  ipcMain.handle('check-for-updates', async () => {
    return updater.checkForUpdates();
  });

  ipcMain.handle('download-update', async () => {
    return updater.downloadUpdate();
  });

  ipcMain.handle('install-update', () => {
    updater.installUpdate();
  });

  ipcMain.handle('get-update-status', () => {
    return updater.getStatus();
  });
}
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 8: Create License Module - License Cache

**File:** `packages/core/src/license/license-cache.ts`

```typescript
/**
 * License Cache - Encrypted local storage for offline validation
 */

import { SecureStorage } from '../storage/secure-storage';
import type { LicenseData, LicenseCacheConfig } from '../types';

const DEFAULT_MAX_AGE_DAYS = 3;

export class LicenseCache {
  private readonly storage: SecureStorage<LicenseData>;
  private readonly maxAgeDays: number;

  constructor(config?: LicenseCacheConfig) {
    this.storage = new SecureStorage<LicenseData>({
      fileName: config?.cacheFileName ?? 'license.dat',
      appName: config?.appName,
      storageDir: config?.cacheDir,
    });
    this.maxAgeDays = config?.maxAgeDays ?? DEFAULT_MAX_AGE_DAYS;
  }

  /**
   * Save license data to cache
   */
  save(data: LicenseData): boolean {
    return this.storage.save(data);
  }

  /**
   * Load license data from cache
   */
  load(): LicenseData | null {
    return this.storage.load();
  }

  /**
   * Check if cache is valid (not expired)
   */
  isValid(): boolean {
    const data = this.load();
    if (!data) return false;

    // Check last validation time
    if (data.lastCheck) {
      const lastCheck = new Date(data.lastCheck);
      const now = new Date();
      const daysSinceCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceCheck > this.maxAgeDays) {
        return false;
      }
    }

    // Check license expiration (skip for lifetime)
    if (data.tier !== 'lifetime' && data.expiresAt) {
      const expires = new Date(data.expiresAt);
      if (expires < new Date()) {
        return false;
      }
    }

    return true;
  }

  /**
   * Clear the cache
   */
  clear(): boolean {
    return this.storage.clear();
  }

  /**
   * Get days remaining until license expires
   */
  getDaysRemaining(): number | null {
    const data = this.load();
    if (!data?.expiresAt) return null;
    if (data.tier === 'lifetime') return Infinity;

    const expires = new Date(data.expiresAt);
    const now = new Date();
    const days = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return Math.max(0, days);
  }
}
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 9: Create License Module - License Service

**File:** `packages/core/src/license/license-service.ts`

```typescript
/**
 * License Service - Supabase integration for license validation
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { generateHWID } from './hwid-generator';
import { LicenseCache } from './license-cache';
import { KeyManager } from '../storage/key-manager';
import type {
  LicenseServiceConfig,
  AuthResult,
  ValidationResult,
  LicenseStatus,
  LicenseData,
} from '../types';

const DEFAULT_KEY_PATTERN = /^[A-Z]{2}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export class LicenseService {
  private readonly supabase: SupabaseClient;
  private readonly cache: LicenseCache;
  private readonly keyManager: KeyManager;
  private readonly keyPattern: RegExp;
  private readonly tableName: string;
  private readonly claimRpcName: string;

  private currentUser: { id: string; email: string } | null = null;
  private currentLicense: Record<string, unknown> | null = null;

  constructor(config: LicenseServiceConfig) {
    // Validate not using service role key
    this.validateKey(config.supabaseAnonKey);

    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
    this.cache = new LicenseCache({ appName: config.appName });
    this.keyManager = new KeyManager(config.appName);
    this.keyPattern = config.licenseKeyPattern ?? DEFAULT_KEY_PATTERN;
    this.tableName = config.tableName ?? 'licenses';
    this.claimRpcName = config.claimRpcName ?? 'claim_license';
  }

  private validateKey(key: string): void {
    try {
      const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64').toString());
      if (payload.role === 'service_role') {
        throw new Error('SECURITY: Service role key detected. Use anon key only!');
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('SECURITY')) throw e;
    }
  }

  /**
   * Register new user with license key
   */
  async register(email: string, password: string, licenseKey: string): Promise<AuthResult> {
    // Validate inputs
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email address');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    if (!licenseKey || !this.keyPattern.test(licenseKey.toUpperCase())) {
      throw new Error('Invalid license key format');
    }

    const normalizedKey = licenseKey.toUpperCase();

    // Check if license exists and is available
    const { data: license, error: licenseError } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('license_key', normalizedKey)
      .single();

    if (licenseError || !license) {
      throw new Error('License key not found');
    }
    if (license.user_id) {
      throw new Error('License already activated');
    }
    if (license.status !== 'active') {
      throw new Error(`License is ${license.status}`);
    }

    // Create auth account
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message ?? 'Registration failed');
    }

    // Claim license
    const hwid = generateHWID();
    const { data: claimResult, error: claimError } = await this.supabase.rpc(this.claimRpcName, {
      p_license_key: normalizedKey,
      p_user_id: authData.user.id,
      p_hwid: hwid,
    });

    if (claimError || !claimResult?.success) {
      throw new Error(claimResult?.error ?? 'License activation failed');
    }

    // Cache license
    this.cache.save({
      email,
      tier: license.tier,
      expiresAt: license.expires_at,
      lastCheck: new Date().toISOString(),
      hwid,
    });

    // Save key for external use
    this.keyManager.save(normalizedKey);

    this.currentUser = { id: authData.user.id, email };
    this.currentLicense = { ...license, hwid, user_id: authData.user.id };

    return {
      user: this.currentUser,
      license: this.currentLicense as AuthResult['license'],
    };
  }

  /**
   * Login existing user
   */
  async login(email: string, password: string): Promise<AuthResult> {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email address');
    }
    if (!password) {
      throw new Error('Password is required');
    }

    // Authenticate
    const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message ?? 'Login failed');
    }

    // Fetch license
    const { data: license, error: licenseError } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', authData.user.id)
      .eq('status', 'active')
      .single();

    if (licenseError || !license) {
      throw new Error('No active license found');
    }

    // Validate HWID
    const hwid = generateHWID();
    if (license.hwid && license.hwid !== hwid) {
      throw new Error('License bound to different computer');
    }

    // Update last_check
    await this.supabase
      .from(this.tableName)
      .update({ last_check: new Date().toISOString(), hwid: license.hwid ?? hwid })
      .eq('id', license.id);

    // Cache license
    this.cache.save({
      email,
      tier: license.tier,
      expiresAt: license.expires_at,
      lastCheck: new Date().toISOString(),
      hwid,
    });

    // Save key
    if (license.license_key) {
      this.keyManager.save(license.license_key);
    }

    this.currentUser = { id: authData.user.id, email };
    this.currentLicense = license;

    return {
      user: this.currentUser,
      license: license as AuthResult['license'],
    };
  }

  /**
   * Validate license (call on app startup)
   */
  async validate(): Promise<ValidationResult> {
    // Try online validation first
    try {
      const { data: sessionData } = await this.supabase.auth.getSession();
      const session = sessionData.session;

      if (session) {
        const { data: license } = await this.supabase
          .from(this.tableName)
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .single();

        if (license) {
          const hwid = generateHWID();
          if (license.hwid && license.hwid !== hwid) {
            return { valid: false, error: 'HWID mismatch' };
          }

          // Update cache
          this.cache.save({
            email: session.user.email ?? '',
            tier: license.tier,
            expiresAt: license.expires_at,
            lastCheck: new Date().toISOString(),
            hwid,
          });

          this.currentUser = { id: session.user.id, email: session.user.email ?? '' };
          this.currentLicense = license;

          return {
            valid: true,
            license: this.cache.load() as LicenseData,
            user: this.currentUser,
            source: 'online',
          };
        }
      }
    } catch {
      // Fall back to cache
    }

    // Fallback to cache
    if (this.cache.isValid()) {
      return {
        valid: true,
        license: this.cache.load() as LicenseData,
        source: 'cache',
      };
    }

    return { valid: false, error: 'No valid license found' };
  }

  /**
   * Logout and clear session
   */
  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this.cache.clear();
    this.keyManager.clear();
    this.currentUser = null;
    this.currentLicense = null;
  }

  /**
   * Get current license status
   */
  getStatus(): LicenseStatus | null {
    const cached = this.cache.load();
    if (!cached) return null;

    return {
      email: cached.email,
      tier: cached.tier,
      daysRemaining: this.cache.getDaysRemaining(),
      isLifetime: cached.tier === 'lifetime',
    };
  }

  /**
   * Request password reset
   */
  async resetPassword(email: string): Promise<boolean> {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email address');
    }

    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
    return true;
  }
}
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 10: Create License Module Index

**File:** `packages/core/src/license/index.ts`

```typescript
/**
 * License module - Supabase auth and license validation
 */

export { generateHWID, getHWIDComponents } from './hwid-generator';
export { LicenseCache } from './license-cache';
export { LicenseService } from './license-service';
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 11: Update Main Index File

**File:** `packages/core/src/index.ts`

Replace the entire contents with:

```typescript
/**
 * electron-license-kit
 *
 * Open-source framework for building secure, licensed Electron applications
 * with Supabase backend integration.
 *
 * @packageDocumentation
 */

export const VERSION = '0.1.0';

// =============================================================================
// TYPES
// =============================================================================
export type {
  AppConfig,
  AppIdentity,
  BrandingAssets,
  ThemeColors,
  LicenseConfig,
  SupabaseConfig,
  WindowSettings,
  FeatureFlags,
  LicenseData,
  LicenseStatus,
  AuthResult,
  ValidationResult,
  LicenseServiceConfig,
  LicenseCacheConfig,
  SecureStorageConfig,
  EncryptedData,
  WindowConfig,
  SingleInstanceConfig,
  SecurityPolicyConfig,
  HWIDComponents,
} from './types';

// =============================================================================
// BRANDING MODULE
// =============================================================================
export {
  defineConfig,
  defaultConfig,
  defaultTheme,
  presets,
  generateCSSVariables,
  generateStyleTag,
  injectTheme,
  injectThemeOnReady,
} from './branding';

// =============================================================================
// LICENSE MODULE
// =============================================================================
export {
  generateHWID,
  getHWIDComponents,
  LicenseCache,
  LicenseService,
} from './license';

// =============================================================================
// STORAGE MODULE
// =============================================================================
export { SecureStorage, KeyManager } from './storage';

// =============================================================================
// WINDOW MODULE
// =============================================================================
export {
  createMainWindow,
  registerWindowControls,
  unregisterWindowControls,
  enforceSingleInstance,
} from './window';

// =============================================================================
// SECURITY MODULE
// =============================================================================
export {
  setupSecurityPolicy,
  createNavigationGuard,
  validateIpcChannel,
} from './security';

// =============================================================================
// LOGGER MODULE
// =============================================================================
export { Logger, createLogger, type LogLevel, type LoggerConfig } from './logger';

// =============================================================================
// CONFIG MODULE
// =============================================================================
export {
  loadEnvFile,
  loadEnvFiles,
  getAppPaths,
  loadAppConfig,
  type AppPaths,
} from './config';

// =============================================================================
// CRASH MODULE
// =============================================================================
export {
  CrashReporter,
  getCrashReporter,
  type CrashReporterConfig,
  type CrashReport,
} from './crash';

// =============================================================================
// UPDATER MODULE
// =============================================================================
export {
  AutoUpdater,
  registerUpdaterHandlers,
  type UpdaterConfig,
  type UpdateStatus,
} from './updater';
```

**Verification:** Run `pnpm typecheck` - should pass.

---

### Task 12: Add electron-updater as Optional Dependency

**File:** `packages/core/package.json`

Add to `peerDependencies`:

```json
"peerDependencies": {
  "electron": ">=25.0.0",
  "electron-updater": ">=6.0.0"
},
"peerDependenciesMeta": {
  "electron": {
    "optional": true
  },
  "electron-updater": {
    "optional": true
  }
}
```

**Verification:** Run `pnpm install` then `pnpm build` - should succeed.

---

## Final Verification

Run these commands:

```bash
cd packages/core

# Clean previous build
pnpm clean

# Typecheck
pnpm typecheck

# Lint
pnpm lint

# Build
pnpm build

# Verify exports
ls -la dist/
```

**Expected Results:**
- All commands pass
- `dist/` contains `index.js`, `index.mjs`, `index.d.ts`
- No TypeScript errors

---

## Next Plan

Proceed to **Plan 04: Vanilla Template** to create:
- Template project structure
- Main process with electron-license-kit integration
- Renderer with themed UI
- CI/CD configuration
