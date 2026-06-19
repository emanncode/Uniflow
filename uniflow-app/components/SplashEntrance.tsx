import { useEffect, useRef } from "react";
import { Text, StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as ExpoSplash from "expo-splash-screen";
import UniflowLogo from "@/components/UniflowLogo";
import { Theme } from "@/constants/Theme";
import { MOTION } from "@/lib/motion";
import {
  claimSplashAnimation,
  isSplashAnimationFinished,
  markSplashAnimationFinished,
  recordSplashMount,
  onSplashClaimReleased,
  releaseSplashAnimationClaim,
  subscribeSplashFinished,
} from "@/lib/splash-session";

const C = Theme.colors;
const LOGO_SIZE = 108;
const LOCKUP_GAP = 6;
const WORDMARK_FONT = 58;
const CLAMP = Extrapolation.CLAMP;

const SMOOTH_IN = Easing.bezier(0.25, 0.1, 0.25, 1);
const SMOOTH_REVEAL = Easing.bezier(0.37, 0, 0.18, 1);

interface SplashEntranceProps {
  onFinish: () => void;
}

export function SplashEntrance({ onFinish }: SplashEntranceProps) {
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  recordSplashMount();

  const progress = useSharedValue(isSplashAnimationFinished() ? 1 : 0);
  const wordmarkWidth = useSharedValue(220);
  const nativeHiddenRef = useRef(false);

  const finishSplash = () => {
    if (!isSplashAnimationFinished()) {
      markSplashAnimationFinished();
    }
    onFinishRef.current();
  };

  const hideNativeSplash = () => {
    if (nativeHiddenRef.current) return;
    nativeHiddenRef.current = true;
    ExpoSplash.hideAsync().catch(() => {});
  };

  useEffect(() => {
    let disposed = false;
    let unsubFinish = () => {};
    let unsubClaim = () => {};

    const completeSplash = () => {
      if (disposed) return;
      progress.value = 1;
      finishSplash();
    };

    const startAnimation = () => {
      if (__DEV__) {
        console.log("[Splash] starting animation sequence");
      }

      progress.value = withSequence(
        withTiming(0.5, {
          duration: MOTION.splash.hold,
          easing: SMOOTH_IN,
        }),
        withTiming(1, {
          duration: MOTION.splash.reveal,
          easing: SMOOTH_REVEAL,
        }),
        withDelay(
          MOTION.splash.settle,
          withTiming(1, { duration: 0 }, (finished) => {
            if (finished) runOnJS(finishSplash)();
          }),
        ),
      );
    };

    const tryClaimAndAnimate = () => {
      if (disposed) return;
      if (isSplashAnimationFinished()) {
        completeSplash();
        return;
      }
      if (claimSplashAnimation()) {
        unsubFinish();
        unsubClaim();
        startAnimation();
        return;
      }
      unsubFinish = subscribeSplashFinished(completeSplash);
      unsubClaim = onSplashClaimReleased(() => {
        if (disposed || isSplashAnimationFinished()) return;
        if (claimSplashAnimation()) {
          unsubFinish();
          unsubClaim();
          startAnimation();
        }
      });
    };

    tryClaimAndAnimate();

    return () => {
      disposed = true;
      unsubFinish();
      unsubClaim();
      cancelAnimation(progress);
      releaseSplashAnimationClaim();
    };
  }, [progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 0.5, 0.92, 1],
      [C.bgDeep, C.bgDeep, C.bgPrimary, C.bgPrimary],
    ),
  }));

  const lockupStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 0.22, 0.5, 0.88, 1],
      [0.72, 1.04, 1.04, 1.01, 1],
      CLAMP,
    );
    const opacity = interpolate(progress.value, [0, 0.14, 1], [0, 1, 1], CLAMP);
    const nudgeX = interpolate(progress.value, [0.5, 1], [0, 6], CLAMP);

    return {
      opacity,
      transform: [{ scale }, { translateX: nudgeX }],
    };
  });

  const logoStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(
      progress.value,
      [0, 0.22, 0.5, 1],
      [0, 1, 0.9, 0.45],
      CLAMP,
    ),
  }));

  const wordmarkClipStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0.5, 1], [0, wordmarkWidth.value], CLAMP),
    marginLeft: interpolate(progress.value, [0.5, 1], [0, LOCKUP_GAP], CLAMP),
    opacity: interpolate(progress.value, [0.5, 0.72, 0.92, 1], [0, 0.4, 0.92, 1], CLAMP),
  }));

  return (
    <Animated.View
      style={[styles.root, backdropStyle]}
      onLayout={hideNativeSplash}
    >
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
    minWidth: 0,
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