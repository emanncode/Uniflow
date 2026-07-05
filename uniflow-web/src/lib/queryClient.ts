// Query keys used across the app with TanStack Query.
// The actual QueryClient is created inside <Providers /> (client component)
// to avoid passing class instances across Server/Client Component boundary.
export const queryKeys = {
  profile: (userId?: string) => ['profile', userId] as const,
  universityStats: (uniId?: string) => ['universityStats', uniId] as const,
  staff: (uniId?: string, roles?: string[]) => ['staff', uniId, roles] as const,
  timetable: (params: Record<string, unknown>) => ['timetable', params] as const,
  courses: (params: Record<string, unknown>) => ['courses', params] as const,
  resources: (uniId?: string) => ['resources', uniId] as const,
  registrations: () => ['registrations'] as const,
  notifications: (userId?: string) => ['notifications', userId] as const,
  courseOfferings: (uniId?: string, deptId?: string | null) => ['courseOfferings', uniId, deptId] as const,
};