# Getting Started

This guide walks you through installing `electron-license-kit` and running your first app.

## 1. Requirements

- Node.js 20+
- pnpm 8+
- Git

## 2. Use the Vanilla Template (Recommended)

```bash
npx degit YOUR_USERNAME/electron-license-kit/templates/vanilla my-app
cd my-app
pnpm install

# Configure Supabase and branding in app.config.ts
cp .env.example .env
# Fill SUPABASE_URL and SUPABASE_ANON_KEY

pnpm dev
```

This template already wires:

- Main process: window creation, security, logger, updater, crash reporter.
- Preload script: safe `window.electronAPI` bridge.
- Renderer: custom titlebar + auth UI (login/register) using Supabase.

## 3. Install as a Library

If you already have an Electron app:

```bash
pnpm add electron-license-kit
```

Then create an `app.config.ts` and follow the main-process integration example in `README.md`.

## 4. Supabase Setup

To use the licensing system, you need a Supabase project:

1. Create a new Supabase project.
2. Open the SQL editor.
3. Copy and run `docs/supabase-schema.sql` from this repository.
4. Copy your `SUPABASE_URL` and `SUPABASE_ANON_KEY` into the `.env` file of your app.

After this, `LicenseService` in the template should be able to register and validate licenses.

