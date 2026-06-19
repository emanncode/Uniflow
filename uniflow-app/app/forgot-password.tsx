import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { ArrowLeft, Mail } from "lucide-react-native";
import UniflowLogo from "@/components/UniflowLogo";
import GridBackground from "@/components/GridBackground";
import { Theme } from "@/constants/Theme";
import { webAppUrl } from "@/lib/config";
import { FadeSlideIn } from "@/components/FadeSlideIn";
import { ScalePressable } from "@/components/ScalePressable";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid registered email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(webAppUrl("/api/public/request-password-reset"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reset email.");

      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <GridBackground />
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => router.back()} style={styles.backRow}>
            <ArrowLeft size={18} color={Theme.colors.textMuted} />
            <Text style={styles.backText}>Back to sign in</Text>
          </Pressable>

          <FadeSlideIn index={0}>
            <View style={styles.logoWrap}>
              <UniflowLogo size={72} />
            </View>
          </FadeSlideIn>

          <FadeSlideIn index={1}>
            <View style={styles.card}>
              <Text style={styles.title}>
                {sent ? "Check your email" : "Forgot password?"}
              </Text>

              {sent ? (
                <>
                  <Text style={styles.subtitle}>
                    If <Text style={styles.emailHighlight}>{email}</Text> is
                    registered, we sent a reset link. Open it in your browser to
                    set a new password, then return here to sign in.
                  </Text>
                  <ScalePressable
                    style={styles.button}
                    onPress={() => router.replace("/login")}
                    scaleTo={0.98}
                  >
                    <Text style={styles.buttonText}>Back to sign in</Text>
                  </ScalePressable>
                </>
              ) : (
                <>
                  <Text style={styles.subtitle}>
                    Enter your registered email. We&apos;ll send a secure link to
                    reset your password on the web.
                  </Text>

                  {error ? <Text style={styles.error}>{error}</Text> : null}

                  <View style={styles.inputWrap}>
                    <Mail
                      size={16}
                      color={Theme.colors.textMuted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="yourname@university.edu"
                      placeholderTextColor={Theme.colors.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>

                  <ScalePressable
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                    scaleTo={0.98}
                  >
                    {loading ? (
                      <ActivityIndicator color={Theme.colors.textPrimary} />
                    ) : (
                      <Text style={styles.buttonText}>Send reset link</Text>
                    )}
                  </ScalePressable>
                </>
              )}
            </View>
          </FadeSlideIn>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Theme.colors.bgDeep },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  backText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
  logoWrap: { alignItems: "center", marginBottom: 28 },
  card: {
    backgroundColor: Theme.colors.bgCard,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 24,
  },
  title: {
    color: Theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  emailHighlight: {
    color: Theme.colors.textPrimary,
    fontWeight: "600",
  },
  error: {
    color: Theme.colors.danger,
    fontSize: 13,
    marginBottom: 12,
  },
  inputWrap: {
    position: "relative",
    marginBottom: 16,
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    top: 15,
    zIndex: 1,
  },
  input: {
    backgroundColor: Theme.colors.bgTertiary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    paddingVertical: 14,
    paddingLeft: 42,
    paddingRight: 14,
    color: Theme.colors.textPrimary,
    fontSize: 15,
  },
  button: {
    backgroundColor: Theme.colors.brand,
    borderRadius: Theme.radius.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: Theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
});