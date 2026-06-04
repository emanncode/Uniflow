import { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { Slot, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuthStore, useIsHydrated, useIsAuthenticated, useIsLecturer } from '@/store/useAuthStore'
import { Theme } from '@/constants/Theme'

// ─── Auth Guard ────────────────────────────────────────────────────────────
// Watches auth state after hydration and redirects accordingly.

function AuthGuard() {
  const router = useRouter()
  const segments = useSegments()

  const isHydrated = useIsHydrated()
  const isAuthenticated = useIsAuthenticated()
  const isLecturer = useIsLecturer()

  useEffect(() => {
    if (!isHydrated) return

    const inAuthGroup = segments[0] === 'login'
    const inLecturerGroup = segments[0] === '(lecturer)'
    const inStudentGroup = segments[0] === '(student)'

    if (!isAuthenticated) {
      if (!inAuthGroup) router.replace('/login')
      return
    }

    if (isLecturer) {
      if (!inLecturerGroup) router.replace('/(lecturer)')
    } else {
      if (!inStudentGroup) router.replace('/(student)')
    }
  }, [isHydrated, isAuthenticated, isLecturer, router, segments])

  return null
}

// ─── Splash ────────────────────────────────────────────────────────────────

function SplashScreen() {
  return (
    <View style={styles.splash}>
      <ActivityIndicator size="large" color={Theme.colors.brand} />
    </View>
  )
}

// ─── Root Layout ───────────────────────────────────────────────────────────

export default function RootLayout() {
  const hydrateSession = useAuthStore((s) => s.hydrateSession)
  const listenToAuthChanges = useAuthStore((s) => s.listenToAuthChanges)
  const isHydrated = useIsHydrated()

  useEffect(() => {
    // 1. Restore persisted session from AsyncStorage
    hydrateSession()

    // 2. Wire up Supabase auth listener for the lifetime of the app
    //    Handles: token expiry, forced logout, password changes
    const unsubscribe = listenToAuthChanges()
    return () => unsubscribe()
  }, [])

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor={Theme.colors.bgDeep} />
      <AuthGuard />
      {!isHydrated ? <SplashScreen /> : <Slot />}
    </View>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.colors.bgDeep,
  },
  splash: {
    flex: 1,
    backgroundColor: Theme.colors.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
})