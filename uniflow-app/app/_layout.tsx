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
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Theme } from "@/constants/Theme";

const C = Theme.colors;

// ─── Auth Guard ────────────────────────────────────────────────────────────

function AuthGuard() {
  const router = useRouter();
  const segments = useSegments();
  const isHydrated = useIsHydrated();
  const isAuthenticated = useIsAuthenticated();
  const isLecturer = useIsLecturer();

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === "login";
    const inLecturerGroup = segments[0] === "(lecturer)";
    const inStudentGroup = segments[0] === "(student)";

    if (!isAuthenticated) {
      if (!inAuthGroup) router.replace("/login");
      return;
    }

    if (isLecturer) {
      if (!inLecturerGroup) router.replace("/(lecturer)");
    } else {
      if (!inStudentGroup) router.replace("/(student)");
    }
  }, [isHydrated, isAuthenticated, isLecturer, router, segments]);

  return null;
}

// ─── Splash ────────────────────────────────────────────────────────────────

function SplashScreen() {
  return (
    <View style={styles.splash}>
      <ActivityIndicator size="large" color={C.brand} />
    </View>
  );
}

// ─── Root Layout ───────────────────────────────────────────────────────────

export default function RootLayout() {
  const hydrateSession = useAuthStore((s) => s.hydrateSession);
  const isHydrated = useIsHydrated();

  // Register push token once profile is available
  usePushNotifications();

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor={C.bgDeep} />
      <AuthGuard />
      {!isHydrated ? <SplashScreen /> : <Slot />}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgDeep },
  splash: {
    flex: 1,
    backgroundColor: C.bgDeep,
    alignItems: "center",
    justifyContent: "center",
  },
});
