<div align="center">

# electron-license-kit

[![npm version](https://img.shields.io/npm/v/electron-license-kit.svg)](https://www.npmjs.com/package/electron-license-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-28+-47848F.svg)](https://www.electronjs.org/)

**Open-source framework for building secure, licensed Electron applications with Supabase backend.**

[Getting Started](#getting-started) •
[Features](#features) •
[Documentation](#documentation) •
[Template](#vanilla-template) •
[Contributing](#contributing)

</div>

---

## Features

- **License Management** – HWID-based license validation with Supabase backend
- **Secure Storage** – AES-256-GCM encrypted local storage for sensitive data
- **Custom Titlebar** – Frameless window with customizable titlebar controls
- **Theming System** – App-wide theming via config file + CSS variables
- **Auto Updates** – `electron-updater` wrapper + IPC helpers
- **Crash Reporting** – Crash reporter with JSON logs and user dialog
- **Security Hardened** – CSP, navigation guards, IPC channel validation
- **TypeScript First** – Fully typed API with strict configuration types

---

## Getting Started

### Option 1 – Use the Vanilla Template

```bash
# Clone the vanilla template
npx degit YOUR_USERNAME/electron-license-kit/templates/vanilla my-app

cd my-app
pnpm install

# Configure your app branding & Supabase
# Edit app.config.ts

# Start in development
pnpm dev
```

The template already wires:

- `electron-license-kit` core (window, security, logger, updater, crash reporter)
- Preload bridge (`window.electronAPI`) for safe renderer access
- Auth + license UI (login/register) backed by Supabase
- Custom titlebar and themeable UI

### Option 2 – Install the Package in an Existing App

```bash
pnpm add electron-license-kit
```

Create an `app.config.ts` at your project root:

```ts
// app.config.ts
import { defineConfig } from 'electron-license-kit';

export default defineConfig({
  app: {
    name: 'My Electron App',
    id: 'com.example.myapp',
    version: '1.0.0',
    description: 'My awesome desktop app',
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
```

Then use it in your main process:

```ts
// main/index.ts
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
import config from './app.config';

loadEnvFiles(process.cwd(), app.isPackaged);

const crashReporter = new CrashReporter({ appName: config.app.name });
crashReporter.initialize();

if (config.features.singleInstance && !enforceSingleInstance()) {
  app.quit();
}

const logger = createLogger({
  appName: config.app.name,
  level: app.isPackaged ? 'info' : 'debug',
});

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = createMainWindow({
    ...config.window,
    backgroundColor: config.theme.background,
    preloadPath: path.join(__dirname, 'preload.js'),
    htmlPath: path.join(__dirname, 'index.html'),
    devTools: config.features.devTools,
  });

  mainWindow.webContents.on('dom-ready', () => {
    if (mainWindow) {
      void injectTheme(mainWindow, config.theme);
    }
  });

  registerWindowControls(mainWindow);
  setupSecurityPolicy(mainWindow, {
    allowedExternalDomains: ['github.com', 'supabase.co'],
    enableDevTools: config.features.devTools,
  });
}

app.whenReady().then(() => {
  createWindow();
  registerUpdaterHandlers();

  if (app.isPackaged && config.features.autoUpdater) {
    const updater = new AutoUpdater();
    updater.initialize({ checkInterval: 5000 });
  }
});
```

---

## Supabase Backend

electron-license-kit expects a `licenses` table and a `claim_license` RPC.

- Full schema: see `docs/supabase-schema.sql`
- Setup guide: see `docs/supabase-setup.md`

At a high level:

- `licenses` rows store license key, user id, HWID, status, tier, etc.
- `claim_license` binds a key to an `auth.users` row + HWID and returns JSON:
  `{ "success": boolean, "error"?: string }`

---

## Documentation

See the `docs/` folder for detailed documentation:

- `docs/getting-started.md` – install, template, minimal setup
- `docs/configuration.md` – full `app.config.ts` reference
- `docs/theming.md` – branding & theme system
- `docs/supabase-setup.md` – Supabase schema + configuration

---

## Vanilla Template

The repository includes a ready-to-use template in `templates/vanilla`:

- TypeScript + Electron main/preload/renderer
- Custom titlebar + themed UI
- Login / registration screens wired to `LicenseService`
- CI workflows for build & release

Use it as the starting point for new apps, or as a reference to integrate the package into your own project.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on the workflow, coding style, and how to run tests.

---

## License

This project is licensed under the [MIT License](LICENSE).

