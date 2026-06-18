import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FileText,
  Image as ImageIcon,
  File,
  Upload,
  Plus,
  Download,
  BookOpen,
  HelpCircle,
  Layers,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import { supabase } from "@/lib/supabase";
import { ResourcesSkeleton } from "@/components/SkeletonLoader";
import { ScreenHeaderActions } from "@/components/ScreenHeaderActions";
import { useAuthStore } from "@/store/useAuthStore";
import { Theme } from "@/constants/Theme";
import { CustomModal } from "@/components/CustomModal";
import type { Resource, ResourceType, FileType, Course } from "@/types";

const C = Theme.colors;
const R = Theme.radius;

// ─── Helpers ───────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getFileType(mimeType?: string, fileName?: string): FileType {
  const ext = fileName?.split(".").pop()?.toLowerCase() ?? "";
  if (mimeType?.includes("pdf") || ext === "pdf") return "pdf";
  if (
    mimeType?.includes("image") ||
    ["png", "jpg", "jpeg", "gif", "webp"].includes(ext)
  )
    return "image";
  if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext)) return "doc";
  return "other";
}

// ─── File Type Config ──────────────────────────────────────────────────────

const FILE_CONFIG: Record<
  FileType,
  { icon: React.ReactNode; color: string; background: string }
> = {
  pdf: {
    icon: <FileText size={18} color={C.danger} strokeWidth={1.8} />,
    color: C.danger,
    background: C.dangerMuted,
  },
  image: {
    icon: <ImageIcon size={18} color={C.info} strokeWidth={1.8} />,
    color: C.info,
    background: C.infoMuted,
  },
  doc: {
    icon: <File size={18} color={C.warning} strokeWidth={1.8} />,
    color: C.warning,
    background: C.warningMuted,
  },
  other: {
    icon: <File size={18} color={C.textMuted} strokeWidth={1.8} />,
    color: C.textMuted,
    background: "rgba(148, 163, 184, 0.1)",
  },
};

const RESOURCE_TYPE_CONFIG: Record<
  ResourceType,
  { icon: React.ReactNode; label: string }
> = {
  note: {
    icon: <BookOpen size={14} color={C.textMuted} strokeWidth={1.8} />,
    label: "Note",
  },
  past_question: {
    icon: <HelpCircle size={14} color={C.textMuted} strokeWidth={1.8} />,
    label: "Past Question",
  },
  material: {
    icon: <Layers size={14} color={C.textMuted} strokeWidth={1.8} />,
    label: "Material",
  },
  other: {
    icon: <File size={14} color={C.textMuted} strokeWidth={1.8} />,
    label: "Other",
  },
};

// ─── Resource Card ─────────────────────────────────────────────────────────

