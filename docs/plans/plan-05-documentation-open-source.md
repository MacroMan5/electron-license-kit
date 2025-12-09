# Plan 05: Documentation & Open Source Setup

**Project:** electron-license-kit
**Phase:** 5 of 5
**Estimated Tasks:** 12

---

## Overview

Set up all documentation, open-source files, and example applications to make the package production-ready for NPM publishing and community contributions.

---

## Prerequisites

- Plans 01-04 completed
- Package builds successfully
- Template runs correctly

---

## Tasks

### Task 1: Create Root README.md

**File:** `C:\DEV\electron-license-kit\README.md`

```markdown
<div align="center">

# electron-license-kit

[![npm version](https://img.shields.io/npm/v/electron-license-kit.svg)](https://www.npmjs.com/package/electron-license-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-28+-47848F.svg)](https://www.electronjs.org/)

**Open-source framework for building secure, licensed Electron applications with Supabase backend.**

[Getting Started](#getting-started) •
[Features](#features) •
[Documentation](#documentation) •
[Examples](#examples) •
[Contributing](#contributing)

</div>

---

## Features

- **License Management** - HWID-based license validation with Supabase backend
- **Secure Storage** - AES-256-GCM encrypted local storage for sensitive data
- **Custom Titlebar** - Frameless window with customizable titlebar
- **Theming System** - Easy branding via CSS variables and presets
- **Auto Updates** - Built-in update system with electron-updater
- **Crash Reporting** - Automatic crash collection and reporting
- **Security Hardened** - CSP, navigation guards, and IPC validation
- **TypeScript First** - Full type definitions included

## Quick Start

### Option 1: Use the Template

```bash
# Clone the vanilla template
npx degit electron-license-kit/electron-license-kit/templates/vanilla my-app

# Install dependencies
cd my-app
pnpm install

# Configure your app
# Edit app.config.ts with your branding

# Start development
pnpm dev
```

### Option 2: Install the Package

```bash
pnpm add electron-license-kit
```

## Getting Started

### 1. Configure Your App

Create `app.config.ts` in your project root:

```typescript
import { defineConfig } from 'electron-license-kit';

export default defineConfig({
  appName: 'My App',
  appId: 'com.mycompany.myapp',
  version: '1.0.0',

  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
  },

  theme: {
    preset: 'dark', // or 'light', 'midnight', 'forest'
  },

  window: {
    width: 1200,
    height: 800,
    frameless: true,
  },
});
```

### 2. Initialize in Main Process

```typescript
import { app, BrowserWindow } from 'electron';
import {
  createMainWindow,
  registerWindowControls,
  enforceSingleInstance,
  setupSecurityPolicy,
  loadAppConfig,
  createLogger,
} from 'electron-license-kit';

const config = loadAppConfig();
const logger = createLogger(config);

// Ensure single instance
if (!enforceSingleInstance(app, () => mainWindow?.show())) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

app.whenReady().then(async () => {
  // Setup security
  setupSecurityPolicy(config);

  // Create window
  mainWindow = await createMainWindow(config);

  // Register controls
  registerWindowControls(mainWindow);

  logger.info('Application started');
});
```

### 3. Setup Supabase Backend

Run the migrations in your Supabase project:

```sql
-- See docs/supabase-schema.md for full schema
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users,
  hwid TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
```

## Documentation

- [Configuration Guide](./docs/configuration.md)
- [Theming & Branding](./docs/theming.md)
- [License System](./docs/licensing.md)
- [Secure Storage](./docs/storage.md)
- [Security Best Practices](./docs/security.md)
- [Auto Updates](./docs/updates.md)
- [API Reference](./docs/api.md)

## Examples

Check the `examples/` directory for complete working examples:

- **Basic App** - Minimal setup with license validation
- **Full App** - Complete app with all features enabled

## Theme Presets

| Preset | Description |
|--------|-------------|
| `dark` | Dark theme with blue accents (default) |
| `light` | Light theme with blue accents |
| `midnight` | Deep purple dark theme |
| `forest` | Green nature-inspired theme |

### Custom Theme

```typescript
export default defineConfig({
  theme: {
    colors: {
      primary: '#FF6B6B',
      primaryHover: '#FF5252',
      background: '#1A1A2E',
      surface: '#16213E',
      text: '#EAEAEA',
      textSecondary: '#A0A0A0',
      border: '#0F3460',
      success: '#00D9A5',
      warning: '#FFB800',
      error: '#FF4757',
    },
  },
});
```

## API Overview

### Core Modules

```typescript
// License
import { LicenseService, LicenseCache, generateHWID } from 'electron-license-kit';

// Storage
import { SecureStorage, KeyManager } from 'electron-license-kit';

// Window
import { createMainWindow, registerWindowControls, enforceSingleInstance } from 'electron-license-kit';

// Security
import { setupSecurityPolicy, validateIpcChannel, createNavigationGuard } from 'electron-license-kit';

// Branding
import { defineConfig, presets, generateCSSVariables, injectTheme } from 'electron-license-kit';
```

### Utility Modules

```typescript
// Logger
import { createLogger, Logger } from 'electron-license-kit';

// Config
import { loadAppConfig, loadEnvFiles, getAppPaths } from 'electron-license-kit';

// Updater
import { AutoUpdater, registerUpdaterHandlers } from 'electron-license-kit';

// Crash Reporter
import { CrashReporter, getCrashReporter } from 'electron-license-kit';
```

## Requirements

- Node.js 20+
- Electron 28+
- pnpm 8+ (recommended)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT - see [LICENSE](./LICENSE) for details.

## Support

- [GitHub Issues](https://github.com/YOUR_USERNAME/electron-license-kit/issues)
- [Discussions](https://github.com/YOUR_USERNAME/electron-license-kit/discussions)

---

<div align="center">
Made with ❤️ for the Electron community
</div>
```

**Verification:** Run `cat README.md` and confirm content matches.

---

### Task 2: Create LICENSE File

**File:** `C:\DEV\electron-license-kit\LICENSE`

```text
MIT License

Copyright (c) 2024 electron-license-kit contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**Verification:** Run `cat LICENSE` and confirm MIT license text.

---

### Task 3: Create CONTRIBUTING.md

**File:** `C:\DEV\electron-license-kit\CONTRIBUTING.md`

```markdown
# Contributing to electron-license-kit

Thank you for your interest in contributing to electron-license-kit! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Git

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/electron-license-kit.git
cd electron-license-kit

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Project Structure

