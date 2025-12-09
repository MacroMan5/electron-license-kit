/**
 * Window Manager - Create and configure BrowserWindow
 */

import { BrowserWindow, app } from 'electron';
import type { WindowConfig } from '../types';

export function createMainWindow(config: WindowConfig): BrowserWindow {
  const window = new BrowserWindow({
    width: config.width ?? 800,
    height: config.height ?? 600,
    minWidth: config.minWidth ?? 700,
    minHeight: config.minHeight ?? 500,
    frame: config.frame ?? false,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: config.preloadPath,
      sandbox: true,
      webSecurity: true,
    },
    backgroundColor: config.backgroundColor ?? '#0a0a0f',
    show: false,
  });

  void window.loadFile(config.htmlPath);

  window.once('ready-to-show', () => {
    window.show();
  });

  const shouldOpenDevTools = config.devTools ?? process.argv.includes('--dev');
  if (shouldOpenDevTools && !app.isPackaged) {
    window.webContents.openDevTools();
  }

  return window;
}

