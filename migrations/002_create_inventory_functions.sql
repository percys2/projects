-- Migration: Create database functions for inventory management
-- These functions ensure atomic operations for inventory updates

-- Function to decrease inventory (for sales)
CREATE OR REPLACE FUNCTION decrease_inventory(
    p_org_id uuid,
    p_product_id uuid,
    p_quantity numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_quantity numeric;
BEGIN
    -- Get current inventory quantity
    SELECT quantity INTO v_current_quantity
    FROM public.inventory
    WHERE org_id = p_org_id 
    AND product_id = p_product_id
    FOR UPDATE;

    -- Check if inventory exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventory not found for product % in organization %', p_product_id, p_org_id;
    END IF;

    -- Check if sufficient stock
    IF v_current_quantity < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', v_current_quantity, p_quantity;
    END IF;

    -- Update inventory
    UPDATE public.inventory
    SET quantity = quantity - p_quantity,
        updated_at = now()
    WHERE org_id = p_org_id 
    AND product_id = p_product_id;
END;
$$;

-- Function to increase inventory (for purchases/returns)
CREATE OR REPLACE FUNCTION increase_inventory(
    p_org_id uuid,
    p_product_id uuid,
    p_quantity numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update inventory or insert if doesn't exist
    INSERT INTO public.inventory (org_id, product_id, quantity, updated_at)
    VALUES (p_org_id, p_product_id, p_quantity, now())
    ON CONFLICT (org_id, product_id)
    DO UPDATE SET 
        quantity = inventory.quantity + p_quantity,
        updated_at = now();
END;
$$;

-- Function to create a complete sale with items (atomic transaction)
CREATE OR REPLACE FUNCTION create_sale_with_items(
    p_org_id uuid,
    p_client_id uuid,
    p_total numeric,
    p_payment_method text,
    p_notes text,
    p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sale_id uuid;
    v_item jsonb;
    v_result jsonb;
BEGIN
    -- Step 1: Create the sale
    INSERT INTO public.sales (org_id, client_id, total, payment_method, notes)
    VALUES (p_org_id, p_client_id, p_total, p_payment_method, p_notes)
    RETURNING id INTO v_sale_id;

    -- Step 2: Create sales items and update inventory
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Insert sales item
        INSERT INTO public.sales_items (
            sale_id,
            org_id,
            product_id,
            quantity,
            price,
            cost,
            subtotal,
            margin
        )
        VALUES (
            v_sale_id,
            p_org_id,
            (v_item->>'product_id')::uuid,
            (v_item->>'quantity')::numeric,
            (v_item->>'price')::numeric,
            COALESCE((v_item->>'cost')::numeric, 0),
            (v_item->>'quantity')::numeric * (v_item->>'price')::numeric,
            ((v_item->>'price')::numeric - COALESCE((v_item->>'cost')::numeric, 0)) * (v_item->>'quantity')::numeric
        );

        -- Decrease inventory
        PERFORM decrease_inventory(
            p_org_id,
            (v_item->>'product_id')::uuid,
            (v_item->>'quantity')::numeric
        );

        -- Create kardex entry
        INSERT INTO public.kardex (
            org_id,
            product_id,
            movement_type,
            quantity,
            reference_id,
            notes
        )
        VALUES (
            p_org_id,
            (v_item->>'product_id')::uuid,
            'sale',
            -(v_item->>'quantity')::numeric,
            v_sale_id,
            'Sale #' || v_sale_id
        );
    END LOOP;

    -- Return the sale ID
    v_result = jsonb_build_object('sale_id', v_sale_id, 'success', true);
    RETURN v_result;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION decrease_inventory TO authenticated;
GRANT EXECUTE ON FUNCTION increase_inventory TO authenticated;
GRANT EXECUTE ON FUNCTION create_sale_with_items TO authenticated;
