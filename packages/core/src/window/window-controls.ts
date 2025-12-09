/**
 * Window Controls - IPC handlers for minimize/maximize/close
 */

import { ipcMain, BrowserWindow } from 'electron';

export function registerWindowControls(window: BrowserWindow): void {
  ipcMain.on('window-minimize', () => {
    if (window && !window.isDestroyed()) {
      window.minimize();
    }
  });

  ipcMain.on('window-maximize', () => {
    if (window && !window.isDestroyed()) {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    }
  });

  ipcMain.on('window-close', () => {
    if (window && !window.isDestroyed()) {
      window.close();
    }
  });
}

export function unregisterWindowControls(): void {
  ipcMain.removeAllListeners('window-minimize');
  ipcMain.removeAllListeners('window-maximize');
  ipcMain.removeAllListeners('window-close');
}

