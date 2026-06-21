import { createAdminClient } from "./supabase-admin";

export type ProfileAccess = {
  role: string;
  university_id: string | null;
  universities?: { short_name?: string } | null;
};

/** Read a user's profile with the service role (bypasses broken RLS). */
export async function getProfileForUser(
  userId: string,
  options?: { includeUniversity?: boolean },
): Promise<ProfileAccess | null> {
  const supabase = createAdminClient();

  if (options?.includeUniversity) {
    const { data, error } = await supabase
      .from("profiles")
      .select("role, university_id, universities(short_name)")
      .eq("id", userId)
      .single();

    if (error || !data) return null;
    return data as unknown as ProfileAccess;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("role, university_id")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data;
}