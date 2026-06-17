import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { Theme } from "@/constants/Theme";

const C = Theme.colors;
const R = Theme.radius;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PREVIEW_SIZE = Math.min(SCREEN_WIDTH - 48, 360);

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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.content} pointerEvents="box-none">
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
          />
        </View>

        <TouchableOpacity
          onPress={onClose}
          hitSlop={12}
          style={[styles.closeBtn, { top: insets.top + 12 }]}
          activeOpacity={0.85}
        >
          <X size={22} color={C.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.88)",
  },
  content: {
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