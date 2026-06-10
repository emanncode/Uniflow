import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { CustomModal } from "./CustomModal";
import { Theme } from "@/constants/Theme";
import { LucideIcon } from "lucide-react-native";

const C = Theme.colors;
const R = Theme.radius;

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  icon?: LucideIcon;
}

export function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
  icon: Icon,
}: ConfirmationModalProps) {
  return (
    <CustomModal visible={visible} onClose={onClose} title={title} type="alert">
      <View style={styles.content}>
        {Icon && (
          <View style={[styles.iconWrapper, isDestructive && styles.iconWrapperDestructive]}>
            <Icon size={28} color={isDestructive ? C.danger : C.brand} strokeWidth={2.5} />
          </View>
        )}
        
        <Text style={styles.message}>{message}</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={onClose}
            disabled={isLoading}
          >
            <Text style={styles.cancelBtnText}>{cancelText}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.confirmBtn, isDestructive && styles.confirmBtnDestructive]} 
            onPress={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={C.textPrimary} />
            ) : (
              <Text style={styles.confirmBtnText}>{confirmText}</Text>
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
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: R.full,
    backgroundColor: C.brandSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconWrapperDestructive: {
    backgroundColor: C.dangerMuted,
  },
  message: {
    color: C.textSecondary,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: C.bgTertiary,
    borderRadius: R.md,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.borderPrimary,
  },
  cancelBtnText: {
    color: C.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: C.brand,
    borderRadius: R.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmBtnDestructive: {
    backgroundColor: C.danger,
  },
  confirmBtnText: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
});
