import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { staggerDelay, MOTION } from "@/lib/motion";

interface FadeSlideInProps {
  children: ReactNode;
  index?: number;
  style?: StyleProp<ViewStyle>;
}

export function FadeSlideIn({
  children,
  index = 0,
  style,
}: FadeSlideInProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(MOTION.normal).delay(staggerDelay(index))}
      style={style}
    >
      {children}
    </Animated.View>
  );
}