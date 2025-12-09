/**
 * IPC Handlers
 * Register custom IPC handlers here
 */

import { ipcMain } from 'electron';
import { LicenseService, type AppConfig } from 'electron-license-kit';

let licenseService: LicenseService | null = null;

export function registerIpcHandlers(appConfig: AppConfig): void {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    licenseService = new LicenseService({
      supabaseUrl,
      supabaseAnonKey: supabaseKey,
      licenseKeyPattern: appConfig.license.keyPattern,
      tableName: appConfig.supabase.tableName,
      claimRpcName: appConfig.supabase.claimFunction,
      appName: appConfig.app.name,
    });
  }

  ipcMain.handle('auth-login', async (_event, email: string, password: string) => {
    if (!licenseService) {
      throw new Error('License service not configured. Check .env file.');
    }
    return licenseService.login(email, password);
  });

  ipcMain.handle(
    'auth-register',
    async (_event, email: string, password: string, licenseKey: string) => {
      if (!licenseService) {
        throw new Error('License service not configured. Check .env file.');
      }
      return licenseService.register(email, password, licenseKey);
    },
  );

  ipcMain.handle('auth-validate', async () => {
    if (!licenseService) {
      return { valid: false, error: 'License service not configured' };
    }
    return licenseService.validate();
  });

  ipcMain.handle('auth-logout', async () => {
    if (licenseService) {
      await licenseService.logout();
    }
  });

  ipcMain.handle('auth-reset-password', async (_event, email: string) => {
    if (!licenseService) {
      throw new Error('License service not configured');
    }
    return licenseService.resetPassword(email);
  });

  ipcMain.handle('auth-get-status', () => {
    if (!licenseService) {
      return null;
    }
    return licenseService.getStatus();
  });

  ipcMain.handle('get-app-info', () => ({
    name: appConfig.app.name,
    version: appConfig.app.version,
  }));
}

