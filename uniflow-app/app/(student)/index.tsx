import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CalendarDays,
  BookOpen,
  Zap,
  Clock,
  MapPin,
  ChevronRight,
  User,
  ThumbsUp,
} from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useStudentEnrollments } from "@/hooks/useStudentEnrollments";
import { Theme } from "@/constants/Theme";
import { DashboardSkeleton } from "@/components/SkeletonLoader";
import { ScreenHeaderActions } from "@/components/ScreenHeaderActions";
import { DashboardStatCard } from "@/components/DashboardStatCard";
import { FadeSlideIn } from "@/components/FadeSlideIn";
import { ScalePressable } from "@/components/ScalePressable";
import type {
  TimetableSlot,
  ClassUpdate,
  ClassStatus,
  DayOfWeek,
} from "@/types";
import { CLASS_STATUS_COLORS, DAY_ORDER } from "@/types";

const C = Theme.colors;
const R = Theme.radius;

// ─── Helpers ───────────────────────────────────────────────────────────────

function getTodayName(): string {
  return new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
}

const TODAY_LABEL = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

// ─── Status Badge ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ClassStatus }) {
  const { color, background } = CLASS_STATUS_COLORS[status];
  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={[styles.badgeText, { color }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
}

// ─── Class Card ────────────────────────────────────────────────────────────

interface ClassCardProps {
  slot: TimetableSlot;
  update?: ClassUpdate;
  isToday?: boolean;
  onPress: () => void;
  onUpvote?: (update: ClassUpdate) => void;
}

function ClassCard({
  slot,
  update,
  isToday,
  onPress,
  onUpvote,
}: ClassCardProps) {
  const status = update?.status ?? null;
  const accentColor = status ? CLASS_STATUS_COLORS[status].color : C.brand;

  return (
    <ScalePressable
      style={[styles.classCard, isToday && styles.classCardToday]}
      onPress={onPress}
    >
      <View style={[styles.classAccent, { backgroundColor: accentColor }]} />

      <View style={styles.classBody}>
        <View style={styles.classTop}>
          <Text style={styles.courseCode}>{slot.courses?.code ?? "—"}</Text>
          {status && <StatusBadge status={status} />}
        </View>

        <Text style={styles.courseTitle} numberOfLines={1}>
          {slot.courses?.title ?? "Unknown Course"}
        </Text>

        {/* Lecturer name — student-specific */}
        {slot.profiles?.full_name ? (
          <View style={styles.lecturerRow}>
            <User size={11} color={C.textMuted} strokeWidth={1.8} />
            <Text style={styles.lecturerText}>{slot.profiles.full_name}</Text>
          </View>
        ) : null}

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

        {/* Upvote — student-specific, only when there's an update */}
        {update && onUpvote && (
          <TouchableOpacity
            style={styles.upvoteBtn}
            onPress={() => onUpvote(update)}
            activeOpacity={0.75}
          >
            <ThumbsUp size={11} color={C.brand} strokeWidth={2} />
            <Text style={styles.upvoteText}>
              {update.upvotes ?? 0} confirm
              {(update.upvotes ?? 0) !== 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ChevronRight
        size={15}
        color={C.textMuted}
        strokeWidth={1.8}
        style={{ marginRight: 14 }}
      />
    </ScalePressable>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────

function SectionHeader({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll} hitSlop={12}>
        <Text style={styles.seeAll}>See all</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);
  console.log('[StudentHome] profile:', profile ? {id: profile.id, uni: profile.university_id, role: profile.role, level: profile.level} : null);

  const [todaySlots, setTodaySlots] = useState<TimetableSlot[]>([]);
  const [upcomingSlots, setUpcomingSlots] = useState<TimetableSlot[]>([]);
  const [todayUpdates, setTodayUpdates] = useState<Record<string, ClassUpdate>>(
    {},
  );
  const [totalCourses, setTotalCourses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────

  const { refresh: refreshEnrollments } = useStudentEnrollments();

  const fetchData = useCallback(async () => {
    if (!profile) return;
    try {
      const { courseIds, offeringIds } = await refreshEnrollments(true);
      console.log('[StudentHome] fetched courseIds:', courseIds, 'offeringIds:', offeringIds);

      // Do not bail here even if courseIds is empty from enrollments.
      // fetchTimetableSlots will query broadly and RLS (plus any level-based fallback policy) will limit results.
      // This mirrors the lecturer fallback behavior so timetable can show when enrollments are missing or for different semester.
      let effectiveTotal = courseIds.length;

      const { fetchTimetableSlots } = await import("@/lib/timetable-query");
      const allSlots = await fetchTimetableSlots({ offeringIds, courseIds });
      console.log('[StudentHome] fetched allSlots length:', allSlots.length, 'first:', allSlots[0]);

      if (!allSlots.length) {
        setTodaySlots([]);
        setUpcomingSlots([]);
        setTodayUpdates({});
        setTotalCourses(effectiveTotal);
        return;
      }

      if (effectiveTotal === 0) {
        effectiveTotal = new Set(allSlots.map((s) => s.course_id)).size;
      }
      setTotalCourses(effectiveTotal);

      const todayName = getTodayName();
      const today = allSlots.filter((s) => s.day_of_week === todayName);
      const upcoming = allSlots
        .filter((s) => s.day_of_week !== todayName)
        .sort(
          (a, b) =>
            DAY_ORDER[a.day_of_week as DayOfWeek] -
            DAY_ORDER[b.day_of_week as DayOfWeek],
        )
        .slice(0, 4);

      setTodaySlots(today);
      setUpcomingSlots(upcoming);

      const todayIds = today.map((s) => s.id);
      if (todayIds.length === 0) {
        setTodayUpdates({});
        return;
      }

      const todayDate = new Date().toISOString().split("T")[0];
      const { data: updates } = await supabase
        .from("class_updates")
        .select("*")
        .eq("university_id", profile.university_id)
        .eq("update_date", todayDate)
        .in("timetable_id", todayIds);

      if (updates) {
        const map: Record<string, ClassUpdate> = {};
        updates.forEach((u) => {
          map[u.timetable_id] = u;
        });
        setTodayUpdates(map);
      } else {
        setTodayUpdates({});
      }
    } catch (e) {
      console.error("Student dashboard fetch error:", e);
    }
  }, [profile, refreshEnrollments]);

  useEffect(() => {
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }, [fetchData]);

  // ── Realtime ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!profile) return;
    const channel = supabase
      .channel("student-dashboard")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "class_updates",
          filter: `university_id=eq.${profile.university_id}`,
        },
        (payload) => {
          const update = payload.new as ClassUpdate;
          if (!update?.timetable_id) return;
          setTodayUpdates((prev) => ({
            ...prev,
            [update.timetable_id]: update,
          }));
        },
      )
      // Sync timetable slot changes (admin edits) into home dashboard too
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "timetable",
          filter: `university_id=eq.${profile.university_id}`,
        },
        () => {
          fetchData();
        },
      )
      // React to my enrollments changing (new courses appear in timetable sections)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "enrollments",
          filter: `student_id=eq.${profile.id}`,
        },
        () => {
          fetchData();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, fetchData]);

  // ── Upvote ────────────────────────────────────────────────────────────

  const handleUpvote = useCallback(async (update: ClassUpdate) => {
    const newCount = (update.upvotes ?? 0) + 1;
    setTodayUpdates((prev) => ({
      ...prev,
      [update.timetable_id]: { ...update, upvotes: newCount },
    }));
    await supabase
      .from("class_updates")
      .update({ upvotes: newCount })
      .eq("id", update.id);
  }, []);

  console.log('[StudentHome] render todaySlots:', todaySlots.length, 'upcoming:', upcomingSlots.length, 'totalCourses:', totalCourses, 'todaySlots[0]:', todaySlots[0]);
  if (isLoading) return <DashboardSkeleton />;

  const firstName = profile?.full_name ?? "Student";
  const alertCount = Object.keys(todayUpdates).length;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 },
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
      <FadeSlideIn index={0}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{firstName}</Text>
            {profile?.level ? (
              <Text style={styles.levelLabel}>{profile.level} Level</Text>
            ) : null}
            <Text style={styles.date}>{TODAY_LABEL}</Text>
          </View>
          <ScreenHeaderActions role="student" />
        </View>
      </FadeSlideIn>

      <View style={styles.statsRow}>
        <DashboardStatCard
          index={1}
          label="Today"
          value={todaySlots.length}
          icon={<CalendarDays size={15} color={C.brand} strokeWidth={1.8} />}
        />
        <DashboardStatCard
          index={2}
          label="Courses"
          value={totalCourses}
          icon={<BookOpen size={15} color={C.brand} strokeWidth={1.8} />}
        />
        <DashboardStatCard
          index={3}
          label="Alerts"
          value={alertCount}
          icon={<Zap size={15} color={C.brand} strokeWidth={1.8} />}
        />
      </View>

      {alertCount > 0 && (
        <FadeSlideIn index={4}>
          <View style={styles.alertBanner}>
            <Zap size={13} color={C.brand} strokeWidth={2} />
            <Text style={styles.alertText}>
              {alertCount} class update{alertCount !== 1 ? "s" : ""} today
            </Text>
          </View>
        </FadeSlideIn>
      )}

      <FadeSlideIn index={5} style={styles.section}>
        <SectionHeader
          title="Today's Classes"
          onSeeAll={() => router.push("/(student)/timetable")}
        />
        {todaySlots.length === 0 ? (
          <View style={styles.emptyCard}>
            <CalendarDays size={26} color={C.textMuted} strokeWidth={1.5} />
            <View style={styles.emptyText}>
              <Text style={styles.emptyTitle}>No classes today</Text>
              <Text style={styles.emptySub}>Enjoy your free day</Text>
            </View>
          </View>
        ) : (
          todaySlots.map((slot, index) => (
            <FadeSlideIn key={slot.id} index={index + 6}>
              <ClassCard
                slot={slot}
                update={todayUpdates[slot.id]}
                isToday
                onPress={() => router.push("/(student)/timetable")}
                onUpvote={handleUpvote}
              />
            </FadeSlideIn>
          ))
        )}
      </FadeSlideIn>

      {upcomingSlots.length > 0 && (
        <FadeSlideIn index={8} style={styles.section}>
          <SectionHeader
            title="Upcoming"
            onSeeAll={() => router.push("/(student)/timetable")}
          />
          {upcomingSlots.map((slot, index) => (
            <FadeSlideIn key={slot.id} index={index + 9}>
              <ClassCard
                slot={slot}
                onPress={() => router.push("/(student)/timetable")}
              />
            </FadeSlideIn>
          ))}
        </FadeSlideIn>
      )}
    </ScrollView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgDeep },
  content: { paddingHorizontal: 20, gap: 24 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { gap: 2 },
  greeting: { color: C.textMuted, fontSize: 13 },
  name: {
    color: C.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  levelLabel: {
    color: C.brand,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  date: { color: C.textMuted, fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10 },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.brandMuted,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.borderBrand,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  alertText: { color: C.brand, fontSize: 13, fontWeight: "600" },

  section: { gap: 10 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: C.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  seeAll: { color: C.brand, fontSize: 13, fontWeight: "600" },

  emptyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.bgSecondary,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    padding: 20,
  },
  emptyText: { gap: 2 },
  emptyTitle: { color: C.textSecondary, fontSize: 14, fontWeight: "600" },
  emptySub: { color: C.textMuted, fontSize: 12 },

  classCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bgSecondary,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    overflow: "hidden",
  },
  classCardToday: {
    borderColor: C.borderBrand,
    backgroundColor: "rgba(255, 92, 26, 0.03)",
  },
  classAccent: { width: 3, alignSelf: "stretch" },
  classBody: { flex: 1, paddingVertical: 14, paddingLeft: 12, gap: 4 },
  classTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  courseCode: {
    color: C.brand,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  courseTitle: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  lecturerRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  lecturerText: { color: C.textMuted, fontSize: 11 },
  classMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 3,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: C.textMuted, fontSize: 12 },
  updateMsg: {
    color: C.textSecondary,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  upvoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: C.brandSubtle,
    borderRadius: R.full,
    borderWidth: 1,
    borderColor: C.borderBrand,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 8,
  },
  upvoteText: { color: C.brand, fontSize: 11, fontWeight: "600" },

  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.full },
  badgeText: { fontSize: 11, fontWeight: "700" },
});
