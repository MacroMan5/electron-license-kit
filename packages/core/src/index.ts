/**
 * electron-license-kit
 *
 * Open-source framework for building secure, licensed Electron applications
 * with Supabase backend integration.
 *
 * @packageDocumentation
 */

export const VERSION = '0.1.0';

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

export {
  generateHWID,
  getHWIDComponents,
  LicenseCache,
  LicenseService,
} from './license';

export { SecureStorage, KeyManager } from './storage';

export {
  createMainWindow,
  registerWindowControls,
  unregisterWindowControls,
  enforceSingleInstance,
} from './window';

export {
  setupSecurityPolicy,
  createNavigationGuard,
  validateIpcChannel,
} from './security';

export { Logger, createLogger, type LogLevel, type LoggerConfig } from './logger';

export {
  loadEnvFile,
  loadEnvFiles,
  getAppPaths,
  loadAppConfig,
  type AppPaths,
} from './config';

export {
  CrashReporter,
  getCrashReporter,
  type CrashReporterConfig,
  type CrashReport,
} from './crash';

export {
  AutoUpdater,
  registerUpdaterHandlers,
  type UpdaterConfig,
  type UpdateStatus,
} from './updater';

