import { NextRequest } from "next/server";
import { z } from "zod";
import { findPartnerStatusRecord } from "@/lib/data/filters";
import { MOCK_PARTNER_STATUS_SEED } from "@/lib/data/mockAdapter";
import {
  checkRateLimit,
  extractClientIp,
  hashClientIp,
  jsonApiError,
  jsonApiSuccess,
  sanitizeText,
} from "@/lib/security/apiGuards";

const statusQuerySchema = z.object({
  reference: z.string().min(4).max(32),
  email: z.string().email().max(120),
});

export async function POST(req: NextRequest) {
  try {
    const ipHash = hashClientIp(extractClientIp(req));
    const rate = checkRateLimit("partner-status", ipHash, 20, 60_000);
    if (!rate.allowed) {
      return jsonApiError(
        "RATE_LIMITED",
        "Too many status checks. Please wait a moment.",
        429,
        { "Retry-After": String(rate.retryAfterSeconds) }
      );
    }

    const body = (await req.json()) as Record<string, unknown>;
    const parsed = statusQuerySchema.safeParse({
      reference: sanitizeText(String(body.reference ?? ""), 32),
      email: sanitizeText(String(body.email ?? ""), 120),
    });

    if (!parsed.success) {
      return jsonApiError(
        "VALIDATION_FAILED",
        "Please provide both a valid reference code and email address.",
        400
      );
    }

    const record = findPartnerStatusRecord(
      MOCK_PARTNER_STATUS_SEED,
      parsed.data.reference,
      parsed.data.email
    );

    if (!record) {
      // Generic response per API_SPEC.md §2.9 to prevent enumeration
      return jsonApiSuccess({ data: { status: "not_found" } }, 200);
    }

    return jsonApiSuccess(
      {
        data: {
          referenceId: record.referenceId,
          brandName: record.brandName,
          status: record.status,
          submittedAt: record.submittedAt,
          note: record.note,
        },
      },
      200
    );
  } catch {
    return jsonApiError(
      "VALIDATION_FAILED",
      "Unable to look up application status right now.",
      400
    );
  }
}
