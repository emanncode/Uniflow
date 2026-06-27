/**
 * Email validation + common domain typo correction.
 *
 * Goal: Catch the most frequent misspellings of popular mail providers
 * (gmail, yahoo, hotmail, outlook, etc.) when admins register students/staff
 * or upload CSVs, and when universities submit the public registration form.
 */

import { Resend } from "resend";
import { APP_URL, BASE_DOMAIN } from "@/lib/domain";

const BASIC_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Common correct domains we care about protecting.
const POPULAR_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
] as const;

// Explicit typo → correction map (domain part only, lowercase, no @).
// Keep this focused on high-frequency real-world typos.
const DOMAIN_TYPO_CORRECTIONS: Record<string, string> = {
  // Gmail (very common typos)
  "gmai.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmaail.com": "gmail.com",
  "gmailll.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.cim": "gmail.com",
  "gmail.om": "gmail.com",
  "gmail.conm": "gmail.com",
  "gnail.com": "gmail.com",
  "gail.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmil.com": "gmail.com",
  "gemail.com": "gmail.com",
  "gmeil.com": "gmail.com",

  // Yahoo
  "yahooo.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "yahho.com": "yahoo.com",
  "yahhoo.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "yaho.co.uk": "yahoo.co.uk",
  "yahooo.co.uk": "yahoo.co.uk",
  "yah.com": "yahoo.com",

  // Hotmail / Outlook / Live / MSN
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmial.co": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmaill.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outloook.com": "outlook.com",
  "outlook.co": "outlook.com",
  "outlook.con": "outlook.com",
  "outlok.co": "outlook.com",
  "outlokk.com": "outlook.com",
  "outloookk.com": "outlook.com",
  "liv.com": "live.com",
  "live.co": "live.com",
  "live.con": "live.com",
  "msn.com": "outlook.com", // often used interchangeably

  // Others
  "icould.com": "icloud.com",
  "icloud.co": "icloud.com",
  "iclould.com": "icloud.com",
  "aol.co": "aol.com",
  "protonmail.co": "protonmail.com",
  "protmail.com": "protonmail.com",
  "proton.me": "proton.me",
};

/**
 * Corrects common typos in the domain part of an email address.
 * Returns a normalized (lowercased) email with domain fixed when a known typo is detected.
 * If no correction applies, returns the lowercased original.
 */
export function correctEmailDomain(email: string): string {
  if (!email || typeof email !== "string") return email;

  const trimmed = email.trim();
  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex === -1) return trimmed.toLowerCase();

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1).toLowerCase();

  const correctedDomain = DOMAIN_TYPO_CORRECTIONS[domain] ?? domain;
  return `${local}@${correctedDomain}`.toLowerCase();
}

/**
 * Basic structural email format check (local@domain.tld style).
 * Does NOT do full RFC validation — just enough to catch obvious garbage.
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  return BASIC_EMAIL_REGEX.test(email.trim());
}

export interface EmailValidationResult {
  valid: boolean;
  /** Lowercased + domain-corrected version ready for storage/lookup */
  normalized: string;
  /** Original input (trimmed) */
  original: string;
  /** True if we applied a domain correction */
  wasCorrected: boolean;
  /** Human-friendly error when !valid */
  error?: string;
  /** The correction we applied (only when wasCorrected) */
  correctedTo?: string;
}

/**
 * Validates an email and returns a normalized version with common domain typos corrected.
 *
 * Usage in forms/CSV:
 *   const result = validateAndNormalizeEmail(raw);
 *   if (!result.valid) { showError(result.error); return; }
 *   const finalEmail = result.normalized;
 */
export function validateAndNormalizeEmail(
  email: string,
): EmailValidationResult {
  const original = (email || "").trim();
  if (!original) {
    return {
      valid: false,
      normalized: "",
      original,
      wasCorrected: false,
      error: "Email is required",
    };
  }

  const normalized = correctEmailDomain(original);
  const wasCorrected = normalized !== original.toLowerCase();

  if (!isValidEmailFormat(normalized)) {
    return {
      valid: false,
      normalized,
      original,
      wasCorrected,
      error: "Enter a valid email address",
      ...(wasCorrected ? { correctedTo: normalized } : {}),
    };
  }

  return {
    valid: true,
    normalized,
    original,
    wasCorrected,
    ...(wasCorrected ? { correctedTo: normalized } : {}),
  };
}

/**
 * Convenience helper that returns just the normalized email or throws with a message.
 * Useful for quick guards.
 */
export function normalizeOrThrow(email: string): string {
  const r = validateAndNormalizeEmail(email);
  if (!r.valid) {
    throw new Error(r.error || "Invalid email");
  }
  return r.normalized;
}

// ─── Transactional email (Resend) ───────────────────────────────────────────

const DEFAULT_FROM = "Uniflow <onboarding@resend.dev>";

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendEmail(to: string, subject: string, html: string) {
  const resend = getResendClient();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return;
  }

  const from = process.env.RESEND_FROM || DEFAULT_FROM;
  const { error } = await resend.emails.send({ from, to, subject, html });

  if (error) {
    throw new Error(error.message);
  }
}

