# Theming & Branding

`electron-license-kit` provides a simple but powerful theming system:

- Configuration-driven colors in `app.config.ts`.
- CSS variables injected into the renderer (`--elk-*`).
- A set of built-in presets for quick setup.

## Theme in `app.config.ts`

```ts
import { defineConfig } from 'electron-license-kit';

export default defineConfig({
  // ...
  theme: {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    primaryText: '#ffffff',
    background: '#0a0a0f',
    backgroundSecondary: '#111118',
    backgroundTertiary: '#1a1a24',
    text: '#ffffff',
    textSecondary: '#a1a1aa',
    textTertiary: '#71717a',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    border: '#27272a',
    divider: '#3f3f46',
    titlebar: {
      background: '#0a0a0f',
      text: '#ffffff',
      buttonHover: '#27272a',
      buttonClose: '#ef4444',
    },
  },
});
```

## Theme Presets

From the core package you can also import presets:

```ts
import { defaultTheme, presets } from 'electron-license-kit';

// presets.dark, presets.light, presets.midnight, presets.forest
```

You can start from a preset and override fields in `app.config.ts`.

## CSS Variables

At runtime, `injectTheme` / `injectThemeOnReady` generate CSS like:

```css
:root {
  --elk-primary: #6366f1;
  --elk-primary-hover: #4f46e5;
  --elk-primary-text: #ffffff;
  /* ... */
}
```

You can use these variables anywhere in your renderer styles, e.g.:

```css
.btn-primary {
  background: var(--elk-primary);
  color: var(--elk-primary-text);
}
```

The vanilla template already includes a base `theme.css` file that defines fallback values and documents the available variables.

