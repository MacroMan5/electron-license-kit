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

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
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
      const parts = key.split('.');
      if (parts.length < 2) {
        return;
      }
      const payloadSegment = parts[1];
      if (!payloadSegment) {
        return;
      }
      const payloadJson = Buffer.from(payloadSegment, 'base64').toString();
      const payload = JSON.parse(payloadJson);
      if (payload.role === 'service_role') {
        throw new Error('SECURITY: Service role key detected. Use anon key only!');
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('SECURITY')) throw e;
    }
  }

  async register(email: string, password: string, licenseKey: string): Promise<AuthResult> {
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

    const { data: license, error: licenseError } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('license_key', normalizedKey)
      .single();

    if (licenseError) {
      throw new Error(licenseError.message);
    }
    if (!license) {
      throw new Error('License key not found');
    }
    if (license.user_id) {
      throw new Error('License already activated');
    }
    if (license.status !== 'active') {
      throw new Error(`License is ${license.status as string}`);
    }

    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw new Error(authError.message);
    }
    if (!authData.user) {
      throw new Error('Registration failed');
    }

    const hwid = generateHWID();
    const { data: claimResult, error: claimError } = await this.supabase.rpc(this.claimRpcName, {
      p_license_key: normalizedKey,
      p_user_id: authData.user.id,
      p_hwid: hwid,
    });

    if (claimError) {
      throw new Error(claimError.message);
    }
    if (!claimResult?.success) {
      throw new Error((claimResult?.error as string | undefined) ?? 'License activation failed');
    }

    this.cache.save({
      email,
      tier: license.tier,
      expiresAt: license.expires_at,
      lastCheck: new Date().toISOString(),
      hwid,
    });

    this.keyManager.save(normalizedKey);

    this.currentUser = { id: authData.user.id, email };
    this.currentLicense = { ...license, hwid, user_id: authData.user.id };

    return {
      user: this.currentUser,
      license: this.currentLicense as AuthResult['license'],
    };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email address');
    }
    if (!password) {
      throw new Error('Password is required');
    }

    const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw new Error(authError.message);
    }
    if (!authData.user) {
      throw new Error('Login failed');
    }

    const { data: license, error: licenseError } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', authData.user.id)
      .eq('status', 'active')
      .single();

    if (licenseError) {
      throw new Error(licenseError.message);
    }
    if (!license) {
      throw new Error('No active license found');
    }

    const hwid = generateHWID();
    if (license.hwid && license.hwid !== hwid) {
      throw new Error('License bound to different computer');
    }

    await this.supabase
      .from(this.tableName)
      .update({ last_check: new Date().toISOString(), hwid: license.hwid ?? hwid })
      .eq('id', license.id);

    this.cache.save({
      email,
      tier: license.tier,
      expiresAt: license.expires_at,
      lastCheck: new Date().toISOString(),
      hwid,
    });

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

  async validate(): Promise<ValidationResult> {
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
      // fall through to cache
    }

    if (this.cache.isValid()) {
      return {
        valid: true,
        license: this.cache.load() as LicenseData,
        source: 'cache',
      };
    }

    return { valid: false, error: 'No valid license found' };
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this.cache.clear();
    this.keyManager.clear();
    this.currentUser = null;
    this.currentLicense = null;
  }

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

  async resetPassword(email: string): Promise<boolean> {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email address');
    }

    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
    return true;
  }
}