export function registrationReceivedEmail(universityName: string) {
  const name = escapeHtml(universityName);
  return `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0a0a0b; color: #ffffff; border-radius: 16px;">
  <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 4px;">uni<span style="color: #ff5c1a;">flow</span></h1>
  <p style="font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 32px;">Registration Received</p>
  <p style="font-size: 15px; color: #a1a1a1; margin: 0 0 8px;">Application received ✓</p>
  <p style="font-size: 13px; color: #666666; margin: 0 0 24px;">Thank you for registering <strong style="color: #ffffff;">${name}</strong> on Uniflow. Our team will review your application and get back to you within <strong style="color: #a1a1a1;">48 hours</strong>.</p>
  <div style="background: rgba(255,92,26,0.08); border: 1px solid rgba(255,92,26,0.2); border-radius: 12px; padding: 16px 20px; margin: 0 0 24px;">
    <p style="font-size: 12px; color: #666666; margin: 0 0 4px;">What happens next:</p>
    <p style="font-size: 13px; color: #a1a1a1; margin: 0 0 4px;">① Our team reviews your application</p>
    <p style="font-size: 13px; color: #a1a1a1; margin: 0 0 4px;">② You receive an approval or rejection email</p>
    <p style="font-size: 13px; color: #a1a1a1; margin: 0;">③ If approved — your portal is live and you receive login credentials</p>
  </div>
  <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 0 0 24px;" />
  <p style="font-size: 12px; color: #444444; margin: 0;">© Uniflow · ${BASE_DOMAIN}</p>
</div>`;
}

export function universityApprovedEmail(
  universityName: string,
  shortName: string,
  email: string,
  resetUrl: string,
) {
  const name = escapeHtml(universityName);
  const portal = escapeHtml(`${shortName}-admin.${BASE_DOMAIN}`);
  const loginEmail = escapeHtml(email);
  const safeResetUrl = escapeHtml(resetUrl);

  return `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0a0a0b; color: #ffffff; border-radius: 16px;">
  <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 4px;">uni<span style="color: #ff5c1a;">flow</span></h1>
  <p style="font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 32px;">Application Approved</p>
  <p style="font-size: 15px; color: #a1a1a1; margin: 0 0 8px;">Welcome to Uniflow, <strong style="color: #ffffff;">${name}</strong> 🎓</p>
  <p style="font-size: 13px; color: #666666; margin: 0 0 24px;">Your university has been approved. Your portal is live. Set your password to access your dashboard.</p>
  <div style="background: rgba(255,92,26,0.08); border: 1px solid rgba(255,92,26,0.2); border-radius: 12px; padding: 16px 20px; margin: 0 0 24px;">
    <p style="font-size: 12px; color: #666666; margin: 0 0 8px;">Your portal details:</p>
    <p style="font-size: 13px; color: #a1a1a1; margin: 0 0 4px;">Portal: <strong style="color: #ff5c1a; font-family: monospace;">${portal}</strong></p>
    <p style="font-size: 13px; color: #a1a1a1; margin: 0;">Login email: <strong style="color: #ffffff;">${loginEmail}</strong></p>
  </div>
  <a href="${safeResetUrl}" style="display: inline-block; background: #ff5c1a; color: #ffffff; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 10px; text-decoration: none; margin: 0 0 24px;">Set Password &amp; Get Started →</a>
  <p style="font-size: 13px; color: #666666; margin: 24px 0 8px;">This link expires in <strong style="color: #a1a1a1;">24 hours</strong>.</p>
  <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 0 0 24px;" />
  <p style="font-size: 12px; color: #444444; margin: 0;">© Uniflow · ${BASE_DOMAIN}</p>
</div>`;
}

export function universityRejectedEmail(
  universityName: string,
  reason: string,
) {
  const name = escapeHtml(universityName);
  const safeReason = escapeHtml(reason);
  const registerUrl = escapeHtml(`${APP_URL}/register`);

  return `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0a0a0b; color: #ffffff; border-radius: 16px;">
  <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 4px;">uni<span style="color: #ff5c1a;">flow</span></h1>
  <p style="font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 32px;">Application Update</p>
  <p style="font-size: 15px; color: #a1a1a1; margin: 0 0 8px;">We couldn't approve your application.</p>
  <p style="font-size: 13px; color: #666666; margin: 0 0 24px;">After reviewing the registration for <strong style="color: #ffffff;">${name}</strong>, we were unable to approve it at this time.</p>
  <div style="background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 16px 20px; margin: 0 0 24px;">
    <p style="font-size: 12px; color: #666666; margin: 0 0 6px;">Reason:</p>
    <p style="font-size: 13px; color: #a1a1a1; margin: 0; line-height: 1.6;">${safeReason}</p>
  </div>
  <a href="${registerUrl}" style="display: inline-block; background: #ff5c1a; color: #ffffff; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 10px; text-decoration: none; margin: 0 0 24px;">Reapply →</a>
  <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 0 0 24px;" />
  <p style="font-size: 12px; color: #444444; margin: 0;">© Uniflow · ${BASE_DOMAIN}</p>
</div>`;
}
