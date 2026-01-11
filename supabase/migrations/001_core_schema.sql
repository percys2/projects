-- Core schema for multi-tenant restaurant/retail ERP (POS + Inventory + Sales)
-- Run in Supabase SQL editor (or via migrations) BEFORE feature-specific migrations.

-- Extensions
create extension if not exists "pgcrypto";

-- =========================
-- Organizations & users
-- =========================

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active',

  -- Optional business info
  email text,
  phone text,
  address text,
  tax_id text,
  logo_url text,

  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

-- Invitations (optional)
create table if not exists public.org_invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null default 'member',
  token text not null unique,
  invited_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- Helper: is current user a member of an org?
create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.org_id = p_org_id
      and m.user_id = auth.uid()
  );
$$;

-- =========================
-- Branches, catalog, stock
-- =========================

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  address text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (org_id, name)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (org_id, name)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  sku text,
  category text,
  subcategory text,
  unit_weight numeric,
  min_stock numeric not null default 0,
  cost numeric not null default 0,
  price numeric not null default 0,
  active boolean not null default true,
  expires_at date,
  created_at timestamptz not null default now(),
  unique (org_id, sku)
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete restrict,

  -- Current quantity on-hand for (org, product, branch)
  quantity numeric not null default 0,

  -- Optional per-branch overrides / lot info
  cost numeric,
  price numeric,
  expiration_date date,
  lot_number text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, product_id, branch_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_inventory_updated_at on public.inventory;
create trigger trg_inventory_updated_at
before update on public.inventory
for each row execute function public.set_updated_at();

-- View used by dashboard + inventory module
create or replace view public.current_stock as
select
  i.org_id,
  i.product_id,
  i.branch_id,
  i.quantity as stock,
  coalesce(i.cost, p.cost) as cost,
  coalesce(i.price, p.price) as price,
  i.expiration_date,
  i.lot_number,
  p.name,
  p.sku,
  p.category,
  p.unit_weight,
  p.min_stock,
  p.active,
  b.name as branch_name
from public.inventory i
join public.products p on p.id = i.product_id
join public.branches b on b.id = i.branch_id;

-- =========================
-- Inventory movements & kardex
-- =========================

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  type text not null, -- entrada | salida | transferencia | SALE | PURCHASE etc (kept flexible)
  qty numeric not null,
  from_branch uuid references public.branches(id) on delete set null,
  to_branch uuid references public.branches(id) on delete set null,
  cost numeric,
  price numeric,
  reference text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.kardex (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  movement_type text not null,
  quantity numeric not null,
  branch_id uuid references public.branches(id) on delete set null,
  from_branch uuid references public.branches(id) on delete set null,
  to_branch uuid references public.branches(id) on delete set null,
  cost_unit numeric not null default 0,
  total numeric not null default 0,
  reference text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace view public.kardex_view as
select
  k.*,
  p.name as product_name,
  pb.name as branch_name,
  fb.name as from_branch_name,
  tb.name as to_branch_name,
  pr.email as user_email
from public.kardex k
left join public.products p on p.id = k.product_id
left join public.branches pb on pb.id = k.branch_id
left join public.branches fb on fb.id = k.from_branch
left join public.branches tb on tb.id = k.to_branch
left join public.profiles pr on pr.id = k.created_by;

-- =========================
-- Sales
-- =========================

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  first_name text not null,
  last_name text,
  phone text,
  address text,
  city text,
  municipio text,
  ruc text,

  is_credit_client boolean not null default false,
  credit_limit numeric not null default 0,
  credit_balance numeric not null default 0,

  created_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete restrict,
  client_id uuid references public.clients(id) on delete set null,
  client_name text,
  factura text,
  total numeric not null default 0,
  payment_method text not null default 'cash',
  notes text,
  status text not null default 'completed',
  user_id uuid references auth.users(id) on delete set null,

  -- Some parts of the codebase historically use `fecha`
  fecha timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.sales_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text,
  quantity numeric not null,
  price numeric not null default 0,
  cost numeric not null default 0,
  subtotal numeric not null default 0,
  margin numeric not null default 0,
  created_at timestamptz not null default now()
);

