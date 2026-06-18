import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { Theme } from "@/constants/Theme";
import { MOTION } from "@/lib/motion";

const C = Theme.colors;
const R = Theme.radius;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PREVIEW_SIZE = Math.min(SCREEN_WIDTH - 48, 360);

const AnimatedPressable = Animated.createAnimatedComponent(TouchableOpacity);

interface AvatarLightboxProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

export function AvatarLightbox({
  visible,
  imageUri,
  onClose,
}: AvatarLightboxProps) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);

  const backdropOpacity = useSharedValue(0);
  const imageScale = useSharedValue(0.82);
  const closeOpacity = useSharedValue(0);

  const finishClose = useCallback(() => {
    setMounted(false);
    onClose();
  }, [onClose]);

  const animateIn = useCallback(() => {
    backdropOpacity.value = withTiming(1, { duration: MOTION.normal });
    imageScale.value = withTiming(1, { duration: MOTION.slow });
    closeOpacity.value = withTiming(1, { duration: MOTION.normal });
  }, [backdropOpacity, closeOpacity, imageScale]);

  const animateOut = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: MOTION.fast });
    imageScale.value = withTiming(0.82, { duration: MOTION.fast });
    closeOpacity.value = withTiming(0, { duration: MOTION.fast }, (finished) => {
      if (finished) runOnJS(finishClose)();
    });
  }, [backdropOpacity, closeOpacity, finishClose, imageScale]);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      backdropOpacity.value = 0;
      imageScale.value = 0.82;
      closeOpacity.value = 0;
      requestAnimationFrame(() => animateIn());
      return;
    }

    if (mounted) animateOut();
  }, [visible, mounted, animateIn, animateOut, backdropOpacity, closeOpacity, imageScale]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
    opacity: backdropOpacity.value,
  }));

  const closeStyle = useAnimatedStyle(() => ({
    opacity: closeOpacity.value,
    transform: [{ scale: 0.9 + closeOpacity.value * 0.1 }],
  }));

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={animateOut}
      statusBarTranslucent
    >
      <AnimatedPressable
        style={[styles.backdrop, backdropStyle]}
        activeOpacity={1}
        onPress={animateOut}
      />

      <Animated.View style={[styles.content, imageStyle]} pointerEvents="box-none">
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="cover"
        />
      </Animated.View>

      <AnimatedPressable
        onPress={animateOut}
        hitSlop={12}
        style={[styles.closeBtn, { top: insets.top + 12 }, closeStyle]}
        activeOpacity={0.85}
      >
        <X size={22} color={C.textPrimary} strokeWidth={2.5} />
      </AnimatedPressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.88)",
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  image: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: R.full,
    borderWidth: 2,
    borderColor: C.borderPrimary,
    backgroundColor: C.bgTertiary,
  },
  closeBtn: {
    position: "absolute",
    right: 20,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: R.full,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});