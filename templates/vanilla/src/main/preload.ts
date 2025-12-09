/**
 * Preload Script
 * Exposes safe APIs to the renderer process
 */

import { contextBridge, ipcRenderer } from 'electron';

declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}

const electronAPI = {
  minimizeWindow: (): void => ipcRenderer.send('window-minimize'),
  maximizeWindow: (): void => ipcRenderer.send('window-maximize'),
  closeWindow: (): void => ipcRenderer.send('window-close'),
  login: (email: string, password: string): Promise<unknown> =>
    ipcRenderer.invoke('auth-login', email, password),
  register: (email: string, password: string, licenseKey: string): Promise<unknown> =>
    ipcRenderer.invoke('auth-register', email, password, licenseKey),
  validateLicense: (): Promise<unknown> => ipcRenderer.invoke('auth-validate'),
  logout: (): Promise<void> => ipcRenderer.invoke('auth-logout'),
  resetPassword: (email: string): Promise<boolean> =>
    ipcRenderer.invoke('auth-reset-password', email),
  getLicenseStatus: (): Promise<unknown> => ipcRenderer.invoke('auth-get-status'),
  getVersion: (): Promise<{ version: string; isPackaged: boolean }> =>
    ipcRenderer.invoke('get-version'),
  checkForUpdates: (): Promise<{ updateAvailable: boolean; version?: string }> =>
    ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: (): Promise<boolean> => ipcRenderer.invoke('download-update'),
  installUpdate: (): Promise<void> => ipcRenderer.invoke('install-update'),
  onUpdateStatus: (callback: (status: unknown) => void): void => {
    ipcRenderer.on('update-status', (_event, status) => callback(status));
  },
  openExternal: (url: string): Promise<boolean> => ipcRenderer.invoke('open-external', url),
  getAppInfo: (): Promise<{ name: string; version: string }> =>
    ipcRenderer.invoke('get-app-info'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

