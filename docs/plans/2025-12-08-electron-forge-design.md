# Electron License Kit - Design Document

**Date:** 2025-12-08
**Status:** Draft
**Author:** Claude Code + User
**License:** MIT (Open Source)

---

## 1. Overview

### 1.1 Purpose

**Electron License Kit** is an open-source framework for building secure, licensed Electron applications with Supabase backend. Perfect for indie developers selling desktop software.

It provides:

- **NPM Package** (`electron-license-kit`): Reusable modules for licensing, security, storage, and more
- **Template** (`templates/vanilla`): Scaffolding for new Electron projects with TypeScript, CI/CD, and best practices
- **Theming System**: Easy color/branding customization via config file

### 1.2 Goals

1. **DRY (Don't Repeat Yourself)**: Extract common patterns from existing projects
2. **Production-Ready**: Include security, auto-updates, crash reporting out of the box
3. **Developer Experience**: TypeScript, ESLint, Prettier, hot reload
4. **Maintainable**: Updates to the package propagate to all projects via `npm update`
5. **Easy Branding**: One config file to customize colors, app name, logo
6. **Open Source Friendly**: MIT license, well documented, easy to contribute

### 1.3 Non-Goals

- React/Vue/Svelte templates (vanilla JS only for V1)
- Cross-platform builds (Windows only for V1)
- Backend/API components (Supabase is external)
- Payment processing (use Stripe/Gumroad separately)

---

## 2. Architecture

### 2.1 Monorepo Structure

```
electron-license-kit/
├── packages/
│   └── core/                      # electron-license-kit (NPM)
│       ├── src/
│       │   ├── license/           # Supabase auth + license validation
│       │   ├── storage/           # Encrypted storage (AES-256-GCM)
│       │   ├── window/            # Window management
│       │   ├── security/          # App hardening
│       │   ├── updater/           # Auto-updates
│       │   ├── logger/            # Structured logging
│       │   ├── config/            # Configuration loading
│       │   ├── crash/             # Crash reporting
│       │   ├── branding/          # Theming system (NEW)
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── templates/
│   └── vanilla/
│       ├── src/
│       │   ├── main/
│       │   ├── renderer/
│       │   └── core/
│       ├── .github/workflows/
│       ├── app.config.ts          # Branding configuration (NEW)
│       ├── package.json
│       └── ...config files
│
├── examples/                      # Example apps (NEW)
│   └── basic-app/
│
├── docs/                          # Documentation (NEW)
│   ├── getting-started.md
│   ├── configuration.md
│   ├── theming.md
│   └── supabase-setup.md
│
├── package.json                   # Monorepo root
├── pnpm-workspace.yaml
├── LICENSE                        # MIT
├── CONTRIBUTING.md
└── README.md
```

### 2.2 Package Dependencies

```
electron-license-kit
├── @supabase/supabase-js    # License validation
├── node-machine-id          # HWID generation
├── electron-updater         # Auto-updates (peer dep)
└── (Node.js crypto built-in) # AES-256-GCM encryption
```

---

## 3. Branding & Theming System

### 4.1 App Configuration File (app.config.ts)

Single file to customize your entire app's branding:

```typescript
// app.config.ts
import { defineConfig } from 'electron-license-kit';

export default defineConfig({
  // App Identity
  app: {
    name: 'My Awesome App',
    id: 'com.mycompany.myapp',
    version: '1.0.0',
    description: 'The best app ever',
    author: 'My Company',
    website: 'https://myapp.com',
  },

  // Branding
  branding: {
    logo: './assets/logo.png',           // App icon
    logoLight: './assets/logo-light.png', // For light backgrounds
    logoDark: './assets/logo-dark.png',   // For dark backgrounds
    splashScreen: './assets/splash.png',  // Optional splash
  },

  // Theme Colors
  theme: {
    // Primary palette
    primary: '#6366f1',        // Main brand color (buttons, links)
    primaryHover: '#4f46e5',   // Hover state
    primaryText: '#ffffff',    // Text on primary background

    // Background colors
    background: '#0a0a0f',     // Main app background
    backgroundSecondary: '#111118', // Cards, panels
    backgroundTertiary: '#1a1a24',  // Inputs, hover states

    // Text colors
    text: '#ffffff',           // Primary text
    textSecondary: '#a1a1aa',  // Secondary/muted text
    textTertiary: '#71717a',   // Disabled/placeholder

    // Semantic colors
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // Border & dividers
    border: '#27272a',
    divider: '#3f3f46',

    // Titlebar (frameless window)
    titlebar: {
      background: '#0a0a0f',
      text: '#ffffff',
      buttonHover: '#27272a',
      buttonClose: '#ef4444',
    },
  },

  // License Configuration
  license: {
    keyPrefix: 'APP',                    // License format: APP-XXXX-XXXX-XXXX
    keyPattern: /^APP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/,
    offlineGraceDays: 3,                 // Days allowed offline
    checkIntervalHours: 24,              // How often to revalidate
  },

  // Supabase (loaded from .env, but can override)
  supabase: {
    tableName: 'licenses',               // Default table name
    claimFunction: 'claim_license',      // RPC function name
  },

  // Window Settings
  window: {
    width: 800,
    height: 600,
    minWidth: 700,
    minHeight: 500,
    frame: false,                        // Frameless (custom titlebar)
    resizable: true,
  },

  // Features Toggle
  features: {
    autoUpdater: true,
    crashReporter: true,
    singleInstance: true,
    devTools: process.env.NODE_ENV === 'development',
  },
});
```

### 4.2 Branding Module API

```typescript
// In electron-license-kit package
import { BrandingConfig, ThemeConfig } from './types';

interface BrandingManager {
  // Load config from app.config.ts
  loadConfig(configPath?: string): AppConfig;

  // Get resolved theme (with defaults)
  getTheme(): ThemeConfig;

  // Generate CSS variables from theme
  generateCSSVariables(): string;

  // Get asset paths (resolved)
  getAssetPath(asset: 'logo' | 'logoLight' | 'logoDark' | 'splash'): string;

  // Validate config
  validateConfig(config: AppConfig): ValidationResult;
}

// Helper function for type-safe config
function defineConfig(config: AppConfig): AppConfig;
```

### 4.3 Generated CSS Variables

The theme config automatically generates CSS variables:

```css
/* Auto-generated from app.config.ts */
:root {
  /* Primary */
  --elk-primary: #6366f1;
  --elk-primary-hover: #4f46e5;
  --elk-primary-text: #ffffff;

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

  /* Computed (auto-generated) */
  --elk-primary-rgb: 99, 102, 241;
  --elk-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
  --elk-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.5);
  --elk-radius-sm: 4px;
  --elk-radius-md: 8px;
  --elk-radius-lg: 12px;
}
```

### 4.4 Using Theme in Components

```css
/* Easy to use in your styles */
.button-primary {
  background: var(--elk-primary);
  color: var(--elk-primary-text);
}

.button-primary:hover {
  background: var(--elk-primary-hover);
}

.card {
  background: var(--elk-bg-secondary);
  border: 1px solid var(--elk-border);
  border-radius: var(--elk-radius-md);
}

.titlebar {
  background: var(--elk-titlebar-bg);
  color: var(--elk-titlebar-text);
}
```

### 4.5 Preset Themes (Optional)

Built-in presets users can extend:

```typescript
import { defineConfig, presets } from 'electron-license-kit';

export default defineConfig({
  ...presets.dark,        // Dark theme (default)
  // or
  ...presets.light,       // Light theme
  // or
  ...presets.midnight,    // Deep blue theme
  // or
  ...presets.forest,      // Green theme

  // Override specific values
  theme: {
    primary: '#ff6b6b',   // Custom primary color
  },
});
```

---

## 4. NPM Package: electron-license-kit

### 4.1 Module Overview

| Module | Purpose | Key Exports |
|--------|---------|-------------|
| `license/` | Supabase auth + license validation | `LicenseService`, `LicenseCache`, `generateHWID` |
| `storage/` | Encrypted local storage | `SecureStorage`, `KeyManager` |
| `window/` | Window management | `createMainWindow`, `registerWindowControls`, `enforceSingleInstance` |
| `security/` | App hardening | `setupSecurityPolicy`, `validateIpcChannel`, `createNavigationGuard` |
| `updater/` | Auto-updates | `AutoUpdater`, `registerUpdaterHandlers` |
| `logger/` | Structured logging | `Logger`, `createLogger` |
| `config/` | Configuration | `loadConfig`, `getAppPaths` |
| `crash/` | Error handling | `CrashReporter` |
| `branding/` | Theming system | `defineConfig`, `BrandingManager`, `presets` |

### 4.2 License Module

#### 4.2.1 LicenseService

```typescript
interface LicenseServiceConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  licenseKeyPattern?: RegExp;  // Default: /^[A-Z]{2}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
  tableName?: string;          // Default: 'licenses'
  claimRpcName?: string;       // Default: 'claim_license'
}

class LicenseService {
  constructor(config: LicenseServiceConfig);

  // Auth methods
  async register(email: string, password: string, licenseKey: string): Promise<AuthResult>;
  async login(email: string, password: string): Promise<AuthResult>;
  async logout(): Promise<void>;
  async resetPassword(email: string): Promise<boolean>;

  // Validation
  async validate(): Promise<ValidationResult>;
  getStatus(): LicenseStatus | null;
}
```

#### 4.2.2 LicenseCache

```typescript
interface LicenseCacheConfig {
  cacheDir?: string;           // Default: %APPDATA%/{appName}
  cacheFileName?: string;      // Default: 'license.dat'
  maxAgeDays?: number;         // Default: 3
}

class LicenseCache {
  constructor(config?: LicenseCacheConfig);

  save(data: LicenseData): boolean;
  load(): LicenseData | null;
  isValid(): boolean;
  clear(): boolean;
  getDaysRemaining(): number | null;
}
```

#### 4.2.3 HWID Generator

```typescript
function generateHWID(): string;
function getHWIDComponents(): HWIDComponents;
```

### 4.3 Storage Module

#### 4.3.1 SecureStorage

Generic encrypted storage for any data.

```typescript
interface SecureStorageConfig {
  storageDir?: string;         // Default: %APPDATA%/{appName}
  fileName: string;            // Required
  encryptionKey?: Buffer;      // Default: derived from HWID
}

class SecureStorage<T> {
  constructor(config: SecureStorageConfig);

  save(data: T): boolean;
  load(): T | null;
  exists(): boolean;
  clear(): boolean;
}
```

#### 4.3.2 KeyManager

Specialized storage for license keys.

```typescript
class KeyManager {
  constructor(appName?: string);

  save(licenseKey: string): boolean;
  load(): string | null;
  exists(): boolean;
  clear(): boolean;
  getKeyPath(): string;
}
```

### 4.4 Window Module

#### 4.4.1 Window Manager

```typescript
interface WindowConfig {
  width?: number;              // Default: 800
  height?: number;             // Default: 600
  minWidth?: number;           // Default: 700
  minHeight?: number;          // Default: 500
  frame?: boolean;             // Default: false (frameless)
  backgroundColor?: string;    // Default: '#0a0a0f'
  preloadPath: string;         // Required
  htmlPath: string;            // Required
  devTools?: boolean;          // Default: process.argv.includes('--dev')
}

function createMainWindow(config: WindowConfig): BrowserWindow;
```

#### 4.4.2 Window Controls

```typescript
function registerWindowControls(window: BrowserWindow): void;
// Registers IPC handlers: window-minimize, window-maximize, window-close
```

#### 4.4.3 Single Instance

```typescript
interface SingleInstanceConfig {
  onSecondInstance?: (argv: string[]) => void;
}

function enforceSingleInstance(config?: SingleInstanceConfig): boolean;
// Returns false if another instance is running (app should quit)
```

### 4.5 Security Module

#### 4.5.1 Security Policy

```typescript
interface SecurityPolicyConfig {
  allowedExternalDomains?: string[];  // Domains allowed for openExternal
  enableDevTools?: boolean;            // Default: false in production
}

function setupSecurityPolicy(window: BrowserWindow, config?: SecurityPolicyConfig): void;
// Sets up: navigation blocking, new window blocking, CSP headers
```

#### 4.5.2 IPC Validator

```typescript
function validateIpcChannel(channel: string, allowedChannels: string[]): boolean;

function createSecureIpcHandler<T>(
  channel: string,
  handler: (event: IpcMainInvokeEvent, ...args: unknown[]) => Promise<T>,
  validator?: (args: unknown[]) => boolean
): void;
```

#### 4.5.3 Navigation Guard

```typescript
function createNavigationGuard(window: BrowserWindow): void;
// Blocks all non-file:// navigation
// Blocks all new window creation
```

### 4.6 Updater Module

```typescript
interface UpdaterConfig {
  autoDownload?: boolean;      // Default: false
  autoInstallOnQuit?: boolean; // Default: true
  checkInterval?: number;      // Default: 5000 (ms after startup)
}

class AutoUpdater {
  constructor();

  initialize(config?: UpdaterConfig): boolean;
  async checkForUpdates(): Promise<UpdateCheckResult>;
  async downloadUpdate(): Promise<DownloadResult>;
  installUpdate(): void;
  getStatus(): UpdaterStatus;
}

function registerUpdaterHandlers(): void;
// Registers IPC handlers: get-version, check-for-updates, download-update, install-update
```

### 4.7 Logger Module

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LoggerConfig {
  appName: string;
  logDir?: string;             // Default: %APPDATA%/{appName}/logs
  maxFileSize?: number;        // Default: 5MB
  maxFiles?: number;           // Default: 5
  level?: LogLevel;            // Default: 'info'
  console?: boolean;           // Default: true
}

class Logger {
  constructor(config: LoggerConfig);

  debug(message: string, meta?: object): void;
  info(message: string, meta?: object): void;
  warn(message: string, meta?: object): void;
  error(message: string, meta?: object): void;
  fatal(message: string, meta?: object): void;

  rotateLogs(): void;
}

function createLogger(config: LoggerConfig): Logger;
```

### 4.8 Config Module

```typescript
interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  isProduction: boolean;
  [key: string]: unknown;
}

