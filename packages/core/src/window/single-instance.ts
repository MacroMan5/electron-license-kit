/**
 * Single Instance - Prevent multiple app instances
 */

import { app, BrowserWindow } from 'electron';
import type { SingleInstanceConfig } from '../types';

export function enforceSingleInstance(config?: SingleInstanceConfig): boolean {
  const gotLock = app.requestSingleInstanceLock();

  if (!gotLock) {
    return false;
  }

  app.on('second-instance', (_event, argv) => {
    if (config?.onSecondInstance) {
      config.onSecondInstance(argv);
    }

    const windows = BrowserWindow.getAllWindows();
    const mainWindow = windows[0];
    if (!mainWindow) {
      return;
    }
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  });

  return true;
}
