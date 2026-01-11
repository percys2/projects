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

export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  sku: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional().nullable(),
  price: z.number().positive('El precio debe ser mayor a 0'),
  cost: z.number().nonnegative('El costo no puede ser negativo').optional(),
});
// Helper para convertir strings vacios a null para campos numericos opcionales
const optionalNumberFromString = z.preprocess(
  (val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    const num = typeof val === "number" ? val : Number(val);
    return Number.isNaN(num) ? undefined : num;
  },
  z.number().optional().nullable()
);

// Helper para convertir strings vacios a undefined para campos string opcionales
const optionalString = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.string().optional().nullable()
);

// Helper para email opcional que acepta strings vacios
const optionalEmail = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.string().email('Email inválido').optional().nullable()
);

// Client Schema (updated for actual fields used)
export const clientSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  municipio: z.string().optional().nullable(),
  animal_type: z.string().optional().nullable(),
  sales_stage: z.string().optional().nullable(),
  latitude: optionalNumberFromString,
  longitude: optionalNumberFromString,
  is_credit_client: z.boolean().optional().default(false),
  credit_limit: z.number().nonnegative('El límite de crédito no puede ser negativo').optional().default(0),
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
  email: optionalEmail,
  phone: optionalString,
  cedula: optionalString,
  inss_number: optionalString,
  position: optionalString,
  department: optionalString,
  salary: optionalNumberFromString,
  commissions: optionalNumberFromString,
  hire_date: optionalString,
  contract_type: optionalString,
  status: optionalString,
  address: optionalString,
  emergency_contact: optionalString,
  emergency_phone: optionalString,
  bank_account: optionalString,
  bank_name: optionalString,
  vacation_days_used: optionalNumberFromString,
});

// Employee Update Schema
export const employeeUpdateSchema = employeeSchema.extend({
  id: z.string().uuid('ID de empleado inválido'),
});
// Supplier Schema
export const supplierSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  contact_name: optionalString,
  email: optionalEmail,
  phone: optionalString,
  address: optionalString,
  tax_id: optionalString,
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

// Helper para UUID opcional que acepta strings vacios
const optionalUuid = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.string().uuid('ID inválido').optional().nullable()
);

// Payment Schema
export const paymentSchema = z.object({
  date: optionalString,
  client_id: optionalUuid,
  supplier_id: optionalUuid,
  sale_id: optionalUuid,
  bill_id: optionalUuid,
  amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  method: optionalString,
  direction: optionalString,
  account_id: optionalUuid,
  reference: optionalString,
  notes: optionalString,
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
  client_id: z.string().uuid('ID de cliente inválido').optional().nullable(),
  title: z.string().min(1, 'El título es requerido'),
  amount: z.coerce.number().nonnegative('El valor no puede ser negativo').optional().nullable(),
  stage_id: z.string().uuid('ID de etapa inválido').optional().nullable(),
  expected_close_date: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
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

// ============================================================
// Odontology (Patients + Appointments)
// ============================================================
export const odontPatientSchema = z.object({
  first_name: z.string().min(1, "El nombre es requerido"),
  last_name: z.string().optional().nullable(),
  phone: optionalString,
  email: optionalEmail,
  dob: optionalString, // YYYY-MM-DD or ISO string
  sex: optionalString, // 'F' | 'M' | 'O' (validated in DB/app logic)
  address: optionalString,
  emergency_contact_name: optionalString,
  emergency_contact_phone: optionalString,
  notes: optionalString,
  odontogram: z.any().optional().nullable(),
});

export const odontPatientUpdateSchema = odontPatientSchema.extend({
  id: z.string().uuid("ID de paciente inválido"),
});

export const odontAppointmentSchema = z.object({
  patient_id: z.string().uuid("ID de paciente inválido"),
  dentist_name: optionalString,
  scheduled_at: z.string().min(1, "La fecha/hora es requerida"),
  duration_minutes: z.coerce.number().int().min(5).max(480).optional(),
  status: z.enum(["scheduled", "confirmed", "completed", "cancelled", "no_show"]).optional(),
  reason: optionalString,
  notes: optionalString,
});

export const odontAppointmentUpdateSchema = odontAppointmentSchema.extend({
  id: z.string().uuid("ID de cita inválido"),
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