function loadConfig(envFiles?: string[]): AppConfig;
// Priority: .env.production (packaged) > .env.development > .env

interface AppPaths {
  userData: string;
  appData: string;
  logs: string;
  cache: string;
}

function getAppPaths(appName: string): AppPaths;
```

### 4.9 Crash Module

```typescript
interface CrashReporterConfig {
  appName: string;
  logDir?: string;
  maxCrashReports?: number;    // Default: 10
  onCrash?: (report: CrashReport) => void;
}

class CrashReporter {
  constructor(config: CrashReporterConfig);

  initialize(): void;
  log(level: LogLevel, message: string): void;
  rotateLogs(): void;
  cleanOldCrashReports(): void;
}

function getCrashReporter(config: CrashReporterConfig): CrashReporter;
```

---

## 5. Template: vanilla

### 5.1 File Structure

```
templates/vanilla/
├── src/
│   ├── main/
│   │   ├── index.ts           # App entry point
│   │   ├── ipc-handlers.ts    # Custom IPC handlers (empty)
│   │   └── preload.ts         # Preload script
│   │
│   ├── renderer/
│   │   ├── index.html         # Main HTML with titlebar
│   │   ├── styles/
│   │   │   ├── main.css       # Base styles (uses CSS vars)
│   │   │   ├── theme.css      # Auto-generated from app.config.ts
│   │   │   ├── titlebar.css   # Custom titlebar
│   │   │   └── auth.css       # Auth pages styles
│   │   └── js/
│   │       ├── app.ts         # Main app (empty)
│   │       ├── auth.ts        # Auth UI logic
│   │       └── titlebar.ts    # Titlebar controls
│   │
│   └── core/                  # Empty - user's business logic
│
├── assets/                    # Branding assets
│   ├── logo.png               # App icon (256x256)
│   ├── logo.ico               # Windows icon
│   └── splash.png             # Optional splash screen
│
├── .github/
│   └── workflows/
│       ├── build.yml          # Build on push to main
│       └── release.yml        # Release on tag push
│
├── app.config.ts              # BRANDING CONFIG (colors, name, logo)
├── package.json
├── tsconfig.json
├── electron-builder.yml
├── .eslintrc.js
├── .prettierrc
├── .gitignore
├── .env.example
└── README.md
```

### 5.2 Main Process (index.ts)

```typescript
import { app, BrowserWindow } from 'electron';
import {
  createMainWindow,
  registerWindowControls,
  enforceSingleInstance,
  setupSecurityPolicy,
  createLogger,
  CrashReporter,
  AutoUpdater,
  registerUpdaterHandlers,
  loadAppConfig,
  injectTheme
} from 'electron-license-kit';
import { registerIpcHandlers } from './ipc-handlers';
import path from 'path';

