export type PortalRole = "uniflow_admin" | "university_admin";

export async function verifyPortalAccess(
  accessToken: string,
  portal: PortalRole,
) {
  return fetch("/api/auth/verify-portal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ portal }),
    credentials: "include",
  });
}