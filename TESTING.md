# Testing Guide - Agro ERP

This guide covers testing strategies for your multi-tenant ERP system.

## Testing Strategy

### 1. Manual Testing (Current)

The application is currently tested manually. Follow these test scenarios before deploying:

## Test Scenarios

### Authentication & User Management

#### Test 1: User Registration
1. Go to `/register`
2. Fill in all fields:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - First Name: `Test`
   - Last Name: `User`
   - Organization Name: `Test Company`
   - Organization Slug: `test-company`
3. Click "Crear Cuenta"
4. **Expected**: Redirected to login with success message
5. **Verify**: Check Supabase Dashboard → Authentication → Users for new user
6. **Verify**: Check `profiles`, `organizations`, `organization_members` tables

#### Test 2: User Login
1. Go to `/login`
2. Enter credentials from Test 1
3. Click "Iniciar Sesión"
4. **Expected**: Redirected to `/test-company/dashboard`
5. **Verify**: Dashboard loads with KPI cards

#### Test 3: Password Reset
1. Go to `/forgot-password`
2. Enter email: `test@example.com`
3. Click "Enviar Enlace de Recuperación"
4. **Expected**: Success message displayed
5. Check email for reset link
6. Click link in email
7. Enter new password (min 6 characters)
8. **Expected**: Redirected to login
9. Login with new password
10. **Expected**: Login successful

#### Test 4: Logout
1. While logged in, go to `/api/auth/logout`
2. **Expected**: Redirected to `/login`
3. Try accessing `/test-company/dashboard`
4. **Expected**: Redirected to `/login`

### Multi-Tenant Isolation

#### Test 5: Create Second Organization
1. Logout from first organization
2. Register new user with different email
3. Create organization with slug: `company-two`
4. Login to second organization
5. **Expected**: Dashboard is empty (no data from first org)

#### Test 6: Verify Data Isolation
1. In first org, create a product
2. In first org, create a sale
3. Switch to second org
4. **Expected**: Products and sales from first org are NOT visible
5. **Verify**: Check database that both records have correct `org_id`

#### Test 7: Cross-Org Access Attempt
1. Login to first org (slug: `test-company`)
2. Manually navigate to `/company-two/dashboard`
3. **Expected**: Access denied or redirected
4. **Verify**: Cannot see data from other organization

### Dashboard

#### Test 8: Dashboard KPIs
1. Login to organization
2. Go to dashboard
3. **Expected**: See 4 KPI cards:
   - Ventas del Mes: $0.00 (if no sales)
   - Clientes: 0 (if no clients)
   - Productos: 0 (if no products)
   - Valor Inventario: $0.00 (if no inventory)
4. Create test data and verify KPIs update

#### Test 9: Low Stock Table
1. Create product with low inventory (< 10 units)
2. Go to dashboard
3. **Expected**: Product appears in "Stock Crítico" table
4. **Verify**: Status shows "Bajo" or "Crítico" based on quantity

### Products & Inventory

#### Test 10: Create Product
1. Go to `/[orgSlug]/inventory`
2. Click "Nuevo Producto"
3. Fill in product details:
   - Name: `Test Product`
   - Price: `100`
   - Cost: `50`
   - Initial quantity: `20`
4. **Expected**: Product created successfully
5. **Verify**: Product appears in inventory list
6. **Verify**: Check `products` and `inventory` tables

#### Test 11: Inventory Movement
1. Go to product detail page
2. Add inventory movement:
   - Type: `purchase`
   - Quantity: `10`
3. **Expected**: Inventory increased by 10
4. **Verify**: Check `kardex` table for movement record
5. **Verify**: Check `inventory` table for updated quantity

### Sales & Transactions

#### Test 12: Create Sale (Manual)
1. Create a client first
2. Create a product with inventory
3. Go to POS or sales page
4. Create sale with:
   - Client
   - Product (quantity: 2)
   - Total calculated correctly
5. **Expected**: Sale created successfully
6. **Verify**: Check `sales` and `sales_items` tables
7. **Verify**: Inventory decreased by 2
8. **Verify**: Kardex entry created

#### Test 13: Create Sale with Transaction API
1. Use API endpoint: `POST /api/sales/create-with-items`
2. Send request:
   ```json
   {
     "client_id": "uuid",
     "total": 200,
     "payment_method": "cash",
     "items": [
       {
         "product_id": "uuid",
         "quantity": 2,
         "price": 100,
         "cost": 50
       }
     ]
   }
   ```
3. **Expected**: Sale created atomically
4. **Verify**: Sale, sales_items, inventory, and kardex all updated
5. **Verify**: If any step fails, entire transaction rolls back

#### Test 14: Sale with Insufficient Stock
1. Create product with 5 units
2. Try to create sale with 10 units
3. **Expected**: Error message about insufficient stock
4. **Verify**: No sale created, inventory unchanged

### Input Validation

#### Test 15: Registration Validation
1. Try to register with invalid email
2. **Expected**: Error message
3. Try to register with password < 6 characters
4. **Expected**: Error message
5. Try to register with existing email
6. **Expected**: Error message

