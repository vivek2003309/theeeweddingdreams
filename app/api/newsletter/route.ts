import { NextRequest } from "next/server";
import { newsletterSchema } from "@/lib/validation/enquiry";
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

export async function POST(req: NextRequest) {
  try {
    const ipHash = hashClientIp(extractClientIp(req));
    const rate = checkRateLimit("newsletter", ipHash, 10, 60 * 60 * 1000);
    if (!rate.allowed) {
      return jsonApiError(
        "RATE_LIMITED",
        "Too many subscription attempts. Please try again shortly.",
        429,
        { "Retry-After": String(rate.retryAfterSeconds) }
      );
    }

    const body = (await req.json()) as Record<string, unknown>;
    if (isHoneypotTriggered(body)) {
      return jsonApiSuccess({ subscribed: true }, 201);
    }

    const email =
      typeof body.email === "string"
        ? sanitizeText(body.email, 120).toLowerCase()
        : "";
    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) {
      return jsonApiError(
        "VALIDATION_FAILED",
        parsed.error.issues[0]?.message ?? "Please enter a valid email.",
        400
      );
    }

    if (isDisposableEmail(parsed.data.email)) {
      return jsonApiError(
        "VALIDATION_FAILED",
        "Please enter a non-disposable email address.",
        400
      );
    }

    // Generic 201 response to prevent email enumeration
    return jsonApiSuccess({ subscribed: true }, 201);
  } catch {
    return jsonApiError(
      "VALIDATION_FAILED",
      "Unable to process your subscription right now.",
      400
    );
  }
}
