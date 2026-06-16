import { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Pressable,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  CalendarDays,
  BookOpen,
  Zap,
  Clock,
  MapPin,
  ChevronRight,
  User,
} from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { Theme } from '@/constants/Theme'
import { DashboardSkeleton } from '@/components/SkeletonLoader'
import type { TimetableSlot, ClassUpdate, ClassStatus, DayOfWeek } from '@/types'
import { CLASS_STATUS_COLORS, DAY_ORDER } from '@/types'

const C = Theme.colors
const R = Theme.radius

// ─── Helpers ───────────────────────────────────────────────────────────────

const TODAY_NAME = new Date()
  .toLocaleDateString('en-US', { weekday: 'long' })
  .toLowerCase()

const TODAY_LABEL = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

// ─── Status Badge ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ClassStatus }) {
  const { color, background } = CLASS_STATUS_COLORS[status]
  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={[styles.badgeText, { color }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  )
}

// ─── Stat Card ─────────────────────────────────────────────────────────────

function StatCard({ label, value, icon }: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconWrap}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

// ─── Class Card ────────────────────────────────────────────────────────────

interface ClassCardProps {
  slot: TimetableSlot
  update?: ClassUpdate
  isToday?: boolean
  onPress: () => void
}

function ClassCard({ slot, update, isToday, onPress }: ClassCardProps) {
  const status = update?.status ?? null
  const accentColor = status ? CLASS_STATUS_COLORS[status].color : C.brand

  return (
    <Pressable
      style={({ pressed }) => [
        styles.classCard,
        isToday && styles.classCardToday,
        pressed && styles.classCardPressed,
      ]}
      onPress={onPress}
    >
      {/* Left accent */}
      <View style={[styles.classAccent, { backgroundColor: accentColor }]} />

      <View style={styles.classBody}>
        <View style={styles.classTop}>
          <Text style={styles.courseCode}>{slot.courses?.code ?? '—'}</Text>
          {status && <StatusBadge status={status} />}
        </View>

        <Text style={styles.courseTitle} numberOfLines={1}>
          {slot.courses?.title ?? 'Unknown Course'}
        </Text>

        <View style={styles.classMeta}>
          <View style={styles.metaItem}>
            <Clock size={12} color={C.textMuted} strokeWidth={1.8} />
            <Text style={styles.metaText}>
              {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MapPin size={12} color={C.textMuted} strokeWidth={1.8} />
            <Text style={styles.metaText} numberOfLines={1}>
              {update?.new_venue ?? slot.venue}
            </Text>
          </View>
        </View>

        {update?.message ? (
          <Text style={styles.updateMsg} numberOfLines={1}>
            {update.message}
          </Text>
        ) : null}
      </View>

      <ChevronRight size={15} color={C.textMuted} strokeWidth={1.8} style={{ marginRight: 14 }} />
    </Pressable>
  )
}

// ─── Section Header ────────────────────────────────────────────────────────

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll} hitSlop={12}>
        <Text style={styles.seeAll}>See all</Text>
      </TouchableOpacity>
    </View>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────

function EmptyDay() {
  return (
    <View style={styles.emptyCard}>
      <CalendarDays size={26} color={C.textMuted} strokeWidth={1.5} />
      <View style={styles.emptyText}>
        <Text style={styles.emptyTitle}>No classes today</Text>
        <Text style={styles.emptySub}>Enjoy your free day</Text>
      </View>
    </View>
  )
}

// ─── Screen ────────────────────────────────────────────────────────────────

