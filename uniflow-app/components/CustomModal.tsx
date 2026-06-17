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
const C = Theme.colors;
const R = Theme.radius;

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  type?: "sheet" | "alert";
}

export function CustomModal({
  visible,
  onClose,
  title,
  children,
  type = "sheet",
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
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable 
          style={styles.overlay} 
          onPress={onClose} 
        />
        
        <View style={[
          styles.container,
          isSheet ? styles.sheetContainer : styles.alertContainer
        ]}>
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

          <View style={styles.body}>
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
    marginTop: "auto",
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  alertContainer: {
    marginHorizontal: 24,
    marginVertical: "auto",
    borderRadius: R.lg,
    alignSelf: 'center',
    width: SCREEN_HEIGHT > 800 ? 340 : 320,
    maxWidth: '90%',
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
});
