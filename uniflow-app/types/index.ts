// ─── Enums / Union Types ───────────────────────────────────────────────────

export type UserRole =
  | "uniflow_admin"
  | "university_admin"
  | "dean"
  | "hod"
  | "lecturer"
  | "student";

export type MobileRole = Extract<
  UserRole,
  "lecturer" | "student" | "uniflow_admin"
>;

export type ClassStatus =
  | "canceled"
  | "delayed"
  | "moved"
  | "ongoing"
  | "ended";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export type FileType = "pdf" | "image" | "doc" | "other";

export type ResourceType = "past_question" | "note" | "material" | "other";

export type NotificationType =
  | "class_update"
  | "resource"
  | "general"
  | "system";

export type RegistrationStatus = "pending" | "approved" | "rejected";

export type ChangeRequestStatus = "pending" | "approved" | "rejected";

// ─── Core Entities ─────────────────────────────────────────────────────────

export interface University {
  id: string;
  name: string;
  short_name: string;
  country: string;
  state: string | null;
  logo_url: string | null;
  is_active: boolean;
  status: RegistrationStatus;
  created_at: string;
}

export interface Profile {
  id: string;
  university_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  push_token: string | null;
  is_active: boolean;
  created_at: string;
  // joined
  university?: Pick<University, "name" | "short_name">;
  department?: {
    id: string;
    name: string;
    short_name: string;
    faculty: string | null;
  };
  faculty?: {
    id: string;
    name: string;
    short_name: string;
  };
}

export interface Faculty {
  id: string;
  university_id: string;
  name: string;
  short_name: string;
  dean_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Department {
  id: string;
  university_id: string;
  faculty_name: string;
  name: string;
  short_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  department_id: string;
  university_id: string;
  title: string;
  code: string;
  description: string | null;
  level: number;
  semester: 1 | 2;
  credit_units: number;
  is_active: boolean;
  created_at: string;
}

// ─── Timetable ─────────────────────────────────────────────────────────────

export interface TimetableSlot {
  id: string;
  course_id: string;
  lecturer_id: string;
  university_id: string;
  day_of_week: DayOfWeek;
  start_time: string; // '08:00:00'
  end_time: string; // '10:00:00'
  venue: string;
  academic_session: string; // '2024/2025'
  semester: 1 | 2;
  is_active: boolean;
  created_at: string;
  // joined
  courses?: Pick<Course, "id" | "title" | "code" | "credit_units">;
  profiles?: Pick<Profile, "id" | "full_name" | "avatar_url">;
}

// ─── Class Updates ─────────────────────────────────────────────────────────

export interface ClassUpdate {
  id: string;
  timetable_id: string;
  reported_by: string;
  university_id: string;
  status: ClassStatus;
  message: string | null;
  new_venue: string | null;
  new_start_time: string | null;
  delay_minutes: number | null;
  upvotes: number;
  is_verified: boolean;
  update_date: string; // 'YYYY-MM-DD'
  created_at: string;
  // joined
  timetable?: {
    course_id: string;
    courses?: Pick<Course, "title" | "code">;
  };
}

export interface NewClassUpdate {
  timetable_id: string;
  reported_by: string;
  university_id: string;
  status: ClassStatus;
  message: string | null;
  new_venue: string | null;
  new_start_time: string | null;
  delay_minutes: number | null;
  update_date: string;
}

// ─── Enrollments ───────────────────────────────────────────────────────────

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  university_id: string;
  academic_session: string;
  semester: 1 | 2;
  enrolled_at: string;
  is_active: boolean;
  // joined
  courses?: Course;
}

// ─── Resources ─────────────────────────────────────────────────────────────

export interface Resource {
  id: string;
  course_id: string;
  uploaded_by: string;
  university_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: FileType;
  resource_type: ResourceType;
  academic_session: string;
  downloads: number;
  is_approved: boolean;
  created_at: string;
}

// ─── Notifications ─────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  university_id: string;
  title: string;
  message: string;
  type: NotificationType;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

// ─── Timetable Change Requests ─────────────────────────────────────────────

export interface TimetableChangeRequest {
  id: string;
  timetable_id: string;
  lecturer_id: string;
  university_id: string;
  proposed_day: DayOfWeek | null;
  proposed_start_time: string | null;
  proposed_end_time: string | null;
  proposed_venue: string | null;
  reason: string;
  status: ChangeRequestStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface NewTimetableChangeRequest {
  timetable_id: string;
  lecturer_id: string;
  university_id: string;
  proposed_day?: DayOfWeek;
  proposed_start_time?: string;
  proposed_end_time?: string;
  proposed_venue?: string;
  reason: string;
}

// ─── Lecturer Courses ──────────────────────────────────────────────────────

export interface LecturerCourse {
  id: string;
  lecturer_id: string;
  course_id: string;
  university_id: string;
  academic_session: string;
  semester: 1 | 2;
  assigned_at: string;
  is_active: boolean;
  // joined
  courses?: Course;
}

// ─── Auth State ────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─── UI / Utility Types ────────────────────────────────────────────────────

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface ApiError {
  message: string;
  code?: string;
}

// Status color map — used in timetable + update badges
export const CLASS_STATUS_COLORS: Record<
  ClassStatus,
  { color: string; background: string }
> = {
  ongoing: { color: "#22c55e", background: "rgba(34,  197, 94,  0.08)" },
  delayed: { color: "#f59e0b", background: "rgba(245, 158, 11,  0.08)" },
  canceled: { color: "#ef4444", background: "rgba(239, 68,  68,  0.08)" },
  moved: { color: "#3b82f6", background: "rgba(59,  130, 246, 0.08)" },
  ended: { color: "#64748b", background: "rgba(100, 116, 139, 0.08)" },
};

// Day order — for sorting timetable
export const DAY_ORDER: Record<DayOfWeek, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
};
