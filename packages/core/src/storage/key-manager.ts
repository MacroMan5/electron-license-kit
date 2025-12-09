/**
 * Key Manager - Specialized encrypted storage for license keys
 */

import { SecureStorage } from './secure-storage';

interface KeyData {
  licenseKey: string;
  savedAt: string;
}

export class KeyManager {
  private readonly storage: SecureStorage<KeyData>;

  constructor(appName?: string) {
    this.storage = new SecureStorage<KeyData>({
      fileName: 'key.dat',
      appName,
    });
  }

  save(licenseKey: string): boolean {
    if (!licenseKey || typeof licenseKey !== 'string') {
      console.error('Invalid license key');
      return false;
    }

    return this.storage.save({
      licenseKey,
      savedAt: new Date().toISOString(),
    });
  }

  load(): string | null {
    const data = this.storage.load();
    return data?.licenseKey ?? null;
  }

  exists(): boolean {
    return this.storage.exists();
  }

  clear(): boolean {
    return this.storage.clear();
  }

  getKeyPath(): string {
    return this.storage.getPath();
  }
}

