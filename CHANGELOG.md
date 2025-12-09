# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial open-source setup and documentation.

## [0.1.0] - 2024-XX-XX

### Added

#### Core Package
- `defineConfig` – type-safe app configuration.
- `generateHWID` – hardware ID generation for license binding.
- `SecureStorage` – AES-256-GCM encrypted local storage.
- `KeyManager` – encrypted license-key persistence.
- `createMainWindow` – frameless window creation.
- `registerWindowControls` – IPC handlers for window controls.
- `enforceSingleInstance` – single-instance locking.
- `setupSecurityPolicy` – navigation and external link guard.
- `validateIpcChannel` – IPC channel whitelist helper.
- `createNavigationGuard` – simple navigation lockdown.

#### Utility Modules
- `Logger` – structured logging with file rotation.
- `loadEnvFiles` – environment file discovery and loading.
- `getAppPaths` – platform-specific app data/log/config paths.
- `AutoUpdater` – `electron-updater` wrapper + IPC helpers.
- `CrashReporter` – process-level crash handler + JSON logs.
- `LicenseService` – Supabase-based license registration/login/validation.
- `LicenseCache` – encrypted offline license cache.

#### Theming
- Theme presets: `dark`, `light`, `midnight`, `forest`.
- CSS variable generation + injection helpers.
- Config-driven branding (logo + colors).

#### Template
- Vanilla TypeScript Electron template (`templates/vanilla`).
- Custom titlebar + themed UI.
- Auth flows wired to `LicenseService`.
- CI workflows for build & release.

### Security
- Content Security Policy in template HTML.
- Context isolation + sandboxed renderer.
- Navigation + external link guards.
- IPC channel validation helpers.

---

## Version History

- **0.1.0** – Initial release with core functionality.

[Unreleased]: https://github.com/YOUR_USERNAME/electron-license-kit/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/YOUR_USERNAME/electron-license-kit/releases/tag/v0.1.0

