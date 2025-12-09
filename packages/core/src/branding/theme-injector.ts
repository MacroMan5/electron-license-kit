/**
 * Injects theme CSS variables into BrowserWindow
 */

import type { BrowserWindow } from 'electron';
import type { ThemeColors } from '../types';
import { generateCSSVariables } from './css-generator';

export async function injectTheme(
  window: BrowserWindow,
  theme: ThemeColors,
): Promise<void> {
  const css = generateCSSVariables(theme);

  await window.webContents.executeJavaScript(`
    (function() {
      const existing = document.getElementById('elk-theme');
      if (existing) existing.remove();

      const style = document.createElement('style');
      style.id = 'elk-theme';
      style.textContent = ${JSON.stringify(css)};
      document.head.appendChild(style);
    })();
  `);
}

export function injectThemeOnReady(
  window: BrowserWindow,
  theme: ThemeColors,
): void {
  window.webContents.on('dom-ready', () => {
    void injectTheme(window, theme);
  });
}

