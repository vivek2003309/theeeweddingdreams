import { NextRequest } from "next/server";
import { getDataAdapter } from "@/lib/data";
import { filterPublicVendors } from "@/lib/data/filters";
import type {
  BudgetTier,
  CitySlug,
  VendorCategorySlug,
} from "@/lib/data/types";
import {
  checkRateLimit,
  clampPagination,
  extractClientIp,
  hashClientIp,
  jsonApiError,
  jsonApiSuccess,
  sanitizeText,
} from "@/lib/security/apiGuards";

export async function GET(req: NextRequest) {
  const ipHash = hashClientIp(extractClientIp(req));
  const rate = checkRateLimit("public-vendors", ipHash, 120, 60_000);
  if (!rate.allowed) {
    return jsonApiError(
      "RATE_LIMITED",
      "Rate limit reached. Please pause briefly.",
      429,
      { "Retry-After": String(rate.retryAfterSeconds) }
    );
  }

  const sp = req.nextUrl.searchParams;
  const city = (sp.get("city") as CitySlug | null) ?? "all";
  const category = (sp.get("category") as VendorCategorySlug | null) ?? "all";
  const tier = (sp.get("tier") as BudgetTier | null) ?? "all";
  const query = sanitizeText(sp.get("q") ?? "", 80).toLowerCase();
  const { page, pageSize } = clampPagination(sp.get("page"), sp.get("pageSize"));

  const adapter = getDataAdapter();
  const allVendors = await adapter.getFeaturedVendors();

  let filtered = filterPublicVendors(allVendors, {
    city,
    category,
    tier,
  });

  if (query) {
    filtered = filtered.filter(
      (v) =>
        v.name.toLowerCase().includes(query) ||
        v.city.toLowerCase().includes(query) ||
        v.specialty.toLowerCase().includes(query)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return jsonApiSuccess(
    { data, page, pageSize, total },
    200,
    {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    }
  );
}
