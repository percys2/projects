# Restaurant Management System (POS + Inventory + Sales)

This repo is a **multi-tenant** (per-organization) management system you can use to run a restaurant (or any retail business) with:

- **POS**: cart, cash register open/close, daily sales summary, credit sales
- **Inventory**: products, stock by branch, movements, transfers, kardex history
- **Sales**: sales history and reporting (dashboard KPIs)
- **Printing**: API endpoints for thermal/ESC-POS/network printers (optional)

Built with **Next.js (App Router)** + **Supabase** + **TailwindCSS**.

## Quick start (local)

### 1) Create a Supabase project

Create a project in Supabase and copy:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2) Run the database migrations

In Supabase SQL editor, run the files in `supabase/migrations/` in order.

Minimum required:

- `supabase/migrations/001_core_schema.sql`

Optional (billing/subscriptions):

- `supabase/migrations/20241227_subscription_tables.sql`

### 3) Create `.env.local`

Create `/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4) Install & run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, register an account, then you’ll be redirected to:

`/[orgSlug]/dashboard`

## Restaurant MVP workflow (what to do first)

1. **Create a branch**: `Settings → Branches`
2. **Create products (menu items)**: `Inventory → Nuevo Producto`
3. **Load starting stock** (for ingredients/items you track): `Inventory → Movimientos (entrada)`
4. **Sell**: `POS`
   - Open cash register
   - Add items to cart
   - Complete sale (cash or credit)
   - Inventory is decremented automatically via the inventory RPCs

## Notes / gotchas

- **Multi-tenancy**: API calls expect `x-org-slug` headers for most business endpoints. Auth + membership is enforced via Supabase + `organization_members`.
- **Billing**: Stripe routes require Stripe env vars; they are optional for running POS/inventory.
- **Printing**: See `printer-server/` if you want local printing support.

