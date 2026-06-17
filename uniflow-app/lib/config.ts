/** Public web app URL (password reset API, deep links, etc.). */
export const WEB_APP_URL =
  process.env.EXPO_PUBLIC_WEB_APP_URL?.replace(/\/$/, "") ||
  "https://uniflow-ebon.vercel.app";