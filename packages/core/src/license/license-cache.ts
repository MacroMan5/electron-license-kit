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

  save(data: LicenseData): boolean {
    return this.storage.save(data);
  }

  load(): LicenseData | null {
    return this.storage.load();
  }

  isValid(): boolean {
    const data = this.load();
    if (!data) return false;

    if (data.lastCheck) {
      const lastCheck = new Date(data.lastCheck);
      const now = new Date();
      const daysSinceCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceCheck > this.maxAgeDays) {
        return false;
      }
    }

    if (data.tier !== 'lifetime' && data.expiresAt) {
      const expires = new Date(data.expiresAt);
      if (expires < new Date()) {
        return false;
      }
    }

    return true;
  }

  clear(): boolean {
    return this.storage.clear();
  }

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

