import { NextResponse } from "next/server";
import { headers } from "next/headers";

// Simple in-memory rate limiter (for demo / low traffic).
// In production, use Redis/Upstash/Vercel KV for distributed rate limiting.
const rateLimitStore = new Map<string, { count: number; reset: number }>();

export async function rateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60_000
): Promise<NextResponse | null> {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.reset) {
    rateLimitStore.set(key, { count: 1, reset: now + windowMs });
    return null;
  }

  if (record.count >= limit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  record.count++;
  return null;
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}
