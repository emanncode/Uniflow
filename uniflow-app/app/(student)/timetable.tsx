import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Clock,
  MapPin,
  User,
  ThumbsUp,
  XCircle,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  StopCircle,
  ChevronDown,
  CalendarDays,
} from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { Theme } from "@/constants/Theme";
import { TimetableSkeleton } from "@/components/SkeletonLoader";
import { CustomModal } from "@/components/CustomModal";
import type {
  TimetableSlot,
  ClassUpdate,
  ClassStatus,
  DayOfWeek,
} from "@/types";
import { CLASS_STATUS_COLORS } from "@/types";

const C = Theme.colors;
const R = Theme.radius;

// ─── Constants ─────────────────────────────────────────────────────────────

const DAYS: { key: DayOfWeek; short: string; label: string }[] = [
  { key: "monday", short: "Mon", label: "Monday" },
  { key: "tuesday", short: "Tue", label: "Tuesday" },
  { key: "wednesday", short: "Wed", label: "Wednesday" },
  { key: "thursday", short: "Thu", label: "Thursday" },
  { key: "friday", short: "Fri", label: "Friday" },
  { key: "saturday", short: "Sat", label: "Saturday" },
];

const TODAY_KEY = new Date()
  .toLocaleDateString("en-US", { weekday: "long" })
  .toLowerCase() as DayOfWeek;

