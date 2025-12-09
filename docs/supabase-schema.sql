-- ============================================================================
-- electron-license-kit Supabase schema (licenses)
-- Source: C:\DEV\macroman-setup\supabase\migrations
-- This script creates the same licenses schema you use in production,
-- plus the `claim_license` RPC expected by LicenseService.
-- Run it in your Supabase project's SQL editor.
-- ============================================================================

-- Enable pgcrypto for gen_random_uuid (usually already enabled on Supabase)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- Helper function: update_updated_at
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- ----------------------------------------------------------------------------
-- Licenses table (lifetime-only version)
-- Based on 00002_licenses_table.sql
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  license_key TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'lifetime',
  status TEXT NOT NULL DEFAULT 'active',
  hwid TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_payment_intent_id TEXT,
  email TEXT,
  product TEXT DEFAULT 'pubg',
  discord_user_id TEXT,
  discord_username TEXT,
  discord_role_assigned BOOLEAN DEFAULT FALSE,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  last_check TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tier constraint: lifetime-only
ALTER TABLE public.licenses
  DROP CONSTRAINT IF EXISTS licenses_tier_check;

ALTER TABLE public.licenses
  ADD CONSTRAINT licenses_tier_check CHECK (tier = 'lifetime');

-- Status constraint
ALTER TABLE public.licenses
  DROP CONSTRAINT IF EXISTS licenses_status_check;

ALTER TABLE public.licenses
  ADD CONSTRAINT licenses_status_check
  CHECK (status = ANY (ARRAY['active', 'expired', 'revoked', 'upgraded']));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_licenses_key
  ON public.licenses (license_key);

CREATE INDEX IF NOT EXISTS idx_licenses_user
  ON public.licenses (user_id);

CREATE INDEX IF NOT EXISTS idx_licenses_status
  ON public.licenses (status);

CREATE INDEX IF NOT EXISTS idx_licenses_discord_user
  ON public.licenses (discord_user_id);

CREATE INDEX IF NOT EXISTS idx_licenses_product
  ON public.licenses (product);

CREATE UNIQUE INDEX IF NOT EXISTS idx_licenses_payment_intent
  ON public.licenses (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_licenses_discord_active_created
  ON public.licenses (discord_user_id, status, created_at DESC);

-- Trigger: auto-update updated_at
DROP TRIGGER IF EXISTS licenses_updated_at ON public.licenses;

CREATE TRIGGER licenses_updated_at
  BEFORE UPDATE ON public.licenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime for this table (optional but matches your setup)
ALTER PUBLICATION supabase_realtime ADD TABLE public.licenses;

-- ----------------------------------------------------------------------------
-- Row-Level Security policies (based on 00003/00005/00006)
-- ----------------------------------------------------------------------------

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own license" ON public.licenses;
DROP POLICY IF EXISTS "Users can update own license" ON public.licenses;
DROP POLICY IF EXISTS "Anon can check unclaimed license" ON public.licenses;
DROP POLICY IF EXISTS "Anon can claim license" ON public.licenses;

CREATE POLICY "Users can view own license"
  ON public.licenses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own license"
  ON public.licenses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anon can check unclaimed license"
  ON public.licenses
  FOR SELECT
  TO anon
  USING (user_id IS NULL);

-- Fixed version with WITH CHECK (from 00005_fix_anon_claim_policy.sql)
CREATE POLICY "Anon can claim license"
  ON public.licenses
  FOR UPDATE
  TO anon
  USING (user_id IS NULL)
  WITH CHECK (TRUE);

COMMENT ON POLICY "Users can view own license" ON public.licenses IS
  'Authenticated users can only view licenses linked to their auth.uid()';

COMMENT ON POLICY "Users can update own license" ON public.licenses IS
  'Authenticated users can update their own license (HWID binding, etc.)';

COMMENT ON POLICY "Anon can check unclaimed license" ON public.licenses IS
  'Anonymous users can check if a license key exists and is unclaimed';

COMMENT ON POLICY "Anon can claim license" ON public.licenses IS
  'Anonymous users can claim an unclaimed license by setting user_id';

COMMENT ON TABLE public.licenses IS
  'MacroMan / electron-license-kit licenses - lifetime-only model';

-- ----------------------------------------------------------------------------
-- Helper: generate_license_key (optional, for backoffice/tools)
-- Based on 00001_functions.sql
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.generate_license_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := 'MM-';
  i INTEGER;
  j INTEGER;
BEGIN
  FOR i IN 1..3 LOOP
    FOR j IN 1..4 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    IF i < 3 THEN
      result := result || '-';
    END IF;
  END LOOP;
  RETURN result;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.generate_license_key() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_license_key() TO service_role;

-- ----------------------------------------------------------------------------
-- RPC: claim_license
-- This is the function used by LicenseService in electron-license-kit.
-- It validates and binds a license key to a Supabase auth user.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.claim_license(
  p_license_key TEXT,
  p_user_id UUID,
  p_hwid TEXT
) RETURNS JSON AS $$
DECLARE
  v_license public.licenses%ROWTYPE;
BEGIN
  -- Look up license by key (normalized)
  SELECT * INTO v_license
  FROM public.licenses
  WHERE UPPER(license_key) = UPPER(p_license_key);

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'License key not found'
    );
  END IF;

  -- Already activated
  IF v_license.user_id IS NOT NULL AND v_license.user_id <> p_user_id THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'License already activated'
    );
  END IF;

  -- Must be active
  IF v_license.status IS NULL OR v_license.status <> 'active' THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'License is ' || COALESCE(v_license.status, 'unknown')
    );
  END IF;

  -- Bind to user + HWID and mark activation
  UPDATE public.licenses
  SET
    user_id = p_user_id,
    hwid = p_hwid,
    activated_at = COALESCE(v_license.activated_at, NOW()),
    last_check = NOW(),
    updated_at = NOW()
  WHERE id = v_license.id;

  RETURN json_build_object('success', TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

