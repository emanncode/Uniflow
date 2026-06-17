import { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet, ViewStyle } from 'react-native'
import { Theme } from '@/constants/Theme'

const C = Theme.colors

// ─── Single Shimmer Bar ────────────────────────────────────────────────────

interface SkeletonBarProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: ViewStyle
}

export function SkeletonBar({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonBarProps) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: C.bgTertiary,
          opacity,
        },
        style,
      ]}
    />
  )
}

// ─── Dashboard Skeleton ────────────────────────────────────────────────────

export function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerSkel}>
        <View style={{ gap: 8, flex: 1 }}>
          <SkeletonBar width={80} height={12} />
          <SkeletonBar width={160} height={28} borderRadius={6} />
          <SkeletonBar width={120} height={11} />
        </View>
        <SkeletonBar width={44} height={44} borderRadius={9999} />
      </View>

      {/* Stat cards */}
      <View style={styles.statsRow}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.statCard}>
            <SkeletonBar width={36} height={36} borderRadius={10} />
            <SkeletonBar width={32} height={24} borderRadius={4} />
            <SkeletonBar width={48} height={10} borderRadius={4} />
          </View>
        ))}
      </View>

      {/* Section */}
      <View style={styles.section}>
        <SkeletonBar width={120} height={14} borderRadius={4} />
        {[1, 2].map((i) => (
          <View key={i} style={styles.classCard}>
            <View style={styles.classCardAccent} />
            <View style={{ flex: 1, padding: 14, gap: 8 }}>
              <SkeletonBar width={80} height={11} borderRadius={4} />
              <SkeletonBar width="90%" height={15} borderRadius={4} />
              <SkeletonBar width={160} height={11} borderRadius={4} />
            </View>
          </View>
        ))}
      </View>

      {/* Upcoming section */}
      <View style={styles.section}>
        <SkeletonBar width={100} height={14} borderRadius={4} />
        {[1, 2].map((i) => (
          <View key={i} style={styles.classCard}>
            <View style={[styles.classCardAccent, { backgroundColor: C.bgSecondary }]} />
            <View style={{ flex: 1, padding: 14, gap: 8 }}>
              <SkeletonBar width={60} height={11} borderRadius={4} />
              <SkeletonBar width="80%" height={15} borderRadius={4} />
              <SkeletonBar width={140} height={11} borderRadius={4} />
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

// ─── Timetable Skeleton ────────────────────────────────────────────────────

export function TimetableSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ gap: 6, paddingBottom: 16 }}>
        <SkeletonBar width={160} height={26} borderRadius={6} />
        <SkeletonBar width={100} height={12} borderRadius={4} />
      </View>

      {/* Day strip */}
      <View style={styles.dayStrip}>
        {[80, 60, 90, 60, 70, 60].map((w, i) => (
          <SkeletonBar key={i} width={w} height={38} borderRadius={9999} />
        ))}
      </View>

      {/* Slots */}
      <View style={styles.section}>
        <SkeletonBar width={90} height={14} borderRadius={4} />
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.classCard}>
            <View style={styles.classCardAccent} />
            <View style={{ flex: 1, padding: 14, gap: 8 }}>
              <SkeletonBar width={70} height={11} borderRadius={4} />
              <SkeletonBar width="85%" height={15} borderRadius={4} />
              <SkeletonBar width={180} height={11} borderRadius={4} />
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

// ─── Courses Skeleton ──────────────────────────────────────────────────────

export function CoursesSkeleton() {
  return (
    <View style={styles.container}>
      <View style={{ gap: 6, paddingBottom: 16 }}>
        <SkeletonBar width={140} height={26} borderRadius={6} />
        <SkeletonBar width={100} height={12} borderRadius={4} />
      </View>

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
            <SkeletonBar width={40} height={22} borderRadius={4} />
            <SkeletonBar width={60} height={10} borderRadius={4} />
          </View>
        ))}
      </View>

      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.courseCard, { gap: 10 }]}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <SkeletonBar width={70} height={24} borderRadius={9999} />
            <SkeletonBar width={50} height={24} borderRadius={9999} />
          </View>
          <SkeletonBar width="90%" height={16} borderRadius={4} />
          <SkeletonBar width={120} height={12} borderRadius={4} />
          <SkeletonBar width={160} height={11} borderRadius={4} />
        </View>
      ))}
    </View>
  )
}

// ─── Notifications Skeleton ────────────────────────────────────────────────

export function NotificationsSkeleton() {
  return (
    <View style={styles.container}>
      <View style={{ gap: 6, paddingBottom: 16 }}>
        <SkeletonBar width={180} height={26} borderRadius={6} />
      </View>

      <SkeletonBar width={60} height={11} borderRadius={4} style={{ marginBottom: 8 }} />

      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.notifRow}>
          <SkeletonBar width={38} height={38} borderRadius={10} />
          <View style={{ flex: 1, gap: 7 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <SkeletonBar width="65%" height={13} borderRadius={4} />
              <SkeletonBar width={40} height={11} borderRadius={4} />
            </View>
            <SkeletonBar width="90%" height={11} borderRadius={4} />
            <SkeletonBar width={70} height={10} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  )
}

// ─── Resources Skeleton ────────────────────────────────────────────────────

export function ResourcesSkeleton() {
  return (
    <View style={styles.container}>
      <View style={{ gap: 6, paddingBottom: 12 }}>
        <SkeletonBar width={120} height={26} borderRadius={6} />
        <SkeletonBar width={100} height={12} borderRadius={4} />
      </View>

      <View style={styles.dayStrip}>
        {[100, 80, 110, 90].map((w, i) => (
          <SkeletonBar key={i} width={w} height={34} borderRadius={9999} />
        ))}
      </View>

      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.courseCard, { flexDirection: 'row', gap: 12 }]}>
          <SkeletonBar width={44} height={44} borderRadius={10} />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <SkeletonBar width={60} height={20} borderRadius={9999} />
              <SkeletonBar width={80} height={20} borderRadius={9999} />
            </View>
            <SkeletonBar width="90%" height={14} borderRadius={4} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <SkeletonBar width={80} height={11} borderRadius={4} />
              <SkeletonBar width={80} height={28} borderRadius={9999} />
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bgDeep,
    paddingHorizontal: 20,
    gap: 16,
  },
  headerSkel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.bgCard,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: C.borderPrimary,
  },
  section: {
    gap: 10,
  },
  classCard: {
    flexDirection: 'row',
    backgroundColor: C.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    overflow: 'hidden',
  },
  classCardAccent: {
    width: 3,
    backgroundColor: C.brand,
    opacity: 0.3,
  },
  dayStrip: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: C.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  courseCard: {
    backgroundColor: C.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    padding: 16,
  },
  notifRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: C.borderPrimary,
  },
})