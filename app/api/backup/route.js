import { NextResponse } from "next/server";
import { validateOrgAccess } from "@/src/lib/middleware/multiTenancy";
import { 
  createOrgBackup, 
  listOrgBackups, 
  exportOrgData,
  scheduleBackup 
} from "@/src/lib/backup/backupService";

export async function GET(req) {
  try {
    const { org, error } = await validateOrgAccess(req);
    if (error) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "list";

    switch (action) {
      case "list": {
        const { backups, error: listError } = await listOrgBackups(org.id);
        if (listError) {
          return NextResponse.json({ error: listError }, { status: 500 });
        }
        return NextResponse.json({ success: true, backups });
      }

      case "export": {
        const tables = searchParams.get("tables")?.split(",").filter(Boolean);
        const { data, filename, error: exportError } = await exportOrgData(org.id, tables);
        
        if (exportError) {
          return NextResponse.json({ error: exportError }, { status: 500 });
        }

        return new Response(data, {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err) {
    console.error("Backup GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { org, error } = await validateOrgAccess(req);
    if (error) {
      return NextResponse.json({ error }, { status: 403 });
    }

    const body = await req.json();
    const { action = "create" } = body;

    switch (action) {
      case "create": {
        const { success, backup, backupId, error: backupError } = await createOrgBackup(org.id);
        
        if (!success) {
          return NextResponse.json({ error: backupError }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true, 
          message: "Backup created successfully",
          backupId,
          summary: {
            tables: Object.keys(backup.tables).length,
            records: Object.values(backup.tables).reduce((sum, t) => sum + t.count, 0),
            created_at: backup.created_at,
          }
        });
      }

      case "schedule": {
        const { frequency = "daily" } = body;
        const { success, error: scheduleError } = await scheduleBackup(org.id, frequency);
        
        if (!success) {
          return NextResponse.json({ error: scheduleError }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true, 
          message: `Backup scheduled: ${frequency}` 
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err) {
    console.error("Backup POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
