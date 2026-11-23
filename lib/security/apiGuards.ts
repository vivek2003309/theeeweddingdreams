import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const FALLBACK_SALT = crypto.randomBytes(16).toString("hex");

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "10minutemail.com",
  "yopmail.com",
  "throwaway.email",
  "trashmail.com",
]);

const rateBuckets = new Map<
  string,
  { count: number; resetAt: number }
>();

export function createRequestId(): string {
  return `req_${crypto.randomBytes(8).toString("hex")}`;
}

export function hashClientIp(rawIp: string): string {
  const salt = process.env.IP_HASH_SALT || FALLBACK_SALT;
  return crypto
    .createHmac("sha256", salt)
    .update(rawIp.trim() || "local")
    .digest("hex")
    .slice(0, 24);
}

export function extractClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "local"
  );
}

export function checkRateLimit(
  bucket: string,
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
  const compositeKey = `${bucket}:${key}`;
  const now = Date.now();
  const entry = rateBuckets.get(compositeKey);

  if (!entry || entry.resetAt <= now) {
    rateBuckets.set(compositeKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function sanitizeText(value: string, maxLength = 2000): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function isDisposableEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1] ?? "";
  return DISPOSABLE_DOMAINS.has(domain);
}

export function isHoneypotTriggered(body: Record<string, unknown>): boolean {
  const h1 = body.websiteHoneypot;
  const h2 = body.website_url;
  return (
    (typeof h1 === "string" && h1.trim().length > 0) ||
    (typeof h2 === "string" && h2.trim().length > 0)
  );
}

export function clampPagination(
  pageRaw?: string | number | null,
  pageSizeRaw?: string | number | null
): { page: number; pageSize: number } {
  const parsedPage = Number(pageRaw ?? 1);
  const parsedSize = Number(pageSizeRaw ?? 12);
  const page =
    Number.isFinite(parsedPage) && parsedPage >= 1 ? Math.floor(parsedPage) : 1;
  const pageSize =
    Number.isFinite(parsedSize) && parsedSize >= 1
      ? Math.min(24, Math.floor(parsedSize))
      : 12;
  return { page, pageSize };
}

export { escapeCsvCell } from "./csv";

export function jsonApiSuccess<T>(
  payload: T,
  status = 200,
  extraHeaders?: Record<string, string>
) {
  const requestId = createRequestId();
  return NextResponse.json(payload, {
    status,
    headers: {
      "x-request-id": requestId,
      ...extraHeaders,
    },
  });
}

export function jsonApiError(
  code:
    | "VALIDATION_FAILED"
    | "RATE_LIMITED"
    | "NOT_FOUND"
    | "PAYLOAD_TOO_LARGE"
    | "FORBIDDEN"
    | "INTERNAL",
  message: string,
  status: number,
  extraHeaders?: Record<string, string>
) {
  const requestId = createRequestId();
  return NextResponse.json(
    {
      error: message,
      errorDetail: { code, message },
    },
    {
      status,
      headers: {
        "x-request-id": requestId,
        ...extraHeaders,
      },
    }
  );
}
