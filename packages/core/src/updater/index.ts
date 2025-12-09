/**
 * Auto-Updater module - electron-updater wrapper
 */

import { app, BrowserWindow, ipcMain } from 'electron';

export interface UpdaterConfig {
  autoDownload?: boolean;
  autoInstallOnQuit?: boolean;
  checkInterval?: number;
}

export interface UpdateStatus {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  version?: string;
  percent?: number;
  error?: string;
}

export class AutoUpdater {
  private autoUpdater: typeof import('electron-updater').autoUpdater | null = null;
  private updateAvailable = false;
  private updateDownloaded = false;
  private enabled = false;

  initialize(config?: UpdaterConfig): boolean {
    if (!app.isPackaged) {
      console.warn('Auto-updater disabled in development mode');
      return false;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { autoUpdater } = require('electron-updater') as typeof import('electron-updater');
      this.autoUpdater = autoUpdater;

      this.autoUpdater.autoDownload = config?.autoDownload ?? false;
      this.autoUpdater.autoInstallOnAppQuit = config?.autoInstallOnQuit ?? true;

      this.setupEventHandlers();
      this.enabled = true;

      const checkInterval = config?.checkInterval ?? 5000;
      setTimeout(() => {
        void this.checkForUpdates();
      }, checkInterval);

      return true;
    } catch (error) {
      console.error('Failed to initialize auto-updater:', error);
      return false;
    }
  }

  private setupEventHandlers(): void {
    if (!this.autoUpdater) return;

    this.autoUpdater.on('checking-for-update', () => {
      this.notifyRenderer({ status: 'checking' });
    });

    this.autoUpdater.on('update-available', (info) => {
      this.updateAvailable = true;
      this.notifyRenderer({
        status: 'available',
        version: info.version,
      });
    });

    this.autoUpdater.on('update-not-available', (info) => {
      this.updateAvailable = false;
      this.notifyRenderer({
        status: 'not-available',
        version: info.version,
      });
    });

    this.autoUpdater.on('download-progress', (progress) => {
      this.notifyRenderer({
        status: 'downloading',
        percent: progress.percent,
      });
    });

    this.autoUpdater.on('update-downloaded', (info) => {
      this.updateDownloaded = true;
      this.notifyRenderer({
        status: 'downloaded',
        version: info.version,
      });
    });

    this.autoUpdater.on('error', (error) => {
      this.notifyRenderer({
        status: 'error',
        error: error.message,
      });
    });
  }

  private notifyRenderer(status: UpdateStatus): void {
    const windows = BrowserWindow.getAllWindows();
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send('update-status', status);
      }
    }
  }

  async checkForUpdates(): Promise<{ updateAvailable: boolean; version?: string }> {
    if (!this.enabled || !this.autoUpdater) {
      return { updateAvailable: false };
    }

    try {
      const result = await this.autoUpdater.checkForUpdates();
      return {
        updateAvailable: this.updateAvailable,
        version: result?.updateInfo?.version,
      };
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return { updateAvailable: false };
    }
  }

  async downloadUpdate(): Promise<boolean> {
    if (!this.enabled || !this.autoUpdater || !this.updateAvailable) {
      return false;
    }

    try {
      await this.autoUpdater.downloadUpdate();
      return true;
    } catch (error) {
      console.error('Failed to download update:', error);
      return false;
    }
  }

  installUpdate(): void {
    if (!this.enabled || !this.autoUpdater || !this.updateDownloaded) {
      return;
    }

    this.autoUpdater.quitAndInstall(false, true);
  }

  getStatus(): { enabled: boolean; updateAvailable: boolean; updateDownloaded: boolean } {
    return {
      enabled: this.enabled,
      updateAvailable: this.updateAvailable,
      updateDownloaded: this.updateDownloaded,
    };
  }
}

export function registerUpdaterHandlers(): void {
  const updater = new AutoUpdater();

  ipcMain.handle('get-version', () => ({
    version: app.getVersion(),
    isPackaged: app.isPackaged,
  }));

  ipcMain.handle('check-for-updates', async () => updater.checkForUpdates());

  ipcMain.handle('download-update', async () => updater.downloadUpdate());

  ipcMain.handle('install-update', () => {
    updater.installUpdate();
  });

  ipcMain.handle('get-update-status', () => updater.getStatus());
}
