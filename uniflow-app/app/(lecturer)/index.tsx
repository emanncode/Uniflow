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
} from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useLecturerCourseIds } from "@/hooks/useLecturerCourseIds";
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
}

function ClassCard({ slot, update, isToday, onPress }: ClassCardProps) {
  const status = update?.status ?? null;
  const accentColor = status ? CLASS_STATUS_COLORS[status].color : C.brand;

  return (
    <ScalePressable
      style={[styles.classCard, isToday && styles.classCardToday]}
      onPress={onPress}
    >
      {/* Left accent */}
      <View style={[styles.classAccent, { backgroundColor: accentColor }]} />

      <View style={styles.classBody}>
        <View style={styles.classTop}>
          <Text style={styles.courseCode}>{slot.courses?.code ?? "—"}</Text>
          {status && <StatusBadge status={status} />}
        </View>

        <Text style={styles.courseTitle} numberOfLines={1}>
          {slot.courses?.title ?? "Unknown Course"}
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
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────

export default function LecturerDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);
  console.log(
    "[LecturerHome] profile:",
    profile
      ? { id: profile.id, uni: profile.university_id, role: profile.role }
      : null,
  );

  const { refresh: refreshLecturerContext } = useLecturerCourseIds();

  const [todaySlots, setTodaySlots] = useState<TimetableSlot[]>([]);
  const [upcomingSlots, setUpcomingSlots] = useState<TimetableSlot[]>([]);
  const [todayUpdates, setTodayUpdates] = useState<Record<string, ClassUpdate>>(
    {},
  );
  const [totalCourses, setTotalCourses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!profile) return;
    try {
      // Use the shared offering-aware + session-filtered fetch for consistency with Timetable tab
      const { offeringIds } = await refreshLecturerContext(true);
      const { fetchTimetableSlots } = await import("@/lib/timetable-query");
      const allSlots = await fetchTimetableSlots({
        lecturerId: profile.id,
        offeringIds,
      });
      console.log(
        "[LecturerHome] fetched allSlots length:",
        allSlots.length,
        "first:",
        allSlots[0],
      );

      if (!allSlots.length) {
        setTodaySlots([]);
        setUpcomingSlots([]);
        setTotalCourses(0);
        setTodayUpdates({});
        return;
      }

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
      setTotalCourses(new Set(allSlots.map((s) => s.course_id)).size);

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
      console.error("Dashboard fetch error:", e);
    }
  }, [profile]);

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
      .channel("lecturer-dashboard")
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
      // Sync timetable slot changes live (e.g. from admin import/edit)
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
      // Catch new offerings assigned to me
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "course_offerings",
          filter: `lecturer_id=eq.${profile.id}`,
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

  // ── Loading ───────────────────────────────────────────────────────────

  console.log(
    "[LecturerHome] render todaySlots:",
    todaySlots.length,
    "upcoming:",
    upcomingSlots.length,
    "totalCourses:",
    totalCourses,
    "todaySlots[0]:",
    todaySlots[0],
  );
  if (isLoading) return <DashboardSkeleton />;

  const firstName = profile?.full_name ?? "Lecturer";
  const alertCount = Object.keys(todayUpdates).length;

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
            <Text style={styles.date}>{TODAY_LABEL}</Text>
          </View>
          <ScreenHeaderActions role="lecturer" />
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
          label="Updates"
          value={alertCount}
          icon={<Zap size={15} color={C.brand} strokeWidth={1.8} />}
        />
      </View>

      <FadeSlideIn index={5} style={styles.section}>
        <SectionHeader
          title="Today's Classes"
          onSeeAll={() => router.push("/(lecturer)/timetable")}
        />
        {todaySlots.length === 0 ? (
          <EmptyDay />
        ) : (
          todaySlots.map((slot, index) => (
            <FadeSlideIn key={slot.id} index={index + 6}>
              <ClassCard
                slot={slot}
                update={todayUpdates[slot.id]}
                isToday
                onPress={() => router.push("/(lecturer)/timetable")}
              />
            </FadeSlideIn>
          ))
        )}
      </FadeSlideIn>

      {upcomingSlots.length > 0 && (
        <FadeSlideIn index={8} style={styles.section}>
          <SectionHeader
            title="Upcoming"
            onSeeAll={() => router.push("/(lecturer)/timetable")}
          />
          {upcomingSlots.map((slot, index) => (
            <FadeSlideIn key={slot.id} index={index + 9}>
              <ClassCard
                slot={slot}
                onPress={() => router.push("/(lecturer)/timetable")}
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

  // Header
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
  date: { color: C.textMuted, fontSize: 12, marginTop: 2 },
  // Stats
  statsRow: { flexDirection: "row", gap: 10 },
  // Section
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
  seeAll: {
    color: C.brand,
    fontSize: 13,
    fontWeight: "600",
  },

  // Empty
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

  // Class Card
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
  classCardPressed: {
    opacity: 0.75,
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

  // Badge
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.full },
  badgeText: { fontSize: 11, fontWeight: "700" },
});
