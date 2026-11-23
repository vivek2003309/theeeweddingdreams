import { NextRequest } from "next/server";
import { partnerApplicationSchema } from "@/lib/validation/enquiry";
import { generatePartnerReferenceCode } from "@/lib/data/filters";
import {
  checkRateLimit,
  extractClientIp,
  hashClientIp,
  isDisposableEmail,
  isHoneypotTriggered,
  jsonApiError,
  jsonApiSuccess,
  sanitizeText,
} from "@/lib/security/apiGuards";

const MAX_APPLICATION_BYTES = 100 * 1024; // 100 KB per SECURITY.md §6

export async function POST(req: NextRequest) {
  try {
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_APPLICATION_BYTES) {
      return jsonApiError(
        "PAYLOAD_TOO_LARGE",
        "Application payload exceeds the maximum allowed size.",
        413
      );
    }

    const ipHash = hashClientIp(extractClientIp(req));
    const rate = checkRateLimit("partner-apps", ipHash, 10, 24 * 60 * 60 * 1000);
    if (!rate.allowed) {
      return jsonApiError(
        "RATE_LIMITED",
        "Please pause before submitting another partner application.",
        429,
        { "Retry-After": String(rate.retryAfterSeconds) }
      );
    }

    const rawText = await req.text();
    if (rawText.length > MAX_APPLICATION_BYTES) {
      return jsonApiError(
        "PAYLOAD_TOO_LARGE",
        "Application payload exceeds the maximum allowed size.",
        413
      );
    }

    const body = JSON.parse(rawText) as Record<string, unknown>;

    if (isHoneypotTriggered(body)) {
      const referenceId = generatePartnerReferenceCode();
      return jsonApiSuccess(
        {
          referenceId,
          status: "pending_verification",
          data: { reference: referenceId, status: "pending_verification" },
        },
        202
      );
    }

    const sanitizedPayload = {
      ...body,
      brandName:
        typeof body.brandName === "string"
          ? sanitizeText(body.brandName, 120)
          : body.brandName,
      contactName:
        typeof body.contactName === "string"
          ? sanitizeText(body.contactName, 80)
          : body.contactName,
      email:
        typeof body.email === "string"
          ? sanitizeText(body.email, 120).toLowerCase()
          : body.email,
      brandSummary:
        typeof body.brandSummary === "string"
          ? sanitizeText(body.brandSummary, 600)
          : body.brandSummary,
    };

    const parsed = partnerApplicationSchema.safeParse(sanitizedPayload);
    if (!parsed.success) {
      return jsonApiError(
        "VALIDATION_FAILED",
        parsed.error.issues[0]?.message ??
          "Please review your application details.",
        400
      );
    }

    if (isDisposableEmail(parsed.data.email)) {
      return jsonApiError(
        "VALIDATION_FAILED",
        "Please provide an official business or studio email address.",
        400
      );
    }

    const referenceId = generatePartnerReferenceCode();

    // Never publish publicly — every partner application enters pending_verification.
    return jsonApiSuccess(
      {
        received: true,
        referenceId,
        status: "pending_verification",
        mode: process.env.DATA_ADAPTER ?? "mock",
        data: {
          reference: referenceId,
          status: "pending_verification",
        },
      },
      201
    );
  } catch {
    return jsonApiError(
      "VALIDATION_FAILED",
      "Unable to receive your application right now.",
      400
    );
  }
}
