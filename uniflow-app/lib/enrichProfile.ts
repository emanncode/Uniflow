import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";

/** Resolve joined faculty/department data for mobile profile display. */
export async function enrichProfile(profile: Profile): Promise<Profile> {
  const enriched: Profile = { ...profile };

  const needsHodDept = enriched.role === "hod" && !enriched.department;
  const needsDeanFaculty = enriched.role === "dean" && !enriched.faculty;

  const [deptResult, deanFacultyResult] = await Promise.all([
    needsHodDept
      ? supabase
          .from("departments")
          .select("id, name, short_name, faculty")
          .eq("hod_id", enriched.id)
          .eq("university_id", enriched.university_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    needsDeanFaculty
      ? supabase
          .from("faculties")
          .select("id, name, short_name")
          .eq("dean_id", enriched.id)
          .eq("university_id", enriched.university_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  if (deptResult.data) {
    enriched.department = deptResult.data;
  }
  if (deanFacultyResult.data) {
    enriched.faculty = deanFacultyResult.data;
  }

  const facultyShort =
    enriched.department?.faculty ?? enriched.faculty?.short_name;
  if (facultyShort && !enriched.faculty?.name) {
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

export function getStudentLevelLabel(profile: Profile): string | null {
  if (profile.role !== "student" || profile.level == null) {
    return null;
  }
  return `${profile.level} Level`;
}