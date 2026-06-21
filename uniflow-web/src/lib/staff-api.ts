export type StaffRole = "student" | "lecturer" | "dean" | "hod";

export const LECTURER_ROLES: StaffRole[] = ["lecturer", "dean", "hod"];

export function staffApiUrl(
  universityId: string,
  options?: {
    roles?: StaffRole[];
    countOnly?: boolean;
    limit?: number;
  },
): string {
  const params = new URLSearchParams({ university_id: universityId });
  if (options?.roles?.length) {
    params.set("role", options.roles.join(","));
  }
  if (options?.countOnly) {
    params.set("count_only", "true");
  }
  if (options?.limit) {
    params.set("limit", String(options.limit));
  }
  return `/api/staff?${params}`;
}