```
electron-license-kit/
├── packages/
│   └── core/           # Main NPM package
│       └── src/
│           ├── branding/
│           ├── config/
│           ├── crash/
│           ├── license/
│           ├── logger/
│           ├── security/
│           ├── storage/
│           ├── updater/
│           └── window/
├── templates/
│   └── vanilla/        # Vanilla TypeScript template
├── examples/           # Example applications
├── docs/               # Documentation
└── .github/            # GitHub workflows
```

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Include:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node, Electron versions)

### Suggesting Features

1. Check existing issues/discussions
2. Use the feature request template
3. Explain:
   - The problem you're solving
   - Your proposed solution
   - Alternative solutions considered

### Submitting Code

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```
3. **Make your changes**
4. **Test your changes**:
   ```bash
   pnpm test
   pnpm lint
   pnpm typecheck
   ```
5. **Commit** with clear messages:
   ```bash
   git commit -m "feat: add new feature"
   # or
   git commit -m "fix: resolve issue with X"
   ```
6. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**

## Coding Standards

### TypeScript

- Use strict TypeScript settings
- Provide explicit return types for public functions
- Use interfaces over types when possible
- Document public APIs with JSDoc

### Style Guide

- Use ESLint and Prettier configuration provided
- 2 spaces for indentation
- Single quotes for strings
- No trailing commas in single-line
- Trailing commas in multi-line

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test additions/modifications
- `chore:` Maintenance tasks

### Testing

- Write tests for new features
- Maintain or improve code coverage
- Test edge cases
- Use descriptive test names

## Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all tests pass
4. Update CHANGELOG.md if applicable
5. Request review from maintainers

### PR Checklist

- [ ] Tests pass locally
- [ ] Lint passes
- [ ] TypeScript compiles without errors
- [ ] Documentation updated
- [ ] CHANGELOG updated (for significant changes)
- [ ] Commit messages follow convention

## Development Scripts

```bash
# Build all packages
pnpm build

# Watch mode for development
pnpm dev

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Lint code
pnpm lint

# Fix lint issues
pnpm lint:fix

# Type check
pnpm typecheck

# Clean build artifacts
pnpm clean
```

## Release Process

Releases are managed by maintainers using:

1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag
4. GitHub Actions publishes to NPM

## Questions?

- Open a [Discussion](https://github.com/YOUR_USERNAME/electron-license-kit/discussions)
- Check existing [Issues](https://github.com/YOUR_USERNAME/electron-license-kit/issues)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
```

**Verification:** Run `cat CONTRIBUTING.md` and confirm content.

---

### Task 4: Create CHANGELOG.md

**File:** `C:\DEV\electron-license-kit\CHANGELOG.md`

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release preparation

## [0.1.0] - 2024-XX-XX

### Added

#### Core Package
- `defineConfig` - Type-safe configuration helper
- `generateHWID` - Hardware ID generation for license binding
- `SecureStorage` - AES-256-GCM encrypted local storage
- `KeyManager` - License key persistence
- `createMainWindow` - Frameless window creation with theming
- `registerWindowControls` - IPC handlers for window controls
- `enforceSingleInstance` - Single instance lock
- `setupSecurityPolicy` - CSP and security headers
- `validateIpcChannel` - IPC channel validation
- `createNavigationGuard` - Navigation security

#### Utility Modules
- `Logger` - File-based logging with rotation
- `loadAppConfig` - Configuration loading
- `loadEnvFiles` - Environment file loading
- `getAppPaths` - Standard app paths
- `AutoUpdater` - Auto-update functionality
- `CrashReporter` - Crash reporting

#### Theming
- Theme presets: dark, light, midnight, forest
- CSS variable injection
- Custom color support

#### Template
- Vanilla TypeScript template
- Custom titlebar component
- Auth forms (login/register)
- Complete build configuration

### Security
- Content Security Policy
- Context isolation
- Sandbox enabled
- Navigation restrictions
- IPC validation

---

## Version History

- **0.1.0** - Initial release with core functionality

[Unreleased]: https://github.com/YOUR_USERNAME/electron-license-kit/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/YOUR_USERNAME/electron-license-kit/releases/tag/v0.1.0
```

**Verification:** Run `cat CHANGELOG.md` and confirm content.

---

### Task 5: Create Configuration Documentation

**File:** `C:\DEV\electron-license-kit\docs\configuration.md`

```markdown
# Configuration Guide

electron-license-kit uses a single `app.config.ts` file for all configuration.

## Basic Configuration

```typescript
import { defineConfig } from 'electron-license-kit';

export default defineConfig({
  // Required
  appName: 'My Application',
  appId: 'com.company.myapp',
  version: '1.0.0',

  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
  },
});
```

## Full Configuration Reference

```typescript
import { defineConfig } from 'electron-license-kit';

export default defineConfig({
  // ============================================
  // APP IDENTITY
  // ============================================
  appName: 'My Application',
  appId: 'com.company.myapp',
  version: '1.0.0',

  // ============================================
  // SUPABASE CONNECTION
  // ============================================
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
  },

  // ============================================
  // THEMING (Optional)
  // ============================================
  theme: {
    // Use a preset
    preset: 'dark', // 'dark' | 'light' | 'midnight' | 'forest'

    // Or define custom colors
    colors: {
      primary: '#3B82F6',
      primaryHover: '#2563EB',
      background: '#0F0F0F',
      surface: '#1A1A1A',
      surfaceHover: '#252525',
      text: '#FFFFFF',
      textSecondary: '#A0A0A0',
      border: '#2A2A2A',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },

    // Additional CSS variables
    customCSS: `
      :root {
        --elk-custom-var: #value;
      }
    `,
  },

  // ============================================
  // WINDOW SETTINGS (Optional)
  // ============================================
  window: {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frameless: true,           // Use custom titlebar
    resizable: true,
    titleBarStyle: 'hidden',   // macOS only
    titleBarOverlay: false,    // Windows only
  },

  // ============================================
  // LICENSE SETTINGS (Optional)
  // ============================================
  license: {
    // Validation interval in milliseconds
    checkInterval: 3600000, // 1 hour

    // Grace period for offline usage
    gracePeriod: 86400000, // 24 hours

    // Allow offline mode
    allowOffline: true,

    // Cache license locally
    cacheEnabled: true,
  },

  // ============================================
  // STORAGE SETTINGS (Optional)
  // ============================================
  storage: {
    // Encryption algorithm
    algorithm: 'aes-256-gcm',

    // Key derivation iterations
    iterations: 100000,

    // Storage file name
    filename: 'app-data.enc',
  },

  // ============================================
  // LOGGING (Optional)
  // ============================================
  logging: {
    // Log level
    level: 'info', // 'debug' | 'info' | 'warn' | 'error'

    // Enable file logging
    file: true,

    // Log file rotation
    maxFiles: 5,
    maxSize: 5242880, // 5MB
  },

  // ============================================
  // AUTO UPDATES (Optional)
  // ============================================
  updates: {
    // Enable auto updates
    enabled: true,

    // Update feed URL (for private updates)
    feedUrl: 'https://your-server.com/updates',

    // Check interval
    checkInterval: 3600000, // 1 hour

    // Auto download updates
    autoDownload: true,

    // Auto install on quit
    autoInstallOnQuit: true,
  },

  // ============================================
  // CRASH REPORTING (Optional)
  // ============================================
  crash: {
    // Enable crash reporting
    enabled: true,

    // Submit URL
    submitUrl: 'https://your-server.com/crashes',

    // Include extra info
    extra: {
      environment: 'production',
    },
  },

  // ============================================
  // SECURITY (Optional)
  // ============================================
  security: {
    // Content Security Policy
    csp: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'connect-src': ["'self'", 'https://*.supabase.co'],
    },

    // Allowed navigation URLs
    allowedNavigation: [
      'https://your-domain.com',
    ],

    // Allowed external protocols
    allowedProtocols: ['https:', 'mailto:'],
  },
});
```

