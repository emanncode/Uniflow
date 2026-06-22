/** Detect embedded email / social in-app browsers that often break auth cookies. */
export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || navigator.vendor || "";

  return /FBAN|FBAV|Instagram|Line\/|Twitter|LinkedInApp|GSA\/|Gmail|Outlook-iOS|Outlook-Android|wv\)/i.test(
    ua,
  );
}