/**
 * Multi-Tenancy Security Middleware
 * Ensures data isolation between organizations
 */

import { supabaseAdmin } from "@/src/lib/supabase/server";

/**
 * Validates organization access and returns org data
 * @param {Request} req - The incoming request
 * @param {string} userId - Optional user ID to verify membership
 * @returns {Promise<{org: object, error: string|null}>}
 */
export async function validateOrgAccess(req, userId = null) {
  const orgSlug = req.headers.get("x-org-slug");
  
  if (!orgSlug) {
    return { org: null, error: "Missing organization identifier" };
  }

  // Sanitize org slug to prevent injection
  const sanitizedSlug = orgSlug.replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 50);
  
  if (sanitizedSlug !== orgSlug) {
    return { org: null, error: "Invalid organization identifier format" };
  }

  try {
    const { data: org, error } = await supabaseAdmin
      .from("organizations")
      .select("id, slug, name, status")
      .eq("slug", sanitizedSlug)
      .single();

    if (error || !org) {
      return { org: null, error: "Organization not found" };
    }

    // Check if organization is active
    if (org.status && org.status !== "active") {
      return { org: null, error: "Organization is not active" };
    }

    // If userId provided, verify user belongs to this organization
    if (userId) {
      const { data: membership, error: memberError } = await supabaseAdmin
        .from("organization_members")
        .select("id, role")
        .eq("org_id", org.id)
        .eq("user_id", userId)
        .single();

      if (memberError || !membership) {
        return { org: null, error: "User does not have access to this organization" };
      }

      org.userRole = membership.role;
    }

    return { org, error: null };
  } catch (err) {
    console.error("Multi-tenancy validation error:", err);
    return { org: null, error: "Failed to validate organization access" };
  }
}

/**
 * Ensures a query is scoped to the correct organization
 */
export function scopeToOrg(query, orgId, orgColumn = "org_id") {
  if (!orgId) {
    throw new Error("Organization ID is required for data access");
  }
  return query.eq(orgColumn, orgId);
}

/**
 * Validates that a record belongs to the specified organization
 */
export async function validateRecordOwnership(table, recordId, orgId) {
  if (!recordId || !orgId) {
    return false;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select("id")
      .eq("id", recordId)
      .eq("org_id", orgId)
      .single();

    return !error && !!data;
  } catch {
    return false;
  }
}

/**
 * Rate limiting per organization
 */
const rateLimitStore = new Map();

export function checkRateLimit(orgId, limit = 100, windowMs = 60000) {
  const now = Date.now();
  const key = `rate:${orgId}`;
  
  let record = rateLimitStore.get(key);
  
  if (!record || now - record.windowStart > windowMs) {
    record = { count: 1, windowStart: now };
    rateLimitStore.set(key, record);
    return { allowed: true, remaining: limit - 1 };
  }
  
  record.count++;
  
  if (record.count > limit) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((record.windowStart + windowMs - now) / 1000) };
  }
  
  return { allowed: true, remaining: limit - record.count };
}

/**
 * Audit log for sensitive operations
 */
export async function auditLog(orgId, action, resource, resourceId, details = {}, userId = null) {
  try {
    await supabaseAdmin.from("audit_logs").insert({
      org_id: orgId,
      action,
      resource,
      resource_id: resourceId,
      details,
      user_id: userId,
      ip_address: details.ip || null,
      user_agent: details.userAgent || null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to create audit log:", err);
  }
}

/**
 * Helper to create a secure API response handler
 */
export function withOrgValidation(handler) {
  return async (req, ...args) => {
    const { org, error } = await validateOrgAccess(req);
    
    if (error) {
      return new Response(JSON.stringify({ error }), {
        status: error.includes("not found") ? 404 : 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check rate limit
    const rateLimit = checkRateLimit(org.id);
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ 
        error: "Rate limit exceeded",
        retryAfter: rateLimit.retryAfter 
      }), {
        status: 429,
        headers: { 
          "Content-Type": "application/json",
          "Retry-After": String(rateLimit.retryAfter),
        },
      });
    }

    // Add org to request context
    req.org = org;
    
    return handler(req, ...args);
  };
}
