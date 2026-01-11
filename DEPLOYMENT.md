# Deployment Guide - Agro ERP

This guide covers deploying your multi-tenant ERP system to production.

## Prerequisites

- Node.js 18+ installed
- Supabase project created
- Domain name (optional but recommended)
- Email service configured in Supabase

## Environment Variables

Create a `.env` file in production with these variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Sentry (Optional - for error monitoring)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

## Database Setup

### 1. Run All Migrations

Execute the SQL migrations in `supabase/migrations/` in order (oldest → newest).

At minimum you should run:

1. **`supabase/migrations/001_core_schema.sql`**
   - Creates the core tables for organizations, branches, products, inventory, sales, POS helpers
   - Creates views: `current_stock`, `kardex_view`
   - Creates RPCs: `increase_inventory`, `decrease_inventory`, `transfer_inventory`, `get_next_invoice_number`, credit RPCs
   - Enables basic RLS policies

2. **`supabase/migrations/20241227_subscription_tables.sql`** (optional)
   - Adds Stripe subscription/billing tables and helper function for plan limits

### 2. Verify RLS Policies

Run this query to verify all tables have RLS enabled:

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

All tables should have `rowsecurity = true`.

### 3. Verify Database Functions

Run this query to verify functions exist:

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('orgs_for_user', 'decrease_inventory', 'increase_inventory', 'create_sale_with_items');
```

## Supabase Configuration

### 1. Email Templates

Configure email templates in Supabase Dashboard → Authentication → Email Templates:

**Reset Password Template:**
- Subject: `Restablecer contraseña - Agro ERP`
- Redirect URL: `{{ .SiteURL }}/reset-password?token={{ .Token }}`

**Email Verification Template:**
- Subject: `Verifica tu email - Agro ERP`
- Redirect URL: `{{ .SiteURL }}/verify-email?token={{ .Token }}&type=email`

### 2. Authentication Settings

Go to Supabase Dashboard → Authentication → Settings:

- **Enable Email Provider**: ✓
- **Enable Email Confirmations**: ✓ (optional)
- **Secure Email Change**: ✓
- **Site URL**: Set to your production URL
- **Redirect URLs**: Add your production domain

### 3. API Settings

Go to Supabase Dashboard → Settings → API:

- Copy your **Project URL** and **anon/public key**
- Keep your **service_role key** secure (never expose to client)

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from `.env`

5. **Configure Domain**
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Add your custom domain

### Option 2: Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build Image**
   ```bash
   docker build -t agro-erp .
   ```

3. **Run Container**
   ```bash
   docker run -p 3000:3000 --env-file .env agro-erp
   ```

### Option 3: VPS (Ubuntu/Debian)

1. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/agro-erp.git
   cd agro-erp
   ```

3. **Install Dependencies**
   ```bash
   npm ci --only=production
   ```

4. **Build Application**
   ```bash
   npm run build
   ```

5. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

6. **Start Application**
   ```bash
   pm2 start npm --name "agro-erp" -- start
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **Enable SSL with Certbot**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Post-Deployment Checklist

- [ ] All environment variables are set correctly
- [ ] Database migrations have been run
- [ ] RLS policies are enabled on all tables
- [ ] Email templates are configured
- [ ] Authentication settings are correct
- [ ] Test user registration flow
- [ ] Test login flow
- [ ] Test password reset flow
- [ ] Test sales creation with transactions
- [ ] Test multi-tenant isolation (create 2 orgs, verify data separation)
- [ ] Verify rate limiting is working
- [ ] Check Sentry for any errors
- [ ] Test on mobile devices
- [ ] Set up monitoring/alerts

## Monitoring

### Sentry Setup

1. Create account at https://sentry.io
2. Create new project (Next.js)
3. Copy DSN to `NEXT_PUBLIC_SENTRY_DSN`
4. Errors will be automatically captured

### Database Monitoring

Monitor these metrics in Supabase Dashboard:

- Database size
- Active connections
- Query performance
- API requests per minute

### Application Monitoring

Monitor these metrics:

- Response times
- Error rates
- User registrations
- Sales transactions
- Inventory movements

## Backup Strategy

### Database Backups

Supabase provides automatic daily backups. For additional safety:

1. **Enable Point-in-Time Recovery** (PITR) in Supabase Dashboard
2. **Export database regularly**:
   ```bash
   pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
   ```

### Application Backups

- Keep your code in Git
- Tag releases: `git tag v1.0.0`
- Store environment variables securely (1Password, AWS Secrets Manager, etc.)

## Scaling Considerations

### Database Scaling

- Upgrade Supabase plan for more connections
- Add database indexes for slow queries
- Consider read replicas for heavy read workloads

### Application Scaling

- Vercel automatically scales
- For VPS: Use load balancer + multiple instances
- Consider CDN for static assets

### Rate Limiting

Current implementation uses in-memory storage. For production at scale:

- Use Redis for distributed rate limiting
- Configure per-organization limits
- Monitor and adjust limits based on usage

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Database Connection Issues

- Verify Supabase credentials
- Check IP allowlist in Supabase Dashboard
- Verify service_role key is correct

### Email Not Sending

- Check Supabase email settings
- Verify email templates are configured
- Check spam folder
- Consider custom SMTP provider (SendGrid, Mailgun)

### RLS Policy Errors

- Verify user is authenticated
- Check user is member of organization
- Verify org_id is being passed correctly
- Check RLS policies in Supabase Dashboard

## Security Checklist

- [ ] All API routes validate input with Zod
- [ ] RLS policies enabled on all tables
- [ ] Service role key is never exposed to client
- [ ] Rate limiting is active
- [ ] Audit logging is working
- [ ] HTTPS is enabled
- [ ] Environment variables are secure
- [ ] Database backups are enabled
- [ ] Error monitoring is active
- [ ] No sensitive data in logs

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Check Next.js documentation: https://nextjs.org/docs
- Review audit logs for security issues
- Check Sentry for application errors
