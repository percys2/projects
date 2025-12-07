import { z } from 'zod';

// User Registration Schema
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  organizationName: z.string().min(1, 'El nombre de la organización es requerido'),
  organizationSlug: z.string().min(1, 'El slug de la organización es requerido')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
});

// Sale Creation Schema
export const createSaleSchema = z.object({
  client_id: z.string().uuid('ID de cliente inválido').optional().nullable(),
  client_name: z.string().optional().nullable(),
  factura: z.string().optional().nullable(),
  total: z.number().positive('El total debe ser mayor a 0'),
  payment_method: z.enum(['cash', 'card', 'transfer', 'credit']).default('cash'),
  notes: z.string().optional().nullable(),
  items: z.array(z.object({
    product_id: z.string().uuid('ID de producto inválido'),
    quantity: z.number().positive('La cantidad debe ser mayor a 0'),
    price: z.number().nonnegative('El precio no puede ser negativo'),
    cost: z.number().nonnegative('El costo no puede ser negativo').optional(),
  })).min(1, 'Debe incluir al menos un producto'),
});

// Product Schema
export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  sku: z.string().optional(),
  category: z.string().optional(),
  price: z.number().positive('El precio debe ser mayor a 0'),
  cost: z.number().nonnegative('El costo no puede ser negativo').optional(),
});

// Client Schema (updated for actual fields used)
export const clientSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  municipio: z.string().optional(),
  animal_type: z.string().optional(),
  sales_stage: z.enum(['prospecto', 'contactado', 'negociacion', 'cliente', 'inactivo']).optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

// Client Update Schema (includes id)
export const clientUpdateSchema = clientSchema.extend({
  id: z.string().uuid('ID de cliente inválido'),
});

// Inventory Movement Schema
export const inventoryMovementSchema = z.object({
  product_id: z.string().uuid('ID de producto inválido'),
  quantity: z.number().int('La cantidad debe ser un número entero'),
  movement_type: z.enum(['purchase', 'sale', 'adjustment', 'return']),
  notes: z.string().optional(),
  reference_id: z.string().uuid().optional(),
});

// Employee Schema (matches actual fields used)
export const employeeSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido').optional().nullable(),
  phone: z.string().optional().nullable(),
  cedula: z.string().optional().nullable(),
  inss_number: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  salary: z.number().nonnegative('El salario no puede ser negativo').optional().nullable(),
  hire_date: z.string().optional().nullable(),
  contract_type: z.string().optional().nullable(),
  status: z.string().optional(),
  address: z.string().optional().nullable(),
  emergency_contact: z.string().optional().nullable(),
  emergency_phone: z.string().optional().nullable(),
  bank_account: z.string().optional().nullable(),
  bank_name: z.string().optional().nullable(),
  vacation_days_used: z.number().int().nonnegative().optional(),
});

// Employee Update Schema
export const employeeUpdateSchema = employeeSchema.extend({
  id: z.string().uuid('ID de empleado inválido'),
});

// Supplier Schema
export const supplierSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  contact_name: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  tax_id: z.string().optional(),
});

// AP Bill Schema
export const apBillSchema = z.object({
  supplier_id: z.string().uuid('ID de proveedor inválido'),
  reference: z.string().optional(),
  date: z.string(),
  due_date: z.string(),
  total: z.number().positive('El total debe ser mayor a 0'),
  description: z.string().optional(),
});

// Payment Schema
export const paymentSchema = z.object({
  client_id: z.string().uuid('ID de cliente inválido').optional(),
  supplier_id: z.string().uuid('ID de proveedor inválido').optional(),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  payment_method: z.enum(['cash', 'card', 'transfer', 'check']).default('cash'),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

// Asset Schema
export const assetSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  acquisition_date: z.string(),
  acquisition_cost: z.number().positive('El costo debe ser mayor a 0'),
  useful_life_years: z.number().int().positive().optional(),
  category: z.string().optional(),
});

// CRM Opportunity Schema
export const opportunitySchema = z.object({
  client_id: z.string().uuid('ID de cliente inválido').optional(),
  title: z.string().min(1, 'El título es requerido'),
  value: z.number().nonnegative('El valor no puede ser negativo').optional(),
  stage_id: z.string().uuid('ID de etapa inválido').optional(),
  expected_close_date: z.string().optional(),
  notes: z.string().optional(),
});

// CRM Activity Schema
export const activitySchema = z.object({
  opportunity_id: z.string().uuid('ID de oportunidad inválido').optional(),
  client_id: z.string().uuid('ID de cliente inválido').optional(),
  type: z.enum(['call', 'email', 'meeting', 'note', 'task']),
  description: z.string().min(1, 'La descripción es requerida'),
  scheduled_at: z.string().optional(),
  completed: z.boolean().optional(),
});

// Organization Settings Schema
export const organizationSettingsSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  tax_id: z.string().optional(),
  logo_url: z.string().url().optional(),
});

// Tax Schema
export const taxSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  rate: z.number().min(0).max(100, 'La tasa debe estar entre 0 y 100'),
  is_default: z.boolean().optional(),
});

// Payment Method Schema
export const paymentMethodSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  is_active: z.boolean().optional(),
});

// Branch Schema
export const branchSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  address: z.string().optional(),
  phone: z.string().optional(),
});

// Kardex Query Schema
export const kardexQuerySchema = z.object({
  product_id: z.string().uuid('ID de producto inválido').optional(),
  branch_id: z.string().uuid('ID de sucursal inválido').optional(),
  movement_type: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
});

// Delete Schema (for DELETE operations)
export const deleteSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

// Product Delete Schema
export const productDeleteSchema = z.object({
  productId: z.string().uuid('ID de producto inválido'),
});

// Helper function to validate request body
export function validateRequest(schema, data) {
  try {
    // Guard against undefined schema
    if (!schema || typeof schema.parse !== 'function') {
      return {
        success: false,
        errors: [{ field: 'schema', message: 'Invalid validation schema' }],
      };
    }
    return {
      success: true,
      data: schema.parse(data),
    };
  } catch (error) {
    // Guard against non-Zod errors (which don't have .errors array)
    const zodErrors = Array.isArray(error.errors) ? error.errors : [];
    if (zodErrors.length === 0) {
      // Non-Zod error - return the error message directly
      return {
        success: false,
        errors: [{ field: 'unknown', message: error.message || 'Validation error' }],
      };
    }
    return {
      success: false,
      errors: zodErrors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    };
  }
}