const STATUS_ACTIONS: {
  status: ClassStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    status: "ongoing",
    label: "Class is Ongoing",
    description: "Class is currently in session",
    icon: (
      <PlayCircle
        size={20}
        color={CLASS_STATUS_COLORS.ongoing.color}
        strokeWidth={1.8}
      />
    ),
  },
  {
    status: "ended",
    label: "Class has Ended",
    description: "Class finished for today",
    icon: (
      <StopCircle
        size={20}
        color={CLASS_STATUS_COLORS.ended.color}
        strokeWidth={1.8}
      />
    ),
  },
  {
    status: "canceled",
    label: "Class is Canceled",
    description: "Lecturer is not available",
    icon: (
      <XCircle
        size={20}
        color={CLASS_STATUS_COLORS.canceled.color}
        strokeWidth={1.8}
      />
    ),
  },
  {
    status: "delayed",
    label: "Class is Delayed",
    description: "Class is running late",
    icon: (
      <AlertTriangle
        size={20}
        color={CLASS_STATUS_COLORS.delayed.color}
        strokeWidth={1.8}
      />
    ),
  },
  {
    status: "moved",
    label: "Class was Moved",
    description: "Venue has changed",
    icon: (
      <CheckCircle
        size={20}
        color={CLASS_STATUS_COLORS.moved.color}
        strokeWidth={1.8}
      />
    ),
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

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

// ─── Day Pill ──────────────────────────────────────────────────────────────

interface DayPillProps {
  day: { key: DayOfWeek; short: string };
  isSelected: boolean;
  isToday: boolean;
  count: number;
  onPress: () => void;
}

function DayPill({ day, isSelected, isToday, count, onPress }: DayPillProps) {
  return (
    <TouchableOpacity
      style={[
        styles.dayPill,
        isSelected && styles.dayPillActive,
        isToday && !isSelected && styles.dayPillToday,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.dayShort, isSelected && styles.dayShortActive]}>
        {day.short}
      </Text>
      {count > 0 ? (
        <View style={[styles.dayCount, isSelected && styles.dayCountActive]}>
          <Text
            style={[
              styles.dayCountText,
              isSelected && styles.dayCountTextActive,
            ]}
          >
            {count}
          </Text>
        </View>
      ) : (
        <View style={styles.dayCountEmpty} />
      )}
    </TouchableOpacity>
  );
}

// ─── Slot Card ─────────────────────────────────────────────────────────────

interface SlotCardProps {
  slot: TimetableSlot;
  update?: ClassUpdate;
  isToday: boolean;
  onReport: (slot: TimetableSlot) => void;
  onUpvote: (update: ClassUpdate) => void;
}

function SlotCard({
  slot,
  update,
  isToday,
  onReport,
  onUpvote,
}: SlotCardProps) {
  const status = update?.status ?? null;
  const accentColor = status ? CLASS_STATUS_COLORS[status].color : C.brand;

  return (
    <View style={[styles.slotCard, isToday && styles.slotCardToday]}>
      <View style={[styles.slotAccent, { backgroundColor: accentColor }]} />

      <View style={styles.slotBody}>
        <View style={styles.slotTop}>
          <Text style={styles.slotCode}>{slot.courses?.code ?? "—"}</Text>
          {status && <StatusBadge status={status} />}
        </View>

        <Text style={styles.slotTitle} numberOfLines={1}>
          {slot.courses?.title ?? "Unknown Course"}
        </Text>

        {slot.profiles?.full_name ? (
          <View style={styles.lecturerRow}>
            <User size={11} color={C.textMuted} strokeWidth={1.8} />
            <Text style={styles.lecturerText}>{slot.profiles.full_name}</Text>
          </View>
        ) : null}

        <View style={styles.slotMeta}>
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
          <Text style={styles.updateMsg} numberOfLines={2}>
            {update.message}
          </Text>
        ) : null}

        {isToday && (
          <View style={styles.actionsRow}>
            {update ? (
              <TouchableOpacity
                style={styles.upvoteBtn}
                onPress={() => onUpvote(update)}
                activeOpacity={0.75}
              >
                <ThumbsUp size={12} color={C.brand} strokeWidth={2} />
                <Text style={styles.upvoteText}>
                  {update.upvotes ?? 0} confirm
                  {(update.upvotes ?? 0) !== 1 ? "s" : ""}
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.reportBtn}
              onPress={() => onReport(slot)}
              activeOpacity={0.75}
            >
              <Text style={styles.reportBtnText}>Report status</Text>
              <ChevronDown size={12} color={C.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Status Action Sheet ───────────────────────────────────────────────────

interface ActionSheetProps {
  slot: TimetableSlot | null;
  visible: boolean;
  isSubmitting: boolean;
  onSelect: (status: ClassStatus) => void;
  onClose: () => void;
}

function StatusActionSheet({
  slot,
  visible,
  isSubmitting,
  onSelect,
  onClose,
}: ActionSheetProps) {
  if (!slot) return null;

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Report Class Status"
      type="sheet"
    >
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetCode}>{slot.courses?.code}</Text>
        <Text style={styles.sheetTitle} numberOfLines={1}>
          {slot.courses?.title}
        </Text>
        <Text style={styles.sheetMeta}>
          {formatTime(slot.start_time)} · {slot.venue}
        </Text>
      </View>

      <View style={styles.sheetNote}>
        <Text style={styles.sheetNoteText}>
          Your report helps other students. Be accurate.
        </Text>
      </View>

      <View style={styles.sheetDivider} />

      {isSubmitting ? (
        <View style={styles.sheetLoading}>
          <ActivityIndicator color={C.brand} />
          <Text style={styles.sheetLoadingText}>Submitting...</Text>
        </View>
      ) : (
        STATUS_ACTIONS.map((action) => (
          <Pressable
            key={action.status}
            style={({ pressed }) => [
              styles.actionRow,
              pressed && { backgroundColor: C.bgHover },
            ]}
            onPress={() => onSelect(action.status)}
          >
            <View
              style={[
                styles.actionIconWrap,
                {
                  backgroundColor:
                    CLASS_STATUS_COLORS[action.status].background,
                },
              ]}
            >
              {action.icon}
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Text style={styles.actionDesc}>{action.description}</Text>
            </View>
          </Pressable>
        ))
      )}
    </CustomModal>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function StudentTimetable() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(TODAY_KEY);
  const [allSlots, setAllSlots] = useState<TimetableSlot[]>([]);
  const [updates, setUpdates] = useState<Record<string, ClassUpdate>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [activeSlot, setActiveSlot] = useState<TimetableSlot | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!profile) return;
    try {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", profile.id)
        .eq("is_active", true);

      if (!enrollments || enrollments.length === 0) {
        setAllSlots([]);
        return;
      }

      const courseIds = enrollments.map((e) => e.course_id);

      const { data: slots } = await supabase
        .from("timetable")
        .select(
          "*, courses(id, title, code, credit_units), profiles(full_name)",
        )
        .in("course_id", courseIds)
        .eq("is_active", true)
        .order("day_of_week")
        .order("start_time");

      if (slots) setAllSlots(slots);

      const todayDate = new Date().toISOString().split("T")[0];
      const { data: todayUpdates } = await supabase
        .from("class_updates")
        .select("*")
        .eq("university_id", profile.university_id)
        .eq("update_date", todayDate);

      if (todayUpdates) {
        const map: Record<string, ClassUpdate> = {};
        todayUpdates.forEach((u) => {
          map[u.timetable_id] = u;
        });
        setUpdates(map);
      }
    } catch (e) {
      console.error("Student timetable fetch error:", e);
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

  useEffect(() => {
    if (!profile) return;
    const channel = supabase
      .channel("student-timetable-updates")
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
          setUpdates((prev) => ({ ...prev, [update.timetable_id]: update }));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  const handleUpvote = useCallback(async (update: ClassUpdate) => {
    const newCount = (update.upvotes ?? 0) + 1;
    setUpdates((prev) => ({
      ...prev,
      [update.timetable_id]: { ...update, upvotes: newCount },
    }));
    await supabase
      .from("class_updates")
      .update({ upvotes: newCount })
      .eq("id", update.id);
  }, []);

  const handleReport = useCallback((slot: TimetableSlot) => {
    setActiveSlot(slot);
    setSheetVisible(true);
  }, []);

  const handleSelectStatus = useCallback(
    async (status: ClassStatus) => {
      if (!activeSlot || !profile) return;
      setIsSubmitting(true);
      try {
        const todayDate = new Date().toISOString().split("T")[0];
        const existing = updates[activeSlot.id];

        if (existing) {
          const { error } = await supabase
            .from("class_updates")
            .update({ status, reported_by: profile.id })
            .eq("id", existing.id);
          if (error) throw error;
          setUpdates((prev) => ({
            ...prev,
            [activeSlot.id]: { ...existing, status },
          }));
        } else {
          const { data, error } = await supabase
            .from("class_updates")
            .insert({
              timetable_id: activeSlot.id,
              reported_by: profile.id,
              university_id: profile.university_id,
              status,
              message: null,
              new_venue: null,
              new_start_time: null,
              delay_minutes: null,
              update_date: todayDate,
            })
            .select()
            .single();
          if (error) throw error;
          if (data) setUpdates((prev) => ({ ...prev, [activeSlot.id]: data }));
        }
        setSheetVisible(false);
        setActiveSlot(null);
      } catch {
        Alert.alert("Error", "Could not submit report. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [activeSlot, profile, updates],
  );

  const slotsForDay = allSlots.filter((s) => s.day_of_week === selectedDay);

  if (isLoading) return <TimetableSkeleton />;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Timetable</Text>
        <Text style={styles.headerSub}>
          {allSlots.length} class{allSlots.length !== 1 ? "es" : ""} enrolled
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayStrip}
      >
        {DAYS.map((day) => (
          <DayPill
            key={day.key}
            day={day}
            isSelected={selectedDay === day.key}
            isToday={day.key === TODAY_KEY}
            count={allSlots.filter((s) => s.day_of_week === day.key).length}
            onPress={() => setSelectedDay(day.key)}
          />
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[
          styles.slotList,
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
        <View style={styles.dayLabelRow}>
          <Text style={styles.dayLabel}>
            {DAYS.find((d) => d.key === selectedDay)?.label}
          </Text>
          {selectedDay === TODAY_KEY && (
            <View style={styles.todayTag}>
              <Text style={styles.todayTagText}>Today</Text>
            </View>
          )}
        </View>

        {slotsForDay.length === 0 ? (
          <View style={styles.emptyCard}>
            <CalendarDays size={28} color={C.textMuted} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No classes this day</Text>
            <Text style={styles.emptySubtitle}>Nothing enrolled</Text>
          </View>
        ) : (
          slotsForDay.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              update={updates[slot.id]}
              isToday={selectedDay === TODAY_KEY}
              onReport={handleReport}
              onUpvote={handleUpvote}
            />
          ))
        )}
      </ScrollView>

      <StatusActionSheet
        slot={activeSlot}
        visible={sheetVisible}
        isSubmitting={isSubmitting}
        onSelect={handleSelectStatus}
        onClose={() => {
          if (!isSubmitting) {
            setSheetVisible(false);
            setActiveSlot(null);
          }
        }}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgDeep },

  header: { paddingHorizontal: 20, paddingBottom: 14, gap: 2 },
  headerTitle: {
    color: C.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  headerSub: { color: C.textMuted, fontSize: 13 },

  dayStrip: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 8,
    flexDirection: "row",
  },
  dayPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: C.bgSecondary,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    alignItems: "center",
    gap: 4,
    minWidth: 52,
  },
  dayPillActive: { backgroundColor: C.brand, borderColor: C.brand },
  dayPillToday: { borderColor: C.borderBrand },
  dayShort: { color: C.textMuted, fontSize: 13, fontWeight: "600" },
  dayShortActive: { color: C.textPrimary },
  dayCount: {
    backgroundColor: C.brandMuted,
    borderRadius: 8,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  dayCountActive: { backgroundColor: "rgba(255,255,255,0.25)" },
  dayCountText: { color: C.brand, fontSize: 10, fontWeight: "700" },
  dayCountTextActive: { color: C.textPrimary },
  dayCountEmpty: { height: 18 },

  slotList: { paddingHorizontal: 20, gap: 10 },
  dayLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 2,
  },
  dayLabel: { color: C.textSecondary, fontSize: 14, fontWeight: "600" },
  todayTag: {
    backgroundColor: C.brandMuted,
    borderRadius: R.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  todayTagText: { color: C.brand, fontSize: 11, fontWeight: "700" },

  emptyCard: {
    backgroundColor: C.bgSecondary,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    padding: 32,
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  emptyTitle: { color: C.textSecondary, fontSize: 15, fontWeight: "600" },
  emptySubtitle: { color: C.textMuted, fontSize: 13 },

  slotCard: {
    flexDirection: "row",
    backgroundColor: C.bgSecondary,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.borderSecondary,
    overflow: "hidden",
  },
  slotCardToday: {
    borderColor: C.borderBrand,
    backgroundColor: "rgba(255, 92, 26, 0.03)",
  },
  slotAccent: { width: 3, alignSelf: "stretch" },
  slotBody: { flex: 1, padding: 14, gap: 4 },
  slotTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  slotCode: {
    color: C.brand,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  slotTitle: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  lecturerRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  lecturerText: { color: C.textMuted, fontSize: 11 },
  slotMeta: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 3 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: C.textMuted, fontSize: 12 },
  updateMsg: {
    color: C.textSecondary,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
  },
  upvoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.brandSubtle,
    borderRadius: R.full,
    borderWidth: 1,
    borderColor: C.borderBrand,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  upvoteText: { color: C.brand, fontSize: 11, fontWeight: "600" },
  reportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.bgTertiary,
    borderRadius: R.full,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  reportBtnText: { color: C.textMuted, fontSize: 11, fontWeight: "600" },

  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.full },
  badgeText: { fontSize: 11, fontWeight: "700" },

  sheetHeader: { paddingBottom: 12, gap: 2 },
  sheetCode: {
    color: C.brand,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sheetTitle: { color: C.textPrimary, fontSize: 17, fontWeight: "700" },
  sheetMeta: { color: C.textMuted, fontSize: 13, marginTop: 2 },
  sheetNote: {
    backgroundColor: C.brandSubtle,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.borderBrand,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  sheetNoteText: { color: C.brand, fontSize: 12 },
  sheetDivider: {
    height: 1,
    backgroundColor: C.borderPrimary,
    marginBottom: 8,
  },
  sheetLoading: { padding: 32, alignItems: "center", gap: 12 },
  sheetLoadingText: { color: C.textSecondary, fontSize: 14 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 14,
    borderRadius: R.sm,
    paddingHorizontal: 4,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: R.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { flex: 1, gap: 2 },
  actionLabel: { color: C.textPrimary, fontSize: 15, fontWeight: "600" },
  actionDesc: { color: C.textMuted, fontSize: 12 },
});
