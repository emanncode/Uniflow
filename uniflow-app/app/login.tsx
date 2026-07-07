import { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/store/useAuthStore";
import UniflowLogo from "@/components/UniflowLogo";
import GridBackground from "@/components/GridBackground";
import { Theme } from "@/constants/Theme";

import { FadeSlideIn } from "@/components/FadeSlideIn";
import { ScalePressable } from "@/components/ScalePressable";
import { useCapsLock } from "@/hooks/useCapsLock";

// ─── Types ─────────────────────────────────────────────────────────────────

interface FieldError {
  email?: string;
  password?: string;
  general?: string;
}

// ─── Login Screen ──────────────────────────────────────────────────────────

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const { capsLock, checkCapsLock } = useCapsLock();

  // ── Validation ─────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FieldError = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (isLoading) return;
    if (!validate()) return;

    setErrors({});
    const { error } = await signIn(email, password);

    if (error) {
      setErrors({ general: error });
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
    <GridBackground />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <StatusBar style="light" backgroundColor={Theme.colors.bgPrimary} />

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FadeSlideIn index={0}>
            <View style={styles.brandSection}>
              <UniflowLogo size={48} />
              <Text style={styles.brandTagline}>
                University intelligence, in your pocket
              </Text>
            </View>
          </FadeSlideIn>

          <FadeSlideIn index={1}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSubtitle}>Sign in to your account</Text>

            {/* General error */}
            {errors.general ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errors.general}</Text>
              </View>
            ) : null}

            {/* Email field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.email ? styles.inputError : null,
                  isLoading ? styles.inputDisabled : null,
                ]}
                placeholder="you@university.edu"
                placeholderTextColor={Theme.colors.textMuted}
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errors.email)
                    setErrors((e) => ({ ...e, email: undefined }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                editable={!isLoading}
              />
              {errors.email ? (
                <Text style={styles.fieldError}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Password field */}
            <View style={styles.fieldGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={[styles.label, { marginBottom: 0 }]}>Password</Text>
                <TouchableOpacity
                  onPress={() => router.push("/forgot-password")}
                  disabled={isLoading}
                  style={isLoading ? styles.linkDisabled : undefined}
                >
                  <Text style={styles.forgotText}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  errors.password ? styles.inputError : null,
                  isLoading ? styles.inputDisabled : null,
                ]}
              >
                <TextInput
                  style={styles.inputInner}
                  placeholder="Enter your password"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={password}
                  onChangeText={(t) => {
                    checkCapsLock(t, password);
                    setPassword(t);
                    if (errors.password)
                      setErrors((e) => ({ ...e, password: undefined }));
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  editable={!isLoading}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  disabled={isLoading}
                  style={[styles.eyeButton, isLoading ? styles.linkDisabled : null]}
                  hitSlop={8}
                >
                  <Text style={styles.eyeText}>
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              </View>
              {errors.password ? (
                <Text style={styles.fieldError}>{errors.password}</Text>
              ) : null}
              {capsLock ? (
                <Text style={styles.capsLockWarning}>
                  Caps Lock is on — passwords are case-sensitive
                </Text>
              ) : null}
            </View>

            {/* Submit */}
            <ScalePressable
              style={[styles.button, isLoading ? styles.buttonDisabled : null]}
              onPress={handleLogin}
              disabled={isLoading}
              scaleTo={0.98}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Theme.colors.textPrimary} />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </ScalePressable>

            <Text style={styles.helpText}>
              Registered by your school? Use{" "}
              <Text
                style={[
                  { color: Theme.colors.brand, fontWeight: "600" },
                  isLoading ? styles.linkDisabled : null,
                ]}
                onPress={
                  isLoading ? undefined : () => router.push("/forgot-password")
                }
              >
                forgot password
              </Text>{" "}
              to get a reset link by email.
            </Text>
          </View>
          </FadeSlideIn>

          <FadeSlideIn index={2}>
            <Text style={styles.footer}>
              Uniflow · Built for Nigerian universities
            </Text>
          </FadeSlideIn>
        </ScrollView>
      </KeyboardAvoidingView>

    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.colors.bgPrimary,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
    justifyContent: "center",
  },

  // ── Brand ──
  brandSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  brandTagline: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // ── Card ──
  card: {
    backgroundColor: Theme.colors.bgSecondary,
    borderRadius: Theme.radius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: Theme.colors.borderPrimary,
  },
  cardTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  cardSubtitle: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 24,
  },

  // ── Error Banner ──
  errorBanner: {
    backgroundColor: Theme.colors.dangerMuted,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    borderRadius: Theme.radius.md,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: Theme.colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },

  // ── Fields ──
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: Theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  forgotText: {
    color: Theme.colors.brand,
    fontSize: 11,
    fontWeight: "700",
  },
  input: {
    backgroundColor: Theme.colors.bgTertiary,
    borderWidth: 1,
    borderColor: Theme.colors.borderPrimary,
    borderRadius: Theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Theme.colors.textPrimary,
    fontSize: 15,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.bgTertiary,
    borderWidth: 1,
    borderColor: Theme.colors.borderPrimary,
    borderRadius: Theme.radius.md,
  },
  inputInner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Theme.colors.textPrimary,
    fontSize: 15,
  },
  inputError: {
    borderColor: "rgba(239, 68, 68, 0.4)",
  },
  inputDisabled: {
    opacity: 0.7,
  },
  linkDisabled: {
    opacity: 0.5,
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  eyeText: {
    color: Theme.colors.brand,
    fontSize: 13,
    fontWeight: "600",
  },
  fieldError: {
    color: Theme.colors.danger,
    fontSize: 12,
    marginTop: 6,
  },

  // ── Button ──
  button: {
    backgroundColor: Theme.colors.brand,
    borderRadius: Theme.radius.md,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    minHeight: 52,
    shadowColor: Theme.colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  capsLockWarning: {
    color: Theme.colors.warning,
    fontSize: 12,
    marginTop: 6,
  },

  // ── Help & Footer ──
  helpText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 18,
  },
  footer: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 32,
  },

  // ── Modal Styles (used inside CustomModal children) ──
  modalSubtitle: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  warningBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: Theme.radius.md,
    padding: 12,
    marginBottom: 20,
  },
  warningText: {
    color: '#60a5fa',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  passContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: Theme.radius.md,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Theme.colors.borderPrimary,
  },
  passCode: {
    color: Theme.colors.brand,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  copyBtn: {
    padding: 8,
  }
});
