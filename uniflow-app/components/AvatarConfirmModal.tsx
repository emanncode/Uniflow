import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { CustomModal } from "@/components/CustomModal";
import { Theme } from "@/constants/Theme";

const C = Theme.colors;
const R = Theme.radius;

interface AvatarConfirmModalProps {
  visible: boolean;
  previewUri: string | null;
  isLoading?: boolean;
  error?: string;
  onCancel: () => void;
  onAccept: () => void;
}

export function AvatarConfirmModal({
  visible,
  previewUri,
  isLoading = false,
  error,
  onCancel,
  onAccept,
}: AvatarConfirmModalProps) {
  return (
    <CustomModal
      visible={visible}
      onClose={onCancel}
      title="Update Profile Photo"
      type="alert"
    >
      <View style={styles.content}>
        {previewUri ? (
          <Image
            source={{ uri: previewUri }}
            style={styles.preview}
            contentFit="cover"
          />
        ) : null}

        <Text style={styles.hint}>
          This photo will appear on your profile and home screen.
        </Text>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onCancel}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.acceptBtn, isLoading && { opacity: 0.6 }]}
            onPress={onAccept}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={C.textPrimary} />
            ) : (
              <Text style={styles.acceptBtnText}>Accept</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    paddingBottom: 16,
    gap: 14,
  },
  preview: {
    width: 160,
    height: 160,
    borderRadius: R.full,
    borderWidth: 2,
    borderColor: C.borderPrimary,
    backgroundColor: C.bgTertiary,
  },
  hint: {
    color: C.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  errorBanner: {
    width: "100%",
    backgroundColor: C.dangerMuted,
    borderWidth: 1,
    borderColor: C.dangerBorder,
    borderRadius: R.sm,
    padding: 10,
  },
  errorText: {
    color: C.danger,
    fontSize: 13,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: R.sm,
    backgroundColor: C.bgTertiary,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    alignItems: "center",
  },
  cancelBtnText: {
    color: C.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: R.sm,
    backgroundColor: C.brand,
    alignItems: "center",
  },
  acceptBtnText: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
});