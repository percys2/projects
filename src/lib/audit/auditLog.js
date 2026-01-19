import { supabaseAdmin } from "@/src/lib/supabase/server";

/**
 * Audit logging for critical operations
 * Logs important actions for security and compliance
 */

const supabase = supabaseAdmin;

/**
 * Log an audit event
 * @param {object} params
 * @param {string} params.userId - User who performed the action
 * @param {string} params.orgId - Organization ID
 * @param {string} params.action - Action performed (e.g., 'create_sale', 'delete_product')
 * @param {string} params.resourceType - Type of resource (e.g., 'sale', 'product', 'user')
 * @param {string} params.resourceId - ID of the resource
 * @param {object} params.metadata - Additional metadata
 * @param {string} params.ipAddress - IP address of the request
 */
export async function logAuditEvent({
  userId,
  orgId,
  action,
  resourceType,
  resourceId,
  metadata = {},
  ipAddress,
}) {
  try {
    // For now, log to console in development
    // In production, this would go to a dedicated audit_logs table
    const auditEntry = {
      timestamp: new Date().toISOString(),
      userId,
      orgId,
      action,
      resourceType,
      resourceId,
      metadata,
      ipAddress,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', JSON.stringify(auditEntry, null, 2));
    }

    // Store in database if audit_logs table exists
    try {
      const { error: dbError } = await supabase.from('audit_logs').insert({
        user_id: userId,
        org_id: orgId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        metadata,
        ip_address: ipAddress,
      });

      if (dbError) {
        // Table might not exist yet, log to console as fallback
        console.warn('[AUDIT] Database insert failed, using console fallback:', dbError.message);
      }
    } catch (dbError) {
      // Table might not exist, continue with console logging
      console.warn('[AUDIT] Database insert failed, using console fallback:', dbError.message);
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw - audit logging should not break the main operation
    return { success: false, error: error.message };
  }
}

/**
 * Audit actions enum
 */
export const AuditActions = {
  // User actions
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_REGISTER: 'user_register',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  
  // Sale actions
  SALE_CREATE: 'sale_create',
  SALE_UPDATE: 'sale_update',
  SALE_DELETE: 'sale_delete',
  
  // Product actions
  PRODUCT_CREATE: 'product_create',
  PRODUCT_UPDATE: 'product_update',
  PRODUCT_DELETE: 'product_delete',
  
  // Inventory actions
  INVENTORY_ADJUST: 'inventory_adjust',
  INVENTORY_MOVEMENT: 'inventory_movement',
  INVENTORY_DELETE: 'inventory_delete',
  
  // Organization actions
  ORG_CREATE: 'org_create',
  ORG_UPDATE: 'org_update',
  ORG_MEMBER_ADD: 'org_member_add',
  ORG_MEMBER_REMOVE: 'org_member_remove',
  ORG_MEMBER_ROLE_CHANGE: 'org_member_role_change',
  
  // Client actions
  CLIENT_CREATE: 'client_create',
  CLIENT_UPDATE: 'client_update',
  CLIENT_DELETE: 'client_delete',
  
  // Employee actions
  EMPLOYEE_CREATE: 'employee_create',
  EMPLOYEE_UPDATE: 'employee_update',
  EMPLOYEE_DELETE: 'employee_delete',
  
  // Finance actions
  SUPPLIER_CREATE: 'supplier_create',
  SUPPLIER_UPDATE: 'supplier_update',
  SUPPLIER_DELETE: 'supplier_delete',
  AP_BILL_CREATE: 'ap_bill_create',
  AP_BILL_UPDATE: 'ap_bill_update',
  AP_BILL_DELETE: 'ap_bill_delete',
  PAYMENT_CREATE: 'payment_create',
  PAYMENT_UPDATE: 'payment_update',
  PAYMENT_DELETE: 'payment_delete',
  ASSET_CREATE: 'asset_create',
  ASSET_UPDATE: 'asset_update',
  ASSET_DELETE: 'asset_delete',
  
  // CRM actions
  OPPORTUNITY_CREATE: 'opportunity_create',
  OPPORTUNITY_UPDATE: 'opportunity_update',
  OPPORTUNITY_DELETE: 'opportunity_delete',
  ACTIVITY_CREATE: 'activity_create',
  ACTIVITY_UPDATE: 'activity_update',
  ACTIVITY_DELETE: 'activity_delete',
  
  // Settings actions
  SETTINGS_UPDATE: 'settings_update',
  TAX_CREATE: 'tax_create',
  TAX_UPDATE: 'tax_update',
  TAX_DELETE: 'tax_delete',
  PAYMENT_METHOD_CREATE: 'payment_method_create',
  PAYMENT_METHOD_UPDATE: 'payment_method_update',
  PAYMENT_METHOD_DELETE: 'payment_method_delete',
  BRANCH_CREATE: 'branch_create',
  BRANCH_UPDATE: 'branch_update',
  BRANCH_DELETE: 'branch_delete',

  // Odontology actions
  PATIENT_CREATE: 'patient_create',
  PATIENT_UPDATE: 'patient_update',
  PATIENT_DELETE: 'patient_delete',
  APPOINTMENT_CREATE: 'appointment_create',
  APPOINTMENT_UPDATE: 'appointment_update',
  APPOINTMENT_DELETE: 'appointment_delete',
};
