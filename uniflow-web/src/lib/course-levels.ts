export const ALL_COURSE_LEVELS = [100, 200, 300, 400, 500] as const;

export type CourseLevel = (typeof ALL_COURSE_LEVELS)[number];
export type MaxCourseLevel = 400 | 500;

export type DepartmentMaxLevel = MaxCourseLevel | null;

export function getCourseLevels(maxLevel: MaxCourseLevel): CourseLevel[] {
  return ALL_COURSE_LEVELS.filter((level) => level <= maxLevel);
}

export function formatLevelTab(level: number): string {
  return `${level} Level`;
}

export function levelStorageKey(universityId: string): string {
  return `uniflow_max_course_level_${universityId}`;
}

export function getStoredMaxLevel(universityId: string): MaxCourseLevel {
  if (typeof window === "undefined") return 400;
  const stored = localStorage.getItem(levelStorageKey(universityId));
  return stored === "500" ? 500 : 400;
}

export function setStoredMaxLevel(
  universityId: string,
  maxLevel: MaxCourseLevel,
): void {
  localStorage.setItem(levelStorageKey(universityId), String(maxLevel));
}

export function parseCourseLevel(raw: string): CourseLevel | null {
  const level = parseInt(raw, 10);
  if (ALL_COURSE_LEVELS.includes(level as CourseLevel)) {
    return level as CourseLevel;
  }
  return null;
}

export function isValidCourseLevel(
  level: number,
  maxLevel: MaxCourseLevel,
): boolean {
  return getCourseLevels(maxLevel).includes(level as CourseLevel);
}