-- Migration: Add subscription tables for Stripe integration
-- Run this migration in your Supabase SQL editor

-- Add subscription columns to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days');

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_id TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'trial',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id)
);

-- Create subscription invoices table
CREATE TABLE IF NOT EXISTS subscription_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  invoice_url TEXT,
  invoice_pdf TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_org_id ON subscription_invoices(org_id);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer_id ON organizations(stripe_customer_id);

-- Enable RLS on new tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions table
CREATE POLICY "Users can view their organization's subscription"
  ON subscriptions FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM user_organizations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Only admins can update subscription"
  ON subscriptions FOR UPDATE
  USING (org_id IN (
    SELECT org_id FROM user_organizations 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- RLS Policies for subscription_invoices table
CREATE POLICY "Users can view their organization's invoices"
  ON subscription_invoices FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM user_organizations WHERE user_id = auth.uid()
  ));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_subscription_updated_at ON subscriptions;
CREATE TRIGGER trigger_update_subscription_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limit(
  p_org_id UUID,
  p_limit_type TEXT,
  p_current_count INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_plan TEXT;
  v_limit INTEGER;
  v_limits JSONB;
BEGIN
  -- Get the organization's plan
  SELECT subscription_plan INTO v_plan
  FROM organizations
  WHERE id = p_org_id;

  -- Define limits per plan
  v_limits := CASE v_plan
    WHEN 'free' THEN '{"employees": 5, "branches": 1, "users": 2, "products": 100}'::JSONB
    WHEN 'basico' THEN '{"employees": 10, "branches": 2, "users": 5, "products": 500}'::JSONB
    WHEN 'pro' THEN '{"employees": 50, "branches": 5, "users": 15, "products": 2000}'::JSONB
    WHEN 'enterprise' THEN '{"employees": -1, "branches": -1, "users": -1, "products": -1}'::JSONB
    ELSE '{"employees": 5, "branches": 1, "users": 2, "products": 100}'::JSONB
  END;

  v_limit := (v_limits->>p_limit_type)::INTEGER;

  -- -1 means unlimited
  IF v_limit = -1 THEN
    RETURN jsonb_build_object(
      'allowed', TRUE,
      'limit', 'unlimited',
      'current', p_current_count
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', p_current_count < v_limit,
    'limit', v_limit,
    'current', p_current_count,
    'remaining', GREATEST(0, v_limit - p_current_count)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_subscription_limit TO authenticated;

COMMENT ON TABLE subscriptions IS 'Stores Stripe subscription information for each organization';
COMMENT ON TABLE subscription_invoices IS 'Stores invoice history from Stripe for billing records';
