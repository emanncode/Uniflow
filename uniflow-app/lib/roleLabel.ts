import type { UserRole } from "@/types";

const MOBILE_ROLE_LABELS: Partial<Record<UserRole, string>> = {
  student: "Student",
  lecturer: "Lecturer",
  dean: "Dean",
  hod: "HOD",
};

export function getMobileRoleLabel(role: UserRole): string {
  return (
    MOBILE_ROLE_LABELS[role] ??
    role.charAt(0).toUpperCase() + role.slice(1)
  );
}