/**
 * Secure Storage - AES-256-GCM encrypted local storage
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { SecureStorageConfig, EncryptedData } from '../types';
import { generateHWID } from '../license/hwid-generator';

const ALGORITHM = 'aes-256-gcm';

export class SecureStorage<T> {
  private readonly storageDir: string;
  private readonly filePath: string;
  private readonly encryptionKey: Buffer;

  constructor(config: SecureStorageConfig) {
    const appName = config.appName ?? 'ElectronApp';
    this.storageDir =
      config.storageDir ?? path.join(os.homedir(), 'AppData', 'Roaming', appName);
    this.filePath = path.join(this.storageDir, config.fileName);
    this.encryptionKey = config.encryptionKey ?? this.deriveKey();
  }

  private deriveKey(): Buffer {
    const hwid = generateHWID();
    return crypto.createHash('sha256').update(hwid).digest();
  }

  private encrypt(data: T): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, this.encryptionKey, iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      data: encrypted,
      tag: authTag.toString('hex'),
    };
  }

  private decrypt(encrypted: EncryptedData): T | null {
    try {
      const iv = Buffer.from(encrypted.iv, 'hex');
      const authTag = Buffer.from(encrypted.tag, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, this.encryptionKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  save(data: T): boolean {
    try {
      fs.mkdirSync(this.storageDir, { recursive: true });
      const encrypted = this.encrypt(data);
      fs.writeFileSync(this.filePath, JSON.stringify(encrypted), 'utf8');
      return true;
    } catch (error) {
      console.error('Failed to save:', error);
      return false;
    }
  }

  load(): T | null {
    try {
      if (!fs.existsSync(this.filePath)) {
        return null;
      }
      const encrypted = JSON.parse(fs.readFileSync(this.filePath, 'utf8')) as EncryptedData;
      return this.decrypt(encrypted);
    } catch (error) {
      console.error('Failed to load:', error);
      return null;
    }
  }

  exists(): boolean {
    try {
      return fs.existsSync(this.filePath) && this.load() !== null;
    } catch {
      return false;
    }
  }

  clear(): boolean {
    try {
      if (fs.existsSync(this.filePath)) {
        fs.unlinkSync(this.filePath);
      }
      return true;
    } catch (error) {
      console.error('Failed to clear:', error);
      return false;
    }
  }

  getPath(): string {
    return this.filePath;
  }
}

