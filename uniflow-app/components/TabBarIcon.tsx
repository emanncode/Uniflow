import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { Theme } from "@/constants/Theme";

const C = Theme.colors;

/** Visible bottom tabs (excludes hidden routes like profile/notifications). */
export const VISIBLE_TAB_COUNT = 4;

interface TabBarIconProps {
  icon: React.ReactNode;
  label: string;
  focused: boolean;
  badgeCount?: number;
}

export function TabBarIcon({
  icon,
  label,
  focused,
  badgeCount,
}: TabBarIconProps) {
  const { width: screenWidth } = useWindowDimensions();
  const tabWidth = screenWidth / VISIBLE_TAB_COUNT;

  return (
    <View style={[styles.tabItem, { width: tabWidth }]}>
      <View style={[styles.iconPill, focused && styles.iconPillActive]}>
        {icon}
        {badgeCount && badgeCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badgeCount > 99 ? "99+" : badgeCount}
            </Text>
          </View>
        ) : null}
      </View>
      <Text
        style={[
          styles.tabLabel,
          focused && styles.tabLabelActive,
          { maxWidth: tabWidth - 4 },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  iconPill: {
    position: "relative",
    width: 50,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconPillActive: {
    backgroundColor: "rgba(255, 92, 26, 0.12)",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: C.textMuted,
    letterSpacing: 0,
    textAlign: "center",
  },
  tabLabelActive: {
    color: C.brand,
    fontWeight: "700",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: C.danger,
    borderRadius: 8,
    minWidth: 15,
    height: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: C.bgSecondary,
  },
  badgeText: {
    color: C.textPrimary,
    fontSize: 8,
    fontWeight: "800",
  },
});