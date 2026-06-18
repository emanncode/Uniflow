import { useState } from "react";
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { Pencil } from "lucide-react-native";
import { Theme } from "@/constants/Theme";
import { getInitials } from "@/lib/avatar";
import { AvatarLightbox } from "@/components/AvatarLightbox";
import { MOTION } from "@/lib/motion";

const C = Theme.colors;

type AvatarSize = "sm" | "lg";

const SIZES: Record<AvatarSize, { container: number; text: number; pencil: number; pencilIcon: number }> = {
  sm: { container: 42, text: 14, pencil: 18, pencilIcon: 10 },
  lg: { container: 80, text: 28, pencil: 28, pencilIcon: 12 },
};

interface ProfileAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: AvatarSize;
  editable?: boolean;
  previewable?: boolean;
  onEditPress?: () => void;
}

export function ProfileAvatar({
  name,
  avatarUrl,
  size = "lg",
  editable = false,
  previewable = true,
  onEditPress,
}: ProfileAvatarProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbScale = useSharedValue(1);
  const dims = SIZES[size];
  const initials = getInitials(name);
  const canPreview = previewable && !!avatarUrl;

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: thumbScale.value }],
  }));

  const openPreview = () => {
    thumbScale.value = withSequence(
      withTiming(0.9, { duration: 90 }),
      withTiming(1.04, { duration: 140 }),
      withTiming(1, { duration: MOTION.fast }),
    );
    setLightboxOpen(true);
  };

  const avatarContent = avatarUrl ? (
    <Image
      source={{ uri: avatarUrl }}
      style={[
        styles.image,
        {
          width: dims.container,
          height: dims.container,
          borderRadius: dims.container / 2,
        },
      ]}
      contentFit="cover"
    />
  ) : (
    <Text style={[styles.initials, { fontSize: dims.text }]}>{initials}</Text>
  );

  return (
    <>
      <View
        style={[
          styles.wrapper,
          { width: dims.container, height: dims.container },
        ]}
      >
        {canPreview ? (
          <Pressable onPress={openPreview}>
            <Animated.View
              style={[
                styles.avatar,
                thumbAnimatedStyle,
                {
                  width: dims.container,
                  height: dims.container,
                  borderRadius: dims.container / 2,
                },
              ]}
            >
              {avatarContent}
            </Animated.View>
          </Pressable>
        ) : (
          <View
            style={[
              styles.avatar,
              {
                width: dims.container,
                height: dims.container,
                borderRadius: dims.container / 2,
              },
            ]}
          >
            {avatarContent}
          </View>
        )}

        {editable && onEditPress ? (
          <TouchableOpacity
            style={[
              styles.editBtn,
              {
                width: dims.pencil,
                height: dims.pencil,
                borderRadius: dims.pencil / 2,
              },
            ]}
            onPress={onEditPress}
            activeOpacity={0.85}
            hitSlop={6}
          >
            <Pencil
              size={dims.pencilIcon}
              color={C.textPrimary}
              strokeWidth={2.2}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {canPreview && avatarUrl ? (
        <AvatarLightbox
          visible={lightboxOpen}
          imageUri={avatarUrl}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  avatar: {
    backgroundColor: C.brand,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.borderBrand,
  },
  image: {
    backgroundColor: C.bgTertiary,
  },
  initials: {
    color: C.textPrimary,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  editBtn: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: C.bgSecondary,
    borderWidth: 1.5,
    borderColor: C.borderPrimary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 2,
  },
});