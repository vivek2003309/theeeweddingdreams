import test from "node:test";
import assert from "node:assert/strict";
import {
  checkRateLimit,
  clampPagination,
  escapeCsvCell,
  hashClientIp,
  isDisposableEmail,
  isHoneypotTriggered,
  sanitizeText,
} from "./apiGuards.ts";
import {
  canAccessModule,
  canApproveApplications,
  canEditHero,
  canEditListings,
  canExportLeadsCsv,
  canManageLeads,
  canReadApplicationDocs,
  canReadPrivateVault,
  canViewAuditLog,
  canWritePrivateVault,
} from "./rbac.ts";

test("RBAC matrix enforces SECURITY.md §2 isolation for admin, editor, and concierge", () => {
  // Admin has full control
  assert.equal(canReadPrivateVault("admin"), true);
  assert.equal(canWritePrivateVault("admin"), true);
  assert.equal(canApproveApplications("admin"), true);
  assert.equal(canExportLeadsCsv("admin"), true);
  assert.equal(canViewAuditLog("admin"), true);

  // Editor can edit hero & public listings, but NEVER read partner_private, approve apps, or access leads
  assert.equal(canEditHero("editor"), true);
  assert.equal(canEditListings("editor"), true);
  assert.equal(canReadPrivateVault("editor"), false);
  assert.equal(canWritePrivateVault("editor"), false);
  assert.equal(canReadApplicationDocs("editor"), false);
  assert.equal(canApproveApplications("editor"), false);
  assert.equal(canAccessModule("editor", "leads"), false);
  assert.equal(canViewAuditLog("editor"), false);

  // Concierge can manage leads and read partner_private, but NEVER write private vault, approve apps, edit hero, or export CSV
  assert.equal(canManageLeads("concierge"), true);
  assert.equal(canReadPrivateVault("concierge"), true);
  assert.equal(canWritePrivateVault("concierge"), false);
  assert.equal(canEditHero("concierge"), false);
  assert.equal(canEditListings("concierge"), false);
  assert.equal(canApproveApplications("concierge"), false);
  assert.equal(canExportLeadsCsv("concierge"), false);
  assert.equal(canViewAuditLog("concierge"), false);
});

test("clampPagination caps pageSize at 24 per API_SPEC.md", () => {
  assert.deepEqual(clampPagination("1", "100"), { page: 1, pageSize: 24 });
  assert.deepEqual(clampPagination("-5", "0"), { page: 1, pageSize: 12 });
  assert.deepEqual(clampPagination("2", "18"), { page: 2, pageSize: 18 });
});

test("sanitizeText strips HTML tags and enforces length caps", () => {
  const cleaned = sanitizeText("<script>alert(1)</script> Udaipur <b>Palace</b>", 30);
  assert.equal(cleaned.includes("<script>"), false);
  assert.equal(cleaned.includes("<b>"), false);
  assert.ok(cleaned.length <= 30);
});

test("escapeCsvCell neutralizes spreadsheet formula injection", () => {
  assert.equal(escapeCsvCell("=CMD|' /C calc'!A0"), `"'=CMD|' /C calc'!A0"`);
  assert.equal(escapeCsvCell("+91 98100 11223"), `"'+91 98100 11223"`);
  assert.equal(escapeCsvCell('Aarav "Royal" Kapoor'), `'"Aarav ""Royal"" Kapoor"'`.replace(/^'|'$/g, ""));
});

test("honeypot, disposable email, salted IP hash, and rate limiter work deterministically", () => {
  assert.equal(isHoneypotTriggered({ website_url: "https://spam.bot" }), true);
  assert.equal(isHoneypotTriggered({ websiteHoneypot: "" }), false);
  assert.equal(isDisposableEmail("test@mailinator.com"), true);
  assert.equal(isDisposableEmail("couple@example.com"), false);

  const hashA = hashClientIp("203.0.113.5");
  const hashB = hashClientIp("203.0.113.5");
  assert.equal(hashA, hashB);
  assert.equal(hashA.length, 24);

  const r1 = checkRateLimit("unit-test", "k1", 2, 10_000);
  const r2 = checkRateLimit("unit-test", "k1", 2, 10_000);
  const r3 = checkRateLimit("unit-test", "k1", 2, 10_000);
  assert.equal(r1.allowed, true);
  assert.equal(r2.allowed, true);
  assert.equal(r3.allowed, false);
  assert.ok(r3.retryAfterSeconds >= 1);
});
