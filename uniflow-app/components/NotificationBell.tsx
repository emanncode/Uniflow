import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Bell } from "lucide-react-native";
import { Theme } from "@/constants/Theme";
import { ScalePressable } from "@/components/ScalePressable";
import { MOTION } from "@/lib/motion";

const C = Theme.colors;

interface NotificationBellProps {
  unreadCount: number;
  onPress: () => void;
}

export function NotificationBell({ unreadCount, onPress }: NotificationBellProps) {
  const dotScale = useSharedValue(1);

  useEffect(() => {
    if (unreadCount > 0) {
      dotScale.value = withRepeat(
        withSequence(
          withTiming(1.25, { duration: 700 }),
          withTiming(1, { duration: 700 }),
        ),
        -1,
      );
      return;
    }

    dotScale.value = withTiming(1, { duration: MOTION.fast });
  }, [unreadCount, dotScale]);

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  return (
    <ScalePressable onPress={onPress} style={styles.button} hitSlop={6}>
      <Bell size={22} color={C.textPrimary} strokeWidth={1.9} />
      {unreadCount > 0 ? (
        <Animated.View style={[styles.dot, dotAnimatedStyle]} />
      ) : null}
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.borderPrimary,
  },
  dot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: C.danger,
    borderWidth: 1.5,
    borderColor: C.bgCard,
  },
});