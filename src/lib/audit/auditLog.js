import { createClient } from "@supabase/supabase-js";

/**
 * Audit logging for critical operations
 * Logs important actions for security and compliance
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

    // TODO: Store in database
    // Uncomment when audit_logs table is created
    /*
    await supabase.from('audit_logs').insert({
      user_id: userId,
      org_id: orgId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
      ip_address: ipAddress,
    });
    */

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
  
  // Organization actions
  ORG_CREATE: 'org_create',
  ORG_UPDATE: 'org_update',
  ORG_MEMBER_ADD: 'org_member_add',
  ORG_MEMBER_REMOVE: 'org_member_remove',
  ORG_MEMBER_ROLE_CHANGE: 'org_member_role_change',
};
