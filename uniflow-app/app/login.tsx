import { useState, useRef } from "react";
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
  Modal,
  Alert,
  Clipboard
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/store/useAuthStore";
import UniflowLogo from "@/components/UniflowLogo";
import GridBackground from "@/components/GridBackground";
import { Theme } from "@/constants/Theme";

// ─── Types ─────────────────────────────────────────────────────────────────

interface FieldError {
  email?: string;
  password?: string;
  general?: string;
}

// ─── Login Screen ──────────────────────────────────────────────────────────

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});

  // Self-service states
  const [showPassModal, setShowPassModal] = useState(false);
  const [genEmail, setGenEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPass, setGeneratedPass] = useState<string | null>(null);

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
    if (!validate()) return;

    setErrors({});
    const { error } = await signIn(email, password);

    if (error) {
      setErrors({ general: error });
    }
  };

  const handleGeneratePassword = async () => {
    if (!genEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(genEmail.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid registered email address.");
      return;
    }

    setIsGenerating(true);
    try {
      // Use the web API endpoint. We assume it's on the same base domain or env var
      const baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '') || '';
      // Since we don't have a reliable way to get the web URL in all envs, we'll try a common pattern
      // but for local dev, it might need to be hardcoded or passed in.
      // Let's assume the web app is at uniflow.com.ng or localhost:3000
      // When running in Expo Go on a physical device, __DEV__ is true, 
      // but 10.0.2.2 only works on the Emulator.
      // Use the production URL for physical devices.
      const webUrl = "https://uniflow-ebon.vercel.app";
      
      console.log("Attempting to fetch password from:", `${webUrl}/api/public/generate-temp-password`);
      
      const res = await fetch(`${webUrl}/api/public/generate-temp-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: genEmail.toLowerCase().trim() })
      });

      console.log("Fetch response status:", res.status);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate password.");

      setGeneratedPass(data.tempPassword);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedPass) {
      Clipboard.setString(generatedPass);
      Alert.alert("Copied", "Password copied to clipboard.");
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
          {/* ── Brand ── */}
          <View style={styles.brandSection}>
            <UniflowLogo size={48} />
            <Text style={styles.brandTagline}>
              University intelligence, in your pocket
            </Text>
          </View>

          {/* ── Form Card ── */}
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
                style={[styles.input, errors.email ? styles.inputError : null]}
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
                <TouchableOpacity onPress={() => setShowPassModal(true)}>
                  <Text style={styles.forgotText}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  errors.password ? styles.inputError : null,
                ]}
              >
                <TextInput
                  style={styles.inputInner}
                  placeholder="Enter your password"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={password}
                  onChangeText={(t) => {
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
                  style={styles.eyeButton}
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
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.button, isLoading ? styles.buttonDisabled : null]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Theme.colors.textPrimary} />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </TouchableOpacity>

            {/* Help text */}
            <Text style={styles.helpText}>
              Need a temporary password?{" "}
              <Text 
                style={{ color: Theme.colors.brand, fontWeight: '600' }}
                onPress={() => setShowPassModal(true)}
              >
                Click here
              </Text>
            </Text>
          </View>

          {/* ── Footer ── */}
          <Text style={styles.footer}>
            Uniflow · Built for Nigerian universities
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Temp Password Modal ── */}
      <Modal
        visible={showPassModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPassModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {generatedPass ? "Password Generated" : "Get Temporary Password"}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowPassModal(false);
                setGeneratedPass(null);
                setGenEmail("");
              }}>
                <Text style={{ color: Theme.colors.textMuted, fontWeight: '600' }}>Close</Text>
              </TouchableOpacity>
            </View>

            {!generatedPass ? (
              <View>
                <Text style={styles.modalSubtitle}>
                  Enter your registered email address to receive a temporary login password.
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="yourname@university.edu"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={genEmail}
                  onChangeText={setGenEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[styles.button, { marginTop: 20 }, isGenerating ? styles.buttonDisabled : null]}
                  onPress={handleGeneratePassword}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Generate Now</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    SECURITY NOTE: This temporary password will be invalidated immediately after your first successful login.
                  </Text>
                </View>
                
                <View style={styles.passContainer}>
                  <Text style={styles.passCode}>{generatedPass}</Text>
                  <TouchableOpacity onPress={copyToClipboard} style={styles.copyBtn}>
                    <Text style={{ color: Theme.colors.brand, fontWeight: '700' }}>Copy</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.button, { marginTop: 10 }]}
                  onPress={() => {
                    setEmail(genEmail);
                    setShowPassModal(false);
                    setGeneratedPass(null);
                  }}
                >
                  <Text style={styles.buttonText}>Proceed to Login</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: Theme.colors.bgSecondary,
    borderRadius: Theme.radius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: Theme.colors.borderPrimary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
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
