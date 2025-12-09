/**
 * Hardware ID Generator
 */

import * as crypto from 'crypto';
import * as os from 'os';
import { machineIdSync } from 'node-machine-id';
import type { HWIDComponents } from '../types';

function getMachineId(): string {
  try {
    return machineIdSync(true);
  } catch {
    return os.hostname() + os.userInfo().username;
  }
}

function getCPUModel(): string {
  const cpus = os.cpus();
  const first = cpus[0];
  return first?.model ?? 'unknown';
}

export function getHWIDComponents(): HWIDComponents {
  return {
    machineId: getMachineId(),
    platform: os.platform(),
    arch: os.arch(),
    cpuModel: getCPUModel(),
  };
}

export function generateHWID(): string {
  const components = getHWIDComponents();

  const combined = [
    components.machineId,
    components.platform,
    components.arch,
    components.cpuModel,
  ].join('|');

  const hash = crypto.createHash('sha256');
  hash.update(combined);

  return hash.digest('hex');
}
