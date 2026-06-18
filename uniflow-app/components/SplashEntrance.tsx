import { useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as ExpoSplash from "expo-splash-screen";
import UniflowLogo from "@/components/UniflowLogo";
import { Theme } from "@/constants/Theme";
import { MOTION } from "@/lib/motion";

const C = Theme.colors;
const LOGO_SIZE = 72;

interface SplashEntranceProps {
  onFinish: () => void;
}

export function SplashEntrance({ onFinish }: SplashEntranceProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    ExpoSplash.hideAsync().catch(() => {});

    progress.value = withTiming(
      1,
      {
        duration: MOTION.splash.total,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) runOnJS(onFinish)();
      },
    );
  }, [onFinish, progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 0.42, 1],
      [C.bgDeep, C.bgDeep, C.bgPrimary],
    ),
  }));

  const lockupStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 0.18, 0.38, 0.72, 1],
      [0.72, 1.08, 1.08, 1, 1],
    );
    const opacity = interpolate(progress.value, [0, 0.1, 1], [0, 1, 1]);

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const logoStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(
      progress.value,
      [0, 0.2, 0.38, 0.72, 1],
      [0, 1, 0.85, 0.5, 0.35],
    ),
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.48, 0.72, 1], [0, 0, 0.9, 1]),
    transform: [
      {
        translateY: interpolate(progress.value, [0.48, 0.72, 1], [10, 4, 0]),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.root, backdropStyle]}>
      <Animated.View style={[styles.lockup, lockupStyle]}>
        <Animated.View style={[styles.logoGlow, logoStyle]}>
          <UniflowLogo size={LOGO_SIZE} showWordmark={false} />
        </Animated.View>

        <Animated.View style={wordmarkStyle}>
          <Text style={styles.wordmark}>
            uni<Text style={styles.wordmarkAccent}>flow</Text>
          </Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  lockup: {
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  logoGlow: {
    shadowColor: C.brand,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 28,
    elevation: 12,
  },
  wordmark: {
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: -1.2,
    color: C.textPrimary,
    textAlign: "center",
  },
  wordmarkAccent: {
    color: C.brand,
  },
});