function ResourceCard({ resource }: { resource: Resource }) {
  const fileConf = FILE_CONFIG[resource.file_type];
  const typeConf = RESOURCE_TYPE_CONFIG[resource.resource_type];

  const handleOpen = useCallback(async () => {
    try {
      await Linking.openURL(resource.file_url);
    } catch {
      Alert.alert("Error", "Could not open this file.");
    }
  }, [resource.file_url]);

  return (
    <TouchableOpacity
      style={styles.resourceCard}
      onPress={handleOpen}
      activeOpacity={0.75}
    >
      <View style={[styles.fileIcon, { backgroundColor: fileConf.background }]}>
        {fileConf.icon}
      </View>

      <View style={styles.resourceBody}>
        <Text style={styles.resourceTitle} numberOfLines={1}>
          {resource.title}
        </Text>
        <View style={styles.resourceMeta}>
          {typeConf.icon}
          <Text style={styles.resourceMetaText}>{typeConf.label}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Download size={11} color={C.textMuted} strokeWidth={1.8} />
          <Text style={styles.resourceMetaText}>{resource.downloads}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.resourceMetaText}>
            {timeAgo(resource.created_at)}
          </Text>
        </View>
        {resource.description ? (
          <Text style={styles.resourceDesc} numberOfLines={1}>
            {resource.description}
          </Text>
        ) : null}
      </View>

      <View
        style={[styles.fileTypeBadge, { backgroundColor: fileConf.background }]}
      >
        <Text style={[styles.fileTypeText, { color: fileConf.color }]}>
          {resource.file_type.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Upload Sheet ──────────────────────────────────────────────────────────

interface UploadSheetProps {
  visible: boolean;
  courses: Course[];
  onClose: () => void;
  onUploaded: () => void;
}

function UploadSheet({
  visible,
  courses,
  onClose,
  onUploaded,
}: UploadSheetProps) {
  const profile = useAuthStore((s) => s.profile);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [resourceType, setResourceType] = useState<ResourceType>("material");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<{
    uri: string;
    name: string;
    mimeType?: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState("");

  const reset = useCallback(() => {
    setSelectedCourseId("");
    setResourceType("material");
    setTitle("");
    setDescription("");
    setFile(null);
    setProgress("");
    setIsUploading(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handlePickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setFile({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? undefined,
      });
      if (!title) setTitle(asset.name.replace(/\.[^/.]+$/, ""));
    } catch (e: any) {
      console.error("DocumentPicker error:", e);
      Alert.alert(
        "File selection failed",
        e?.message ??
          "Could not pick file. Please check permissions and try again.",
      );
      return;
    }
  }, [title]);

  const handleUpload = useCallback(async () => {
    if (!profile) return;
    if (!selectedCourseId) {
      Alert.alert("Missing", "Please select a course");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Missing", "Please enter a title");
      return;
    }
    if (!file) {
      Alert.alert("Missing", "Please pick a file");
      return;
    }

    setIsUploading(true);
    setProgress("Uploading file...");

    try {
      const ext = file.name.split(".").pop();
      const fileName = `${selectedCourseId}/${Date.now()}.${ext}`;

      const response = await fetch(file.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from("resources")
        .upload(fileName, blob, {
          contentType: file.mimeType ?? "application/octet-stream",
        });

      if (uploadError) throw uploadError;

      setProgress("Saving record...");

      const { data: urlData } = supabase.storage
        .from("resources")
        .getPublicUrl(fileName);

      const fileType = getFileType(file.mimeType, file.name);

      const { error: insertError } = await supabase.from("resources").insert({
        course_id: selectedCourseId,
        uploaded_by: profile.id,
        university_id: profile.university_id,
        title: title.trim(),
        description: description.trim() || null,
        file_url: urlData.publicUrl,
        file_type: fileType,
        resource_type: resourceType,
        academic_session:
          new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
        is_approved: true,
      });

      if (insertError) throw insertError;

      setProgress("Done!");
      setTimeout(() => {
        reset();
        onClose();
        onUploaded();
      }, 800);
    } catch (e: any) {
      Alert.alert("Upload Failed", e.message ?? "Please try again.");
      setIsUploading(false);
      setProgress("");
    }
  }, [
    profile,
    selectedCourseId,
    title,
    description,
    file,
    resourceType,
    reset,
    onClose,
    onUploaded,
  ]);

  const RESOURCE_TYPES: ResourceType[] = [
    "material",
    "note",
    "past_question",
    "other",
  ];

  return (
    <CustomModal
      visible={visible}
      onClose={handleClose}
      title="Upload Resource"
      type="sheet"
    >
      <ScrollView
        style={styles.sheetScroll}
        contentContainerStyle={styles.sheetScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Course selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Course</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pillScroll}
          >
            {courses.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.coursePill,
                  selectedCourseId === c.id && styles.coursePillActive,
                ]}
                onPress={() => setSelectedCourseId(c.id)}
              >
                <Text
                  style={[
                    styles.coursePillText,
                    selectedCourseId === c.id && styles.coursePillTextActive,
                  ]}
                >
                  {c.code}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Type selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Type</Text>
          <View style={styles.typeGrid}>
            {RESOURCE_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typePill,
                  resourceType === t && styles.typePillActive,
                ]}
                onPress={() => setResourceType(t)}
              >
                <Text
                  style={[
                    styles.typePillText,
                    resourceType === t && styles.typePillTextActive,
                  ]}
                >
                  {RESOURCE_TYPE_CONFIG[t].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Week 5 Lecture Notes"
            placeholderTextColor={C.textMuted}
            value={title}
            onChangeText={setTitle}
            editable={!isUploading}
          />
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Brief description..."
            placeholderTextColor={C.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            editable={!isUploading}
          />
        </View>

        {/* File picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>File</Text>
          <TouchableOpacity
            style={styles.filePicker}
            onPress={handlePickFile}
            activeOpacity={0.75}
            disabled={isUploading}
          >
            {file ? (
              <View style={styles.filePickerSelected}>
                <FileText size={20} color={C.brand} strokeWidth={1.8} />
                <Text style={styles.filePickerName} numberOfLines={1}>
                  {file.name}
                </Text>
              </View>
            ) : (
              <View style={styles.filePickerEmpty}>
                <Upload size={22} color={C.textMuted} strokeWidth={1.5} />
                <Text style={styles.filePickerHint}>Tap to pick a file</Text>
                <Text style={styles.filePickerSub}>PDF, DOC, images, etc.</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.uploadBtn, isUploading && { opacity: 0.7 }]}
          onPress={handleUpload}
          disabled={isUploading}
          activeOpacity={0.85}
        >
          {isUploading ? (
            <View style={styles.uploadBtnLoading}>
              <ActivityIndicator size="small" color={C.textPrimary} />
              <Text style={styles.uploadBtnText}>{progress}</Text>
            </View>
          ) : (
            <Text style={styles.uploadBtnText}>Upload Resource</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </CustomModal>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function LecturerResources() {
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);

  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uploadVisible, setUploadVisible] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!profile) return;
    try {
      // Get assigned course IDs
      const { data: lecturerCourses } = await supabase
        .from("lecturer_courses")
        .select("course_id")
        .eq("lecturer_id", profile.id)
        .eq("is_active", true);

      if (!lecturerCourses?.length) {
        setCourses([]);
        setResources([]);
        return;
      }

      const courseIds = lecturerCourses.map((lc) => lc.course_id);

      // Fetch courses
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .in("id", courseIds)
        .eq("is_active", true)
        .order("code");

      if (courseData) setCourses(courseData);

      // Fetch resources uploaded by this lecturer
      const { data: resourceData } = await supabase
        .from("resources")
        .select("*")
        .eq("uploaded_by", profile.id)
        .in("course_id", courseIds)
        .order("created_at", { ascending: false });

      if (resourceData) setResources(resourceData);
    } catch (e) {
      console.error("Resources fetch error:", e);
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

  // ── Filtered resources ────────────────────────────────────────────────

  const filtered =
    selectedCourseId === "all"
      ? resources
      : resources.filter((r) => r.course_id === selectedCourseId);

  // ── Loading ───────────────────────────────────────────────────────────

  if (isLoading) {
    return <ResourcesSkeleton />;
  }

  // ── Render ────────────────────────────────────────────────────────────

  const renderHeader = () => (
    <>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Resources</Text>
            <Text style={styles.headerSub}>
              {resources.length} file{resources.length !== 1 ? "s" : ""} uploaded
            </Text>
            <TouchableOpacity
              style={styles.uploadFab}
              onPress={() => setUploadVisible(true)}
              activeOpacity={0.85}
            >
              <Plus size={18} color={C.textPrimary} strokeWidth={2.5} />
              <Text style={styles.uploadFabText}>Upload</Text>
            </TouchableOpacity>
          </View>
          <ScreenHeaderActions role="lecturer" />
        </View>
      </View>

      {/* Course filter */}
      <FlatList
        horizontal
        data={[{ id: "all", code: "All" }, ...courses]}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterStrip}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedCourseId === item.id && styles.filterPillActive,
            ]}
            onPress={() => setSelectedCourseId(item.id)}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedCourseId === item.id && styles.filterPillTextActive,
              ]}
            >
              {item.code}
            </Text>
          </TouchableOpacity>
        )}
      />
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyCard}>
      <Upload size={32} color={C.textMuted} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>No resources yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap Upload to share notes, past questions, or materials
      </Text>
    </View>
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ResourceCard resource={item} />}
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

      {/* Upload sheet */}
      <UploadSheet
        visible={uploadVisible}
        courses={courses}
        onClose={() => setUploadVisible(false)}
        onUploaded={fetchData}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgDeep },

  header: {
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    color: C.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  headerSub: { color: C.textMuted, fontSize: 13, marginTop: 2 },

  uploadFab: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: C.brand,
    borderRadius: R.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 10,
  },
  uploadFabText: { color: C.textPrimary, fontSize: 13, fontWeight: "700" },

  filterStrip: {
    paddingBottom: 14,
    gap: 8,
    flexDirection: "row",
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.borderPrimary,
  },
  filterPillActive: { backgroundColor: C.brand, borderColor: C.brand },
  filterPillText: { color: C.textMuted, fontSize: 13, fontWeight: "600" },
  filterPillTextActive: { color: C.textPrimary },

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
    lineHeight: 19,
  },

  resourceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bgCard,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    padding: 14,
    gap: 12,
  },
  fileIcon: {
    width: 42,
    height: 42,
    borderRadius: R.sm,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  resourceBody: { flex: 1, gap: 3 },
  resourceTitle: { color: C.textPrimary, fontSize: 14, fontWeight: "600" },
  resourceMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  resourceMetaText: { color: C.textMuted, fontSize: 11 },
  metaDot: { color: C.textMuted, fontSize: 11 },
  resourceDesc: { color: C.textMuted, fontSize: 12, fontStyle: "italic" },
  fileTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: R.sm,
    flexShrink: 0,
  },
  fileTypeText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },

  sheetScroll: { flex: 1 },
  sheetScrollContent: { paddingBottom: 24, gap: 16 },

  fieldGroup: { gap: 8 },
  fieldLabel: {
    color: C.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  pillScroll: { flexGrow: 0 },
  coursePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: C.bgTertiary,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    marginRight: 8,
  },
  coursePillActive: { backgroundColor: C.brand, borderColor: C.brand },
  coursePillText: { color: C.textMuted, fontSize: 13, fontWeight: "600" },
  coursePillTextActive: { color: C.textPrimary },

  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: C.bgTertiary,
    borderWidth: 1,
    borderColor: C.borderPrimary,
  },
  typePillActive: { backgroundColor: C.brandMuted, borderColor: C.borderBrand },
  typePillText: { color: C.textMuted, fontSize: 13, fontWeight: "600" },
  typePillTextActive: { color: C.brand },

  input: {
    backgroundColor: C.bgTertiary,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    borderRadius: R.sm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: C.textPrimary,
    fontSize: 15,
  },
  inputMultiline: { height: 88, textAlignVertical: "top", paddingTop: 12 },

  filePicker: {
    backgroundColor: C.bgTertiary,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    borderRadius: R.md,
    borderStyle: "dashed",
    minHeight: 90,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  filePickerEmpty: { alignItems: "center", gap: 6 },
  filePickerSelected: { flexDirection: "row", alignItems: "center", gap: 10 },
  filePickerHint: { color: C.textSecondary, fontSize: 14, fontWeight: "600" },
  filePickerSub: { color: C.textMuted, fontSize: 12 },
  filePickerName: { color: C.brand, fontSize: 14, fontWeight: "600", flex: 1 },

  uploadBtn: {
    backgroundColor: C.brand,
    borderRadius: R.sm,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  uploadBtnLoading: { flexDirection: "row", alignItems: "center", gap: 10 },
  uploadBtnText: { color: C.textPrimary, fontSize: 15, fontWeight: "700" },
});