## Environment Variables

Create a `.env` file in your project root:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Optional
NODE_ENV=development
LOG_LEVEL=debug
```

## Loading Configuration

```typescript
import { loadAppConfig } from 'electron-license-kit';

// Automatically loads from ./app.config.ts
const config = loadAppConfig();

// Or specify a path
const config = loadAppConfig('./custom-config.ts');
```

## Type Safety

The `defineConfig` helper provides full TypeScript autocomplete:

```typescript
import { defineConfig, AppConfig } from 'electron-license-kit';

// Full type inference
const config = defineConfig({
  appName: 'Test',
  // ... TypeScript will show all available options
});

// Or type explicitly
const config: AppConfig = {
  appName: 'Test',
  appId: 'com.test.app',
  version: '1.0.0',
  supabase: { url: '', anonKey: '' },
};
```
```

**Verification:** Run `cat docs/configuration.md` and confirm content.

---

### Task 6: Create Theming Documentation

**File:** `C:\DEV\electron-license-kit\docs\theming.md`

```markdown
# Theming & Branding Guide

electron-license-kit provides a flexible theming system using CSS variables.

## Quick Start

### Using Presets

```typescript
import { defineConfig } from 'electron-license-kit';

export default defineConfig({
  appName: 'My App',
  theme: {
    preset: 'dark', // 'dark' | 'light' | 'midnight' | 'forest'
  },
});
```

### Available Presets

#### Dark (Default)
- Dark background with blue accents
- Good for developer tools, media apps

#### Light
- Clean white background with blue accents
- Good for productivity apps, document editors

#### Midnight
- Deep purple/indigo dark theme
- Good for creative apps, entertainment

#### Forest
- Green nature-inspired theme
- Good for health apps, outdoor-related apps

## Custom Colors

Define your own color scheme:

```typescript
export default defineConfig({
  theme: {
    colors: {
      // Primary brand color
      primary: '#FF6B6B',
      primaryHover: '#FF5252',

      // Backgrounds
      background: '#1A1A2E',
      surface: '#16213E',
      surfaceHover: '#1E2A4A',

      // Text
      text: '#EAEAEA',
      textSecondary: '#A0A0A0',

      // Accents
      border: '#0F3460',
      success: '#00D9A5',
      warning: '#FFB800',
      error: '#FF4757',
    },
  },
});
```

## CSS Variables Reference

All colors are injected as CSS variables with the `--elk-` prefix:

```css
:root {
  /* Primary */
  --elk-primary: #3B82F6;
  --elk-primary-hover: #2563EB;

  /* Backgrounds */
  --elk-background: #0F0F0F;
  --elk-surface: #1A1A1A;
  --elk-surface-hover: #252525;

  /* Text */
  --elk-text: #FFFFFF;
  --elk-text-secondary: #A0A0A0;

  /* Accents */
  --elk-border: #2A2A2A;
  --elk-success: #10B981;
  --elk-warning: #F59E0B;
  --elk-error: #EF4444;
}
```

## Using in CSS

```css
.button {
  background-color: var(--elk-primary);
  color: var(--elk-text);
  border: 1px solid var(--elk-border);
}

.button:hover {
  background-color: var(--elk-primary-hover);
}

.card {
  background-color: var(--elk-surface);
  border: 1px solid var(--elk-border);
}

.error-message {
  color: var(--elk-error);
}
```

## Using in JavaScript/TypeScript

```typescript
// Access via getComputedStyle
const primary = getComputedStyle(document.documentElement)
  .getPropertyValue('--elk-primary');

// Or set dynamically
document.documentElement.style.setProperty('--elk-primary', '#FF0000');
```

## Theme Injection

Themes are automatically injected when creating windows:

```typescript
import { createMainWindow } from 'electron-license-kit';

// Theme is applied automatically
const win = await createMainWindow(config);
```

### Manual Injection

```typescript
import { injectTheme, generateCSSVariables } from 'electron-license-kit';

// Inject into existing window
await injectTheme(browserWindow, config);

// Or generate CSS string
const css = generateCSSVariables(config.theme);
// Returns: ":root { --elk-primary: #3B82F6; ... }"
```

## Custom CSS

Add additional CSS variables or overrides:

```typescript
export default defineConfig({
  theme: {
    preset: 'dark',
    customCSS: `
      :root {
        --elk-sidebar-width: 250px;
        --elk-header-height: 60px;
        --elk-font-mono: 'Fira Code', monospace;
      }

      /* Override specific components */
      .titlebar {
        background: linear-gradient(
          90deg,
          var(--elk-surface) 0%,
          var(--elk-background) 100%
        );
      }
    `,
  },
});
```

## Branding Assets

### App Icon

Place your icon files in the `resources/` directory:

```
resources/
├── icon.ico      # Windows
├── icon.icns     # macOS
└── icon.png      # Linux (512x512 recommended)
```

### Titlebar Customization

```css
/* Custom titlebar styling */
.titlebar {
  background: var(--elk-surface);
  border-bottom: 1px solid var(--elk-border);
}

.titlebar-title {
  font-weight: 600;
  color: var(--elk-text);
}

/* Custom window controls */
.titlebar-controls button:hover {
  background: var(--elk-surface-hover);
}

.titlebar-controls .close:hover {
  background: var(--elk-error);
  color: white;
}
```

## Dark/Light Mode Toggle

Implement runtime theme switching:

```typescript
// renderer/js/theme-toggle.ts
const themes = {
  dark: {
    background: '#0F0F0F',
    surface: '#1A1A1A',
    text: '#FFFFFF',
  },
  light: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#1A1A1A',
  },
};

