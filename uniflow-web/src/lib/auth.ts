import { createSupabaseServer } from "./supabase-server";

export type UserRole = "uniflow_admin" | "university_admin" | "dean" | "hod" | "lecturer" | "student";

export async function getSession() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, university_id")
    .eq("id", user.id)
    .single();

  return {
    user,
    profile,
  };
}

/**
 * Checks if the current user has permission to manage a specific university.
 * Returns true if the user is a uniflow_admin OR a university_admin for that university.
 */
export async function canManageUniversity(universityId: string) {
  const session = await getSession();
  if (!session || !session.profile) return false;

  const { profile } = session;

  // Uniflow admins can manage everything
  if (profile.role === "uniflow_admin") return true;

  // Only university admins can manage their portal
  const allowedRoles: UserRole[] = ["university_admin"];
  if (profile.university_id === universityId && allowedRoles.includes(profile.role as UserRole)) {
    return true;
  }

  return false;
}

/**
 * Checks if the current user is a uniflow_admin.
 */
export async function isSuperAdmin() {
  const session = await getSession();
  return session?.profile?.role === "uniflow_admin";
}
