import { Tabs } from 'expo-router'
import { StyleSheet, Platform } from 'react-native'
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  FolderOpen,
  Bell,
} from 'lucide-react-native'
import { Theme } from '@/constants/Theme'
import { TabBarIcon } from '@/components/TabBarIcon'

const C = Theme.colors

// ─── Lecturer Tab Layout ───────────────────────────────────────────────────

export default function LecturerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: C.brand,
        tabBarInactiveTintColor: C.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              icon={<LayoutDashboard size={20} color={color} strokeWidth={focused ? 2.2 : 1.8} />}
              label="Home"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="timetable"
        options={{
          title: 'Timetable',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              icon={<CalendarDays size={20} color={color} strokeWidth={focused ? 2.2 : 1.8} />}
              label="Schedule"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              icon={<BookOpen size={20} color={color} strokeWidth={focused ? 2.2 : 1.8} />}
              label="Courses"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: 'Resources',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              icon={<FolderOpen size={20} color={color} strokeWidth={focused ? 2.2 : 1.8} />}
              label="Resources"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              icon={<Bell size={20} color={color} strokeWidth={focused ? 2.2 : 1.8} />}
              label="Alerts"
              focused={focused}
            />
          ),
        }}
      />

      {/* Profile — stack-style screen: no tab bar, back button on screen */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: C.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: C.borderPrimary,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 6,
    elevation: 0,
    shadowOpacity: 0,
  },

})