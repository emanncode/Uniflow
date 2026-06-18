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
const LOGO_SIZE = 40;

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

  const logoStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 0.18, 0.38, 0.72, 1],
      [0.65, 1.2, 1.2, 1, 1],
    );
    const opacity = interpolate(progress.value, [0, 0.1, 1], [0, 1, 1]);
    const glow = interpolate(
      progress.value,
      [0, 0.2, 0.38, 0.72, 1],
      [0, 0.9, 0.75, 0.35, 0.2],
    );

    return {
      opacity,
      transform: [{ scale }],
      shadowOpacity: glow,
    };
  });

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.52, 0.78, 1], [0, 0, 0.85, 1]),
    transform: [
      {
        translateX: interpolate(progress.value, [0.52, 0.78, 1], [14, 6, 0]),
      },
    ],
  }));

  const lockupStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.value, [0, 0.38, 0.78, 1], [0, 0, -34, -34]),
      },
    ],
    gap: interpolate(progress.value, [0, 0.52, 0.78], [0, 0, 10]),
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
    flexDirection: "row",
    alignItems: "center",
  },
  logoGlow: {
    shadowColor: C.brand,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 18,
    elevation: 8,
  },
  wordmark: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -1,
    color: C.textPrimary,
  },
  wordmarkAccent: {
    color: C.brand,
  },
});