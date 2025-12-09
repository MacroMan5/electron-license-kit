/**
 * Logger module - Structured logging with file rotation
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LoggerConfig {
  appName: string;
  logDir?: string;
  maxFileSize?: number;
  maxFiles?: number;
  level?: LogLevel;
  console?: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

export class Logger {
  private readonly logDir: string;
  private readonly logFile: string;
  private readonly maxFileSize: number;
  private readonly maxFiles: number;
  private readonly minLevel: number;
  private readonly enableConsole: boolean;

  constructor(config: LoggerConfig) {
    this.logDir =
      config.logDir ??
      path.join(os.homedir(), 'AppData', 'Roaming', config.appName, 'logs');
    this.logFile = path.join(this.logDir, 'app.log');
    this.maxFileSize = config.maxFileSize ?? 5 * 1024 * 1024;
    this.maxFiles = config.maxFiles ?? 5;
    this.minLevel = LOG_LEVELS[config.level ?? 'info'];
    this.enableConsole = config.console ?? true;

    fs.mkdirSync(this.logDir, { recursive: true });
  }

  private formatMessage(level: LogLevel, message: string, meta?: object): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  private write(level: LogLevel, message: string, meta?: object): void {
    if (LOG_LEVELS[level] < this.minLevel) return;

    const formatted = this.formatMessage(level, message, meta);

    if (this.enableConsole) {
      const consoleFn = level === 'error' || level === 'fatal' ? console.error : console.warn;
      consoleFn(formatted);
    }

    try {
      fs.appendFileSync(this.logFile, `${formatted}\n`);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  debug(message: string, meta?: object): void {
    this.write('debug', message, meta);
  }

  info(message: string, meta?: object): void {
    this.write('info', message, meta);
  }

  warn(message: string, meta?: object): void {
    this.write('warn', message, meta);
  }

  error(message: string, meta?: object): void {
    this.write('error', message, meta);
  }

  fatal(message: string, meta?: object): void {
    this.write('fatal', message, meta);
  }

  rotateLogs(): void {
    try {
      if (!fs.existsSync(this.logFile)) return;

      const stats = fs.statSync(this.logFile);
      if (stats.size < this.maxFileSize) return;

      for (let i = this.maxFiles - 1; i >= 0; i -= 1) {
        const oldFile = i === 0 ? this.logFile : `${this.logFile}.${i}`;
        const newFile = `${this.logFile}.${i + 1}`;

        if (fs.existsSync(oldFile)) {
          if (i === this.maxFiles - 1) {
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

  getLogDir(): string {
    return this.logDir;
  }
}

export function createLogger(config: LoggerConfig): Logger {
  return new Logger(config);
}
