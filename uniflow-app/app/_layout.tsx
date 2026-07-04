import "react-native-reanimated";
import { useEffect, useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ExpoSplash from "expo-splash-screen";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  useAuthStore,
  useIsHydrated,
  useIsAuthenticated,
  useIsLecturer,
} from "@/store/useAuthStore";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { SplashEntrance } from "@/components/SplashEntrance";
import { SpeedInsightsWeb } from "@/components/SpeedInsightsWeb";
import { Theme } from "@/constants/Theme";
import { isSplashAnimationFinished } from "@/lib/splash-session";
import { queryClient } from "@/lib/queryClient";

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

    const inAuthGroup =
      segments[0] === "login" || segments[0] === "forgot-password";
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
  const [splashDone, setSplashDone] = useState(() => isSplashAnimationFinished());

  const handleSplashFinish = useCallback(() => {
    setSplashDone(true);
  }, []);

  usePushNotifications();

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  const appReady = splashDone && isHydrated;

  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.root}>
        <StatusBar style="light" backgroundColor={C.bgDeep} />
        <AuthGuard />
        {appReady ? <Slot /> : null}
        {!appReady ? <SplashEntrance onFinish={handleSplashFinish} /> : null}
        <SpeedInsightsWeb />
      </View>
    </QueryClientProvider>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgDeep },
});