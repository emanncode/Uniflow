import { Tabs } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  FolderOpen,
  Bell,
  User,
} from "lucide-react-native";
import { Theme } from "@/constants/Theme";

// ─── Tab Icon ──────────────────────────────────────────────────────────────

interface TabIconProps {
  icon: React.ReactNode;
  label: string;
  focused: boolean;
  badgeCount?: number;
}

function TabIcon({ icon, label, focused, badgeCount }: TabIconProps) {
  return (
    <View style={styles.tabItem}>
      <View style={styles.iconWrapper}>
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
        style={[styles.tabLabel, focused && styles.tabLabelActive]} 
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── Lecturer Tab Layout ───────────────────────────────────────────────────

export default function LecturerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Theme.colors.brand,
        tabBarInactiveTintColor: Theme.colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              icon={
                <LayoutDashboard
                  size={22}
                  color={color}
                  strokeWidth={focused ? 2.2 : 1.8}
                />
              }
              label="Home"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="timetable"
        options={{
          title: "Timetable",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              icon={
                <CalendarDays
                  size={22}
                  color={color}
                  strokeWidth={focused ? 2.2 : 1.8}
                />
              }
              label="Timetable"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: "Courses",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              icon={
                <BookOpen
                  size={22}
                  color={color}
                  strokeWidth={focused ? 2.2 : 1.8}
                />
              }
              label="Courses"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: "Resources",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              icon={
                <FolderOpen
                  size={22}
                  color={color}
                  strokeWidth={focused ? 2.2 : 1.8}
                />
              }
              label="Resources"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alerts",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              icon={
                <Bell
                  size={22}
                  color={color}
                  strokeWidth={focused ? 2.2 : 1.8}
                />
              }
              label="Alerts"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              icon={
                <User
                  size={22}
                  color={color}
                  strokeWidth={focused ? 2.2 : 1.8}
                />
              }
              label="Profile"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Theme.colors.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderPrimary,
    height: Platform.OS === "ios" ? 84 : 64,
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    paddingTop: 8,
    elevation: 0,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  iconWrapper: {
    position: "relative",
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: Theme.colors.textMuted,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: Theme.colors.brand,
    fontWeight: "700",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: Theme.colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Theme.colors.textPrimary,
    fontSize: 9,
    fontWeight: "700",
  },
});
