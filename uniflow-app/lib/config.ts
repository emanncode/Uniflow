function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. For local dev add it to uniflow-app/.env.local. ` +
        "For EAS builds set it with: eas env:create --environment development --environment preview --environment production",
    );
  }
  return value;
}

/** Supabase project URL */
export const SUPABASE_URL = requireEnv(
  "EXPO_PUBLIC_SUPABASE_URL",
  process.env.EXPO_PUBLIC_SUPABASE_URL,
);

/** Supabase anon/public key */
export const SUPABASE_ANON_KEY = requireEnv(
  "EXPO_PUBLIC_SUPABASE_ANON_KEY",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
);

/**
 * Public web app URL — password reset API, deep links, etc.
 * Set EXPO_PUBLIC_WEB_APP_URL in .env.local (e.g. http://localhost:3000 for local web).
 */
export const WEB_APP_URL = (
  process.env.EXPO_PUBLIC_WEB_APP_URL?.replace(/\/$/, "") ||
  "https://uniflowapp.xyz"
);

/** Build a full URL to a web app API route or page. */
export function webAppUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${WEB_APP_URL}${normalized}`;
}

/** Where Supabase password-reset emails should send users (web page). */
export const PASSWORD_RESET_URL = webAppUrl("/reset-password");