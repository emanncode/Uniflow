import { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Bell,
  BellOff,
  Zap,
  BookOpen,
  Info,
  Settings,
  CheckCheck,
} from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { Theme } from '@/constants/Theme'
import type { Notification, NotificationType } from '@/types'

const C = Theme.colors
const R = Theme.radius

// ─── Helpers ───────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  )
}

// ─── Type Config ───────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ReactNode; color: string; background: string; label: string }
> = {
  class_update: {
    icon: <Zap size={16} color="#ff5c1a" strokeWidth={1.8} />,
    color: '#ff5c1a',
    background: 'rgba(255, 92, 26, 0.1)',
    label: 'Class Update',
  },
  resource: {
    icon: <BookOpen size={16} color="#3b82f6" strokeWidth={1.8} />,
    color: '#3b82f6',
    background: 'rgba(59, 130, 246, 0.1)',
    label: 'Resource',
  },
  general: {
    icon: <Info size={16} color="#f59e0b" strokeWidth={1.8} />,
    color: '#f59e0b',
    background: 'rgba(245, 158, 11, 0.1)',
    label: 'General',
  },
  system: {
    icon: <Settings size={16} color="#94a3b8" strokeWidth={1.8} />,
    color: '#94a3b8',
    background: 'rgba(148, 163, 184, 0.1)',
    label: 'System',
  },
}

// ─── Notification Row ──────────────────────────────────────────────────────

interface NotifRowProps {
  notif: Notification
  onPress: (notif: Notification) => void
}

function NotifRow({ notif, onPress }: NotifRowProps) {
  const config = TYPE_CONFIG[notif.type]

  return (
    <Pressable
      style={[styles.row, !notif.is_read && styles.rowUnread]}
      onPress={() => onPress(notif)}
      android_ripple={{ color: C.bgHover }}
    >
      {/* Unread dot */}
      {!notif.is_read && <View style={styles.unreadDot} />}

      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: config.background }]}>
        {config.icon}
      </View>

      {/* Content */}
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text
            style={[styles.rowTitle, !notif.is_read && styles.rowTitleUnread]}
            numberOfLines={1}
          >
            {notif.title}
          </Text>
          <Text style={styles.rowTime}>{timeAgo(notif.created_at)}</Text>
        </View>
        <Text style={styles.rowMessage} numberOfLines={2}>
          {notif.message}
        </Text>
        <View style={styles.typeTag}>
          <Text style={[styles.typeTagText, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

// ─── Section Header ────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  )
}

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function LecturerNotifications() {
  const insets = useSafeAreaInsets()
  const profile = useAuthStore((s) => s.profile)

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  // ── Fetch ─────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!profile) return
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) setNotifications(data)
    } catch (e) {
      console.error('Notifications fetch error:', e)
    }
  }, [profile])

  useEffect(() => {
    fetchData().finally(() => setIsLoading(false))
  }, [fetchData])

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await fetchData()
    setIsRefreshing(false)
  }, [fetchData])

  // ── Realtime ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!profile) return

    const channel = supabase
      .channel('lecturer-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${profile.id}`,
      }, (payload) => {
        const newNotif = payload.new as Notification
        setNotifications((prev) => [newNotif, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile])

  // ── Mark Single as Read ───────────────────────────────────────────────

  const handlePress = useCallback(async (notif: Notification) => {
    if (notif.is_read) return

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
    )

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notif.id)
  }, [])

  // ── Mark All as Read ──────────────────────────────────────────────────

  const handleMarkAllRead = useCallback(async () => {
    if (!profile || unreadCount === 0) return
    setIsMarkingAll(true)

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', profile.id)
      .eq('is_read', false)

    setIsMarkingAll(false)
  }, [profile, unreadCount])

  // ── Group notifications ───────────────────────────────────────────────

  const todayNotifs = notifications.filter((n) => isToday(n.created_at))
  const earlierNotifs = notifications.filter((n) => !isToday(n.created_at))

  // ── Loading ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator size="large" color={C.brand} />
      </View>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={handleMarkAllRead}
            disabled={isMarkingAll}
            activeOpacity={0.75}
          >
            {isMarkingAll ? (
              <ActivityIndicator size="small" color={C.brand} />
            ) : (
              <>
                <CheckCheck size={14} color={C.brand} strokeWidth={2} />
                <Text style={styles.markAllText}>Mark all read</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={C.brand}
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <BellOff size={32} color={C.textMuted} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>
              You'll be notified about class updates and more
            </Text>
          </View>
        ) : (
          <>
            {/* Today */}
            {todayNotifs.length > 0 && (
              <>
                <SectionHeader title="Today" />
                {todayNotifs.map((n) => (
                  <NotifRow key={n.id} notif={n} onPress={handlePress} />
                ))}
              </>
            )}

            {/* Earlier */}
            {earlierNotifs.length > 0 && (
              <>
                <SectionHeader title="Earlier" />
                {earlierNotifs.map((n) => (
                  <NotifRow key={n.id} notif={n} onPress={handlePress} />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bgDeep,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    color: C.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  unreadBadge: {
    backgroundColor: C.brand,
    borderRadius: R.full,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: C.textPrimary,
    fontSize: 11,
    fontWeight: '800',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.brandSubtle,
    borderRadius: R.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: C.borderBrand,
    minWidth: 44,
    minHeight: 34,
    justifyContent: 'center',
  },
  markAllText: {
    color: C.brand,
    fontSize: 12,
    fontWeight: '600',
  },

  // List
  list: {
    gap: 2,
    paddingHorizontal: 0,
  },

  // Section header
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  sectionTitle: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    position: 'relative',
  },
  rowUnread: {
    backgroundColor: C.bgSecondary,
  },
  unreadDot: {
    position: 'absolute',
    left: 8,
    top: 20,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.brand,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowContent: {
    flex: 1,
    gap: 3,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  rowTitle: {
    flex: 1,
    color: C.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  rowTitleUnread: {
    color: C.textPrimary,
    fontWeight: '700',
  },
  rowTime: {
    color: C.textMuted,
    fontSize: 11,
    flexShrink: 0,
    marginTop: 2,
  },
  rowMessage: {
    color: C.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  typeTag: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  typeTagText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Empty
  emptyCard: {
    margin: 20,
    backgroundColor: C.bgCard,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: C.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  emptySubtitle: {
    color: C.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
})