export default function LecturerDashboard() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const profile = useAuthStore((s) => s.profile)

  const [todaySlots, setTodaySlots] = useState<TimetableSlot[]>([])
  const [upcomingSlots, setUpcomingSlots] = useState<TimetableSlot[]>([])
  const [todayUpdates, setTodayUpdates] = useState<Record<string, ClassUpdate>>({})
  const [totalCourses, setTotalCourses] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // ── Fetch ─────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!profile) return
    try {
      const { data: allSlots } = await supabase
        .from('timetable')
        .select('*, courses(id, title, code, credit_units)')
        .eq('lecturer_id', profile.id)
        .eq('is_active', true)
        .order('start_time')

      if (!allSlots) return

      const today = allSlots.filter((s) => s.day_of_week === TODAY_NAME)
      const upcoming = allSlots
        .filter((s) => s.day_of_week !== TODAY_NAME)
        .sort((a, b) => DAY_ORDER[a.day_of_week as DayOfWeek] - DAY_ORDER[b.day_of_week as DayOfWeek])
        .slice(0, 4)

      setTodaySlots(today)
      setUpcomingSlots(upcoming)
      setTotalCourses(new Set(allSlots.map((s) => s.course_id)).size)

      const todayDate = new Date().toISOString().split('T')[0]
      const { data: updates } = await supabase
        .from('class_updates')
        .select('*')
        .eq('university_id', profile.university_id)
        .eq('update_date', todayDate)
        .in('timetable_id', today.map((s) => s.id))

      if (updates) {
        const map: Record<string, ClassUpdate> = {}
        updates.forEach((u) => { map[u.timetable_id] = u })
        setTodayUpdates(map)
      }
    } catch (e) {
      console.error('Dashboard fetch error:', e)
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
      .channel('lecturer-dashboard')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'class_updates',
        filter: `university_id=eq.${profile.university_id}`,
      }, (payload) => {
        const update = payload.new as ClassUpdate
        if (!update?.timetable_id) return
        setTodayUpdates((prev) => ({ ...prev, [update.timetable_id]: update }))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profile])

  // ── Loading ───────────────────────────────────────────────────────────

  if (isLoading) return <DashboardSkeleton />

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Lecturer'
  const alertCount = Object.keys(todayUpdates).length

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={C.brand} />
      }
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.name}>{firstName}</Text>
          <Text style={styles.date}>{TODAY_LABEL}</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => router.push('/(lecturer)/profile')}
          activeOpacity={0.8}
        >
          <User size={18} color={C.brand} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>

      {/* ── Stats ── */}
      <View style={styles.statsRow}>
        <StatCard
          label="Today"
          value={todaySlots.length}
          icon={<CalendarDays size={17} color={C.brand} strokeWidth={1.8} />}
        />
        <StatCard
          label="Courses"
          value={totalCourses}
          icon={<BookOpen size={17} color={C.brand} strokeWidth={1.8} />}
        />
        <StatCard
          label="Updates"
          value={alertCount}
          icon={<Zap size={17} color={C.brand} strokeWidth={1.8} />}
        />
      </View>

      {/* ── Today's Classes ── */}
      <View style={styles.section}>
        <SectionHeader
          title="Today's Classes"
          onSeeAll={() => router.push('/(lecturer)/timetable')}
        />
        {todaySlots.length === 0
          ? <EmptyDay />
          : todaySlots.map((slot) => (
            <ClassCard
              key={slot.id}
              slot={slot}
              update={todayUpdates[slot.id]}
              isToday
              onPress={() => router.push('/(lecturer)/timetable')}
            />
          ))
        }
      </View>

      {/* ── Upcoming ── */}
      {upcomingSlots.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Upcoming"
            onSeeAll={() => router.push('/(lecturer)/timetable')}
          />
          {upcomingSlots.map((slot) => (
            <ClassCard
              key={slot.id}
              slot={slot}
              onPress={() => router.push('/(lecturer)/timetable')}
            />
          ))}
        </View>
      )}
    </ScrollView>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgDeep },
  content: { paddingHorizontal: 20, gap: 24 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: { gap: 2 },
  greeting: { color: C.textMuted, fontSize: 13 },
  name: {
    color: C.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  date: { color: C.textMuted, fontSize: 12, marginTop: 2 },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: R.full,
    backgroundColor: C.brandMuted,
    borderWidth: 1,
    borderColor: C.borderBrand,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: C.bgSecondary,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.borderSecondary,
    padding: 14,
    alignItems: 'center',
    gap: 5,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: R.sm,
    backgroundColor: C.brandSubtle,
    borderWidth: 1,
    borderColor: 'rgba(255, 92, 26, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: C.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Section
  section: { gap: 10 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: C.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  seeAll: {
    color: C.brand,
    fontSize: 13,
    fontWeight: '600',
  },

  // Empty
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: C.bgSecondary,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    padding: 20,
  },
  emptyText: { gap: 2 },
  emptyTitle: { color: C.textSecondary, fontSize: 14, fontWeight: '600' },
  emptySub: { color: C.textMuted, fontSize: 12 },

  // Class Card
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bgSecondary,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    overflow: 'hidden',
  },
  classCardToday: {
    borderColor: C.borderBrand,
    backgroundColor: 'rgba(255, 92, 26, 0.03)',
  },
  classCardPressed: {
    opacity: 0.75,
  },
  classAccent: { width: 3, alignSelf: 'stretch' },
  classBody: { flex: 1, paddingVertical: 14, paddingLeft: 12, gap: 4 },
  classTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  courseCode: {
    color: C.brand,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  courseTitle: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  classMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 3,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: C.textMuted, fontSize: 12 },
  updateMsg: {
    color: C.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },

  // Badge
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.full },
  badgeText: { fontSize: 11, fontWeight: '700' },
})