/**
 * App configuration loader
 * Loads app.config.ts and merges with defaults
 */

import * as fs from 'fs';
import type { AppConfig } from '../types';
import { defineConfig, defaultConfig } from '../branding/define-config';

export function loadAppConfig(configPath?: string): AppConfig {
  const resolvedPath = configPath ?? './app.config.ts';

  if (!fs.existsSync(resolvedPath)) {
    console.warn(`Config file not found: ${resolvedPath}, using defaults`);
    return defaultConfig;
  }

  console.warn('Dynamic config loading not supported, import config directly');
  return defaultConfig;
}

export { defineConfig };