function setTheme(mode: 'dark' | 'light') {
  const theme = themes[mode];
  const root = document.documentElement;

  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--elk-${key}`, value);
  });

  localStorage.setItem('theme', mode);
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
setTheme(savedTheme);
```

## Examples

### Gradient Backgrounds

```css
.hero {
  background: linear-gradient(
    135deg,
    var(--elk-primary) 0%,
    var(--elk-surface) 100%
  );
}
```

### Glassmorphism Effect

```css
.glass-card {
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid var(--elk-border);
  border-radius: 12px;
}
```

### Neon Glow

```css
.neon-button {
  background: var(--elk-primary);
  box-shadow:
    0 0 5px var(--elk-primary),
    0 0 10px var(--elk-primary),
    0 0 20px var(--elk-primary);
}
```
```

**Verification:** Run `cat docs/theming.md` and confirm content.

---

### Task 7: Create Licensing Documentation

**File:** `C:\DEV\electron-license-kit\docs\licensing.md`

```markdown
# License System Guide

electron-license-kit provides a complete licensing solution with Supabase backend.

## Overview

The license system includes:
- **HWID Generation** - Unique hardware identifier for each machine
- **License Validation** - Server-side validation with Supabase
- **License Caching** - Offline support with local cache
- **Grace Period** - Configurable offline tolerance

## Supabase Setup

### 1. Create Database Tables

Run these migrations in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Licenses table
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hwid TEXT,
  product_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'expired', 'revoked')),
  max_activations INTEGER DEFAULT 1,
  current_activations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_licenses_user_id ON licenses(user_id);
CREATE INDEX idx_licenses_key ON licenses(key);
CREATE INDEX idx_licenses_hwid ON licenses(hwid);
CREATE INDEX idx_licenses_status ON licenses(status);

-- Row Level Security
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- Users can only see their own licenses
CREATE POLICY "Users can view own licenses"
  ON licenses FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can modify licenses
CREATE POLICY "Service role can manage licenses"
  ON licenses FOR ALL
  USING (auth.role() = 'service_role');
```

### 2. Create License Validation Function

```sql
CREATE OR REPLACE FUNCTION validate_license(
  p_key TEXT,
  p_hwid TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_license RECORD;
  v_result JSONB;
BEGIN
  -- Find license
  SELECT * INTO v_license
  FROM licenses
  WHERE key = p_key;

  -- License not found
  IF v_license IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'LICENSE_NOT_FOUND'
    );
  END IF;

  -- Check status
  IF v_license.status != 'active' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'LICENSE_' || UPPER(v_license.status)
    );
  END IF;

  -- Check expiration
  IF v_license.expires_at IS NOT NULL AND v_license.expires_at < NOW() THEN
    -- Update status to expired
    UPDATE licenses SET status = 'expired' WHERE id = v_license.id;

    RETURN jsonb_build_object(
      'valid', false,
      'error', 'LICENSE_EXPIRED'
    );
  END IF;

  -- Check HWID
  IF v_license.hwid IS NULL THEN
    -- First activation - bind HWID
    UPDATE licenses
    SET
      hwid = p_hwid,
      activated_at = NOW(),
      current_activations = 1
    WHERE id = v_license.id;
  ELSIF v_license.hwid != p_hwid THEN
    -- HWID mismatch
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'HWID_MISMATCH'
    );
  END IF;

  -- License is valid
  RETURN jsonb_build_object(
    'valid', true,
    'license', jsonb_build_object(
      'id', v_license.id,
      'key', v_license.key,
      'status', v_license.status,
      'expiresAt', v_license.expires_at,
      'productId', v_license.product_id
    )
  );
END;
$$;
```

### 3. Enable Realtime (Optional)

```sql
-- Enable realtime for license changes
ALTER PUBLICATION supabase_realtime ADD TABLE licenses;
```

## Usage in App

### Basic License Check

```typescript
import {
  LicenseService,
  LicenseCache,
  generateHWID,
  loadAppConfig,
} from 'electron-license-kit';

const config = loadAppConfig();
const hwid = await generateHWID();
const cache = new LicenseCache(config);
const licenseService = new LicenseService(config, hwid, cache);

// Validate license
const result = await licenseService.validate('LICENSE-KEY-HERE');

if (result.valid) {
  console.log('License valid!', result.license);
} else {
  console.error('License invalid:', result.error);
}
```

### With Auth Flow

```typescript
// After user logs in
async function handleLogin(email: string, password: string) {
  // 1. Authenticate with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // 2. Get user's license
  const { data: license } = await supabase
    .from('licenses')
    .select('key')
    .eq('user_id', data.user.id)
    .single();

  if (!license) {
    throw new Error('No license found for this account');
  }

  // 3. Validate license with HWID
  const result = await licenseService.validate(license.key);

  if (!result.valid) {
    throw new Error(`License error: ${result.error}`);
  }

  // 4. Store license key locally
  const keyManager = new KeyManager(config);
  await keyManager.store(license.key);

  return result.license;
}
```

### Offline Support

```typescript
// Check license with offline fallback
async function checkLicense(): Promise<boolean> {
  const keyManager = new KeyManager(config);
  const storedKey = await keyManager.get();

  if (!storedKey) {
    return false;
  }

  try {
    // Try online validation
    const result = await licenseService.validate(storedKey);
    return result.valid;
  } catch (error) {
    // Offline - use cache
    const cached = await cache.get(storedKey);

    if (!cached) {
      return false;
    }

    // Check if within grace period
    const gracePeriod = config.license?.gracePeriod || 86400000; // 24h
    const elapsed = Date.now() - cached.validatedAt;

    return elapsed < gracePeriod;
  }
}
```

## IPC Integration

### Main Process

```typescript
import { ipcMain } from 'electron';
import { LicenseService, generateHWID } from 'electron-license-kit';

ipcMain.handle('license:validate', async (_, key: string) => {
  const hwid = await generateHWID();
  const result = await licenseService.validate(key);
  return result;
});

ipcMain.handle('license:check', async () => {
  return await checkLicense();
});

ipcMain.handle('license:deactivate', async () => {
  const keyManager = new KeyManager(config);
  await keyManager.clear();
  return true;
});
```

### Renderer Process

```typescript
// Validate a new license
const result = await window.electronAPI.invoke('license:validate', licenseKey);

if (result.valid) {
  showApp();
} else {
  showError(result.error);
}

// Check existing license on startup
const isLicensed = await window.electronAPI.invoke('license:check');

