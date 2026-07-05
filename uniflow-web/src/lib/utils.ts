import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Internal bootstrap password for Supabase createUser only — never returned to clients. */
export function generateTempPassword(length: number = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  // Ensure it has at least one uppercase, one lowercase, one number, and one special char
  // Simple way to ensure it meets common requirements
  return password + "A1!"
}

/**
 * Safe error response for APIs.
 * Never leak raw DB / internal error details to clients in production.
 */
export function safeErrorResponse(err: unknown, fallback = "An error occurred") {
  const isDev = process.env.NODE_ENV !== "production";
  const message = err instanceof Error ? err.message : String(err);

  // In production, return generic message unless it's a known client error
  if (!isDev) {
    // Allow specific safe messages
    if (message.includes("required") || message.includes("Invalid") || message.includes("not found") || message.includes("Unauthorized")) {
      return { error: message };
    }
    return { error: fallback };
  }
  return { error: message };
}
