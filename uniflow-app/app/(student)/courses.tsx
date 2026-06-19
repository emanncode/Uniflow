import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,

  StyleSheet,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BookOpen,
  Award,
  Layers,
  Clock,
  MapPin,
  User,
  Calendar,
} from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { Theme } from "@/constants/Theme";
import { CustomModal } from "@/components/CustomModal";
import { CoursesSkeleton } from "@/components/SkeletonLoader";
import { ScreenPageHeader } from "@/components/ScreenPageHeader";
import { ScalePressable } from "@/components/ScalePressable";
import type { Course, TimetableSlot } from "@/types";

const C = Theme.colors;
const R = Theme.radius;

// ─── Types ─────────────────────────────────────────────────────────────────

interface EnrolledCourse extends Course {
  slots: TimetableSlot[];
  lecturerNames: string[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Course Card ───────────────────────────────────────────────────────────

interface CourseCardProps {
  course: EnrolledCourse;
  onPress: (course: EnrolledCourse) => void;
}

function CourseCard({ course, onPress }: CourseCardProps) {
  return (
    <ScalePressable
      style={styles.card}
      onPress={() => onPress(course)}
    >
      {/* Top tags */}
      <View style={styles.cardTop}>
        <View style={styles.codeTag}>
          <Text style={styles.codeText}>{course.code}</Text>
        </View>
        <View style={styles.levelTag}>
          <Text style={styles.levelText}>{course.level}00L</Text>
        </View>
        <View style={styles.semTag}>
          <Text style={styles.semText}>Sem {course.semester}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.cardTitle} numberOfLines={2}>
        {course.title}
      </Text>

      {/* Lecturer */}
      {course.lecturerNames.length > 0 ? (
        <View style={styles.lecturerRow}>
          <User size={12} color={C.textMuted} strokeWidth={1.8} />
          <Text style={styles.lecturerText}>
            {course.lecturerNames.join(", ")}
          </Text>
        </View>
      ) : null}

      {/* Stats */}
      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Award size={13} color={C.textMuted} strokeWidth={1.8} />
          <Text style={styles.statText}>{course.credit_units} units</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Layers size={13} color={C.textMuted} strokeWidth={1.8} />
          <Text style={styles.statText}>
            {course.slots.length} slot{course.slots.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>
    </ScalePressable>
  );
}

// ─── Course Detail Modal ───────────────────────────────────────────────────

interface DetailModalProps {
  course: EnrolledCourse | null;
  visible: boolean;
  onClose: () => void;
}

function CourseDetailModal({ course, visible, onClose }: DetailModalProps) {
  if (!course) return null;

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title={course.code}
      type="sheet"
      sheetScroll
    >
      <ScrollView
        style={styles.sheetScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.sheetBody}
      >
        <Text style={styles.sheetTitle}>{course.title}</Text>

        {/* Info pills */}
        <View style={styles.infoPills}>
          <View style={styles.infoPill}>
            <Award size={14} color={C.brand} strokeWidth={1.8} />
            <Text style={styles.infoPillText}>
              {course.credit_units} Credit Units
            </Text>
          </View>
          <View style={styles.infoPill}>
            <Calendar size={14} color={C.brand} strokeWidth={1.8} />
            <Text style={styles.infoPillText}>Semester {course.semester}</Text>
          </View>
          {course.lecturerNames.length > 0 ? (
            <View style={styles.infoPill}>
              <User size={14} color={C.brand} strokeWidth={1.8} />
              <Text style={styles.infoPillText}>
                {course.lecturerNames.join(", ")}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Description */}
        {course.description ? (
          <View style={styles.descSection}>
            <Text style={styles.sectionLabel}>About</Text>
            <Text style={styles.descText}>{course.description}</Text>
          </View>
        ) : null}

        {/* Schedule */}
        <View style={styles.slotsSection}>
          <Text style={styles.sectionLabel}>
            Schedule ({course.slots.length} slot
            {course.slots.length !== 1 ? "s" : ""})
          </Text>

          {course.slots.length === 0 ? (
            <Text style={styles.noSlots}>No timetable slots yet</Text>
          ) : (
            course.slots.map((slot) => (
              <View key={slot.id} style={styles.slotRow}>
                <View style={styles.slotDayTag}>
                  <Text style={styles.slotDayText}>
                    {capitalize(slot.day_of_week).slice(0, 3)}
                  </Text>
                </View>
                <View style={styles.slotInfo}>
                  <View style={styles.slotInfoRow}>
                    <Clock size={12} color={C.textMuted} strokeWidth={1.8} />
                    <Text style={styles.slotInfoText}>
                      {formatTime(slot.start_time)} –{" "}
                      {formatTime(slot.end_time)}
                    </Text>
                  </View>
                  <View style={styles.slotInfoRow}>
                    <MapPin size={12} color={C.textMuted} strokeWidth={1.8} />
                    <Text style={styles.slotInfoText}>{slot.venue}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </CustomModal>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function StudentCourses() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);

  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<EnrolledCourse | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!profile) return;
    try {
      // 1. Enrolled course IDs
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", profile.id)
        .eq("is_active", true);

      if (!enrollments || enrollments.length === 0) {
        setCourses([]);
        return;
      }

      const courseIds = enrollments.map((e) => e.course_id);

      // 2. Course data
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .in("id", courseIds)
        .eq("is_active", true)
        .order("code");

      if (!courseData) return;

      // 3. Timetable slots with lecturer profile
      const { data: slots } = await supabase
        .from("timetable")
        .select("*, profiles(full_name)")
        .in("course_id", courseIds)
        .eq("is_active", true)
        .order("day_of_week")
        .order("start_time");

      // 4. Assigned lecturers per course
      const { data: lecturerAssignments } = await supabase
        .from("lecturer_courses")
        .select("course_id, profiles(full_name)")
        .in("course_id", courseIds)
        .eq("is_active", true);

      const lecturerMap: Record<string, string[]> = {};
      for (const row of lecturerAssignments ?? []) {
        const profile = row.profiles as
          | { full_name: string }
          | { full_name: string }[]
          | null;
        const name = Array.isArray(profile)
          ? profile[0]?.full_name
          : profile?.full_name;
        if (!name) continue;
        if (!lecturerMap[row.course_id]) lecturerMap[row.course_id] = [];
        if (!lecturerMap[row.course_id].includes(name)) {
          lecturerMap[row.course_id].push(name);
        }
      }

      // 5. Build enriched courses
      const enriched: EnrolledCourse[] = courseData.map((course) => {
        const courseSlots = (slots ?? []).filter(
          (s) => s.course_id === course.id,
        );
        const slotLecturers = courseSlots
          .map((s) => s.profiles?.full_name)
          .filter((name): name is string => Boolean(name));
        const assignedLecturers = lecturerMap[course.id] ?? [];
        const lecturerNames = [
          ...new Set([...assignedLecturers, ...slotLecturers]),
        ];
        return { ...course, slots: courseSlots, lecturerNames };
      });

      setCourses(enriched);
    } catch (e) {
      console.error("Student courses fetch error:", e);
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

  const handleCoursePress = useCallback((course: EnrolledCourse) => {
    setSelectedCourse(course);
    setModalVisible(true);
  }, []);

  // ── Loading ───────────────────────────────────────────────────────────

  if (isLoading) return <CoursesSkeleton />;

  // ── Render ────────────────────────────────────────────────────────────

  const totalUnits = courses.reduce((sum, c) => sum + c.credit_units, 0);
  const totalSlots = courses.reduce((sum, c) => sum + c.slots.length, 0);

  const renderHeader = () => (
    <>
      {/* Header */}
      <ScreenPageHeader
        title="My Courses"
        subtitle={`${courses.length} course${courses.length !== 1 ? "s" : ""} enrolled`}
        role="student"
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      />

      {/* Summary strip */}
      {courses.length > 0 && (
        <View style={styles.summaryStrip}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{courses.length}</Text>
            <Text style={styles.summaryLabel}>Courses</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalUnits}</Text>
            <Text style={styles.summaryLabel}>Credit Units</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalSlots}</Text>
            <Text style={styles.summaryLabel}>Weekly Slots</Text>
          </View>
        </View>
      )}
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyCard}>
      <BookOpen size={32} color={C.textMuted} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>No courses yet</Text>
      <Text style={styles.emptySubtitle}>
        Your university admin will enroll you in courses
      </Text>
    </View>
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CourseCard course={item} onPress={handleCoursePress} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={isLoading ? null : renderEmpty}
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
      />

      {/* Detail modal */}
      <CourseDetailModal
        course={selectedCourse}
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedCourse(null);
        }}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgDeep },
  centered: { alignItems: "center", justifyContent: "center" },

  header: { paddingBottom: 16 },

  summaryStrip: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: C.bgCard,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    paddingVertical: 14,
  },
  summaryItem: { flex: 1, alignItems: "center", gap: 2 },
  summaryValue: {
    color: C.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  summaryLabel: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: C.borderPrimary,
    marginVertical: 4,
  },

