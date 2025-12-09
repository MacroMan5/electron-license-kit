/**
 * Core type definitions for electron-license-kit
 */

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

export interface SecurityPolicyConfig {
  allowedExternalDomains?: string[];
  enableDevTools?: boolean;
}

export interface HWIDComponents {
  machineId: string;
  platform: string;
  arch: string;
  cpuModel: string;
}

