/**
 * Main Process Entry Point
 * Built with electron-license-kit
 */

import { app, BrowserWindow } from 'electron';
import path from 'path';
import {
  createMainWindow,
  registerWindowControls,
  enforceSingleInstance,
  setupSecurityPolicy,
  createLogger,
  CrashReporter,
  AutoUpdater,
  registerUpdaterHandlers,
  injectTheme,
  loadEnvFiles,
} from 'electron-license-kit';
import { registerIpcHandlers } from './ipc-handlers';
import appConfig from '../../app.config';

loadEnvFiles(path.join(__dirname, '../..'), app.isPackaged);

const crashReporter = new CrashReporter({ appName: appConfig.app.name });
crashReporter.initialize();
crashReporter.rotateLogs();
crashReporter.cleanOldCrashReports();
crashReporter.log('info', `${appConfig.app.name} v${appConfig.app.version} starting...`);

if (appConfig.features.singleInstance && !enforceSingleInstance()) {
  crashReporter.log('info', 'Another instance running, quitting...');
  app.quit();
  process.exit(0);
}

const logger = createLogger({
  appName: appConfig.app.name,
  level: app.isPackaged ? 'info' : 'debug',
});

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  logger.info('Creating main window');

  mainWindow = createMainWindow({
    ...appConfig.window,
    backgroundColor: appConfig.theme.background,
    preloadPath: path.join(__dirname, 'preload.js'),
    htmlPath: path.join(__dirname, '../renderer/index.html'),
    devTools: appConfig.features.devTools,
  });

  mainWindow.webContents.on('dom-ready', () => {
    if (mainWindow) {
      void injectTheme(mainWindow, appConfig.theme);
    }
  });

  registerWindowControls(mainWindow);

  setupSecurityPolicy(mainWindow, {
    allowedExternalDomains: ['github.com', 'supabase.co'],
    enableDevTools: appConfig.features.devTools,
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  logger.info('Main window created');
}

registerIpcHandlers(appConfig);
registerUpdaterHandlers();

app.whenReady().then(() => {
  createWindow();

  if (app.isPackaged && appConfig.features.autoUpdater) {
    const updater = new AutoUpdater();
    if (updater.initialize({ checkInterval: 5000 })) {
      logger.info('Auto-updater initialized');
    }
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  logger.info('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  crashReporter.log('info', 'Application exiting normally');
});

