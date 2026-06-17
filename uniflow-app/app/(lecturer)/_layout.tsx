import { Tabs } from 'expo-router'
import { View, Text, StyleSheet, Platform } from 'react-native'
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  FolderOpen,
  Bell,
} from 'lucide-react-native'
import { Theme } from '@/constants/Theme'

const C = Theme.colors

// ─── Tab Icon ──────────────────────────────────────────────────────────────
// Active state: orange pill background behind icon + orange label
// Inactive state: just the muted icon + muted label
// Badge: red dot top-right of icon for notification counts

interface TabIconProps {
  icon: React.ReactNode
  label: string
  focused: boolean
  badgeCount?: number
}

function TabIcon({ icon, label, focused, badgeCount }: TabIconProps) {
  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconPill, focused && styles.iconPillActive]}>
        {icon}
        {badgeCount && badgeCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badgeCount > 99 ? '99+' : badgeCount}
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}

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
            <TabIcon
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
            <TabIcon
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
            <TabIcon
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
            <TabIcon
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
            <TabIcon
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

  // Each tab item: pill + label stacked
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    // gap: 2,
  },

  // The pill that wraps the icon
  // Inactive: transparent, no background
  // Active: subtle orange fill + border
  iconPill: {
    position: 'relative',
    width: 44,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconPillActive: {
    backgroundColor: 'rgba(255, 92, 26, 0.12)',
    // No border — the background alone reads as selected
  },

  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: C.textMuted,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: C.brand,
    fontWeight: '700',
  },

  // Notification badge
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: C.danger,
    borderRadius: 8,
    minWidth: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: C.bgSecondary, // cuts out from the tab bar background
  },
  badgeText: {
    color: C.textPrimary,
    fontSize: 8,
    fontWeight: '800',
  },
})