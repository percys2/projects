-- Migration: Add org_id to sales_items table for proper tenant isolation
-- This fixes a critical security issue where sales_items aren't properly isolated between organizations

-- Step 1: Check if org_id column already exists (if it does, this will error and you can skip to Step 4)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales_items' 
        AND column_name = 'org_id'
    ) THEN
        -- Add org_id column
        ALTER TABLE public.sales_items ADD COLUMN org_id uuid;
        RAISE NOTICE 'Added org_id column to sales_items';
    ELSE
        RAISE NOTICE 'org_id column already exists in sales_items';
    END IF;
END $$;

-- Step 2: Backfill org_id from the parent sales table
-- This assumes sales table has org_id column
UPDATE public.sales_items si
SET org_id = s.org_id
FROM public.sales s
WHERE s.id = si.sale_id
AND si.org_id IS NULL;

-- Step 3: Make org_id NOT NULL and add foreign key constraint
ALTER TABLE public.sales_items
    ALTER COLUMN org_id SET NOT NULL;

ALTER TABLE public.sales_items
    ADD CONSTRAINT sales_items_org_id_fkey
    FOREIGN KEY (org_id) 
    REFERENCES public.organizations(id)
    ON DELETE CASCADE;

-- Step 4: Drop existing RLS policies if they exist (to recreate them correctly)
DROP POLICY IF EXISTS "org members read sales items" ON public.sales_items;
DROP POLICY IF EXISTS "org members insert sales items" ON public.sales_items;
DROP POLICY IF EXISTS "org members update sales items" ON public.sales_items;
DROP POLICY IF EXISTS "org members delete sales items" ON public.sales_items;

-- Step 5: Enable RLS on sales_items if not already enabled
ALTER TABLE public.sales_items ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies using org_id
CREATE POLICY "org members read sales items"
ON public.sales_items
FOR SELECT
USING (org_id IN (SELECT org_id FROM orgs_for_user()));

CREATE POLICY "org members insert sales items"
ON public.sales_items
FOR INSERT
WITH CHECK (org_id IN (SELECT org_id FROM orgs_for_user()));

CREATE POLICY "org members update sales items"
ON public.sales_items
FOR UPDATE
USING (org_id IN (SELECT org_id FROM orgs_for_user()))
WITH CHECK (org_id IN (SELECT org_id FROM orgs_for_user()));

CREATE POLICY "org members delete sales items"
ON public.sales_items
FOR DELETE
USING (org_id IN (SELECT org_id FROM orgs_for_user()));

-- Verification queries (run these to confirm the migration worked)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'sales_items' AND column_name = 'org_id';

-- SELECT policyname, cmd FROM pg_policies 
-- WHERE schemaname = 'public' AND tablename = 'sales_items';
