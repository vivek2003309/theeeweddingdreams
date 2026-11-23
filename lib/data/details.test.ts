import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPublicVendorJsonLd,
  buildPublicVenueJsonLd,
  getVendorDetailBySlug,
  getVenueDetailBySlug,
} from "./details";
import { MOCK_VENDORS, MOCK_VENUES } from "./mockAdapter";

test("getVenueDetailBySlug resolves valid slug and returns null for unknown slug", () => {
  const first = MOCK_VENUES[0];
  const detail = getVenueDetailBySlug(first.slug);
  assert.ok(detail);
  assert.equal(detail.name, first.name);
  assert.equal(detail.gallery.length, 6);
  assert.equal(detail.spaces.length, 3);

  assert.equal(getVenueDetailBySlug("non-existent-palace"), null);
});

test("getVendorDetailBySlug resolves valid slug and returns null for unknown slug", () => {
  const first = MOCK_VENDORS[0];
  const detail = getVendorDetailBySlug(first.slug);
  assert.ok(detail);
  assert.equal(detail.name, first.name);
  assert.equal(detail.gallery.length, 4);
  assert.equal(detail.signatureOfferings.length, 3);

  assert.equal(getVendorDetailBySlug("non-existent-atelier"), null);
});

test("Venue & Vendor detail payloads and JSON-LD never leak private contacts or prices", () => {
  const venue = getVenueDetailBySlug(MOCK_VENUES[0].slug)!;
  const vendor = getVendorDetailBySlug(MOCK_VENDORS[0].slug)!;
  const serialized = JSON.stringify({
    venue,
    vendor,
    venueLd: buildPublicVenueJsonLd(venue),
    vendorLd: buildPublicVendorJsonLd(vendor),
  });

  assert.equal(serialized.includes("telephone"), false);
  assert.equal(serialized.includes("priceRange"), false);
  assert.equal(serialized.includes("@gmail"), false);
  assert.equal(serialized.includes("whatsapp"), false);
  assert.equal(serialized.includes("₹"), false);
});
