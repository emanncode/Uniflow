import { useEffect } from "react";
import { Text, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as ExpoSplash from "expo-splash-screen";
import UniflowLogo from "@/components/UniflowLogo";
import { Theme } from "@/constants/Theme";
import { MOTION } from "@/lib/motion";

const C = Theme.colors;
const LOGO_SIZE = 108;
const LOCKUP_GAP = 16;
const WORDMARK_FONT = 58;

interface SplashEntranceProps {
  onFinish: () => void;
}

export function SplashEntrance({ onFinish }: SplashEntranceProps) {
  const progress = useSharedValue(0);
  const wordmarkWidth = useSharedValue(220);

  useEffect(() => {
    ExpoSplash.hideAsync().catch(() => {});

    progress.value = withSequence(
      withTiming(0.5, {
        duration: MOTION.splash.hold,
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(
        1,
        {
          duration: MOTION.splash.reveal,
          easing: Easing.inOut(Easing.cubic),
        },
        (finished) => {
          if (finished) runOnJS(onFinish)();
        },
      ),
    );
  }, [onFinish, progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 0.5, 1],
      [C.bgDeep, C.bgDeep, C.bgPrimary],
    ),
  }));

  const lockupStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 0.2, 0.5, 0.85, 1],
      [0.72, 1.04, 1.04, 1, 1],
    );
    const opacity = interpolate(progress.value, [0, 0.12, 1], [0, 1, 1]);
    const nudgeX = interpolate(progress.value, [0.5, 1], [0, 6]);

    return {
      opacity,
      transform: [{ scale }, { translateX: nudgeX }],
    };
  });

  const logoStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(
      progress.value,
      [0, 0.2, 0.5, 1],
      [0, 1, 0.9, 0.45],
    ),
  }));

  const wordmarkClipStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0.5, 1], [0, wordmarkWidth.value]),
    marginLeft: interpolate(progress.value, [0.5, 1], [0, LOCKUP_GAP]),
    opacity: interpolate(progress.value, [0.5, 0.58, 1], [0, 1, 1]),
  }));

  return (
    <Animated.View style={[styles.root, backdropStyle]}>
      <View style={styles.measure} pointerEvents="none">
        <Text
          style={styles.wordmark}
          onLayout={(e) => {
            wordmarkWidth.value = e.nativeEvent.layout.width;
          }}
        >
          uni<Text style={styles.wordmarkAccent}>flow</Text>
        </Text>
      </View>

      <Animated.View style={[styles.lockup, lockupStyle]}>
        <Animated.View style={[styles.logoGlow, logoStyle]}>
          <UniflowLogo size={LOGO_SIZE} showWordmark={false} />
        </Animated.View>

        <Animated.View style={[styles.wordmarkClip, wordmarkClipStyle]}>
          <Text style={styles.wordmark} numberOfLines={1}>
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
  measure: {
    position: "absolute",
    opacity: 0,
  },
  lockup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  logoGlow: {
    shadowColor: C.brand,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 36,
    elevation: 14,
  },
  wordmarkClip: {
    overflow: "hidden",
    justifyContent: "center",
  },
  wordmark: {
    fontSize: WORDMARK_FONT,
    fontWeight: "800",
    letterSpacing: -2,
    lineHeight: WORDMARK_FONT + 4,
    color: C.textPrimary,
    includeFontPadding: false,
  },
  wordmarkAccent: {
    color: C.brand,
  },
});