  list: { paddingHorizontal: 20, gap: 10 },

  emptyCard: {
    backgroundColor: C.bgCard,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    padding: 40,
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  emptyTitle: {
    color: C.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },
  emptySubtitle: {
    color: C.textMuted,
    fontSize: 13,
    textAlign: "center",
  },

  card: {
    backgroundColor: C.bgCard,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    padding: 16,
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  codeTag: {
    backgroundColor: C.brandMuted,
    borderRadius: R.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.borderBrand,
  },
  codeText: {
    color: C.brand,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  levelTag: {
    backgroundColor: C.bgTertiary,
    borderRadius: R.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.borderPrimary,
  },
  levelText: { color: C.textSecondary, fontSize: 12, fontWeight: "600" },
  semTag: {
    backgroundColor: C.bgTertiary,
    borderRadius: R.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.borderPrimary,
  },
  semText: { color: C.textMuted, fontSize: 12, fontWeight: "500" },
  cardTitle: {
    color: C.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  lecturerRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  lecturerText: { color: C.textMuted, fontSize: 12 },
  cardStats: { flexDirection: "row", alignItems: "center", gap: 10 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  statText: { color: C.textMuted, fontSize: 12 },
  statDivider: { width: 1, height: 12, backgroundColor: C.borderPrimary },

  sheetScroll: { flex: 1 },
  sheetBody: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 20,
  },

  sheetTitle: {
    color: C.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 8,
  },

  infoPills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.brandSubtle,
    borderRadius: R.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: C.borderBrand,
  },
  infoPillText: { color: C.brand, fontSize: 12, fontWeight: "600" },

  descSection: { gap: 6 },
  sectionLabel: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  descText: { color: C.textSecondary, fontSize: 14, lineHeight: 21 },

  slotsSection: { gap: 8 },
  noSlots: { color: C.textMuted, fontSize: 13 },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.bgTertiary,
    borderRadius: R.sm,
    padding: 12,
    borderWidth: 1,
    borderColor: C.borderPrimary,
  },
  slotDayTag: {
    width: 40,
    height: 40,
    borderRadius: R.sm,
    backgroundColor: C.brandMuted,
    borderWidth: 1,
    borderColor: C.borderBrand,
    alignItems: "center",
    justifyContent: "center",
  },
  slotDayText: { color: C.brand, fontSize: 12, fontWeight: "700" },
  slotInfo: { flex: 1, gap: 4 },
  slotInfoRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  slotInfoText: { color: C.textSecondary, fontSize: 13 },
});
