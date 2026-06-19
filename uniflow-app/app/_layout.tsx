import "react-native-reanimated";
import { useEffect, useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ExpoSplash from "expo-splash-screen";
import {
  useAuthStore,
  useIsHydrated,
  useIsAuthenticated,
  useIsLecturer,
} from "@/store/useAuthStore";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { SplashEntrance } from "@/components/SplashEntrance";
import { Theme } from "@/constants/Theme";

ExpoSplash.preventAutoHideAsync().catch(() => {});

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

// ─── Root Layout ───────────────────────────────────────────────────────────

export default function RootLayout() {
  const hydrateSession = useAuthStore((s) => s.hydrateSession);
  const isHydrated = useIsHydrated();
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashFinish = useCallback(() => {
    setSplashDone(true);
  }, []);

  usePushNotifications();

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  const appReady = splashDone && isHydrated;

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor={C.bgDeep} />
      <AuthGuard />
      {appReady ? <Slot /> : null}
      {!appReady ? <SplashEntrance onFinish={handleSplashFinish} /> : null}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgDeep },
});