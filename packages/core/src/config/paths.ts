/**
 * Application paths helper
 */

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export interface AppPaths {
  userData: string;
  appData: string;
  logs: string;
  cache: string;
  config: string;
}

export function getAppPaths(appName: string): AppPaths {
  const appData = path.join(os.homedir(), 'AppData', 'Roaming', appName);

  const paths: AppPaths = {
    userData: appData,
    appData,
    logs: path.join(appData, 'logs'),
    cache: path.join(appData, 'cache'),
    config: path.join(appData, 'config'),
  };

  const allDirs: string[] = [
    paths.userData,
    paths.appData,
    paths.logs,
    paths.cache,
    paths.config,
  ];

  for (const dir of allDirs) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return paths;
}