if (isLicensed) {
  showApp();
} else {
  showLicensePrompt();
}
```

## Error Handling

```typescript
const errorMessages: Record<string, string> = {
  LICENSE_NOT_FOUND: 'Invalid license key',
  LICENSE_EXPIRED: 'Your license has expired',
  LICENSE_SUSPENDED: 'Your license has been suspended',
  LICENSE_REVOKED: 'Your license has been revoked',
  HWID_MISMATCH: 'This license is registered to another device',
  NETWORK_ERROR: 'Unable to connect. Please check your internet.',
};

function getErrorMessage(error: string): string {
  return errorMessages[error] || 'An unknown error occurred';
}
```

## License Key Generation

Generate license keys server-side:

```typescript
// Node.js / Edge Function
import { randomBytes } from 'crypto';

function generateLicenseKey(): string {
  const segments = 4;
  const segmentLength = 4;
  const parts: string[] = [];

  for (let i = 0; i < segments; i++) {
    const bytes = randomBytes(segmentLength);
    parts.push(bytes.toString('hex').toUpperCase().slice(0, segmentLength));
  }

  return parts.join('-'); // e.g., "A1B2-C3D4-E5F6-G7H8"
}
```

## Security Considerations

1. **Never validate client-side** - Always validate on server
2. **Use HWID binding** - Prevent license sharing
3. **Implement rate limiting** - Prevent brute force attacks
4. **Use HTTPS only** - Encrypt all communications
5. **Rotate keys on compromise** - Have a key invalidation strategy
6. **Log validation attempts** - Monitor for abuse
```

**Verification:** Run `cat docs/licensing.md` and confirm content.

---

### Task 8: Create Security Documentation

**File:** `C:\DEV\electron-license-kit\docs\security.md`

```markdown
# Security Best Practices

electron-license-kit includes security features by default, but proper configuration is essential.

## Default Security Features

### 1. Context Isolation

All preload scripts run in an isolated context:

```typescript
const win = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,  // ✅ Enabled by default
    nodeIntegration: false,  // ✅ Disabled by default
    sandbox: true,           // ✅ Enabled by default
  },
});
```

### 2. Content Security Policy

Default CSP is applied to all windows:

```typescript
import { setupSecurityPolicy } from 'electron-license-kit';

setupSecurityPolicy(config);
// Applies CSP: default-src 'self'; script-src 'self'; ...
```

### 3. Navigation Guard

Prevents navigation to untrusted URLs:

```typescript
import { createNavigationGuard } from 'electron-license-kit';

const guard = createNavigationGuard(['https://your-domain.com']);
win.webContents.on('will-navigate', guard);
```

## Configuration

### Custom CSP

```typescript
export default defineConfig({
  security: {
    csp: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': [
        "'self'",
        'https://*.supabase.co',
        'wss://*.supabase.co',
      ],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
    },
  },
});
```

### Allowed Navigation

```typescript
export default defineConfig({
  security: {
    allowedNavigation: [
      'https://your-domain.com',
      'https://docs.your-domain.com',
    ],
    allowedProtocols: ['https:', 'mailto:'],
  },
});
```

## IPC Security

### Channel Validation

```typescript
import { validateIpcChannel } from 'electron-license-kit';

const allowedChannels = [
  'auth:login',
  'auth:logout',
  'license:validate',
  'window:minimize',
  'window:maximize',
  'window:close',
];

// In preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel: string, ...args: unknown[]) => {
    if (validateIpcChannel(channel, allowedChannels)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`Invalid IPC channel: ${channel}`);
  },
});
```

### Input Validation

Always validate IPC inputs in main process:

```typescript
import { z } from 'zod'; // or manual validation

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

ipcMain.handle('auth:login', async (_, data: unknown) => {
  // Validate input
  const result = LoginSchema.safeParse(data);
  if (!result.success) {
    throw new Error('Invalid input');
  }

  // Proceed with validated data
  const { email, password } = result.data;
  // ...
});
```

## Secure Storage

### How It Works

1. **Key Derivation**: PBKDF2 with 100,000 iterations
2. **Encryption**: AES-256-GCM with random IV
3. **HWID Binding**: Keys derived from hardware ID

```typescript
import { SecureStorage } from 'electron-license-kit';

const storage = new SecureStorage(config);

// Data is automatically encrypted
await storage.set('apiToken', 'secret-value');
const token = await storage.get('apiToken');
```

### Security Considerations

- Storage file is encrypted but file location is known
- HWID provides machine binding, not user binding
- For sensitive secrets, consider OS keychain integration

## Preload Script Best Practices

### DO ✅

```typescript
// Expose specific, controlled methods
contextBridge.exposeInMainWorld('electronAPI', {
  // Specific actions
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),

  // Controlled data access
  getVersion: () => ipcRenderer.invoke('app:version'),
});
```

### DON'T ❌

```typescript
// NEVER expose full ipcRenderer
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: ipcRenderer, // ❌ DANGEROUS
});

// NEVER expose node modules
contextBridge.exposeInMainWorld('node', {
  fs: require('fs'), // ❌ DANGEROUS
});
```

## External Content

### Remote Content

If you must load remote content:

```typescript
// Create a separate window with extra restrictions
const remoteWindow = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    webSecurity: true,
    allowRunningInsecureContent: false,
  },
});

// Apply strict CSP
remoteWindow.webContents.session.webRequest.onHeadersReceived(
  (details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; style-src 'self'",
        ],
      },
    });
  }
);
```

### WebViews

Avoid `<webview>` when possible. If required:

```html
<webview
  src="https://trusted-site.com"
  sandbox="allow-scripts"
  disablewebsecurity="false"
></webview>
```

## Updating Dependencies

Regularly update Electron and dependencies:

```bash
# Check for vulnerabilities
pnpm audit

# Update Electron
pnpm update electron

# Update all dependencies
pnpm update
```

## Security Checklist

Before release, verify:

- [ ] Context isolation enabled
- [ ] Node integration disabled
- [ ] Sandbox enabled
- [ ] CSP configured
- [ ] Navigation guard active
- [ ] IPC channels validated
- [ ] Inputs sanitized
- [ ] Dependencies audited
- [ ] Secure storage used for secrets
- [ ] HTTPS enforced for all external requests
- [ ] No sensitive data in logs
- [ ] No secrets in code or config files

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public issue
2. Email: security@your-domain.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours.
```

**Verification:** Run `cat docs/security.md` and confirm content.

---

### Task 9: Create API Reference Documentation

**File:** `C:\DEV\electron-license-kit\docs\api.md`

