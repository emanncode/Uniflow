import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Theme } from "@/constants/Theme";
import { ScreenHeaderActions } from "@/components/ScreenHeaderActions";
import { FadeSlideIn } from "@/components/FadeSlideIn";

const C = Theme.colors;

type AppRole = "student" | "lecturer";

interface ScreenPageHeaderProps {
  title: string;
  subtitle?: string;
  role: AppRole;
  style?: StyleProp<ViewStyle>;
}

export function ScreenPageHeader({
  title,
  subtitle,
  role,
  style,
}: ScreenPageHeaderProps) {
  return (
    <FadeSlideIn index={0} style={style}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle ? <Text style={styles.headerSub}>{subtitle}</Text> : null}
        </View>
        <ScreenHeaderActions role={role} />
      </View>
    </FadeSlideIn>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    color: C.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  headerSub: {
    color: C.textMuted,
    fontSize: 13,
  },
});