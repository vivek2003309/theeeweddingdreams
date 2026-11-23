import { jsonApiSuccess } from "@/lib/security/apiGuards";

export async function GET() {
  return jsonApiSuccess(
    {
      ok: true,
      adapter: process.env.DATA_ADAPTER ?? "mock",
    },
    200
  );
}
