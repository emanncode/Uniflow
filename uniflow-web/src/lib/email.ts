/**
 * Email validation + common domain typo correction.
 *
 * Goal: Catch the most frequent misspellings of popular mail providers
 * (gmail, yahoo, hotmail, outlook, etc.) when admins register students/staff
 * or upload CSVs, and when universities submit the public registration form.
 */

const BASIC_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Common correct domains we care about protecting.
const POPULAR_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
] as const;

// Explicit typo → correction map (domain part only, lowercase, no @).
// Keep this focused on high-frequency real-world typos.
const DOMAIN_TYPO_CORRECTIONS: Record<string, string> = {
  // Gmail (very common typos)
  'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmaail.com': 'gmail.com',
  'gmailll.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmail.cim': 'gmail.com',
  'gmail.om': 'gmail.com',
  'gmail.conm': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gail.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmil.com': 'gmail.com',
  'gemail.com': 'gmail.com',
  'gmeil.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmial.com': 'gmail.com',

  // Yahoo
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'yahho.com': 'yahoo.com',
  'yahhoo.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'yaho.co.uk': 'yahoo.co.uk',
  'yahooo.co.uk': 'yahoo.co.uk',
  'yah.com': 'yahoo.com',

  // Hotmail / Outlook / Live / MSN
  'hotmial.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'hotmial.co': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloook.com': 'outlook.com',
  'outlook.co': 'outlook.com',
  'outlook.con': 'outlook.com',
  'outlok.co': 'outlook.com',
  'outlokk.com': 'outlook.com',
  'outloookk.com': 'outlook.com',
  'liv.com': 'live.com',
  'live.co': 'live.com',
  'live.con': 'live.com',
  'msn.com': 'outlook.com', // often used interchangeably

  // Others
  'icould.com': 'icloud.com',
  'icloud.co': 'icloud.com',
  'iclould.com': 'icloud.com',
  'aol.co': 'aol.com',
  'protonmail.co': 'protonmail.com',
  'protmail.com': 'protonmail.com',
  'proton.me': 'proton.me',
};

/**
 * Corrects common typos in the domain part of an email address.
 * Returns a normalized (lowercased) email with domain fixed when a known typo is detected.
 * If no correction applies, returns the lowercased original.
 */
export function correctEmailDomain(email: string): string {
  if (!email || typeof email !== 'string') return email;

  const trimmed = email.trim();
  const atIndex = trimmed.lastIndexOf('@');
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
  if (!email || typeof email !== 'string') return false;
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
export function validateAndNormalizeEmail(email: string): EmailValidationResult {
  const original = (email || '').trim();
  if (!original) {
    return {
      valid: false,
      normalized: '',
      original,
      wasCorrected: false,
      error: 'Email is required',
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
      error: 'Enter a valid email address',
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
    throw new Error(r.error || 'Invalid email');
  }
  return r.normalized;
}
