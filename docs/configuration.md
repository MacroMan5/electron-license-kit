# Configuration Guide

`electron-license-kit` uses a single `app.config.ts` file to configure:

- App identity
- Branding assets
- Theme colors
- License behavior
- Supabase table/function names
- Window settings
- Feature flags

## Basic Example

```ts
import { defineConfig } from 'electron-license-kit';

export default defineConfig({
  app: {
    name: 'My Electron App',
    id: 'com.example.myapp',
    version: '1.0.0',
  },
  branding: {
    logo: './assets/logo.png',
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

## Type Reference

The configuration shape is defined in `packages/core/src/types.ts` as `AppConfig`:

- `app: AppIdentity`
  - `name: string`
  - `id: string` (bundle identifier, e.g. `com.example.myapp`)
  - `version: string`
  - `description?: string`
  - `author?: string`
  - `website?: string`

- `branding: BrandingAssets`
  - `logo?: string`
  - `logoLight?: string`
  - `logoDark?: string`
  - `splashScreen?: string`

- `theme: ThemeColors` – see [Theming](./theming.md).

- `license: LicenseConfig`
  - `keyPrefix: string` – used for display / validation hints.
  - `keyPattern: RegExp` – used by `LicenseService` for basic format validation.
  - `offlineGraceDays: number` – how long the cache is trusted offline.
  - `checkIntervalHours: number` – recommended revalidation interval.

- `supabase: SupabaseConfig`
  - `url?: string` – usually loaded from `.env` at runtime.
  - `anonKey?: string` – Supabase anon key.
  - `tableName: string` – defaults to `licenses`.
  - `claimFunction: string` – defaults to `claim_license`.

- `window: WindowSettings`
  - `width`, `height`, `minWidth`, `minHeight`
  - `frame` – `false` for frameless + custom titlebar.
  - `resizable` – allow resizing.

- `features: FeatureFlags`
  - `autoUpdater: boolean`
  - `crashReporter: boolean`
  - `singleInstance: boolean`
  - `devTools: boolean`

The `defineConfig` helper merges your partial config with sensible defaults, so you can start with the basic example and extend as needed.

