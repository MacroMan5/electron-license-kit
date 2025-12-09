/**
 * Crash Reporter - Error handling and crash logging
 */

import { app, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import type { LogLevel } from '../logger';

export interface CrashReporterConfig {
  appName: string;
  logDir?: string;
  maxCrashReports?: number;
  onCrash?: (report: CrashReport) => void;
}

export interface CrashReport {
  timestamp: string;
  type: string;
  message: string;
  version: string;
  platform: string;
  arch: string;
  nodeVersion: string;
  electronVersion: string;
}

export class CrashReporter {
  private readonly logDir: string;
  private readonly maxReports: number;
  private readonly onCrash?: (report: CrashReport) => void;
  private readonly appName: string;
  private initialized = false;

  constructor(config: CrashReporterConfig) {
    this.appName = config.appName;
    this.logDir = config.logDir ?? this.getDefaultLogDir();
    this.maxReports = config.maxCrashReports ?? 10;
    this.onCrash = config.onCrash;
  }

  private getDefaultLogDir(): string {
    try {
      return path.join(app.getPath('userData'), 'logs');
    } catch {
      return path.join(process.cwd(), 'logs');
    }
  }

  initialize(): void {
    if (this.initialized) return;

    fs.mkdirSync(this.logDir, { recursive: true });

    process.on('uncaughtException', (error) => {
      this.handleCrash('uncaughtException', error);
    });

    process.on('unhandledRejection', (reason) => {
      this.handleCrash('unhandledRejection', reason);
    });

    this.initialized = true;
    this.log('info', `${this.appName} crash reporter initialized`);
  }

  private handleCrash(type: string, error: unknown): void {
    const errorMessage =
      error instanceof Error
        ? `${error.message}\n${error.stack ?? ''}`
        : String(error);

    const report: CrashReport = {
      timestamp: new Date().toISOString(),
      type,
      message: errorMessage,
      version: app.isPackaged ? app.getVersion() : 'development',
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      electronVersion: process.versions.electron ?? 'unknown',
    };

    const crashFile = path.join(this.logDir, `crash-${Date.now()}.json`);
    try {
      fs.writeFileSync(crashFile, JSON.stringify(report, null, 2));
    } catch (writeError) {
      console.error('Failed to write crash report:', writeError);
    }

    this.log('fatal', `[${type}] ${errorMessage}`);

    if (this.onCrash) {
      this.onCrash(report);
    }

    if (app.isReady()) {
      dialog.showErrorBox(
        `${this.appName} Error`,
        `An unexpected error occurred:\n\n${
          error instanceof Error ? error.message : String(error)
        }\n\nCrash report saved to:\n${crashFile}\n\nPlease restart the application.`,
      );
    }

    app.exit(1);
  }

  log(level: LogLevel, message: string): void {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

    const logFile = path.join(this.logDir, 'app.log');
    try {
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error('Failed to write log:', error);
    }

    console.error(logLine.trim());
  }

  rotateLogs(): void {
    const logFile = path.join(this.logDir, 'app.log');
    const maxSize = 5 * 1024 * 1024;
    const maxFiles = 5;

    try {
      if (!fs.existsSync(logFile)) return;

      const stats = fs.statSync(logFile);
      if (stats.size < maxSize) return;

      for (let i = maxFiles - 1; i >= 0; i -= 1) {
        const oldFile = i === 0 ? logFile : `${logFile}.${i}`;
        const newFile = `${logFile}.${i + 1}`;

        if (fs.existsSync(oldFile)) {
          if (i === maxFiles - 1) {
            fs.unlinkSync(oldFile);
          } else {
            fs.renameSync(oldFile, newFile);
          }
        }
      }
    } catch (error) {
      console.error('Failed to rotate logs:', error);
    }
  }

  cleanOldCrashReports(): void {
    try {
      const files = fs
        .readdirSync(this.logDir)
        .filter((f) => f.startsWith('crash-') && f.endsWith('.json'))
        .map((f) => ({
          name: f,
          path: path.join(this.logDir, f),
          time: fs.statSync(path.join(this.logDir, f)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);

      for (let i = this.maxReports; i < files.length; i += 1) {
        const file = files[i];
        if (!file) {
          continue;
        }
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error('Failed to clean crash reports:', error);
    }
  }
}

let crashReporterInstance: CrashReporter | null = null;

export function getCrashReporter(config: CrashReporterConfig): CrashReporter {
  if (!crashReporterInstance) {
    crashReporterInstance = new CrashReporter(config);
  }
  return crashReporterInstance;
}
