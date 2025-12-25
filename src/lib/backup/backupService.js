/**
 * Backup & Data Recovery Service
 * Provides backup functionality for organization data
 */

import { supabaseAdmin } from "@/src/lib/supabase/server";

// Tables to backup per organization
const BACKUP_TABLES = [
  "products",
  "clients",
  "sales",
  "sales_items",
  "inventory_movements",
  "kardex",
  "accounts",
  "receivables",
  "payables",
  "payments",
  "suppliers",
  "employees",
  "branches",
  "cash_closings",
];

/**
 * Create a full backup for an organization
 */
export async function createOrgBackup(orgId) {
  if (!orgId) {
    return { success: false, backup: null, error: "Organization ID required" };
  }

  try {
    const backup = {
      org_id: orgId,
      created_at: new Date().toISOString(),
      version: "1.0",
      tables: {},
    };

    // Backup each table
    for (const table of BACKUP_TABLES) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select("*")
          .eq("org_id", orgId);

        if (!error) {
          backup.tables[table] = {
            count: data?.length || 0,
            data: data || [],
          };
        }
      } catch (tableError) {
        console.warn(`Could not backup table ${table}:`, tableError.message);
        backup.tables[table] = { count: 0, data: [], error: tableError.message };
      }
    }

    // Get organization details
    const { data: orgData } = await supabaseAdmin
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .single();

    backup.organization = orgData;

    // Store backup metadata
    const { data: backupRecord, error: insertError } = await supabaseAdmin
      .from("backups")
      .insert({
        org_id: orgId,
        type: "full",
        status: "completed",
        size_bytes: JSON.stringify(backup).length,
        tables_count: Object.keys(backup.tables).length,
        records_count: Object.values(backup.tables).reduce((sum, t) => sum + t.count, 0),
        created_at: backup.created_at,
      })
      .select()
      .single();

    if (insertError) {
      console.warn("Could not store backup metadata:", insertError.message);
    }

    return { 
      success: true, 
      backup,
      backupId: backupRecord?.id,
      error: null 
    };
  } catch (err) {
    console.error("Backup creation failed:", err);
    return { success: false, backup: null, error: err.message };
  }
}

/**
 * List available backups for an organization
 */
export async function listOrgBackups(orgId) {
  try {
    const { data, error } = await supabaseAdmin
      .from("backups")
      .select("id, type, status, size_bytes, tables_count, records_count, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return { backups: data || [], error: null };
  } catch (err) {
    return { backups: [], error: err.message };
  }
}

/**
 * Export organization data as JSON
 */
export async function exportOrgData(orgId, tables = BACKUP_TABLES) {
  try {
    const { success, backup, error } = await createOrgBackup(orgId);
    
    if (!success) {
      return { data: null, filename: null, error };
    }

    // Filter to requested tables only
    if (tables && tables.length > 0) {
      const filteredTables = {};
      for (const table of tables) {
        if (backup.tables[table]) {
          filteredTables[table] = backup.tables[table];
        }
      }
      backup.tables = filteredTables;
    }

    const filename = `backup_${orgId}_${new Date().toISOString().split("T")[0]}.json`;
    
    return {
      data: JSON.stringify(backup, null, 2),
      filename,
      error: null,
    };
  } catch (err) {
    return { data: null, filename: null, error: err.message };
  }
}

/**
 * Validate backup data structure
 */
export function validateBackupData(backupData) {
  const errors = [];

  if (!backupData) {
    errors.push("Backup data is empty");
    return { valid: false, errors };
  }

  if (!backupData.org_id) {
    errors.push("Missing organization ID");
  }

  if (!backupData.version) {
    errors.push("Missing backup version");
  }

  if (!backupData.tables || typeof backupData.tables !== "object") {
    errors.push("Missing or invalid tables data");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Restore data from backup (with safety checks)
 */
export async function restoreFromBackup(orgId, backupData, options = {}) {
  const { 
    dryRun = true,
    tables = null,
    overwrite = false 
  } = options;

  // Validate backup data
  const validation = validateBackupData(backupData);
  if (!validation.valid) {
    return { success: false, restored: null, error: validation.errors.join(", ") };
  }

  // Security check: ensure backup belongs to this org
  if (backupData.org_id !== orgId) {
    return { success: false, restored: null, error: "Backup does not belong to this organization" };
  }

  const restored = {
    tables: {},
    totalRecords: 0,
  };

  const tablesToRestore = tables || Object.keys(backupData.tables);

  try {
    for (const table of tablesToRestore) {
      const tableData = backupData.tables[table];
      if (!tableData || !tableData.data) continue;

      if (dryRun) {
        restored.tables[table] = {
          wouldRestore: tableData.data.length,
          status: "dry_run",
        };
        restored.totalRecords += tableData.data.length;
        continue;
      }

      // If overwrite, delete existing data first
      if (overwrite) {
        await supabaseAdmin.from(table).delete().eq("org_id", orgId);
      }

      // Insert backup data
      if (tableData.data.length > 0) {
        const { error } = await supabaseAdmin.from(table).insert(tableData.data);
        
        restored.tables[table] = {
          restored: error ? 0 : tableData.data.length,
          status: error ? "error" : "success",
          error: error?.message,
        };
        
        if (!error) {
          restored.totalRecords += tableData.data.length;
        }
      }
    }

    return { success: true, restored, error: null };
  } catch (err) {
    return { success: false, restored, error: err.message };
  }
}

/**
 * Schedule automatic backups
 */
export async function scheduleBackup(orgId, frequency = "daily") {
  try {
    const { error } = await supabaseAdmin
      .from("backup_schedules")
      .upsert({
        org_id: orgId,
        frequency,
        enabled: true,
        last_run: null,
        next_run: calculateNextRun(frequency),
        updated_at: new Date().toISOString(),
      }, { onConflict: "org_id" });

    return { success: !error, error: error?.message };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function calculateNextRun(frequency) {
  const now = new Date();
  switch (frequency) {
    case "daily":
      now.setDate(now.getDate() + 1);
      now.setHours(2, 0, 0, 0);
      break;
    case "weekly":
      now.setDate(now.getDate() + 7);
      now.setHours(2, 0, 0, 0);
      break;
    case "monthly":
      now.setMonth(now.getMonth() + 1);
      now.setDate(1);
      now.setHours(2, 0, 0, 0);
      break;
  }
  return now.toISOString();
}
