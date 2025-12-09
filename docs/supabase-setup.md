# Supabase Setup

This guide explains how to configure Supabase for use with `electron-license-kit` and the included template.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Note your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the project settings.

## 2. Apply the Schema

In your Supabase project:

1. Open the **SQL Editor**.
2. Create a new query.
3. Copy the contents of `docs/supabase-schema.sql` from this repository.
4. Run the query.

This will:

- Create the `public.licenses` table with all the fields used by `LicenseService`.
- Add indexes and constraints for performance and data integrity.
- Enable Row Level Security (RLS) with policies for authenticated and anonymous users.
- Create the `claim_license` RPC function that the template calls when registering a license.

## 3. Configure Environment Variables

In your Electron app (template or your own project):

1. Copy `.env.example` to `.env`.
2. Fill the values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
NODE_ENV=development
```

3. Ensure the main process loads environment files, e.g. using `loadEnvFiles` from `electron-license-kit`.

## 4. How LicenseService Uses Supabase

`LicenseService` uses:

- `supabase.auth` for user registration and login.
- `licenses` table to store:
  - `license_key`, `tier`, `status`, `expires_at` / `last_check`
  - `user_id` (link to `auth.users`)
  - `hwid` (hardware ID)
- `claim_license` RPC to atomically bind a license to a Supabase user + HWID.

The template’s IPC handlers create `LicenseService` like this:

```ts
import { LicenseService } from 'electron-license-kit';

const service = new LicenseService({
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
  licenseKeyPattern: appConfig.license.keyPattern,
  tableName: appConfig.supabase.tableName,
  claimRpcName: appConfig.supabase.claimFunction,
  appName: appConfig.app.name,
});
```

As long as you ran `supabase-schema.sql` and set `SUPABASE_URL` / `SUPABASE_ANON_KEY`, the template should be able to register users, claim licenses, and validate them offline using the encrypted cache.

