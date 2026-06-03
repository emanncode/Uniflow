import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { AuthUser, Profile, MobileRole } from '@/types'

// ─── State Shape ───────────────────────────────────────────────────────────

interface AuthStore {
  // State
  user: AuthUser | null
  profile: Profile | null
  isLoading: boolean
  isHydrated: boolean   // true once session check on app launch is done

  // Actions
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  hydrateSession: () => Promise<void>
  listenToAuthChanges: () => () => void  // returns unsubscribe fn — call in _layout.tsx
  updateProfile: (updates: Partial<Profile>) => void
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const ALLOWED_ROLES: MobileRole[] = ['lecturer', 'student']

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, universities(name, short_name)')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  if (!ALLOWED_ROLES.includes(data.role as MobileRole)) return null
  if (!data.is_active) return null

  return data as Profile
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  isHydrated: false,

  // ── Sign In ──────────────────────────────────────────────────────────────
  signIn: async (email, password) => {
    set({ isLoading: true })

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      set({ isLoading: false })
      return { error: error.message }
    }

    if (!data.user) {
      set({ isLoading: false })
      return { error: 'Sign in failed. Please try again.' }
    }

    const profile = await fetchProfile(data.user.id)

    if (!profile) {
      await supabase.auth.signOut()
      set({ isLoading: false })

      // Distinguish between "wrong role" and "account issue"
      const { data: raw } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', data.user.id)
        .single()

      if (!raw) return { error: 'Could not load your profile. Contact support.' }
      if (!ALLOWED_ROLES.includes(raw.role as MobileRole))
        return { error: 'This app is for lecturers and students only.' }
      if (!raw.is_active)
        return { error: 'Your account has been deactivated. Contact your university admin.' }

      return { error: 'Sign in failed. Please try again.' }
    }

    set({
      user: { id: data.user.id, email: data.user.email! },
      profile,
      isLoading: false,
    })

    return { error: null }
  },

  // ── Sign Out ─────────────────────────────────────────────────────────────
  signOut: async () => {
    set({ isLoading: true })
    await supabase.auth.signOut()
    set({ user: null, profile: null, isLoading: false })
  },

  // ── Hydrate Session ──────────────────────────────────────────────────────
  // Called once on app launch from _layout.tsx
  // Checks AsyncStorage for a persisted session and restores state
  hydrateSession: async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      set({ isHydrated: true })
      return
    }

    const profile = await fetchProfile(session.user.id)

    if (!profile) {
      // Session exists but profile invalid — clear and force re-login
      await supabase.auth.signOut()
      set({ isHydrated: true })
      return
    }

    set({
      user: { id: session.user.id, email: session.user.email! },
      profile,
      isHydrated: true,
    })
  },

  // ── Listen To Auth Changes ───────────────────────────────────────────────
  // Wires up Supabase's auth state listener.
  // Handles: token expiry, forced logout, password changes, session refresh.
  // Call this in _layout.tsx useEffect — it returns an unsubscribe fn.
  //
  // Usage in _layout.tsx:
  //   const unsubscribe = useAuthStore.getState().listenToAuthChanges()
  //   return () => unsubscribe()
  listenToAuthChanges: () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          // Token expired or user signed out from another device
          set({ user: null, profile: null })
          return
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Only update if we don't already have this user loaded
          // (avoids redundant profile fetches on every token refresh)
          const currentUser = get().user
          if (currentUser?.id === session.user.id) return

          const profile = await fetchProfile(session.user.id)
          if (!profile) {
            await supabase.auth.signOut()
            return
          }

          set({
            user: { id: session.user.id, email: session.user.email! },
            profile,
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  },

  // ── Update Profile (local only) ──────────────────────────────────────────
  // Use after saving profile changes to Supabase — keeps local state in sync
  updateProfile: (updates) => {
    const current = get().profile
    if (!current) return
    set({ profile: { ...current, ...updates } })
  },
}))

// ─── Selectors ─────────────────────────────────────────────────────────────
// Use these in components instead of reading the full store —
// they prevent unnecessary re-renders

export const useUser = () => useAuthStore((s) => s.user)
export const useProfile = () => useAuthStore((s) => s.profile)
export const useIsLecturer = () => useAuthStore((s) => s.profile?.role === 'lecturer')
export const useIsStudent = () => useAuthStore((s) => s.profile?.role === 'student')
export const useIsHydrated = () => useAuthStore((s) => s.isHydrated)
export const useIsAuthenticated = () => useAuthStore((s) => !!s.user && !!s.profile)