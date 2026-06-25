import { createSupabaseServer } from "./supabase-server";
import { createAdminClient } from "./supabase-admin";
import { getProfileForUser } from "./profile-server";
import type { UserRole } from "@/lib/role-access";

export type { UserRole } from "@/lib/role-access";

export async function getSession() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getProfileForUser(user.id);

  return {
    user,
    profile,
  };
}

/**
 * Check if a user is a university admin (exists in university_admins table).
 * If universityId is provided, also checks it matches.
 */
export async function isUniversityAdmin(userId: string, universityId?: string) {
  const supabase = createAdminClient();
  let query = supabase
    .from("university_admins")
    .select("id")
    .eq("user_id", userId);
  if (universityId) query = query.eq("university_id", universityId);
  const { data } = await query.maybeSingle();
  return !!data;
}

/**
 * Checks if the current user has permission to manage a specific university.
 * Returns true if the user is a uniflow_admin OR a university_admin for that university.
 */
export async function canManageUniversity(universityId: string) {
  const session = await getSession();
  if (!session || !session.profile) return false;

  const { user, profile } = session;

  // Uniflow admins can manage everything
  if (profile.role === "uniflow_admin") return true;

  // Check university_admins table (source of truth)
  if (profile.university_id === universityId) {
    return isUniversityAdmin(user.id, universityId);
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
