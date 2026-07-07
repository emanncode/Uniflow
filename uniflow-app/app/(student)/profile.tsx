import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  User,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Layers,
  ChevronRight,
  LogOut,
  Lock,
  Check,
} from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { Theme } from "@/constants/Theme";
import { CustomModal } from "@/components/CustomModal";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { AvatarConfirmModal } from "@/components/AvatarConfirmModal";
import { useAvatarPicker } from "@/hooks/useAvatarPicker";
import {
  getDepartmentLabel,
  getFacultyLabel,
  getStudentLevelLabel,
} from "@/lib/enrichProfile";
import { getMobileRoleLabel } from "@/lib/roleLabel";
import { ProfileBackHeader } from "@/components/ProfileBackHeader";
import { useCapsLock } from "@/hooks/useCapsLock";

const C = Theme.colors;
const R = Theme.radius;

// ─── Info Row ──────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Settings Row ──────────────────────────────────────────────────────────

function SettingsRow({
  icon,
  label,
  onPress,
  danger,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={loading}
    >
      <View style={[styles.settingsIcon, danger && styles.settingsIconDanger]}>
        {icon}
      </View>
      <Text
        style={[styles.settingsLabel, danger && styles.settingsLabelDanger]}
      >
        {label}
      </Text>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={danger ? C.danger : C.textMuted}
        />
      ) : (
        <ChevronRight
          size={16}
          color={danger ? C.danger : C.textMuted}
          strokeWidth={1.8}
        />
      )}
    </TouchableOpacity>
  );
}

// ─── Change Password Modal ─────────────────────────────────────────────────

function ChangePasswordModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { capsLock, checkCapsLock } = useCapsLock();

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setError("");
    setSuccess(false);
    setIsLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    setError("");
    if (!current || !next || !confirm) {
      setError("All fields are required");
      return;
    }
    if (next.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (next !== confirm) {
      setError("New passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("Session expired");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: current,
      });
      if (signInError) {
        setError("Current password is incorrect");
        setIsLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: next,
      });
      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => handleClose(), 1500);
    } catch (e: any) {
      setError(e.message ?? "Failed to update password. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomModal
      visible={visible}
      onClose={handleClose}
      title="Change Password"
      type="sheet"
    >
      <View style={styles.sheetBody}>
        {success ? (
          <View style={styles.successState}>
            <View style={styles.successIcon}>
              <Check size={28} color={C.success} strokeWidth={2.5} />
            </View>
            <Text style={styles.successText}>Password updated!</Text>
          </View>
        ) : (
          <>
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {[
              {
                label: "Current Password",
                value: current,
                onChange: setCurrent,
                placeholder: "Enter current password",
              },
              {
                label: "New Password",
                value: next,
                onChange: setNext,
                placeholder: "Min. 6 characters",
              },
              {
                label: "Confirm New Password",
                value: confirm,
                onChange: setConfirm,
                placeholder: "Repeat new password",
              },
            ].map((field) => (
              <View key={field.label} style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor={C.textMuted}
                  value={field.value}
                  onChangeText={(t) => {
                    checkCapsLock(t, field.value);
                    field.onChange(t);
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            ))}
            {capsLock ? (
              <View style={styles.capsLockWarning}>
                <Text style={styles.capsLockWarningText}>
                  Caps Lock is on — passwords are case-sensitive
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.submitBtn, isLoading && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={C.textPrimary} />
              ) : (
                <Text style={styles.submitBtnText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </CustomModal>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function StudentProfile() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);
  const {
    pickImage,
    acceptPhoto,
    cancelPhoto,
    previewUri,
    modalVisible,
    isUploading,
    error: avatarError,
  } = useAvatarPicker();

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    await signOut();
    setSignOutModalVisible(false);
  }, [signOut]);

  useFocusEffect(
    useCallback(() => {
      void refreshProfile();
    }, [refreshProfile]),
  );

  if (!profile) return null;

const isUniflowAdmin = profile.role === 'uniflow_admin';
const universityName = isUniflowAdmin ? 'System Administrator' : (profile.university?.name ?? "Unknown University");
const universityShort = isUniflowAdmin ? 'Admin' : (profile.university?.short_name ?? "");
const roleDisplay = profile.role.charAt(0).toUpperCase() + profile.role.slice(1);
const departmentLabel = getDepartmentLabel(profile);
const facultyLabel = getFacultyLabel(profile);
const levelLabel = getStudentLevelLabel(profile);

return (
    <View style={styles.root}>
      <ProfileBackHeader homeRoute="/(student)" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
      {/* Hero */}
      <View style={styles.hero}>
        <ProfileAvatar
          name={profile.full_name}
          avatarUrl={profile.avatar_url}
          size="lg"
          editable
          onEditPress={pickImage}
        />
        <Text style={styles.heroName}>{profile.full_name}</Text>
        <View style={styles.heroBadges}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{roleDisplay}</Text>
          </View>
          {levelLabel ? (
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{levelLabel}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.heroUniversity}>
          {universityShort || universityName}
        </Text>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <InfoRow
            icon={<User size={16} color={C.brand} strokeWidth={1.8} />}
            label="Full Name"
            value={profile.full_name}
          />
          <View style={styles.rowDivider} />
          <InfoRow
            icon={<Mail size={16} color={C.brand} strokeWidth={1.8} />}
            label="Email"
            value={profile.email}
          />
          {levelLabel ? (
            <>
              <View style={styles.rowDivider} />
              <InfoRow
                icon={<Layers size={16} color={C.brand} strokeWidth={1.8} />}
                label="Study Level"
                value={levelLabel}
              />
            </>
          ) : null}
          {profile.phone ? (
            <>
              <View style={styles.rowDivider} />
              <InfoRow
                icon={<Phone size={16} color={C.brand} strokeWidth={1.8} />}
                label="Phone"
                value={profile.phone}
              />
            </>
          ) : null}
        </View>
      </View>

      {/* University */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>University</Text>
        <View style={styles.card}>
          <InfoRow
            icon={<Building2 size={16} color={C.brand} strokeWidth={1.8} />}
            label="Institution"
            value={universityName}
          />
          {departmentLabel ? (
            <>
              <View style={styles.rowDivider} />
              <InfoRow
                icon={<GraduationCap size={16} color={C.brand} strokeWidth={1.8} />}
                label="Department"
                value={departmentLabel}
              />
            </>
          ) : null}
          {facultyLabel ? (
            <>
              <View style={styles.rowDivider} />
              <InfoRow
                icon={<Building2 size={16} color={C.brand} strokeWidth={1.8} />}
                label="Faculty"
                value={facultyLabel}
              />
            </>
          ) : null}
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Settings</Text>
        <View style={styles.card}>
          <SettingsRow
            icon={<Lock size={16} color={C.textSecondary} strokeWidth={1.8} />}
            label="Change Password"
            onPress={() => setPasswordModalVisible(true)}
          />
        </View>
      </View>

      {/* Sign out */}
      <View style={styles.section}>
        <View style={styles.card}>
          <SettingsRow
            icon={<LogOut size={16} color={C.danger} strokeWidth={1.8} />}
            label="Sign Out"
            onPress={() => setSignOutModalVisible(true)}
            danger
            loading={isSigningOut}
          />
        </View>
      </View>

      <Text style={styles.appInfo}>
        Uniflow Mobile · {getMobileRoleLabel(profile.role)}
      </Text>

      <ChangePasswordModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />

      <ConfirmationModal
        visible={signOutModalVisible}
        onClose={() => setSignOutModalVisible(false)}
        onConfirm={handleSignOut}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        isDestructive
        isLoading={isSigningOut}
        icon={LogOut}
      />

      <AvatarConfirmModal
        visible={modalVisible}
        previewUri={previewUri}
        isLoading={isUploading}
        error={avatarError}
        onCancel={cancelPhoto}
        onAccept={acceptPhoto}
      />
      </ScrollView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgDeep },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, gap: 20 },

  hero: { alignItems: "center", paddingVertical: 8, gap: 8 },
  heroBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  heroName: {
    color: C.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.brandMuted,
    borderRadius: R.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.borderBrand,
  },
  roleText: { color: C.brand, fontSize: 12, fontWeight: "700" },
  levelBadge: {
    backgroundColor: C.bgCard,
    borderRadius: R.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.borderPrimary,
  },
  levelBadgeText: {
    color: C.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  heroUniversity: { color: C.textMuted, fontSize: 13 },

  section: { gap: 8 },
  sectionLabel: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: C.bgCard,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    overflow: "hidden",
  },
  infoRow: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: R.sm,
    backgroundColor: C.brandSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: { flex: 1, gap: 2 },
  infoLabel: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  infoValue: { color: C.textPrimary, fontSize: 15, fontWeight: "500" },
  rowDivider: {
    height: 1,
    backgroundColor: C.borderPrimary,
    marginHorizontal: 16,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: R.sm,
    backgroundColor: C.bgTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsIconDanger: { backgroundColor: C.dangerMuted },
  settingsLabel: {
    flex: 1,
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: "500",
  },
  settingsLabelDanger: { color: C.danger },
  appInfo: {
    color: C.bgTertiary,
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },

  sheetBody: { gap: 14 },
  capsLockWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderRadius: R.sm,
    padding: 10,
  },
  capsLockWarningText: {
    color: C.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: C.dangerMuted,
    borderWidth: 1,
    borderColor: C.dangerBorder,
    borderRadius: R.sm,
    padding: 12,
  },
  errorText: { color: C.danger, fontSize: 13 },
  fieldGroup: { gap: 8 },
  fieldLabel: {
    color: C.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: C.bgTertiary,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    borderRadius: R.sm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: C.textPrimary,
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: C.brand,
    borderRadius: R.sm,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  submitBtnText: { color: C.textPrimary, fontSize: 15, fontWeight: "700" },
  successState: { alignItems: "center", paddingVertical: 24, gap: 12 },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: R.full,
    backgroundColor: C.successMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  successText: { color: C.success, fontSize: 16, fontWeight: "700" },
});
