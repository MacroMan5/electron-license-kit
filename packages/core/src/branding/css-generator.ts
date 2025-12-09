/**
 * Generates CSS variables from theme configuration
 */

import type { ThemeColors } from '../types';

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  const r = result[1] ?? '00';
  const g = result[2] ?? '00';
  const b = result[3] ?? '00';
  return `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}`;
}

export function generateCSSVariables(theme: ThemeColors): string {
  return `:root {
  /* Primary */
  --elk-primary: ${theme.primary};
  --elk-primary-hover: ${theme.primaryHover};
  --elk-primary-text: ${theme.primaryText};
  --elk-primary-rgb: ${hexToRgb(theme.primary)};

  /* Backgrounds */
  --elk-bg: ${theme.background};
  --elk-bg-secondary: ${theme.backgroundSecondary};
  --elk-bg-tertiary: ${theme.backgroundTertiary};

  /* Text */
  --elk-text: ${theme.text};
  --elk-text-secondary: ${theme.textSecondary};
  --elk-text-tertiary: ${theme.textTertiary};

  /* Semantic */
  --elk-success: ${theme.success};
  --elk-warning: ${theme.warning};
  --elk-error: ${theme.error};
  --elk-info: ${theme.info};

  /* Border */
  --elk-border: ${theme.border};
  --elk-divider: ${theme.divider};

  /* Titlebar */
  --elk-titlebar-bg: ${theme.titlebar.background};
  --elk-titlebar-text: ${theme.titlebar.text};
  --elk-titlebar-btn-hover: ${theme.titlebar.buttonHover};
  --elk-titlebar-btn-close: ${theme.titlebar.buttonClose};

  /* Computed */
  --elk-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
  --elk-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.5);
  --elk-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --elk-radius-sm: 4px;
  --elk-radius-md: 8px;
  --elk-radius-lg: 12px;
  --elk-radius-full: 9999px;
}`;
}

export function generateStyleTag(theme: ThemeColors): string {
  return `<style id="elk-theme">\n${generateCSSVariables(theme)}\n</style>`;
}