```markdown
# API Reference

Complete API documentation for electron-license-kit.

## Table of Contents

- [Configuration](#configuration)
- [Branding](#branding)
- [License](#license)
- [Storage](#storage)
- [Window](#window)
- [Security](#security)
- [Logger](#logger)
- [Config](#config)
- [Updater](#updater)
- [Crash Reporter](#crash-reporter)

---

## Configuration

### defineConfig

Type-safe configuration helper.

```typescript
function defineConfig(config: AppConfig): AppConfig
```

**Parameters:**
- `config`: AppConfig object

**Returns:** Validated AppConfig

**Example:**
```typescript
import { defineConfig } from 'electron-license-kit';

export default defineConfig({
  appName: 'My App',
  appId: 'com.company.app',
  version: '1.0.0',
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
  },
});
```

---

## Branding

### presets

Built-in theme presets.

```typescript
const presets: Record<ThemePreset, ThemeColors>
```

**Available presets:** `'dark'`, `'light'`, `'midnight'`, `'forest'`

### generateCSSVariables

Generate CSS variable string from theme config.

```typescript
function generateCSSVariables(theme?: ThemeConfig): string
```

**Returns:** CSS string with `:root { --elk-*: value; }`

### injectTheme

Inject theme into BrowserWindow.

```typescript
async function injectTheme(
  window: BrowserWindow,
  config: AppConfig
): Promise<void>
```

---

## License

### generateHWID

Generate hardware identifier.

```typescript
async function generateHWID(): Promise<string>
```

**Returns:** SHA-256 hash of machine ID

### LicenseCache

Local license cache for offline support.

```typescript
class LicenseCache {
  constructor(config: AppConfig)

  async get(key: string): Promise<CachedLicense | null>
  async set(key: string, license: LicenseData): Promise<void>
  async clear(): Promise<void>
  async isValid(key: string, gracePeriod?: number): Promise<boolean>
}
```

### LicenseService

License validation service.

```typescript
class LicenseService {
  constructor(
    config: AppConfig,
    hwid: string,
    cache?: LicenseCache
  )

  async validate(key: string): Promise<LicenseResult>
  async checkOnline(key: string): Promise<LicenseResult>
  async checkOffline(key: string): Promise<LicenseResult>
}
```

**LicenseResult:**
```typescript
interface LicenseResult {
  valid: boolean;
  license?: LicenseData;
  error?: string;
  cached?: boolean;
}
```

---

## Storage

### SecureStorage

Encrypted local storage.

```typescript
class SecureStorage {
  constructor(config: AppConfig)

  async get<T>(key: string): Promise<T | null>
  async set<T>(key: string, value: T): Promise<void>
  async delete(key: string): Promise<void>
  async clear(): Promise<void>
  async has(key: string): Promise<boolean>
  async keys(): Promise<string[]>
}
```

**Example:**
```typescript
const storage = new SecureStorage(config);

await storage.set('user', { id: 1, name: 'John' });
const user = await storage.get<User>('user');
await storage.delete('user');
```

### KeyManager

License key storage.

```typescript
class KeyManager {
  constructor(config: AppConfig)

  async get(): Promise<string | null>
  async store(key: string): Promise<void>
  async clear(): Promise<void>
  async exists(): Promise<boolean>
}
```

---

## Window

### createMainWindow

Create the main application window.

```typescript
async function createMainWindow(
  config: AppConfig
): Promise<BrowserWindow>
```

**Returns:** Configured BrowserWindow with theme applied

### registerWindowControls

Register IPC handlers for window controls.

```typescript
function registerWindowControls(
  window: BrowserWindow
): void
```

**Registers handlers:**
- `window:minimize`
- `window:maximize`
- `window:close`
- `window:isMaximized`

### enforceSingleInstance

Ensure only one app instance runs.

```typescript
function enforceSingleInstance(
  app: App,
  onSecondInstance?: () => void
): boolean
```

**Returns:** `true` if this is the first instance

**Example:**
```typescript
if (!enforceSingleInstance(app, () => mainWindow?.show())) {
  app.quit();
}
```

---

## Security

### setupSecurityPolicy

Configure security policies.

```typescript
function setupSecurityPolicy(config: AppConfig): void
```

**Configures:**
- Content Security Policy headers
- Session permissions
- Protocol handlers

### validateIpcChannel

Validate IPC channel names.

```typescript
function validateIpcChannel(
  channel: string,
  allowed: string[]
): boolean
```

### createNavigationGuard

Create navigation event handler.

```typescript
function createNavigationGuard(
  allowedUrls: string[]
): (event: Event, url: string) => void
```

---

## Logger

### createLogger

Create a logger instance.

```typescript
function createLogger(config: AppConfig): Logger
```

### Logger

```typescript
class Logger {
  constructor(options: LoggerOptions)

  debug(message: string, ...args: unknown[]): void
  info(message: string, ...args: unknown[]): void
  warn(message: string, ...args: unknown[]): void
  error(message: string, error?: Error, ...args: unknown[]): void

  getLogPath(): string
  clearLogs(): Promise<void>
}
```

**Example:**
```typescript
const logger = createLogger(config);

logger.info('Application started');
logger.error('Failed to connect', new Error('Network error'));
```

---

## Config

### loadAppConfig

Load configuration from app.config.ts.

```typescript
function loadAppConfig(path?: string): AppConfig
```

**Parameters:**
- `path`: Optional config file path (default: `./app.config.ts`)

### loadEnvFiles

Load environment variables from files.

```typescript
function loadEnvFiles(
  files: string[],
  options?: { override?: boolean }
): void
```

**Example:**
```typescript
loadEnvFiles(['.env', '.env.local']);
```

### getAppPaths

Get standard app paths.

```typescript
function getAppPaths(appName: string): AppPaths

interface AppPaths {
  userData: string;
  logs: string;
  cache: string;
  temp: string;
  config: string;
}
```

---

## Updater

### AutoUpdater

Auto-update manager.

```typescript
class AutoUpdater {
  constructor(config: AppConfig)

  async checkForUpdates(): Promise<UpdateResult>
  async downloadUpdate(): Promise<void>
  async installUpdate(): Promise<void>

  on(event: UpdateEvent, handler: Function): void
  off(event: UpdateEvent, handler: Function): void
}

type UpdateEvent =
  | 'checking'
  | 'available'
  | 'not-available'
  | 'progress'
  | 'downloaded'
  | 'error';
```

### registerUpdaterHandlers

Register IPC handlers for updates.

```typescript
function registerUpdaterHandlers(
  updater: AutoUpdater
): void
```

**Registers:**
- `updater:check`
- `updater:download`
- `updater:install`

---

## Crash Reporter

### CrashReporter

Crash collection and reporting.

```typescript
class CrashReporter {
  constructor(config: AppConfig)

