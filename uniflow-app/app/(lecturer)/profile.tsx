import { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  ChevronRight,
  LogOut,
  Lock,
  X,
  Check,
} from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { Theme } from '@/constants/Theme'

const C = Theme.colors
const R = Theme.radius

// ─── Avatar ────────────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  )
}

// ─── Info Row ──────────────────────────────────────────────────────────────

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: string
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  )
}

// ─── Settings Row ──────────────────────────────────────────────────────────

interface SettingsRowProps {
  icon: React.ReactNode
  label: string
  onPress: () => void
  danger?: boolean
  loading?: boolean
}

function SettingsRow({ icon, label, onPress, danger, loading }: SettingsRowProps) {
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
      <Text style={[styles.settingsLabel, danger && styles.settingsLabelDanger]}>
        {label}
      </Text>
      {loading
        ? <ActivityIndicator size="small" color={danger ? C.danger : C.textMuted} />
        : <ChevronRight size={16} color={danger ? C.danger : C.textMuted} strokeWidth={1.8} />
      }
    </TouchableOpacity>
  )
}

// ─── Change Password Modal ─────────────────────────────────────────────────

interface ChangePasswordModalProps {
  visible: boolean
  onClose: () => void
}

function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const reset = useCallback(() => {
    setCurrent('')
    setNext('')
    setConfirm('')
    setError('')
    setSuccess(false)
    setIsLoading(false)
  }, [])

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  const handleSubmit = useCallback(async () => {
    setError('')

    if (!current || !next || !confirm) {
      setError('All fields are required')
      return
    }
    if (next.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }
    if (next !== confirm) {
      setError('New passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      // Re-authenticate with current password first
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('Session expired')

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: current,
      })

      if (signInError) {
        setError('Current password is incorrect')
        setIsLoading(false)
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: next,
      })

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => handleClose(), 1500)
    } catch (e: any) {
      setError(e.message ?? 'Failed to update password. Try again.')
    } finally {
      setIsLoading(false)
    }
  }, [current, next, confirm, handleClose])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.overlay} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Change Password</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={8} style={styles.closeBtn}>
              <X size={18} color={C.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.sheetDivider} />

          <View style={styles.sheetBody}>
            {/* Success */}
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

                {/* Current password */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Current Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter current password"
                    placeholderTextColor={C.textMuted}
                    value={current}
                    onChangeText={setCurrent}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>

                {/* New password */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>New Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Min. 6 characters"
                    placeholderTextColor={C.textMuted}
                    value={next}
                    onChangeText={setNext}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>

                {/* Confirm */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Confirm New Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Repeat new password"
                    placeholderTextColor={C.textMuted}
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!isLoading}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, isLoading && { opacity: 0.6 }]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading
                    ? <ActivityIndicator size="small" color={C.textPrimary} />
                    : <Text style={styles.submitBtnText}>Update Password</Text>
                  }
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function LecturerProfile() {
  const insets = useSafeAreaInsets()
  const profile = useAuthStore((s) => s.profile)
  const signOut = useAuthStore((s) => s.signOut)

  const [isSigningOut, setIsSigningOut] = useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)

  // ── Sign Out ──────────────────────────────────────────────────────────

  const handleSignOut = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true)
            await signOut()
            // AuthGuard in _layout.tsx handles redirect to /login
          },
        },
      ]
    )
  }, [signOut])

  if (!profile) return null

  const isUniflowAdmin = profile.role === 'uniflow_admin';
  const universityName = isUniflowAdmin ? 'System Administrator' : ((profile.universities as any)?.name ?? 'Unknown University');
  const universityShort = isUniflowAdmin ? 'Admin' : ((profile.universities as any)?.short_name ?? '');

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero ── */}
      <View style={styles.hero}>
        <Avatar name={profile.full_name} />
        <Text style={styles.heroName}>{profile.full_name}</Text>
        <View style={styles.roleBadge}>
          <Shield size={12} color={C.brand} strokeWidth={2} />
          <Text style={styles.roleText}>Lecturer</Text>
        </View>
        <Text style={styles.heroUniversity}>{universityShort || universityName}</Text>
      </View>

      {/* ── Account Info ── */}
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

      {/* ── University ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>University</Text>
        <View style={styles.card}>
          <InfoRow
            icon={<Building2 size={16} color={C.brand} strokeWidth={1.8} />}
            label="Institution"
            value={universityName}
          />
        </View>
      </View>

      {/* ── Settings ── */}
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

      {/* ── Sign Out ── */}
      <View style={styles.section}>
        <View style={styles.card}>
          <SettingsRow
            icon={<LogOut size={16} color={C.danger} strokeWidth={1.8} />}
            label="Sign Out"
            onPress={handleSignOut}
            danger
            loading={isSigningOut}
          />
        </View>
      </View>

      {/* ── App info ── */}
      <Text style={styles.appInfo}>Uniflow Mobile · Lecturer</Text>

      {/* ── Change Password Modal ── */}
      <ChangePasswordModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />
    </ScrollView>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bgDeep,
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: R.full,
    backgroundColor: C.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    color: C.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroName: {
    color: C.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.brandMuted,
    borderRadius: R.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.borderBrand,
  },
  roleText: {
    color: C.brand,
    fontSize: 12,
    fontWeight: '700',
  },
  heroUniversity: {
    color: C.textMuted,
    fontSize: 13,
  },

  // Section
  section: {
    gap: 8,
  },
  sectionLabel: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: C.bgCard,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    overflow: 'hidden',
  },

  // Info row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: R.sm,
    backgroundColor: C.brandSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  rowDivider: {
    height: 1,
    backgroundColor: C.borderPrimary,
    marginHorizontal: 16,
  },

  // Settings row
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: R.sm,
    backgroundColor: C.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIconDanger: {
    backgroundColor: C.dangerMuted,
  },
  settingsLabel: {
    flex: 1,
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  settingsLabelDanger: {
    color: C.danger,
  },

  // App info
  appInfo: {
    color: C.bgTertiary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },

  // Modal / Sheet
  overlay: {
    flex: 1,
    backgroundColor: C.overlay,
  },
  sheet: {
    backgroundColor: C.bgSecondary,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    borderWidth: 1,
    borderColor: C.borderPrimary,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.borderSecondary,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sheetTitle: {
    color: C.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: R.full,
    backgroundColor: C.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: C.borderPrimary,
  },
  sheetBody: {
    padding: 20,
    gap: 14,
  },

  // Error
  errorBanner: {
    backgroundColor: C.dangerMuted,
    borderWidth: 1,
    borderColor: C.dangerBorder,
    borderRadius: R.sm,
    padding: 12,
  },
  errorText: {
    color: C.danger,
    fontSize: 13,
  },

  // Fields
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    color: C.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
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
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },

  // Success state
  successState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: R.full,
    backgroundColor: C.successMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    color: C.success,
    fontSize: 16,
    fontWeight: '700',
  },
})