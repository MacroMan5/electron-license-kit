/**
 * Environment file loader
 */

import * as fs from 'fs';
import * as path from 'path';

export function loadEnvFile(envPath: string): boolean {
  if (!fs.existsSync(envPath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const [, rawKey = '', rawValue = ''] = match;
        const key = rawKey.trim();
        const value = rawValue.trim();
        if (!(key in process.env)) {
          process.env[key] = value;
        }
      }
    }
    return true;
  } catch (error) {
    console.error(`Failed to load env file: ${envPath}`, error);
    return false;
  }
}

export function loadEnvFiles(basePath: string, isPackaged: boolean): string | null {
  const envFiles = isPackaged
    ? [path.join(basePath, '.env.production'), path.join(basePath, '.env')]
    : [
        path.join(basePath, '.env.development'),
        path.join(basePath, '.env.local'),
        path.join(basePath, '.env'),
      ];

  for (const envPath of envFiles) {
    if (loadEnvFile(envPath)) {
      return envPath;
    }
  }

  return null;
}
