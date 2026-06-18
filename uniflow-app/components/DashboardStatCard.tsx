import { View, Text, StyleSheet } from "react-native";
import { Theme } from "@/constants/Theme";
import { FadeSlideIn } from "@/components/FadeSlideIn";

const C = Theme.colors;
const R = Theme.radius;

interface DashboardStatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  index?: number;
}

export function DashboardStatCard({
  label,
  value,
  icon,
  index = 0,
}: DashboardStatCardProps) {
  return (
    <FadeSlideIn index={index} style={styles.wrap}>
      <View style={styles.statCard}>
        <View style={styles.statTop}>
          <View style={styles.statIconWrap}>{icon}</View>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </FadeSlideIn>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  statCard: {
    flex: 1,
    backgroundColor: C.bgSecondary,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.borderSecondary,
    padding: 14,
    gap: 10,
  },
  statTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: R.sm,
    backgroundColor: C.brandSubtle,
    borderWidth: 1,
    borderColor: "rgba(255, 92, 26, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    flex: 1,
    color: C.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  statValue: {
    color: C.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.6,
    lineHeight: 30,
  },
});