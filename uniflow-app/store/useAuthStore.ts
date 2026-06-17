import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { enrichProfile } from "@/lib/enrichProfile";
import type { AuthUser, Profile, MobileRole } from "@/types";

// ─── State Shape ───────────────────────────────────────────────────────────

interface AuthStore {
  // State
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isHydrated: boolean; // true once session check on app launch is done

  // Actions
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  hydrateSession: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => void;
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  isHydrated: false,

  // ── Sign In ──────────────────────────────────────────────────────────────
  signIn: async (email, password) => {
    set({ isLoading: true });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      set({ isLoading: false });
      return { error: error.message };
    }

    if (!data.user) {
      set({ isLoading: false });
      return { error: "Sign in failed. Please try again." };
    }

    // Fetch profile with university, department, and faculty joined
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*, university:university_id(name, short_name), department:department_id(id, name, short_name, faculty), faculty:faculties!profiles_faculty_id_fkey(id, name, short_name)")
      .eq("id", data.user.id)
      .single();
      console.log("Profile Error:", profileError);
    if (profileError || !profile) {
      await supabase.auth.signOut();
      set({ isLoading: false });
      return { error: "Could not load your profile. Please contact support." };
    }

    const enrichedProfile = await enrichProfile(profile as Profile);

    // Block web-only roles from accessing the mobile app
    const allowedRoles: MobileRole[] = ["lecturer", "student", "dean", "hod"];
    if (!allowedRoles.includes(enrichedProfile.role as MobileRole)) {
      await supabase.auth.signOut();
      set({ isLoading: false });
      return { error: "This app is for lecturers, students, deans, and HODs only." };
    }

    // Block inactive accounts
    if (!enrichedProfile.is_active) {
      await supabase.auth.signOut();
      set({ isLoading: false });
      return {
        error:
          "Your account has been deactivated. Contact your university admin.",
      };
    }

    set({
      user: { id: data.user.id, email: data.user.email! },
      profile: enrichedProfile,
      isLoading: false,
    });

    return { error: null };
  },

  // ── Sign Out ─────────────────────────────────────────────────────────────
  signOut: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({ user: null, profile: null, isLoading: false });
  },

  // ── Hydrate Session ──────────────────────────────────────────────────────
  // Called once on app launch from _layout.tsx
  // Checks AsyncStorage for a persisted session and restores state
  hydrateSession: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      set({ isHydrated: true });
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*, university:university_id(name, short_name), department:department_id(id, name, short_name, faculty), faculty:faculties!profiles_faculty_id_fkey(id, name, short_name)")
      .eq("id", session.user.id)
      .single();

    if (error || !profile) {
      // Session exists but profile fetch failed — clear and force re-login
      await supabase.auth.signOut();
      set({ isHydrated: true });
      return;
    }

    const enrichedProfile = await enrichProfile(profile as Profile);

    const allowedRoles: MobileRole[] = ["lecturer", "student", "dean", "hod"];
    if (
      !allowedRoles.includes(enrichedProfile.role as MobileRole) ||
      !enrichedProfile.is_active
    ) {
      await supabase.auth.signOut();
      set({ isHydrated: true });
      return;
    }

    set({
      user: { id: session.user.id, email: session.user.email! },
      profile: enrichedProfile,
      isHydrated: true,
    });
  },

  // ── Update Profile (local only) ──────────────────────────────────────────
  // Use after saving changes to Supabase — keeps local state in sync
  updateProfile: (updates) => {
    const current = get().profile;
    if (!current) return;
    set({ profile: { ...current, ...updates } });
  },
}));

// ─── Selectors ─────────────────────────────────────────────────────────────
// Use these in components instead of reading the full store —
// they prevent unnecessary re-renders

export const useUser = () => useAuthStore((s) => s.user);
export const useProfile = () => useAuthStore((s) => s.profile);
export const useIsLecturer = () =>
  useAuthStore((s) => s.profile?.role === "lecturer" || s.profile?.role === "uniflow_admin");
export const useIsStudent = () =>
  useAuthStore((s) => s.profile?.role === "student");
export const useIsHydrated = () => useAuthStore((s) => s.isHydrated);
export const useIsAuthenticated = () =>
  useAuthStore((s) => !!s.user && !!s.profile);