  start(): void
  stop(): void
  addBreadcrumb(message: string, data?: object): void
  captureException(error: Error): void
  setUser(user: { id: string; email?: string }): void
}
```

### getCrashReporter

Get singleton instance.

```typescript
function getCrashReporter(config?: AppConfig): CrashReporter
```

---

## Types

### AppConfig

```typescript
interface AppConfig {
  appName: string;
  appId: string;
  version: string;
  supabase: {
    url: string;
    anonKey: string;
  };
  theme?: ThemeConfig;
  window?: WindowConfig;
  license?: LicenseConfig;
  storage?: StorageConfig;
  logging?: LoggingConfig;
  updates?: UpdatesConfig;
  crash?: CrashConfig;
  security?: SecurityConfig;
}
```

### ThemeColors

```typescript
interface ThemeColors {
  primary: string;
  primaryHover: string;
  background: string;
  surface: string;
  surfaceHover: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}
```

### LicenseData

```typescript
interface LicenseData {
  id: string;
  key: string;
  status: 'active' | 'suspended' | 'expired' | 'revoked';
  expiresAt?: string;
  productId: string;
  hwid?: string;
}
```

See the TypeScript definitions for complete type information.
```

**Verification:** Run `cat docs/api.md` and confirm content.

---

### Task 10: Create Supabase Schema Documentation

**File:** `C:\DEV\electron-license-kit\docs\supabase-schema.md`

```markdown
# Supabase Schema Setup

Complete database schema for the license system.

## Quick Setup

Run all migrations in order in your Supabase SQL editor.

## Migration 1: Extensions

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

## Migration 2: Licenses Table

```sql
-- Licenses table
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hwid TEXT,
  product_id TEXT NOT NULL DEFAULT 'default',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'expired', 'revoked')),
  max_activations INTEGER NOT NULL DEFAULT 1,
  current_activations INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  last_validated_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT valid_activations CHECK (current_activations <= max_activations)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(key);
CREATE INDEX IF NOT EXISTS idx_licenses_hwid ON licenses(hwid);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_product_id ON licenses(product_id);
CREATE INDEX IF NOT EXISTS idx_licenses_expires_at ON licenses(expires_at)
  WHERE expires_at IS NOT NULL;

-- Enable RLS
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own licenses"
  ON licenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anon can validate licenses"
  ON licenses FOR SELECT
  USING (true);

-- Only service role can insert/update/delete
CREATE POLICY "Service role manages licenses"
  ON licenses FOR ALL
  USING (auth.role() = 'service_role');
```

## Migration 3: License Validation Function

```sql
CREATE OR REPLACE FUNCTION validate_license(
  p_key TEXT,
  p_hwid TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_license RECORD;
BEGIN
  -- Find and lock the license row
  SELECT * INTO v_license
  FROM licenses
  WHERE key = p_key
  FOR UPDATE;

  -- License not found
  IF v_license IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'LICENSE_NOT_FOUND',
      'message', 'The license key was not found'
    );
  END IF;

  -- Check if revoked
  IF v_license.status = 'revoked' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'LICENSE_REVOKED',
      'message', 'This license has been revoked'
    );
  END IF;

  -- Check if suspended
  IF v_license.status = 'suspended' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'LICENSE_SUSPENDED',
      'message', 'This license has been suspended'
    );
  END IF;

  -- Check expiration
  IF v_license.expires_at IS NOT NULL AND v_license.expires_at < NOW() THEN
    UPDATE licenses
    SET status = 'expired'
    WHERE id = v_license.id;

    RETURN jsonb_build_object(
      'valid', false,
      'error', 'LICENSE_EXPIRED',
      'message', 'This license has expired',
      'expiredAt', v_license.expires_at
    );
  END IF;

  -- Check HWID binding
  IF v_license.hwid IS NULL THEN
    -- First activation
    IF v_license.current_activations >= v_license.max_activations THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'MAX_ACTIVATIONS_REACHED',
        'message', 'Maximum activations reached for this license'
      );
    END IF;

    -- Bind HWID and activate
    UPDATE licenses
    SET
      hwid = p_hwid,
      activated_at = COALESCE(activated_at, NOW()),
      current_activations = current_activations + 1,
      last_validated_at = NOW()
    WHERE id = v_license.id;

  ELSIF v_license.hwid != p_hwid THEN
    -- HWID mismatch
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'HWID_MISMATCH',
      'message', 'This license is registered to a different device'
    );
  ELSE
    -- Same HWID - update last validated
    UPDATE licenses
    SET last_validated_at = NOW()
    WHERE id = v_license.id;
  END IF;

  -- License is valid
  RETURN jsonb_build_object(
    'valid', true,
    'license', jsonb_build_object(
      'id', v_license.id,
      'key', v_license.key,
      'status', v_license.status,
      'productId', v_license.product_id,
      'expiresAt', v_license.expires_at,
      'activatedAt', v_license.activated_at
    )
  );
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION validate_license TO anon;
GRANT EXECUTE ON FUNCTION validate_license TO authenticated;
```

## Migration 4: License Generation Function

```sql
-- Function to generate a license key
CREATE OR REPLACE FUNCTION generate_license_key()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_key TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 4 segments of 4 characters each
    v_key := UPPER(
      SUBSTRING(encode(gen_random_bytes(2), 'hex') FROM 1 FOR 4) || '-' ||
      SUBSTRING(encode(gen_random_bytes(2), 'hex') FROM 1 FOR 4) || '-' ||
      SUBSTRING(encode(gen_random_bytes(2), 'hex') FROM 1 FOR 4) || '-' ||
      SUBSTRING(encode(gen_random_bytes(2), 'hex') FROM 1 FOR 4)
    );

    -- Check if key exists
    SELECT EXISTS(SELECT 1 FROM licenses WHERE key = v_key) INTO v_exists;

    -- If unique, exit loop
    EXIT WHEN NOT v_exists;
  END LOOP;

  RETURN v_key;
END;
$$;

