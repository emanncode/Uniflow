import { QueryClient } from '@tanstack/react-query';

// Shared QueryClient for the admin/university web app.
// Tuned for dashboard-style usage with moderate freshness.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30s (slightly fresher for admin views)
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

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