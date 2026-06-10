import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  PlayCircle,
  StopCircle,
  ChevronDown,
} from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { Theme } from "@/constants/Theme";
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

const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
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
    label: "Mark as Ongoing",
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
    label: "Mark as Ended",
    description: "Class has finished for today",
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
    label: "Cancel Class",
    description: "Class will not hold today",
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
    label: "Mark as Delayed",
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
    label: "Mark as Moved",
    description: "Class moved to a different venue",
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

// ─── Slot Card ─────────────────────────────────────────────────────────────

interface SlotCardProps {
  slot: TimetableSlot;
  update?: ClassUpdate;
  isToday: boolean;
  onMarkStatus: (slot: TimetableSlot) => void;
}

function SlotCard({ slot, update, isToday, onMarkStatus }: SlotCardProps) {
  const status = update?.status ?? null;
  const accentColor = status ? CLASS_STATUS_COLORS[status].color : C.brand;

  return (
    <View style={[styles.slotCard, isToday && styles.slotCardToday]}>
      <View style={[styles.slotAccent, { backgroundColor: accentColor }]} />

      <View style={styles.slotBody}>
        {/* Top row */}
        <View style={styles.slotTop}>
          <Text style={styles.slotCode}>{slot.courses?.code ?? "—"}</Text>
          {status && <StatusBadge status={status} />}
        </View>

        <Text style={styles.slotTitle} numberOfLines={1}>
          {slot.courses?.title ?? "Unknown Course"}
        </Text>

        {/* Meta */}
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

        {/* Update message */}
        {update?.message ? (
          <Text style={styles.updateMsg} numberOfLines={2}>
            {update.message}
          </Text>
        ) : null}

        {/* Mark status button — only for today's slots */}
        {isToday && (
          <TouchableOpacity
            style={styles.markBtn}
            onPress={() => onMarkStatus(slot)}
            activeOpacity={0.75}
          >
            <Text style={styles.markBtnText}>Update status</Text>
            <ChevronDown size={13} color={C.brand} strokeWidth={2} />
          </TouchableOpacity>
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
      title="Update Class Status"
      type="sheet"
    >
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetCourse}>{slot.courses?.code}</Text>
        <Text style={styles.sheetTitle} numberOfLines={1}>
          {slot.courses?.title}
        </Text>
        <Text style={styles.sheetVenue}>
          {formatTime(slot.start_time)} · {slot.venue}
        </Text>
      </View>

      <View style={styles.sheetDivider} />

      {/* Actions */}
      {isSubmitting ? (
        <View style={styles.sheetLoading}>
          <ActivityIndicator color={C.brand} />
          <Text style={styles.sheetLoadingText}>Updating status...</Text>
        </View>
      ) : (
        STATUS_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.status}
            style={styles.actionRow}
            onPress={() => onSelect(action.status)}
            activeOpacity={0.7}
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
          </TouchableOpacity>
        ))
      )}
    </CustomModal>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function LecturerTimetable() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(TODAY_KEY);
  const [allSlots, setAllSlots] = useState<TimetableSlot[]>([]);
  const [updates, setUpdates] = useState<Record<string, ClassUpdate>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Action sheet state
  const [activeSlot, setActiveSlot] = useState<TimetableSlot | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!profile) return;
    try {
      const { data: slots } = await supabase
        .from("timetable")
        .select("*, courses(id, title, code, credit_units)")
        .eq("lecturer_id", profile.id)
        .eq("is_active", true)
        .order("day_of_week")
        .order("start_time");

      if (slots) setAllSlots(slots);

      // Fetch today's updates
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
      console.error("Timetable fetch error:", e);
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
      .channel("timetable-updates")
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

  // ── Mark Status ───────────────────────────────────────────────────────

  const handleMarkStatus = useCallback((slot: TimetableSlot) => {
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
          // Update existing record
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
          // Insert new record
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
          if (data) {
            setUpdates((prev) => ({ ...prev, [activeSlot.id]: data }));
          }
        }

        setSheetVisible(false);
        setActiveSlot(null);
      } catch (_) {
        Alert.alert(
          "Error",
          "Could not update class status. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [activeSlot, profile, updates],
  );

  // ── Derived ───────────────────────────────────────────────────────────

  const slotsForDay = allSlots.filter((s) => s.day_of_week === selectedDay);

  // ── Loading ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator size="large" color={C.brand} />
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>My Timetable</Text>
        <Text style={styles.headerSub}>
          {allSlots.length} class{allSlots.length !== 1 ? "es" : ""} total
        </Text>
      </View>

      {/* ── Day Selector ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayStrip}
      >
        {DAYS.map((day) => {
          const isSelected = selectedDay === day.key;
          const isToday = day.key === TODAY_KEY;
          const count = allSlots.filter(
            (s) => s.day_of_week === day.key,
          ).length;

          return (
            <TouchableOpacity
              key={day.key}
              style={[
                styles.dayPill,
                isSelected && styles.dayPillActive,
                isToday && !isSelected && styles.dayPillToday,
              ]}
              onPress={() => setSelectedDay(day.key)}
              activeOpacity={0.75}
            >
              <Text
                style={[styles.dayShort, isSelected && styles.dayShortActive]}
              >
                {day.short}
              </Text>
              {count > 0 && (
                <View
                  style={[styles.dayDot, isSelected && styles.dayDotActive]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Slots ── */}
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
        {/* Day label */}
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
            <Text style={styles.emptyTitle}>No classes this day</Text>
            <Text style={styles.emptySubtitle}>Nothing scheduled</Text>
          </View>
        ) : (
          slotsForDay.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              update={updates[slot.id]}
              isToday={selectedDay === TODAY_KEY}
              onMarkStatus={handleMarkStatus}
            />
          ))
        )}
      </ScrollView>

      {/* ── Status Action Sheet ── */}
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 2,
  },
  headerTitle: {
    color: C.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  headerSub: {
    color: C.textMuted,
    fontSize: 13,
  },

  // Day Strip
  dayStrip: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
    flexDirection: "row",
  },
  dayPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: R.full,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    alignItems: "center",
    gap: 5,
  },
  dayPillActive: {
    backgroundColor: C.brand,
    borderColor: C.brand,
  },
  dayPillToday: {
    borderColor: C.borderBrand,
  },
  dayShort: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  dayShortActive: {
    color: C.textPrimary,
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.brand,
  },
  dayDotActive: {
    backgroundColor: C.textPrimary,
  },

  // Slot List
  slotList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  dayLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  dayLabel: {
    color: C.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  todayTag: {
    backgroundColor: C.brandMuted,
    borderRadius: R.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  todayTagText: {
    color: C.brand,
    fontSize: 11,
    fontWeight: "700",
  },

  // Empty
  emptyCard: {
    backgroundColor: C.bgCard,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    padding: 32,
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  emptyTitle: {
    color: C.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: C.textMuted,
    fontSize: 13,
  },

  // Slot Card
  slotCard: {
    flexDirection: "row",
    backgroundColor: C.bgCard,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    overflow: "hidden",
  },
  slotCardToday: {
    borderColor: C.borderBrand,
  },
  slotAccent: {
    width: 3,
    alignSelf: "stretch",
  },
  slotBody: {
    flex: 1,
    padding: 14,
    gap: 4,
  },
  slotTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  slotCode: {
    color: C.brand,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  slotTitle: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  slotMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: C.textMuted,
    fontSize: 12,
  },
  updateMsg: {
    color: C.textSecondary,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  markBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: C.brandSubtle,
    borderWidth: 1,
    borderColor: C.borderBrand,
    borderRadius: R.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markBtnText: {
    color: C.brand,
    fontSize: 12,
    fontWeight: "600",
  },

  // Badge
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // Action Sheet
  sheetHeader: {
    paddingBottom: 12,
    gap: 2,
  },
  sheetCourse: {
    color: C.brand,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sheetTitle: {
    color: C.textPrimary,
    fontSize: 17,
    fontWeight: "700",
  },
  sheetVenue: {
    color: C.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: C.borderPrimary,
    marginVertical: 12,
  },
  sheetLoading: {
    padding: 32,
    alignItems: "center",
    gap: 12,
  },
  sheetLoadingText: {
    color: C.textSecondary,
    fontSize: 14,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 14,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: R.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    flex: 1,
    gap: 2,
  },
  actionLabel: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  actionDesc: {
    color: C.textMuted,
    fontSize: 12,
  },
});
