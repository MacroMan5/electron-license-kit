/**
 * Branding module - Theme configuration and CSS generation
 */

export { defineConfig, defaultConfig, defaultTheme } from './define-config';
export { presets } from './presets';
export { generateCSSVariables, generateStyleTag } from './css-generator';
export { injectTheme, injectThemeOnReady } from './theme-injector';

