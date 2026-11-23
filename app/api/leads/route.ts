import { NextRequest } from "next/server";
import { conciergeEnquirySchema } from "@/lib/validation/enquiry";
import { generateEnquiryReferenceCode } from "@/lib/data/filters";
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

const MAX_LEAD_BYTES = 20 * 1024; // 20 KB per SECURITY.md §6

export async function POST(req: NextRequest) {
  try {
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_LEAD_BYTES) {
      return jsonApiError(
        "PAYLOAD_TOO_LARGE",
        "Enquiry payload exceeds the allowed size limit.",
        413
      );
    }

    const ipHash = hashClientIp(extractClientIp(req));
    const rate = checkRateLimit("leads", ipHash, 12, 60 * 60 * 1000);
    if (!rate.allowed) {
      return jsonApiError(
        "RATE_LIMITED",
        "Too many enquiries submitted. Please wait a moment and try again.",
        429,
        { "Retry-After": String(rate.retryAfterSeconds) }
      );
    }

    const rawText = await req.text();
    if (rawText.length > MAX_LEAD_BYTES) {
      return jsonApiError(
        "PAYLOAD_TOO_LARGE",
        "Enquiry payload exceeds the allowed size limit.",
        413
      );
    }

    const body = JSON.parse(rawText) as Record<string, unknown>;

    // Honeypot check: return generic 201/202 without storing (anti-enumeration)
    if (isHoneypotTriggered(body)) {
      const referenceCode = generateEnquiryReferenceCode();
      return jsonApiSuccess(
        {
          received: true,
          referenceCode,
          data: {
            reference: referenceCode,
            message:
              "Thank you. Your concierge will be in touch within 24 hours.",
          },
        },
        202
      );
    }

    const sanitizedPayload = {
      ...body,
      fullName:
        typeof body.fullName === "string"
          ? sanitizeText(body.fullName, 80)
          : body.fullName,
      email:
        typeof body.email === "string"
          ? sanitizeText(body.email, 120).toLowerCase()
          : body.email,
      briefNotes:
        typeof body.briefNotes === "string"
          ? sanitizeText(body.briefNotes, 1200)
          : body.briefNotes,
    };

    const parsed = conciergeEnquirySchema.safeParse(sanitizedPayload);
    if (!parsed.success) {
      return jsonApiError(
        "VALIDATION_FAILED",
        parsed.error.issues[0]?.message ??
          "Please review the highlighted fields.",
        400
      );
    }

    if (isDisposableEmail(parsed.data.email)) {
      return jsonApiError(
        "VALIDATION_FAILED",
        "Please use a permanent personal or family email address so our concierge can reach you.",
        400
      );
    }

    const referenceCode = generateEnquiryReferenceCode();

    return jsonApiSuccess(
      {
        received: true,
        referenceCode,
        mode: process.env.DATA_ADAPTER ?? "mock",
        data: {
          reference: referenceCode,
          message:
            "Thank you. Your concierge will be in touch within 24 hours.",
        },
      },
      201
    );
  } catch {
    return jsonApiError(
      "VALIDATION_FAILED",
      "Unable to process your enquiry at this moment.",
      400
    );
  }
}
