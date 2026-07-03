import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,

  StyleSheet,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BookOpen,
  Users,
  Layers,
  Award,
  Clock,
  MapPin,
  Calendar,
} from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useLecturerCourseIds } from "@/hooks/useLecturerCourseIds";
import { countByCourseId } from "@/lib/enrollmentCounts";
import { Theme } from "@/constants/Theme";
import { CustomModal } from "@/components/CustomModal";
import { CoursesSkeleton } from "@/components/SkeletonLoader";
import { ScreenPageHeader } from "@/components/ScreenPageHeader";
import { ScalePressable } from "@/components/ScalePressable";
import type { Course, TimetableSlot } from "@/types";

const C = Theme.colors;
const R = Theme.radius;

// ─── Types ─────────────────────────────────────────────────────────────────

interface CourseWithMeta extends Course {
  studentCount: number;
  slots: TimetableSlot[];
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

// ─── Level Badge ───────────────────────────────────────────────────────────

function LevelBadge({ level }: { level: number }) {
  return (
    <View style={styles.levelBadge}>
      <Text style={styles.levelBadgeText}>{level}L</Text>
    </View>
  );
}

// ─── Course Card ───────────────────────────────────────────────────────────

interface CourseCardProps {
  course: CourseWithMeta;
  onPress: (course: CourseWithMeta) => void;
}

function CourseCard({ course, onPress }: CourseCardProps) {
  return (
    <ScalePressable
      style={styles.card}
      onPress={() => onPress(course)}
    >
      {/* Top row — code + level */}
      <View style={styles.cardTop}>
        <View style={styles.codeTag}>
          <Text style={styles.codeText}>{course.code}</Text>
        </View>
        <LevelBadge level={course.level} />
        <View style={styles.semesterTag}>
          <Text style={styles.semesterText}>Sem {course.semester}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.cardTitle} numberOfLines={2}>
        {course.title}
      </Text>

      {/* Stats row */}
      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Users size={13} color={C.textMuted} strokeWidth={1.8} />
          <Text style={styles.statText}>
            {course.studentCount} student{course.studentCount !== 1 ? "s" : ""}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Award size={13} color={C.textMuted} strokeWidth={1.8} />
          <Text style={styles.statText}>
            {course.credit_units} unit{course.credit_units !== 1 ? "s" : ""}
          </Text>
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
  course: CourseWithMeta | null;
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
        
        {/* Course info pills */}
        <View style={styles.infoPills}>
          <View style={styles.infoPill}>
            <Award size={14} color={C.brand} strokeWidth={1.8} />
            <Text style={styles.infoPillText}>
              {course.credit_units} Credit Units
            </Text>
          </View>
          <View style={styles.infoPill}>
            <Calendar size={14} color={C.brand} strokeWidth={1.8} />
            <Text style={styles.infoPillText}>
              Semester {course.semester}
            </Text>
          </View>
          <View style={styles.infoPill}>
            <Users size={14} color={C.brand} strokeWidth={1.8} />
            <Text style={styles.infoPillText}>
              {course.studentCount} Students
            </Text>
          </View>
        </View>

        {/* Description */}
        {course.description ? (
          <View style={styles.descSection}>
            <Text style={styles.sectionLabel}>About</Text>
            <Text style={styles.descText}>{course.description}</Text>
          </View>
        ) : null}

        {/* Timetable slots */}
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

export default function LecturerCourses() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);

  const [courses, setCourses] = useState<CourseWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithMeta | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────

  const { refresh: refreshCourseIds } = useLecturerCourseIds();

