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
  client_id: z.string().uuid('ID de cliente inválido').optional(),
  total: z.number().positive('El total debe ser mayor a 0'),
  payment_method: z.enum(['cash', 'card', 'transfer', 'credit']).default('cash'),
  notes: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().uuid('ID de producto inválido'),
    quantity: z.number().positive('La cantidad debe ser mayor a 0'),
    price: z.number().positive('El precio debe ser mayor a 0'),
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

// Client Schema
export const clientSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  tax_id: z.string().optional(),
});

// Inventory Movement Schema
export const inventoryMovementSchema = z.object({
  product_id: z.string().uuid('ID de producto inválido'),
  quantity: z.number().int('La cantidad debe ser un número entero'),
  movement_type: z.enum(['purchase', 'sale', 'adjustment', 'return']),
  notes: z.string().optional(),
  reference_id: z.string().uuid().optional(),
});

// Helper function to validate request body
export function validateRequest(schema, data) {
  try {
    return {
      success: true,
      data: schema.parse(data),
    };
  } catch (error) {
    return {
      success: false,
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    };
  }
}
