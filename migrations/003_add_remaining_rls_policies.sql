-- Migration: Add RLS policies for remaining tables without policies
-- This ensures complete tenant isolation across all tables

-- ============================================
-- BRANCHES TABLE
-- ============================================
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org members read branches" ON public.branches;
DROP POLICY IF EXISTS "org members insert branches" ON public.branches;
DROP POLICY IF EXISTS "org members update branches" ON public.branches;
DROP POLICY IF EXISTS "org members delete branches" ON public.branches;

CREATE POLICY "org members read branches"
ON public.branches FOR SELECT
USING (org_id IN (SELECT org_id FROM orgs_for_user()));

CREATE POLICY "org members insert branches"
ON public.branches FOR INSERT
WITH CHECK (org_id IN (SELECT org_id FROM orgs_for_user()));

CREATE POLICY "org members update branches"
ON public.branches FOR UPDATE
USING (org_id IN (SELECT org_id FROM orgs_for_user()))
WITH CHECK (org_id IN (SELECT org_id FROM orgs_for_user()));

CREATE POLICY "org members delete branches"
ON public.branches FOR DELETE
USING (org_id IN (SELECT org_id FROM orgs_for_user()));

-- ============================================
-- ORGANIZATION_MEMBERS TABLE
-- ============================================
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org members read members" ON public.organization_members;
DROP POLICY IF EXISTS "org admins insert members" ON public.organization_members;
DROP POLICY IF EXISTS "org admins update members" ON public.organization_members;
DROP POLICY IF EXISTS "org admins delete members" ON public.organization_members;

CREATE POLICY "org members read members"
ON public.organization_members FOR SELECT
USING (org_id IN (SELECT org_id FROM orgs_for_user()));

CREATE POLICY "org admins insert members"
ON public.organization_members FOR INSERT
WITH CHECK (
  org_id IN (SELECT org_id FROM orgs_for_user())
  AND EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = auth.uid()
    AND org_id = organization_members.org_id
    AND role = 'admin'
  )
);

CREATE POLICY "org admins update members"
ON public.organization_members FOR UPDATE
USING (
  org_id IN (SELECT org_id FROM orgs_for_user())
  AND EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = auth.uid()
    AND org_id = organization_members.org_id
    AND role = 'admin'
  )
)
WITH CHECK (
  org_id IN (SELECT org_id FROM orgs_for_user())
);

CREATE POLICY "org admins delete members"
ON public.organization_members FOR DELETE
USING (
  org_id IN (SELECT org_id FROM orgs_for_user())
  AND EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = auth.uid()
    AND org_id = organization_members.org_id
    AND role = 'admin'
  )
);

-- ============================================
-- PROFILES TABLE
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "users update own profile" ON public.profiles;

CREATE POLICY "users read own profile"
ON public.profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "users update own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================
-- ORGANIZATIONS TABLE
-- ============================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org members read organization" ON public.organizations;
DROP POLICY IF EXISTS "org admins update organization" ON public.organizations;

CREATE POLICY "org members read organization"
ON public.organizations FOR SELECT
USING (id IN (SELECT org_id FROM orgs_for_user()));

CREATE POLICY "org admins update organization"
ON public.organizations FOR UPDATE
USING (
  id IN (SELECT org_id FROM orgs_for_user())
  AND EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = auth.uid()
    AND org_id = organizations.id
    AND role = 'admin'
  )
)
WITH CHECK (
  id IN (SELECT org_id FROM orgs_for_user())
);

-- ============================================
-- VERIFICATION
-- ============================================
-- Run these queries to verify all tables have RLS enabled and policies:

-- Check RLS status for all tables
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;

-- Check all policies
-- SELECT schemaname, tablename, policyname, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- Tables that should have RLS:
-- ✓ branches
-- ✓ clients
-- ✓ inventory
-- ✓ kardex
-- ✓ organization_members
-- ✓ organizations
-- ✓ products
-- ✓ profiles
-- ✓ sales
-- ✓ sales_items
