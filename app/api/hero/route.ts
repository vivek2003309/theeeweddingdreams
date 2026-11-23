import { getDataAdapter } from "@/lib/data";
import { jsonApiSuccess } from "@/lib/security/apiGuards";

export async function GET() {
  const adapter = getDataAdapter();
  const slides = await adapter.getHeroSlides();
  return jsonApiSuccess(
    { data: slides },
    200,
    {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    }
  );
}
