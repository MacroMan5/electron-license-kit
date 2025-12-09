/**
 * Security module - App hardening utilities
 */

import { BrowserWindow, shell, ipcMain } from 'electron';
import type { SecurityPolicyConfig } from '../types';

export function setupSecurityPolicy(
  window: BrowserWindow,
  config?: SecurityPolicyConfig,
): void {
  const allowedDomains = config?.allowedExternalDomains ?? [];

  window.webContents.on('will-navigate', (event, url) => {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'file:') {
        event.preventDefault();
        console.warn(`Blocked navigation to: ${url}`);
      }
    } catch (error) {
      event.preventDefault();
      console.error(`Blocked malformed URL: ${url}`, error);
    }
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    console.warn(`Blocked new window: ${url}`);
    return { action: 'deny' };
  });

  ipcMain.handle('open-external', async (_event, url: string) => {
    try {
      const parsedUrl = new URL(url);

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        console.warn(`Blocked non-http URL: ${url}`);
        return false;
      }

      if (allowedDomains.length > 0) {
        const isAllowed = allowedDomains.some(
          (domain) =>
            parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`),
        );
        if (!isAllowed) {
          console.warn(`Blocked non-whitelisted domain: ${url}`);
          return false;
        }
      }

      await shell.openExternal(url);
      return true;
    } catch (error) {
      console.error(`Failed to open external URL: ${url}`, error);
      return false;
    }
  });
}

export function createNavigationGuard(window: BrowserWindow): void {
  window.webContents.on('will-navigate', (event, url) => {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'file:') {
        event.preventDefault();
      }
    } catch {
      event.preventDefault();
    }
  });

  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
}

export function validateIpcChannel(channel: string, allowedChannels: string[]): boolean {
  return allowedChannels.includes(channel);
}