  const fetchData = useCallback(async () => {
    if (!profile) return;
    try {
      const { courseIds, offeringIds } = await refreshCourseIds(true);
      console.log('[LecturerCourses] fetched courseIds:', courseIds, 'offeringIds:', offeringIds);

      if (courseIds.length === 0) {
        console.log('[LecturerCourses] no courseIds, skipping courses query');
        setCourses([]);
        return;
      }

      const { fetchTimetableSlots } = await import("@/lib/timetable-query");

      const [courseRes, slots, enrollmentsRes] = await Promise.all([
        supabase
          .from("courses")
          .select("*")
          .in("id", courseIds)
          .eq("is_active", true)
          .order("code"),
        fetchTimetableSlots({ offeringIds, courseIds, lecturerId: profile.id }),
        offeringIds.length > 0
          ? supabase
              .from("enrollments")
              .select("course_id, course_offering_id")
              .in("course_offering_id", offeringIds)
              .eq("is_active", true)
          : supabase
              .from("enrollments")
              .select("course_id")
              .in("course_id", courseIds)
              .eq("is_active", true),
      ]);

      const courseData = courseRes.data;
      const enrollmentCounts = countByCourseId(enrollmentsRes.data ?? []);
      console.log('[LecturerCourses] courseData length:', courseData?.length, 'slots length:', slots?.length, 'enrollmentsRes:', enrollmentsRes.data?.length);

      if (courseData && courseData.length === 0) {
        console.log('[LecturerCourses] courses query returned 0 even with courseIds - possible RLS or no matching courses');
      }

      if (!courseData) return;

      const enriched: CourseWithMeta[] = courseData.map((course) => {
        const courseSlots = (slots ?? []).filter(
          (s) => s.course_id === course.id,
        );
        return {
          ...course,
          slots: courseSlots,
          studentCount: enrollmentCounts[course.id] ?? 0,
        };
      });
      console.log('[LecturerCourses] enriched courses:', enriched.length, 'first:', enriched[0]);

      setCourses(enriched);
    } catch (e) {
      console.error("Courses fetch error:", e);
    }
  }, [profile, refreshCourseIds]);

  useEffect(() => {
    fetchData().finally(() => setIsLoading(false));
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }, [fetchData]);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleCoursePress = useCallback((course: CourseWithMeta) => {
    setSelectedCourse(course);
    setModalVisible(true);
  }, []);

  // ── Loading ───────────────────────────────────────────────────────────

  console.log('[LecturerCourses] render courses.length:', courses.length);
  if (isLoading) return <CoursesSkeleton />;

  // ── Render ────────────────────────────────────────────────────────────

  console.log('[LecturerCourses] about to render, courses:', courses.length);
  const renderHeader = () => (
    <>
      {/* Header */}
      <ScreenPageHeader
        title="My Courses"
        subtitle={`${courses.length} course${courses.length !== 1 ? "s" : ""} assigned`}
        role="lecturer"
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      />

      {/* Summary strip */}
      {courses.length > 0 && (
        <View style={styles.summaryStrip}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {courses.reduce((sum, c) => sum + c.studentCount, 0)}
            </Text>
            <Text style={styles.summaryLabel}>Total Students</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {courses.reduce((sum, c) => sum + c.credit_units, 0)}
            </Text>
            <Text style={styles.summaryLabel}>Total Units</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {courses.reduce((sum, c) => sum + c.slots.length, 0)}
            </Text>
            <Text style={styles.summaryLabel}>Weekly Slots</Text>
          </View>
        </View>
      )}
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyCard}>
      <BookOpen size={32} color={C.textMuted} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>No courses assigned</Text>
      <Text style={styles.emptySubtitle}>
        Contact your university admin to get courses assigned
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

      {/* Course detail modal */}
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
  root: {
    flex: 1,
    backgroundColor: C.bgDeep,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },

  // Header
  header: {
    paddingBottom: 16,
  },

  // Summary strip
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
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
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

  // List
  list: {
    paddingHorizontal: 20,
    gap: 10,
  },

  // Empty
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

  // Course Card
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
  levelBadge: {
    backgroundColor: C.bgTertiary,
    borderRadius: R.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.borderPrimary,
  },
  levelBadgeText: {
    color: C.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  semesterTag: {
    backgroundColor: C.bgTertiary,
    borderRadius: R.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.borderPrimary,
  },
  semesterText: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
  cardTitle: {
    color: C.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  cardStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    color: C.textMuted,
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: C.borderPrimary,
  },

  sheetScroll: { flex: 1 },
  sheetBody: {
    paddingBottom: 32,
    gap: 20,
  },
  sheetTitle: {
    color: C.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 16,
  },

  // Info pills
  infoPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
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
  infoPillText: {
    color: C.brand,
    fontSize: 12,
    fontWeight: "600",
  },

  // Description
  descSection: {
    marginBottom: 20,
    gap: 6,
  },
  sectionLabel: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  descText: {
    color: C.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  // Slots
  slotsSection: {
    gap: 8,
  },
  noSlots: {
    color: C.textMuted,
    fontSize: 13,
  },
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
  slotDayText: {
    color: C.brand,
    fontSize: 12,
    fontWeight: "700",
  },
  slotInfo: {
    flex: 1,
    gap: 4,
  },
  slotInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  slotInfoText: {
    color: C.textSecondary,
    fontSize: 13,
  },
});
