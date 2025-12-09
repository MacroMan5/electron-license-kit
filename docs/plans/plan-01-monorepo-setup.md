# Plan 01: Monorepo Setup

**Project:** electron-license-kit
**Phase:** 1 of 5
**Estimated Tasks:** 8

---

## Overview

Set up the monorepo structure with pnpm workspaces, TypeScript configuration, and all necessary tooling for an open-source NPM package.

---

## Prerequisites

- Node.js 20+ installed
- pnpm installed globally (`npm install -g pnpm`)
- Git installed

---

## Tasks

### Task 1: Create Repository Structure

**File:** `C:\DEV\electron-license-kit\` (new directory)

Create the base directory structure:

```bash
mkdir electron-license-kit
cd electron-license-kit
git init
```

Create folders:
```
electron-license-kit/
├── packages/
│   └── core/
│       └── src/
├── templates/
│   └── vanilla/
├── examples/
├── docs/
└── .github/
    └── workflows/
```

**Verification:** Run `ls -la` and confirm all directories exist.

---

### Task 2: Create Root package.json

**File:** `C:\DEV\electron-license-kit\package.json`

```json
{
  "name": "electron-license-kit-monorepo",
  "version": "0.0.0",
  "private": true,
  "description": "Open-source framework for building licensed Electron apps with Supabase",
  "scripts": {
    "build": "pnpm -r build",
    "dev": "pnpm -r dev",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test",
    "clean": "pnpm -r clean",
    "typecheck": "pnpm -r typecheck"
  },
  "keywords": [
    "electron",
    "license",
    "supabase",
    "desktop-app",
    "typescript"
  ],
  "author": "",
  "license": "MIT",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

**Verification:** Run `cat package.json` and confirm content matches.

---

### Task 3: Create pnpm-workspace.yaml

**File:** `C:\DEV\electron-license-kit\pnpm-workspace.yaml`

```yaml
packages:
  - 'packages/*'
  - 'templates/*'
  - 'examples/*'
```

**Verification:** Run `cat pnpm-workspace.yaml` and confirm content.

---

### Task 4: Create Core Package package.json

**File:** `C:\DEV\electron-license-kit\packages\core\package.json`

```json
{
  "name": "electron-license-kit",
  "version": "0.1.0",
  "description": "Secure licensing, storage, and utilities for Electron apps with Supabase",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts --clean",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "clean": "rimraf dist"
  },
  "keywords": [
    "electron",
    "license",
    "supabase",
    "hwid",
    "secure-storage",
    "auto-updater",
    "typescript"
  ],
  "author": "",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/electron-license-kit.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/electron-license-kit/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/electron-license-kit#readme",
  "peerDependencies": {
    "electron": ">=25.0.0"
  },
  "peerDependenciesMeta": {
    "electron": {
      "optional": true
    }
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.86.2",
    "node-machine-id": "^1.1.12"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "electron": "^28.0.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "rimraf": "^5.0.5",
    "tsup": "^8.0.1",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  }
}
```

**Verification:** Run `cat packages/core/package.json` and confirm content.

---

### Task 5: Create Core Package tsconfig.json

**File:** `C:\DEV\electron-license-kit\packages\core\tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**Verification:** Run `cat packages/core/tsconfig.json` and confirm content.

---

### Task 6: Create ESLint Configuration

**File:** `C:\DEV\electron-license-kit\packages\core\.eslintrc.js`

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js'],
};
```

**Verification:** Run `cat packages/core/.eslintrc.js` and confirm content.

---

### Task 7: Create Initial Index Entry Point

**File:** `C:\DEV\electron-license-kit\packages\core\src\index.ts`

```typescript
/**
 * electron-license-kit
 *
 * Open-source framework for building secure, licensed Electron applications
 * with Supabase backend integration.
 *
 * @packageDocumentation
 */

// Version export
export const VERSION = '0.1.0';

// =============================================================================
// LICENSE MODULE
// =============================================================================
// TODO: Export LicenseService, LicenseCache, generateHWID

// =============================================================================
// STORAGE MODULE
// =============================================================================
// TODO: Export SecureStorage, KeyManager

// =============================================================================
// WINDOW MODULE
// =============================================================================
// TODO: Export createMainWindow, registerWindowControls, enforceSingleInstance

// =============================================================================
// SECURITY MODULE
// =============================================================================
// TODO: Export setupSecurityPolicy, validateIpcChannel, createNavigationGuard

// =============================================================================
// BRANDING MODULE
// =============================================================================
// TODO: Export defineConfig, BrandingManager, presets, injectTheme

// =============================================================================
// UPDATER MODULE
// =============================================================================
// TODO: Export AutoUpdater, registerUpdaterHandlers

// =============================================================================
// LOGGER MODULE
// =============================================================================
// TODO: Export Logger, createLogger

// =============================================================================
// CONFIG MODULE
// =============================================================================
// TODO: Export loadConfig, loadAppConfig, getAppPaths

// =============================================================================
// CRASH MODULE
// =============================================================================
// TODO: Export CrashReporter, getCrashReporter

// =============================================================================
// TYPES
// =============================================================================
// TODO: Export all TypeScript interfaces and types
```

**Verification:** Run `cat packages/core/src/index.ts` and confirm content.

---

### Task 8: Create .gitignore

**File:** `C:\DEV\electron-license-kit\.gitignore`

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
*.tsbuildinfo

# IDE
.idea/
.vscode/
*.swp
*.swo
.DS_Store

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Test coverage
coverage/

# OS files
Thumbs.db
.DS_Store

# Electron
out/

# Misc
*.tgz
```

**Verification:** Run `cat .gitignore` and confirm content.

---

## Final Verification

Run these commands to verify the setup is complete:

```bash
# Install dependencies
pnpm install

# Build the package (should succeed with empty exports)
cd packages/core && pnpm build

# Run typecheck
pnpm typecheck

# Run lint
pnpm lint
```

**Expected Results:**
- `pnpm install` completes without errors
- `pnpm build` creates `dist/` folder with `index.js`, `index.mjs`, `index.d.ts`
- `pnpm typecheck` passes
- `pnpm lint` passes

---

## Next Plan

Proceed to **Plan 02: NPM Package Core Modules** to implement:
- License module (LicenseService, LicenseCache, HWID)
- Storage module (SecureStorage, KeyManager)
- Window module (createMainWindow, controls, single-instance)
- Security module (CSP, navigation guard, IPC validator)
