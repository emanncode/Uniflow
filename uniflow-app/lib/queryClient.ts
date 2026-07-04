import { QueryClient } from '@tanstack/react-query';

// Shared QueryClient tuned for a mobile + Supabase app.
// - Reasonable stale time so data feels fresh without constant refetches
// - Background refetch on focus/reconnect
// - Limited retries for network flakes
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 45, // 45s
      gcTime: 1000 * 60 * 5, // 5 min
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Common query key factories for consistency and easy invalidation
export const queryKeys = {
  profile: (userId?: string) => ['profile', userId] as const,
  studentEnrollments: (studentId?: string) => ['studentEnrollments', studentId] as const,
  lecturerContext: (lecturerId?: string) => ['lecturerContext', lecturerId] as const,
  timetable: (params: { lecturerId?: string; courseIds?: string[]; offeringIds?: string[] }) =>
    ['timetable', params] as const,
  notifications: (userId?: string) => ['notifications', userId] as const,
  resources: (courseIds?: string[]) => ['resources', courseIds] as const,
  courses: (ids?: string[]) => ['courses', ids] as const,
  classUpdates: (date?: string, slotIds?: string[]) => ['classUpdates', date, slotIds] as const,
};