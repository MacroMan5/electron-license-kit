import { describe, it, expect } from 'vitest';

describe('electron-license-kit', () => {
  it('should export core modules', async () => {
    // Basic smoke test to ensure the package can be imported
    const exports = await import('../index');
    
    expect(exports).toBeDefined();
    expect(typeof exports).toBe('object');
  });

  it('should have license service exports', async () => {
    const { LicenseService } = await import('../license');
    expect(LicenseService).toBeDefined();
  });

  it('should have secure storage exports', async () => {
    const { SecureStorage } = await import('../storage');
    expect(SecureStorage).toBeDefined();
  });

  it('should have window manager exports', async () => {
    const { createMainWindow, registerWindowControls, enforceSingleInstance } = await import('../window');
    expect(createMainWindow).toBeDefined();
    expect(registerWindowControls).toBeDefined();
    expect(enforceSingleInstance).toBeDefined();
  });

  it('should have branding exports', async () => {
    const { defineConfig, generateCSSVariables, presets } = await import('../branding');
    expect(defineConfig).toBeDefined();
    expect(generateCSSVariables).toBeDefined();
    expect(presets).toBeDefined();
  });
});
