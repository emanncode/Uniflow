import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";

/** Resolve joined faculty/department data for mobile profile display. */
export async function enrichProfile(profile: Profile): Promise<Profile> {
  const enriched: Profile = { ...profile };

  if (enriched.role === "hod" && !enriched.department) {
    const { data: dept } = await supabase
      .from("departments")
      .select("id, name, short_name, faculty")
      .eq("hod_id", enriched.id)
      .eq("university_id", enriched.university_id)
      .maybeSingle();
    if (dept) {
      enriched.department = dept;
    }
  }

  if (enriched.role === "dean" && !enriched.faculty) {
    const { data: facultyData } = await supabase
      .from("faculties")
      .select("id, name, short_name")
      .eq("dean_id", enriched.id)
      .eq("university_id", enriched.university_id)
      .maybeSingle();
    if (facultyData) {
      enriched.faculty = facultyData;
    }
  }

  if (enriched.department?.faculty && !enriched.faculty?.name) {
    const facultyShort = enriched.department.faculty;
    const { data: facultyData } = await supabase
      .from("faculties")
      .select("id, name, short_name")
      .eq("short_name", facultyShort)
      .eq("university_id", enriched.university_id)
      .maybeSingle();
    if (facultyData) {
      enriched.faculty = facultyData;
    }
  }

  return enriched;
}

export function formatEntityLabel(
  name: string,
  shortName: string,
): string {
  return `${name} (${shortName})`;
}

export function getFacultyLabel(profile: Profile): string | null {
  if (profile.faculty?.name && profile.faculty.short_name) {
    return formatEntityLabel(profile.faculty.name, profile.faculty.short_name);
  }
  if (profile.department?.faculty) {
    return profile.department.faculty;
  }
  return null;
}

export function getDepartmentLabel(profile: Profile): string | null {
  if (!profile.department?.name || !profile.department.short_name) {
    return null;
  }
  return formatEntityLabel(
    profile.department.name,
    profile.department.short_name,
  );
}