#### Test 16: Sale Validation
1. Try to create sale with negative quantity
2. **Expected**: Validation error
3. Try to create sale with empty items array
4. **Expected**: Validation error
5. Try to create sale with invalid product_id
6. **Expected**: Error message

### Rate Limiting

#### Test 17: Rate Limit Check
1. Make 60 rapid requests to `/api/sales/create-with-items`
2. **Expected**: After 50 requests, receive HTTP 429 error
3. **Expected**: Response includes `Retry-After` header
4. Wait 1 minute
5. **Expected**: Can make requests again

### Organization Settings

#### Test 18: Update Organization
1. Go to `/[orgSlug]/settings`
2. Update organization details:
   - Name
   - Email
   - Phone
   - Address
   - Tax ID
3. Click "Guardar Cambios"
4. **Expected**: Success message
5. **Verify**: Changes saved in database
6. **Verify**: Slug cannot be changed

### Audit Logging

#### Test 19: Audit Log Creation
1. Perform critical operation (create sale)
2. Check console logs (development)
3. **Expected**: See audit log entry with:
   - User ID
   - Organization ID
   - Action
   - Resource type
   - Metadata
4. In production: Check `audit_logs` table

#### Test 20: Audit Log Access
1. Login as regular user
2. Try to access audit logs
3. **Expected**: Access denied
4. Login as admin
5. **Expected**: Can view audit logs

## Browser Testing

Test on multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Performance Testing

### Load Testing

Use tools like Apache Bench or k6:

```bash
# Test sales endpoint
ab -n 1000 -c 10 -H "x-org-id: your-org-id" \
   -p sale.json -T application/json \
   http://localhost:3000/api/sales/create-with-items
```

**Expected**:
- Response time < 500ms for 95% of requests
- No errors under normal load
- Rate limiting kicks in at 50 req/min

## Security Testing

### Test 21: SQL Injection
1. Try SQL injection in input fields:
   - `'; DROP TABLE users; --`
   - `1' OR '1'='1`
2. **Expected**: Input validation prevents injection
3. **Expected**: Zod validation catches malicious input

### Test 22: XSS Prevention
1. Try XSS in input fields:
   - `<script>alert('XSS')</script>`
   - `<img src=x onerror=alert('XSS')>`
2. **Expected**: Input sanitized, no script execution

### Test 23: CSRF Protection
1. Try to make authenticated request from different origin
2. **Expected**: Request blocked by CORS policy

### Test 24: RLS Bypass Attempt
1. Try to access data from different org via API
2. Use browser dev tools to modify org_id header
3. **Expected**: RLS policies prevent access
4. **Expected**: Only see data from authenticated user's org

## Automated Testing (Future)

### Unit Tests (Recommended)

Create tests for:
- Validation schemas (`src/lib/validation/schemas.js`)
- Utility functions
- API route handlers

Example with Jest:
```javascript
import { validateRequest, createSaleSchema } from '@/src/lib/validation/schemas';

describe('Sale Validation', () => {
  it('should validate correct sale data', () => {
    const data = {
      total: 100,
      items: [{ product_id: 'uuid', quantity: 1, price: 100 }]
    };
    const result = validateRequest(createSaleSchema, data);
    expect(result.success).toBe(true);
  });

  it('should reject negative quantities', () => {
    const data = {
      total: 100,
      items: [{ product_id: 'uuid', quantity: -1, price: 100 }]
    };
    const result = validateRequest(createSaleSchema, data);
    expect(result.success).toBe(false);
  });
});
```

### Integration Tests (Recommended)

Test API routes end-to-end:
```javascript
import { POST } from '@/app/api/sales/create-with-items/route';

describe('Sales API', () => {
  it('should create sale with items', async () => {
    const request = new Request('http://localhost:3000/api/sales/create-with-items', {
      method: 'POST',
      headers: { 'x-org-id': 'test-org-id' },
      body: JSON.stringify({
        total: 100,
        items: [{ product_id: 'uuid', quantity: 1, price: 100, cost: 50 }]
      })
    });
    
    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
```

### E2E Tests (Recommended)

Use Playwright or Cypress:
```javascript
// Playwright example
test('complete sale flow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'password');
  await page.click('button[type=submit]');
  
  await page.waitForURL('**/dashboard');
  await page.click('text=POS');
  
  // Create sale...
  await expect(page.locator('text=Venta creada')).toBeVisible();
});
```

## Test Data

### Create Test Data Script

```javascript
// scripts/seed-test-data.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedTestData(orgId) {
  // Create test products
  await supabase.from('products').insert([
    { org_id: orgId, name: 'Product 1', price: 100, cost: 50 },
    { org_id: orgId, name: 'Product 2', price: 200, cost: 100 },
  ]);
  
  // Create test clients
  await supabase.from('clients').insert([
    { org_id: orgId, name: 'Client 1', email: 'client1@example.com' },
    { org_id: orgId, name: 'Client 2', email: 'client2@example.com' },
  ]);
  
  console.log('Test data created');
}
```

## Regression Testing

Before each release, run through all test scenarios to ensure:
- No existing functionality is broken
- New features work as expected
- Performance hasn't degraded
- Security measures are still effective

## Bug Reporting

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/device information
5. Screenshots/videos if applicable
6. Error messages from console
7. Network requests (from dev tools)
