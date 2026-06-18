import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { X } from "lucide-react-native";
import { Theme } from "@/constants/Theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.9;
const SHEET_SCROLL_HEIGHT = SCREEN_HEIGHT * 0.85;

const C = Theme.colors;
const R = Theme.radius;

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  type?: "sheet" | "alert";
  /** Tall sheet with scrollable body — use for long forms/lists only */
  sheetScroll?: boolean;
}

export function CustomModal({
  visible,
  onClose,
  title,
  children,
  type = "sheet",
  sheetScroll = false,
}: CustomModalProps) {
  const isSheet = type === "sheet";

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isSheet ? "slide" : "fade"}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.root, isSheet ? styles.rootSheet : styles.rootAlert]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.overlay} onPress={onClose} />

        <View
          style={[
            styles.container,
            isSheet && styles.sheetContainer,
            isSheet && sheetScroll && styles.sheetContainerScroll,
            !isSheet && styles.alertContainer,
          ]}
        >
          {isSheet && <View style={styles.sheetHandle} />}

          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={12}
              style={styles.closeBtn}
            >
              <X size={20} color={C.textMuted} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.body,
              isSheet && sheetScroll && styles.sheetBodyScroll,
            ]}
          >
            {children}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootSheet: {
    justifyContent: "flex-end",
  },
  rootAlert: {
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  container: {
    backgroundColor: C.bgSecondary,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    overflow: "hidden",
  },
  sheetContainer: {
    width: "100%",
    maxHeight: SHEET_MAX_HEIGHT,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  sheetContainerScroll: {
    height: SHEET_SCROLL_HEIGHT,
    maxHeight: SHEET_MAX_HEIGHT,
  },
  alertContainer: {
    marginHorizontal: 24,
    marginVertical: "auto",
    borderRadius: R.lg,
    alignSelf: "center",
    width: SCREEN_HEIGHT > 800 ? 340 : 320,
    maxWidth: "90%",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.borderSecondary,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  title: {
    color: C.textPrimary,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: R.full,
    backgroundColor: C.bgTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  sheetBodyScroll: {
    flex: 1,
    minHeight: 0,
  },
});