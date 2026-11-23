export type StaffRole = "admin" | "editor" | "concierge";

export type AdminModule =
  | "dashboard"
  | "hero"
  | "applications"
  | "listings"
  | "leads";

export interface StaffProfile {
  role: StaffRole;
  name: string;
  title: string;
  mfaEnrolled: boolean;
}

export const MOCK_STAFF_PROFILES: Record<StaffRole, StaffProfile> = {
  admin: {
    role: "admin",
    name: "Ananya Rathore",
    title: "Managing Director · Admin",
    mfaEnrolled: true,
  },
  editor: {
    role: "editor",
    name: "Meera Sen",
    title: "Editorial Curator · Editor",
    mfaEnrolled: true,
  },
  concierge: {
    role: "concierge",
    name: "Siddharth Verma",
    title: "Lead Concierge · Concierge",
    mfaEnrolled: true,
  },
};

/**
 * Permission matrix strictly following SECURITY.md §2.
 */
export function canAccessModule(role: StaffRole, mod: AdminModule): boolean {
  if (role === "admin") return true;
  if (role === "editor") {
    return mod !== "leads";
  }
  // concierge
  return mod === "dashboard" || mod === "leads" || mod === "listings";
}

export function canEditHero(role: StaffRole): boolean {
  return role === "admin" || role === "editor";
}

export function canEditListings(role: StaffRole): boolean {
  return role === "admin" || role === "editor";
}

export function canReadPrivateVault(role: StaffRole): boolean {
  // Editor CANNOT read partner_private (contact, pricing, GST)
  return role === "admin" || role === "concierge";
}

export function canWritePrivateVault(role: StaffRole): boolean {
  return role === "admin";
}

export function canReadApplicationDocs(role: StaffRole): boolean {
  return role === "admin";
}

export function canApproveApplications(role: StaffRole): boolean {
  return role === "admin";
}

export function canManageLeads(role: StaffRole): boolean {
  return role === "admin" || role === "concierge";
}

export function canExportLeadsCsv(role: StaffRole): boolean {
  return role === "admin";
}

export function canViewAuditLog(role: StaffRole): boolean {
  return role === "admin";
}