-- =========================
-- POS helpers: invoice numbers, cash closings, menudeo
-- =========================

create table if not exists public.invoice_counters (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete cascade,
  last_number integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Uniqueness with NULL branch_id (global counter) + per-branch counters
create unique index if not exists invoice_counters_org_branch_not_null_uniq
  on public.invoice_counters(org_id, branch_id)
  where branch_id is not null;

create unique index if not exists invoice_counters_org_branch_null_uniq
  on public.invoice_counters(org_id)
  where branch_id is null;

create or replace function public.get_next_invoice_number(p_org_id uuid, p_branch_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new integer;
begin
  if p_org_id is null then
    raise exception 'p_org_id is required';
  end if;

  if p_branch_id is null then
    insert into public.invoice_counters(org_id, branch_id, last_number)
    values (p_org_id, null, 1)
    on conflict (org_id) where branch_id is null
    do update set
      last_number = public.invoice_counters.last_number + 1,
      updated_at = now()
    returning last_number into v_new;
  else
    insert into public.invoice_counters(org_id, branch_id, last_number)
    values (p_org_id, p_branch_id, 1)
    on conflict (org_id, branch_id) where branch_id is not null
    do update set
      last_number = public.invoice_counters.last_number + 1,
      updated_at = now()
    returning last_number into v_new;
  end if;

  return v_new;
end;
$$;

grant execute on function public.get_next_invoice_number(uuid, uuid) to authenticated;

create table if not exists public.cash_register_closings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  user_name text,

  opening_time timestamptz,
  closing_time timestamptz not null default now(),

  opening_amount numeric not null default 0,
  total_entries numeric not null default 0,
  total_exits numeric not null default 0,
  expected_total numeric not null default 0,
  counted_amount numeric not null default 0,
  difference numeric not null default 0,

  sales_count integer not null default 0,
  movements_count integer not null default 0,
  notes text,
  movements jsonb not null default '[]'::jsonb,

  created_at timestamptz not null default now()
);

create table if not exists public.menudeo_transactions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  amount numeric not null default 0,
  description text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- =========================
-- Credit (accounts receivable)
-- =========================

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  sale_id uuid references public.sales(id) on delete set null,
  type text not null, -- purchase | payment
  amount numeric not null,
  payment_method text,
  description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.register_credit_purchase(
  p_org_id uuid,
  p_client_id uuid,
  p_branch_id uuid,
  p_sale_id uuid,
  p_amount numeric,
  p_created_by uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be > 0';
  end if;

  update public.clients
  set credit_balance = credit_balance + p_amount
  where id = p_client_id and org_id = p_org_id;

  insert into public.credit_transactions(
    org_id, client_id, branch_id, sale_id, type, amount, description, created_by
  ) values (
    p_org_id, p_client_id, p_branch_id, p_sale_id, 'purchase', p_amount,
    'Compra a crédito', p_created_by
  );
end;
$$;

grant execute on function public.register_credit_purchase(uuid, uuid, uuid, uuid, numeric, uuid) to authenticated;

create or replace function public.register_credit_payment(
  p_org_id uuid,
  p_client_id uuid,
  p_branch_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_description text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance numeric;
  v_tx_id uuid;
begin
  if p_amount is null or p_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'Amount must be > 0');
  end if;

  update public.clients
  set credit_balance = greatest(0, credit_balance - p_amount)
  where id = p_client_id and org_id = p_org_id
  returning credit_balance into v_new_balance;

  insert into public.credit_transactions(
    org_id, client_id, branch_id, type, amount, payment_method, description
  ) values (
    p_org_id, p_client_id, p_branch_id, 'payment', p_amount,
    coalesce(p_payment_method, 'cash'),
    coalesce(p_description, 'Abono de crédito')
  )
  returning id into v_tx_id;

  return jsonb_build_object('success', true, 'transaction_id', v_tx_id, 'new_balance', v_new_balance);
end;
$$;

grant execute on function public.register_credit_payment(uuid, uuid, uuid, numeric, text, text) to authenticated;

-- =========================
-- Inventory RPCs used by API
-- =========================

create or replace function public.increase_inventory(
  p_org_id uuid,
  p_product_id uuid,
  p_branch_id uuid,
  p_quantity numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantity must be > 0';
  end if;

  insert into public.inventory(org_id, product_id, branch_id, quantity)
  values (p_org_id, p_product_id, p_branch_id, p_quantity)
  on conflict (org_id, product_id, branch_id)
  do update set quantity = public.inventory.quantity + excluded.quantity;
end;
$$;

create or replace function public.decrease_inventory(
  p_org_id uuid,
  p_product_id uuid,
  p_branch_id uuid,
  p_quantity numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current numeric;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantity must be > 0';
  end if;

  select quantity into v_current
  from public.inventory
  where org_id = p_org_id and product_id = p_product_id and branch_id = p_branch_id
  for update;

  if v_current is null then
    raise exception 'No inventory row for product % in branch %', p_product_id, p_branch_id;
  end if;

  if v_current < p_quantity then
    raise exception 'Insufficient stock. Current: %, Requested: %', v_current, p_quantity;
  end if;

  update public.inventory
  set quantity = quantity - p_quantity
  where org_id = p_org_id and product_id = p_product_id and branch_id = p_branch_id;
end;
$$;

create or replace function public.transfer_inventory(
  p_org_id uuid,
  p_product_id uuid,
  p_from_branch uuid,
  p_to_branch uuid,
  p_quantity numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.decrease_inventory(p_org_id, p_product_id, p_from_branch, p_quantity);
  perform public.increase_inventory(p_org_id, p_product_id, p_to_branch, p_quantity);
end;
$$;

grant execute on function public.increase_inventory(uuid, uuid, uuid, numeric) to authenticated;
grant execute on function public.decrease_inventory(uuid, uuid, uuid, numeric) to authenticated;
grant execute on function public.transfer_inventory(uuid, uuid, uuid, uuid, numeric) to authenticated;

-- =========================
-- Minimal HR / CRM (used by dashboard counts)
-- =========================

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  status text not null default 'activo',
  created_at timestamptz not null default now()
);

create table if not exists public.crm_opportunities (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  amount numeric not null default 0,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

-- =========================
-- Settings tables used by API routes
-- =========================

create table if not exists public.invoice_settings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  invoice_prefix text,
  invoice_next_number integer,
  receipt_prefix text,
  receipt_next_number integer,
  quote_prefix text,
  quote_next_number integer,
  show_logo boolean,
  show_tax_breakdown boolean,
  footer_text text,
  terms_and_conditions text,
  created_at timestamptz not null default now(),
  unique (org_id)
);

create table if not exists public.system_preferences (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  language text,
  timezone text,
  date_format text,
  decimal_separator text,
  thousands_separator text,
  low_stock_threshold integer,
  enable_notifications boolean,
  enable_email_alerts boolean,
  auto_logout_minutes integer,
  require_manager_pin boolean,
  manager_pin text,
  created_at timestamptz not null default now(),
  unique (org_id)
);

create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (org_id, name)
);

create table if not exists public.taxes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  rate numeric not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (org_id, name)
);

-- =========================
-- Audit logs
-- =========================

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource text,
  resource_id text,
  details jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- =========================
-- RLS (minimal + practical)
-- =========================

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.branches enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.inventory enable row level security;
alter table public.clients enable row level security;
alter table public.sales enable row level security;
alter table public.sales_items enable row level security;
alter table public.kardex enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.invoice_counters enable row level security;
alter table public.cash_register_closings enable row level security;
alter table public.menudeo_transactions enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.org_invitations enable row level security;
alter table public.employees enable row level security;
alter table public.crm_opportunities enable row level security;
alter table public.invoice_settings enable row level security;
alter table public.system_preferences enable row level security;
alter table public.payment_methods enable row level security;
alter table public.taxes enable row level security;
alter table public.audit_logs enable row level security;

-- Organizations: members can read their org
drop policy if exists "org_select_for_members" on public.organizations;
create policy "org_select_for_members"
  on public.organizations for select
  using (public.is_org_member(id));

-- Profiles: user can read/update own profile
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid());

-- Membership: user can read own membership rows
drop policy if exists "memberships_select_own" on public.organization_members;
create policy "memberships_select_own"
  on public.organization_members for select
  using (user_id = auth.uid());

-- Generic helper policies for org-scoped tables (select only)
-- Branches
drop policy if exists "branches_select_org" on public.branches;
create policy "branches_select_org"
  on public.branches for select
  using (public.is_org_member(org_id));

-- Categories
drop policy if exists "categories_select_org" on public.categories;
create policy "categories_select_org"
  on public.categories for select
  using (public.is_org_member(org_id));

-- Products
drop policy if exists "products_select_org" on public.products;
create policy "products_select_org"
  on public.products for select
  using (public.is_org_member(org_id));

-- Inventory
drop policy if exists "inventory_select_org" on public.inventory;
create policy "inventory_select_org"
  on public.inventory for select
  using (public.is_org_member(org_id));

-- Clients
drop policy if exists "clients_select_org" on public.clients;
create policy "clients_select_org"
  on public.clients for select
  using (public.is_org_member(org_id));

-- Sales
drop policy if exists "sales_select_org" on public.sales;
create policy "sales_select_org"
  on public.sales for select
  using (public.is_org_member(org_id));

-- Sales items
drop policy if exists "sales_items_select_org" on public.sales_items;
create policy "sales_items_select_org"
  on public.sales_items for select
  using (public.is_org_member(org_id));

-- Kardex & movements
drop policy if exists "kardex_select_org" on public.kardex;
create policy "kardex_select_org"
  on public.kardex for select
  using (public.is_org_member(org_id));

drop policy if exists "inventory_movements_select_org" on public.inventory_movements;
create policy "inventory_movements_select_org"
  on public.inventory_movements for select
  using (public.is_org_member(org_id));

-- Employees & CRM
drop policy if exists "employees_select_org" on public.employees;
create policy "employees_select_org"
  on public.employees for select
  using (public.is_org_member(org_id));

drop policy if exists "crm_opportunities_select_org" on public.crm_opportunities;
create policy "crm_opportunities_select_org"
  on public.crm_opportunities for select
  using (public.is_org_member(org_id));

-- Settings
drop policy if exists "invoice_settings_select_org" on public.invoice_settings;
create policy "invoice_settings_select_org"
  on public.invoice_settings for select
  using (public.is_org_member(org_id));

drop policy if exists "system_preferences_select_org" on public.system_preferences;
create policy "system_preferences_select_org"
  on public.system_preferences for select
  using (public.is_org_member(org_id));

drop policy if exists "payment_methods_select_org" on public.payment_methods;
create policy "payment_methods_select_org"
  on public.payment_methods for select
  using (public.is_org_member(org_id));

drop policy if exists "taxes_select_org" on public.taxes;
create policy "taxes_select_org"
  on public.taxes for select
  using (public.is_org_member(org_id));

-- Audit logs (admin-only by membership role)
drop policy if exists "audit_logs_select_admin" on public.audit_logs;
create policy "audit_logs_select_admin"
  on public.audit_logs for select
  using (
    exists (
      select 1
      from public.organization_members m
      where m.org_id = audit_logs.org_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  );

