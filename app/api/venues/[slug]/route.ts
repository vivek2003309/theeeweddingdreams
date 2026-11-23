import { NextRequest } from "next/server";
import { getVenueDetailBySlug } from "@/lib/data/details";
import { jsonApiError, jsonApiSuccess } from "@/lib/security/apiGuards";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return jsonApiError("NOT_FOUND", "Venue not found.", 404);
  }

  const detail = getVenueDetailBySlug(slug);
  if (!detail) {
    return jsonApiError("NOT_FOUND", "Venue not found.", 404);
  }

  return jsonApiSuccess(
    { data: detail },
    200,
    {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    }
  );
}