-- Function to create a license
CREATE OR REPLACE FUNCTION create_license(
  p_user_id UUID DEFAULT NULL,
  p_product_id TEXT DEFAULT 'default',
  p_max_activations INTEGER DEFAULT 1,
  p_expires_in_days INTEGER DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key TEXT;
  v_expires_at TIMESTAMPTZ;
  v_license licenses;
BEGIN
  -- Generate unique key
  v_key := generate_license_key();

  -- Calculate expiration
  IF p_expires_in_days IS NOT NULL THEN
    v_expires_at := NOW() + (p_expires_in_days || ' days')::INTERVAL;
  END IF;

  -- Insert license
  INSERT INTO licenses (
    key,
    user_id,
    product_id,
    max_activations,
    expires_at,
    metadata
  )
  VALUES (
    v_key,
    p_user_id,
    p_product_id,
    p_max_activations,
    v_expires_at,
    p_metadata
  )
  RETURNING * INTO v_license;

  RETURN jsonb_build_object(
    'success', true,
    'license', jsonb_build_object(
      'id', v_license.id,
      'key', v_license.key,
      'productId', v_license.product_id,
      'expiresAt', v_license.expires_at,
      'maxActivations', v_license.max_activations
    )
  );
END;
$$;

-- Only service role can create licenses
REVOKE EXECUTE ON FUNCTION create_license FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_license TO service_role;
```

## Migration 5: Deactivation Function

```sql
-- Function to deactivate a license (reset HWID)
CREATE OR REPLACE FUNCTION deactivate_license(
  p_key TEXT,
  p_hwid TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_license RECORD;
BEGIN
  SELECT * INTO v_license
  FROM licenses
  WHERE key = p_key
  FOR UPDATE;

  IF v_license IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'LICENSE_NOT_FOUND'
    );
  END IF;

  -- Verify HWID matches
  IF v_license.hwid IS NULL OR v_license.hwid != p_hwid THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'HWID_MISMATCH'
    );
  END IF;

  -- Reset HWID and decrement activations
  UPDATE licenses
  SET
    hwid = NULL,
    current_activations = GREATEST(0, current_activations - 1)
  WHERE id = v_license.id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'License deactivated successfully'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION deactivate_license TO anon;
GRANT EXECUTE ON FUNCTION deactivate_license TO authenticated;
```

## Migration 6: Admin Functions

```sql
-- Suspend a license
CREATE OR REPLACE FUNCTION suspend_license(p_license_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE licenses
  SET status = 'suspended'
  WHERE id = p_license_id;

  RETURN FOUND;
END;
$$;

-- Revoke a license
CREATE OR REPLACE FUNCTION revoke_license(p_license_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE licenses
  SET status = 'revoked'
  WHERE id = p_license_id;

  RETURN FOUND;
END;
$$;

-- Reactivate a license
CREATE OR REPLACE FUNCTION reactivate_license(p_license_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE licenses
  SET status = 'active'
  WHERE id = p_license_id
  AND status IN ('suspended', 'expired');

  RETURN FOUND;
END;
$$;

-- Extend license expiration
CREATE OR REPLACE FUNCTION extend_license(
  p_license_id UUID,
  p_days INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE licenses
  SET expires_at = COALESCE(expires_at, NOW()) + (p_days || ' days')::INTERVAL
  WHERE id = p_license_id;

  RETURN FOUND;
END;
$$;

-- Only service role can use admin functions
REVOKE EXECUTE ON FUNCTION suspend_license FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION revoke_license FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION reactivate_license FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION extend_license FROM PUBLIC;

GRANT EXECUTE ON FUNCTION suspend_license TO service_role;
GRANT EXECUTE ON FUNCTION revoke_license TO service_role;
GRANT EXECUTE ON FUNCTION reactivate_license TO service_role;
GRANT EXECUTE ON FUNCTION extend_license TO service_role;
```

## Usage Examples

### Create a License (Server-Side)

```typescript
// Using service role key (never expose in client!)
const { data, error } = await supabaseAdmin.rpc('create_license', {
  p_user_id: userId,
  p_product_id: 'pro',
  p_max_activations: 2,
  p_expires_in_days: 365,
});
```

### Validate a License (Client-Side)

```typescript
const { data, error } = await supabase.rpc('validate_license', {
  p_key: licenseKey,
  p_hwid: hwid,
});

if (data.valid) {
  console.log('License valid:', data.license);
} else {
  console.error('Invalid:', data.error);
}
```

### Deactivate a License

```typescript
const { data, error } = await supabase.rpc('deactivate_license', {
  p_key: licenseKey,
  p_hwid: hwid,
});
```
```

**Verification:** Run `cat docs/supabase-schema.md` and confirm content.

---

### Task 11: Create GitHub Issue Templates

**File:** `C:\DEV\electron-license-kit\.github\ISSUE_TEMPLATE\bug_report.md`

```markdown
---
name: Bug Report
about: Report a bug to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

## Description

A clear and concise description of the bug.

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior

What you expected to happen.

## Actual Behavior

What actually happened.

## Environment

- OS: [e.g., Windows 11, macOS 14]
- Node.js: [e.g., 20.10.0]
- Electron: [e.g., 28.0.0]
- electron-license-kit: [e.g., 0.1.0]

## Screenshots

If applicable, add screenshots.

## Error Logs

```
Paste any error messages here
```

## Additional Context

Any other context about the problem.
```

**File:** `C:\DEV\electron-license-kit\.github\ISSUE_TEMPLATE\feature_request.md`

```markdown
---
name: Feature Request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## Problem Statement

A clear description of the problem you're trying to solve.

## Proposed Solution

Your idea for solving the problem.

## Alternatives Considered

Other solutions you've considered.

## Additional Context

Any other context, mockups, or examples.
```

**Verification:** Check both files exist in `.github/ISSUE_TEMPLATE/`

---

### Task 12: Create Pull Request Template

**File:** `C:\DEV\electron-license-kit\.github\PULL_REQUEST_TEMPLATE.md`

```markdown
## Description

Brief description of changes.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues

Fixes #(issue number)

## Checklist

- [ ] My code follows the project style guidelines
- [ ] I have performed a self-review
- [ ] I have added tests for new functionality
- [ ] All tests pass locally
- [ ] I have updated documentation as needed
- [ ] I have updated CHANGELOG.md if applicable

## Screenshots (if applicable)

Add screenshots for UI changes.

## Testing Instructions

How to test these changes.
```

**Verification:** Run `cat .github/PULL_REQUEST_TEMPLATE.md` and confirm content.

---

## Final Verification

After completing all tasks, run:

```bash
# Verify all documentation files exist
ls -la docs/
ls -la .github/

# Check file contents
cat README.md | head -50
cat CONTRIBUTING.md | head -50
cat CHANGELOG.md
```

**Expected Results:**
- All documentation files exist
- README.md has proper formatting and badges
- CONTRIBUTING.md has complete guidelines
- CHANGELOG.md is ready for releases
- GitHub templates are in place

---

## All Plans Complete

You have now completed all 5 plans for electron-license-kit:

1. **Plan 01: Monorepo Setup** - Base structure and configuration
2. **Plan 02: Core Modules** - Branding, license, storage, window, security
3. **Plan 03: Utility Modules** - Logger, config, crash, updater, license service
4. **Plan 04: Vanilla Template** - Complete Electron app template
5. **Plan 05: Documentation** - README, guides, API docs, open source files

The project is now ready for implementation!
