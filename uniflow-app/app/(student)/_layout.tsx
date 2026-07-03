import { useEffect } from "react";
import { Tabs } from "expo-router";
import { StyleSheet, Platform } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { prefetchStudentEnrollments } from "@/hooks/useStudentEnrollments";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  FolderDown,
} from "lucide-react-native";
import { Theme } from "@/constants/Theme";
import { TabBarIcon } from "@/components/TabBarIcon";

const C = Theme.colors;
const TAB_ICON_SIZE = 24;

export default function StudentLayout() {
  const profile = useAuthStore((s) => s.profile);

  useEffect(() => {
    if (profile?.role === "student") {
      prefetchStudentEnrollments(profile.id);
    }
  }, [profile?.id, profile?.role]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarShowLabel: false,
        tabBarActiveTintColor: C.brand,
        tabBarInactiveTintColor: C.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              icon={
                <LayoutDashboard
                  size={TAB_ICON_SIZE}
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
            <TabBarIcon
              icon={
                <CalendarDays
                  size={TAB_ICON_SIZE}
                  color={color}
                  strokeWidth={focused ? 2.2 : 1.8}
                />
              }
              label="Schedule"
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
            <TabBarIcon
              icon={
                <BookOpen
                  size={TAB_ICON_SIZE}
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
            <TabBarIcon
              icon={
                <FolderDown
                  size={TAB_ICON_SIZE}
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
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarItem: {
    paddingHorizontal: 0,
  },
  tabBar: {
    backgroundColor: C.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: C.borderPrimary,
    height: Platform.OS === "ios" ? 88 : 68,
    paddingBottom: Platform.OS === "ios" ? 24 : 10,
    paddingTop: 16,
    elevation: 0,
    shadowOpacity: 0,
  },
});