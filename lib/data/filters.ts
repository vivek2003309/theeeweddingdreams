import type {
  BudgetTier,
  CitySlug,
  GuestBand,
  PartnerStatusRecord,
  PublicVendor,
  PublicVenue,
  VendorCategorySlug,
  VenueSettingSlug,
} from "./types";

export function formatTierDiamonds(tier: BudgetTier): {
  diamonds: string;
  label: string;
} {
  switch (tier) {
    case "classic":
      return { diamonds: "◇", label: "Classic" };
    case "grand":
      return { diamonds: "◇◇", label: "Grand" };
    case "royal":
      return { diamonds: "◇◇◇", label: "Royal" };
  }
}

export function matchesGuestBand(
  capacityMin: number,
  capacityMax: number,
  band?: GuestBand
): boolean {
  if (!band || band === "all") return true;
  switch (band) {
    case "under-100":
      return capacityMin <= 100;
    case "100-250":
      return capacityMax >= 100 && capacityMin <= 250;
    case "250-500":
      return capacityMax >= 250 && capacityMin <= 500;
    case "500-plus":
      return capacityMax >= 500;
  }
}

export function filterPublicVenues(
  venues: PublicVenue[],
  criteria: {
    city?: CitySlug | "all";
    setting?: VenueSettingSlug | "all";
    tier?: BudgetTier | "all";
    guestBand?: GuestBand;
    guestCount?: number;
  }
): PublicVenue[] {
  return venues.filter((venue) => {
    if (criteria.city && criteria.city !== "all" && venue.citySlug !== criteria.city) {
      return false;
    }
    if (
      criteria.setting &&
      criteria.setting !== "all" &&
      venue.settingSlug !== criteria.setting
    ) {
      return false;
    }
    if (criteria.tier && criteria.tier !== "all" && venue.tier !== criteria.tier) {
      return false;
    }
    if (
      criteria.guestBand &&
      !matchesGuestBand(venue.capacityMin, venue.capacityMax, criteria.guestBand)
    ) {
      return false;
    }
    if (
      typeof criteria.guestCount === "number" &&
      criteria.guestCount > 0 &&
      (criteria.guestCount < venue.capacityMin ||
        criteria.guestCount > venue.capacityMax)
    ) {
      return false;
    }
    return true;
  });
}

export function filterPublicVendors(
  vendors: PublicVendor[],
  criteria: {
    category?: VendorCategorySlug | "all";
    city?: CitySlug | "all";
    tier?: BudgetTier | "all";
  }
): PublicVendor[] {
  return vendors.filter((vendor) => {
    if (
      criteria.category &&
      criteria.category !== "all" &&
      vendor.categorySlug !== criteria.category
    ) {
      return false;
    }
    if (criteria.city && criteria.city !== "all" && vendor.citySlug !== criteria.city) {
      return false;
    }
    if (criteria.tier && criteria.tier !== "all" && vendor.tier !== criteria.tier) {
      return false;
    }
    return true;
  });
}

export function generateEnquiryReferenceCode(seedTimestamp?: number): string {
  const ts = seedTimestamp ?? Date.now();
  const suffix = (ts % 100000).toString(36).toUpperCase().padStart(4, "0");
  return `TWD-${suffix}`;
}

export function generatePartnerReferenceCode(seedTimestamp?: number): string {
  const ts = seedTimestamp ?? Date.now();
  const suffix = (ts % 100000).toString(36).toUpperCase().padStart(4, "0");
  return `TWD-P${suffix}`;
}

export function findPartnerStatusRecord(
  records: PartnerStatusRecord[],
  referenceId: string,
  email: string
): PartnerStatusRecord | null {
  const normalizedRef = referenceId.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedRef || !normalizedEmail) return null;

  return (
    records.find(
      (rec) =>
        rec.referenceId.toUpperCase() === normalizedRef &&
        rec.email.toLowerCase() === normalizedEmail
    ) ?? null
  );
}