// Load app configuration (branding, theme, etc.)
const appConfig = loadAppConfig('./app.config.ts');

// Initialize crash reporter early
const crashReporter = new CrashReporter({ appName: appConfig.app.name });
crashReporter.initialize();

// Single instance lock
if (!enforceSingleInstance()) {
  app.quit();
  process.exit(0);
}

const logger = createLogger({ appName: appConfig.app.name });

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = createMainWindow({
    ...appConfig.window,
    preloadPath: path.join(__dirname, 'preload.js'),
    htmlPath: path.join(__dirname, '../renderer/index.html')
  });

  // Inject theme CSS variables into renderer
  injectTheme(mainWindow, appConfig.theme);

  registerWindowControls(mainWindow);
  setupSecurityPolicy(mainWindow);
}

// Register IPC handlers
registerIpcHandlers();
registerUpdaterHandlers();

app.whenReady().then(() => {
  createWindow();

  // Auto-updater (production only)
  if (app.isPackaged && appConfig.features.autoUpdater) {
    const updater = new AutoUpdater();
    updater.initialize();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

### 5.3 Preload Script (preload.ts)

```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls (from electron-license-kit)
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),

  // Auth (from electron-license-kit)
  login: (email: string, password: string) =>
    ipcRenderer.invoke('auth-login', email, password),
  register: (email: string, password: string, licenseKey: string) =>
    ipcRenderer.invoke('auth-register', email, password, licenseKey),
  validateLicense: () => ipcRenderer.invoke('auth-validate'),
  logout: () => ipcRenderer.invoke('auth-logout'),
  getLicenseStatus: () => ipcRenderer.invoke('auth-get-status'),

  // Updates (from electron-license-kit)
  getVersion: () => ipcRenderer.invoke('get-version'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),

  // External links
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),

  // === Add your custom APIs below ===
});
```

### 5.4 Package.json

```json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "description": "My Electron App",
  "main": "dist/main/index.js",
  "scripts": {
    "start": "tsc && electron .",
    "dev": "tsc && electron . --dev",
    "build": "tsc && electron-builder --win",
    "build:portable": "tsc && electron-builder --win portable",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.{ts,css,html}\""
  },
  "dependencies": {
    "electron-license-kit": "^1.0.0",
    "@supabase/supabase-js": "^2.86.2"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1",
    "electron-updater": "^6.1.7",
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "prettier": "^3.1.0"
  }
}
```

### 5.5 GitHub Actions

#### build.yml
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
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/*.exe
```

#### release.yml
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
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - uses: softprops/action-gh-release@v1
        with:
          files: dist/*.exe
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 6. Implementation Plan

### Phase 1: NPM Package Core

1. **Setup monorepo** with pnpm workspaces
2. **Branding module**: Create defineConfig, theme generator, CSS variables
3. **License module**: Port LicenseService, LicenseCache, hwid-generator from existing code
4. **Storage module**: Port SecureStorage, KeyManager
5. **Window module**: Create window-manager, window-controls, single-instance
6. **Security module**: Create csp-policy, navigation-guard, ipc-validator

### Phase 2: NPM Package Utilities

7. **Logger module**: Create structured logger with rotation
8. **Config module**: Create env-loader, paths helper, app config loader
9. **Crash module**: Port CrashReporter
10. **Updater module**: Port AutoUpdater wrapper
11. **Theme presets**: Create dark, light, midnight, forest presets
12. **Index exports**: Create clean public API with TypeScript types

### Phase 3: Template

13. **Scaffold template** structure with assets folder
14. **app.config.ts**: Default branding configuration
15. **Main process**: Integration with electron-license-kit + theme injection
16. **Renderer**: HTML, CSS (using CSS vars), titlebar, auth UI
17. **Config files**: TypeScript, ESLint, Prettier, electron-builder
18. **CI/CD**: GitHub Actions workflows

### Phase 4: Documentation & Examples

19. **README.md**: Badges, screenshots, quick start
20. **docs/getting-started.md**: Step-by-step setup guide
21. **docs/theming.md**: How to customize colors/branding
22. **docs/supabase-setup.md**: Supabase configuration guide
23. **examples/basic-app**: Minimal working example
24. **CONTRIBUTING.md**: How to contribute

### Phase 5: Testing & Release

25. **Test NPM package** in isolation
26. **Test template** by creating a new project
27. **Verify theming** works with different color schemes
28. **Publish** to npm
29. **Announce** on Reddit, Twitter, Hacker News

---

## 7. Open Questions (Resolved)

1. **Package name**: ✅ `electron-license-kit`

2. **Tray icon**: Not in V1, can add later

3. **Deep links**: Not in V1, can add later

4. **Framework (React/Vue)**: ✅ Vanilla only for V1

5. **Theming**: ✅ Single app.config.ts file with CSS variables

6. **Open Source**: ✅ MIT License, community-friendly

---

## 8. Appendix

### A. Encryption Details

- **Algorithm**: AES-256-GCM
- **Key derivation**: SHA-256 hash of HWID
- **IV**: Random 16 bytes per encryption
- **Auth tag**: 16 bytes for integrity verification

### B. HWID Components

```typescript
{
  machineId: string;   // From node-machine-id
  platform: string;    // os.platform()
  arch: string;        // os.arch()
  cpuModel: string;    // os.cpus()[0].model
}
```

### C. Supabase Schema Requirements

```sql
-- licenses table
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  hwid TEXT,
  tier TEXT DEFAULT 'standard',
  status TEXT DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  last_check TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RPC function for claiming license
CREATE FUNCTION claim_license(
  p_license_key TEXT,
  p_user_id UUID,
  p_hwid TEXT
) RETURNS JSON AS $$
  -- Implementation
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
