-- Migration: Create audit_logs table for security and compliance
-- This table stores all critical operations for audit trail

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    ip_address text,
    created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON public.audit_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only org admins can read audit logs
CREATE POLICY "org admins read audit logs"
ON public.audit_logs FOR SELECT
USING (
    org_id IN (SELECT org_id FROM orgs_for_user())
    AND EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = auth.uid()
        AND org_id = audit_logs.org_id
        AND role = 'admin'
    )
);

-- System can insert audit logs (using service role)
CREATE POLICY "system insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);

-- No updates or deletes allowed (audit logs are immutable)
-- This ensures audit trail integrity

-- Add comment
COMMENT ON TABLE public.audit_logs IS 'Audit trail for critical operations. Immutable for compliance.';
