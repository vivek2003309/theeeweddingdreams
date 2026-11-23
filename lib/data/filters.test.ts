import test from "node:test";
import assert from "node:assert/strict";
import {
  filterPublicVendors,
  filterPublicVenues,
  findPartnerStatusRecord,
  formatTierDiamonds,
  generateEnquiryReferenceCode,
  generatePartnerReferenceCode,
  matchesGuestBand,
} from "./filters";
import {
  MOCK_DECOR_PLATES,
  MOCK_EXPERIENCES,
  MOCK_HERO_SLIDES,
  MOCK_PARTNER_STATUS_SEED,
  MOCK_PROCESSION_STEPS,
  MOCK_VENDORS,
  MOCK_VENUES,
} from "./mockAdapter";
import {
  conciergeEnquirySchema,
  newsletterSchema,
  partnerApplicationSchema,
} from "../validation/enquiry";

test("Seed datasets meet Phase 0 & Phase 2 counts (6 hero, 12 venues, 18 vendors, 4 experiences, 5 steps)", () => {
  assert.equal(MOCK_HERO_SLIDES.length, 6);
  assert.equal(MOCK_VENUES.length, 12);
  assert.equal(MOCK_VENDORS.length, 18);
  assert.equal(MOCK_DECOR_PLATES.length, 6);
  assert.equal(MOCK_EXPERIENCES.length, 4);
  assert.equal(MOCK_PROCESSION_STEPS.length, 5);
});

test("formatTierDiamonds renders diamonds rather than prices", () => {
  assert.deepEqual(formatTierDiamonds("classic"), {
    diamonds: "◇",
    label: "Classic",
  });
  assert.deepEqual(formatTierDiamonds("grand"), {
    diamonds: "◇◇",
    label: "Grand",
  });
  assert.deepEqual(formatTierDiamonds("royal"), {
    diamonds: "◇◇◇",
    label: "Royal",
  });
});

test("filterPublicVenues filters by city, setting, tier, and guestBand", () => {
  const udaipur = filterPublicVenues(MOCK_VENUES, { city: "udaipur" });
  assert.equal(udaipur.length, 3);

  const royalPalaces = filterPublicVenues(MOCK_VENUES, {
    setting: "heritage-palace",
    tier: "royal",
  });
  assert.equal(royalPalaces.length, 2);

  const largeBand = filterPublicVenues(MOCK_VENUES, { guestBand: "500-plus" });
  assert.ok(largeBand.length >= 2);
  assert.ok(largeBand.every((v) => v.capacityMax >= 500));

  assert.equal(matchesGuestBand(60, 220, "under-100"), true);
  assert.equal(matchesGuestBand(200, 900, "under-100"), false);
});

test("filterPublicVendors filters by category, city, and tier", () => {
  const florals = filterPublicVendors(MOCK_VENDORS, {
    category: "decor-florals",
  });
  assert.equal(florals.length, 3);

  const royalJaipur = filterPublicVendors(MOCK_VENDORS, {
    city: "jaipur",
    tier: "royal",
  });
  assert.equal(royalJaipur.length, 2);
});

test("Public listings never leak private contact or exact pricing fields", () => {
  const forbidden = [
    "phone",
    "email",
    "whatsapp",
    "gst",
    "pan",
    "price",
    "exactPrice",
    "internalNotes",
  ];
  for (const item of [...MOCK_VENUES, ...MOCK_VENDORS]) {
    const keys = Object.keys(item);
    for (const key of forbidden) {
      assert.equal(keys.includes(key), false, `Forbidden key leaked: ${key}`);
    }
    const serialized = JSON.stringify(item);
    assert.equal(serialized.includes("@"), false);
    assert.equal(serialized.includes("₹"), false);
  }
});

test("Reference generators and partner status lookup work cleanly", () => {
  const leadCode = generateEnquiryReferenceCode(1732140000000);
  const partnerCode = generatePartnerReferenceCode(1732140000000);
  assert.ok(leadCode.startsWith("TWD-"));
  assert.ok(partnerCode.startsWith("TWD-P"));

  const found = findPartnerStatusRecord(
    MOCK_PARTNER_STATUS_SEED,
    "twd-p1042",
    "CONCIERGE-DEMO@EXAMPLE.COM"
  );
  assert.ok(found);
  assert.equal(found.status, "pending_verification");

  const wrongEmail = findPartnerStatusRecord(
    MOCK_PARTNER_STATUS_SEED,
    "TWD-P1042",
    "other@example.com"
  );
  assert.equal(wrongEmail, null);
});

test("Zod schemas validate concierge enquiry, partner application, and newsletter cleanly", () => {
  assert.equal(newsletterSchema.safeParse({ email: "not-an-email" }).success, false);

  const validEnquiry = conciergeEnquirySchema.safeParse({
    interestType: "venue",
    city: "udaipur",
    celebrationDate: "November 2026",
    guestCount: "250-500",
    tier: "royal",
    fullName: "Aarav & Meera",
    email: "aarav@example.com",
    phone: "+91 98111 00000",
    consent: true,
    humanVerified: true,
    websiteHoneypot: "",
  });
  assert.equal(validEnquiry.success, true);

  const validPartner = partnerApplicationSchema.safeParse({
    role: "venue-owner",
    brandName: "Surya Heritage Palace",
    city: "jaipur",
    categoryOrSetting: "Heritage Palace",
    yearsActive: "14 years",
    brandSummary: "Restored 19th-century sandstone courtyard hosting private buyouts.",
    portfolioLinks: [{ url: "https://vimeo.com/example4k" }],
    tier: "royal",
    capacityBand: "250-500",
    contactName: "Vikram Singh",
    email: "director@suryapalace.in",
    phone: "+91 98290 12345",
    gstNumber: "08AAACS1234A1Z5",
    consent: true,
    humanVerified: true,
    websiteHoneypot: "",
  });
  assert.equal(validPartner.success, true);
});
