export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  ACCOUNTANT: "accountant",
  CASHIER: "cashier",
  WAREHOUSE: "warehouse",
  VIEWER: "viewer",
};

export const PERMISSIONS = {
  VIEW_DASHBOARD: "view_dashboard",
  VIEW_POS: "view_pos",
  CREATE_SALE: "create_sale",
  VOID_SALE: "void_sale",
  VIEW_INVENTORY: "view_inventory",
  MANAGE_INVENTORY: "manage_inventory",
  VIEW_PRODUCTS: "view_products",
  MANAGE_PRODUCTS: "manage_products",
  VIEW_CRM: "view_crm",
  MANAGE_CRM: "manage_crm",
  VIEW_HR: "view_hr",
  MANAGE_HR: "manage_hr",
  VIEW_FINANCE: "view_finance",
  MANAGE_FINANCE: "manage_finance",
  VIEW_REPORTS: "view_reports",
  EXPORT_REPORTS: "export_reports",
  VIEW_SETTINGS: "view_settings",
  MANAGE_SETTINGS: "manage_settings",
  MANAGE_USERS: "manage_users",
  OPEN_CASH: "open_cash",
  CLOSE_CASH: "close_cash",
  DELETE_RECORDS: "delete_records",
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_POS,
    PERMISSIONS.CREATE_SALE,
    PERMISSIONS.VOID_SALE,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.VIEW_CRM,
    PERMISSIONS.MANAGE_CRM,
    PERMISSIONS.VIEW_HR,
    PERMISSIONS.VIEW_FINANCE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.OPEN_CASH,
    PERMISSIONS.CLOSE_CASH,
    PERMISSIONS.DELETE_RECORDS,
  ],
  
  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_CRM,
    PERMISSIONS.VIEW_HR,
    PERMISSIONS.MANAGE_HR,
    PERMISSIONS.VIEW_FINANCE,
    PERMISSIONS.MANAGE_FINANCE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_SETTINGS,
  ],
  
  [ROLES.CASHIER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_POS,
    PERMISSIONS.CREATE_SALE,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_CRM,
    PERMISSIONS.OPEN_CASH,
    PERMISSIONS.CLOSE_CASH,
  ],
  
  [ROLES.WAREHOUSE]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.MANAGE_PRODUCTS,
  ],
  
  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_CRM,
    PERMISSIONS.VIEW_REPORTS,
  ],
};

export function hasPermission(userRole, permission) {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

export function hasAnyPermission(userRole, permissions) {
  if (!userRole) return false;
  return permissions.some((p) => hasPermission(userRole, p));
}

export function hasAllPermissions(userRole, permissions) {
  if (!userRole) return false;
  return permissions.every((p) => hasPermission(userRole, p));
}

export function getPermissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}

export function canAccessModule(userRole, module) {
  const modulePermissions = {
    dashboard: [PERMISSIONS.VIEW_DASHBOARD],
    pos: [PERMISSIONS.VIEW_POS],
    inventory: [PERMISSIONS.VIEW_INVENTORY],
    kardex: [PERMISSIONS.VIEW_INVENTORY],
    products: [PERMISSIONS.VIEW_PRODUCTS],
    crm: [PERMISSIONS.VIEW_CRM],
    hr: [PERMISSIONS.VIEW_HR],
    finance: [PERMISSIONS.VIEW_FINANCE],
    reports: [PERMISSIONS.VIEW_REPORTS],
    settings: [PERMISSIONS.VIEW_SETTINGS],
  };

  const required = modulePermissions[module];
  if (!required) return true;
  
  return hasAnyPermission(userRole, required);
}

export function filterMenuByRole(menuItems, userRole) {
  return menuItems.filter((item) => {
    if (!item.module) return true;
    return canAccessModule(userRole, item.module);
  });
}

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Administrador",
  [ROLES.MANAGER]: "Gerente",
  [ROLES.ACCOUNTANT]: "Contador",
  [ROLES.CASHIER]: "Cajero",
  [ROLES.WAREHOUSE]: "Bodeguero",
  [ROLES.VIEWER]: "Solo Lectura",
};

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || role;
}
