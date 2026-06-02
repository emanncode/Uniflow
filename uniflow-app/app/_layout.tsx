import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useAuthStore,
  useIsHydrated,
  useIsAuthenticated,
  useIsLecturer,
} from "@/store/useAuthStore";
import { Theme } from "@/constants/Theme";

// ─── Auth Guard ────────────────────────────────────────────────────────────
// Watches auth state after hydration and redirects accordingly.
// Runs on every change to: isHydrated, isAuthenticated, role.

function AuthGuard() {
  const router = useRouter();
  const segments = useSegments();

  const isHydrated = useIsHydrated();
  const isAuthenticated = useIsAuthenticated();
  const isLecturer = useIsLecturer();

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === "Login";
    const inLecturerGroup = segments[0] === "(lecturer)";
    const inStudentGroup = segments[0] === "(student)";

    if (!isAuthenticated) {
      // Not logged in — always go to login
      if (!inAuthGroup) {
        router.replace("/Login");
      }
      return;
    }

    // Logged in — route to correct role group
    if (isLecturer) {
      if (!inLecturerGroup) {
        router.replace("/(lecturer)");
      }
    } else {
      if (!inStudentGroup) {
        router.replace("/(student)");
      }
    }
  }, [isHydrated, isAuthenticated, isLecturer, segments, router]);

  return null;
}

// ─── Splash / Loading Screen ───────────────────────────────────────────────

function SplashScreen() {
  return (
    <View style={styles.splash}>
      <ActivityIndicator size="large" color={Theme.colors.brand} />
    </View>
  );
}

// ─── Root Layout ───────────────────────────────────────────────────────────

export default function RootLayout() {
  const hydrateSession = useAuthStore((s) => s.hydrateSession);
  const isHydrated = useIsHydrated();

  // Fire session check once on mount
  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor={Theme.colors.bgPrimary} />
      <AuthGuard />
      {/* Show splash until session check completes */}
      {!isHydrated ? <SplashScreen /> : <Slot />}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.colors.bgPrimary,
  },
  splash: {
    flex: 1,
    backgroundColor: Theme.colors.bgPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
});
