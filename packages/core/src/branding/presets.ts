/**
 * Built-in theme presets
 */

import type { ThemeColors } from '../types';

export const darkPreset: Partial<ThemeColors> = {
  primary: '#6366f1',
  primaryHover: '#4f46e5',
  primaryText: '#ffffff',
  background: '#0a0a0f',
  backgroundSecondary: '#111118',
  backgroundTertiary: '#1a1a24',
  text: '#ffffff',
  textSecondary: '#a1a1aa',
  textTertiary: '#71717a',
  border: '#27272a',
  divider: '#3f3f46',
};

export const lightPreset: Partial<ThemeColors> = {
  primary: '#4f46e5',
  primaryHover: '#4338ca',
  primaryText: '#ffffff',
  background: '#ffffff',
  backgroundSecondary: '#f4f4f5',
  backgroundTertiary: '#e4e4e7',
  text: '#18181b',
  textSecondary: '#52525b',
  textTertiary: '#a1a1aa',
  border: '#e4e4e7',
  divider: '#d4d4d8',
};

export const midnightPreset: Partial<ThemeColors> = {
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  primaryText: '#ffffff',
  background: '#0f172a',
  backgroundSecondary: '#1e293b',
  backgroundTertiary: '#334155',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',
  border: '#334155',
  divider: '#475569',
};

export const forestPreset: Partial<ThemeColors> = {
  primary: '#22c55e',
  primaryHover: '#16a34a',
  primaryText: '#ffffff',
  background: '#0a0f0a',
  backgroundSecondary: '#111811',
  backgroundTertiary: '#1a241a',
  text: '#f0fdf4',
  textSecondary: '#86efac',
  textTertiary: '#4ade80',
  border: '#27372a',
  divider: '#3f4f46',
};

export const presets = {
  dark: darkPreset,
  light: lightPreset,
  midnight: midnightPreset,
  forest: forestPreset,
} as const;

