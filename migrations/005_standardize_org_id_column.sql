-- Migration: Standardize organization column name to org_id
-- This ensures all tables use the same column name for tenant isolation

-- ============================================
-- PRODUCTS TABLE
-- ============================================
-- Check if products table uses organization_id and rename to org_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'organization_id'
    ) THEN
        -- Rename column
        ALTER TABLE public.products RENAME COLUMN organization_id TO org_id;
        RAISE NOTICE 'Renamed products.organization_id to products.org_id';
    ELSE
        RAISE NOTICE 'products.org_id already exists or organization_id does not exist';
    END IF;
END $$;

-- ============================================
-- SALES TABLE
-- ============================================
-- Check if sales table uses organization_id and rename to org_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sales' 
        AND column_name = 'organization_id'
    ) THEN
        -- Rename column
        ALTER TABLE public.sales RENAME COLUMN organization_id TO org_id;
        RAISE NOTICE 'Renamed sales.organization_id to sales.org_id';
    ELSE
        RAISE NOTICE 'sales.org_id already exists or organization_id does not exist';
    END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this query to verify all tables now use org_id:
-- SELECT table_name, column_name 
-- FROM information_schema.columns 
-- WHERE column_name IN ('org_id', 'organization_id') 
-- AND table_schema = 'public'
-- ORDER BY table_name;

-- Expected result: All tenant tables should have org_id, none should have organization_id
