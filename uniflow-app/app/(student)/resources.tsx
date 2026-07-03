import { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  FlatList,

  StyleSheet,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  FolderDown,
  FileText,
  Image,
  File,
  BookOpen,
  Download,
  HelpCircle,
  StickyNote,
} from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { ResourcesSkeleton } from '@/components/SkeletonLoader'
import { ScreenPageHeader } from '@/components/ScreenPageHeader'
import { FadeSlideIn } from '@/components/FadeSlideIn'
import { ScalePressable } from '@/components/ScalePressable'
import { useAuthStore } from '@/store/useAuthStore'
import { useStudentEnrollments } from '@/hooks/useStudentEnrollments'
import { Theme } from '@/constants/Theme'
import type { Resource, FileType, ResourceType } from '@/types'

const C = Theme.colors
const R = Theme.radius

// ─── Types ─────────────────────────────────────────────────────────────────

interface ResourceWithCourse extends Resource {
  courseCode: string
  courseTitle: string
}

// ─── Config ────────────────────────────────────────────────────────────────

const FILE_TYPE_CONFIG: Record<FileType, {
  icon: React.ReactNode
  color: string
  background: string
  label: string
}> = {
  pdf: {
    icon: <FileText size={20} color={C.danger} strokeWidth={1.8} />,
    color: C.danger,
    background: C.dangerMuted,
    label: 'PDF',
  },
  image: {
    icon: <Image size={20} color={C.info} strokeWidth={1.8} />,
    color: C.info,
    background: C.infoMuted,
    label: 'Image',
  },
  doc: {
    icon: <FileText size={20} color={C.success} strokeWidth={1.8} />,
    color: C.success,
    background: C.successMuted,
    label: 'Doc',
  },
  other: {
    icon: <File size={20} color={C.textMuted} strokeWidth={1.8} />,
    color: C.textMuted,
    background: 'rgba(148, 163, 184, 0.1)',
    label: 'File',
  },
}

const RESOURCE_TYPE_CONFIG: Record<ResourceType, {
  icon: React.ReactNode
  label: string
}> = {
  past_question: {
    icon: <HelpCircle size={12} color={C.textMuted} strokeWidth={1.8} />,
    label: 'Past Question',
  },
  note: {
    icon: <StickyNote size={12} color={C.textMuted} strokeWidth={1.8} />,
    label: 'Note',
  },
  material: {
    icon: <BookOpen size={12} color={C.textMuted} strokeWidth={1.8} />,
    label: 'Material',
  },
  other: {
    icon: <File size={12} color={C.textMuted} strokeWidth={1.8} />,
    label: 'Other',
  },
}

const RESOURCE_TYPE_FILTERS: { key: ResourceType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'past_question', label: 'Past Questions' },
  { key: 'note', label: 'Notes' },
  { key: 'material', label: 'Materials' },
  { key: 'other', label: 'Other' },
]

// ─── Resource Card ─────────────────────────────────────────────────────────

interface ResourceCardProps {
  resource: ResourceWithCourse
  onDownload: (resource: ResourceWithCourse) => void
}

function ResourceCard({ resource, onDownload }: ResourceCardProps) {
  const fileConfig = FILE_TYPE_CONFIG[resource.file_type]
  const typeConfig = RESOURCE_TYPE_CONFIG[resource.resource_type]

  return (
    <View style={styles.card}>
      {/* Left icon */}
      <View style={[styles.fileIcon, { backgroundColor: fileConfig.background }]}>
        {fileConfig.icon}
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        {/* Course badge + type */}
        <View style={styles.cardMeta}>
          <View style={styles.courseBadge}>
            <Text style={styles.courseBadgeText}>{resource.courseCode}</Text>
          </View>
          <View style={styles.typeBadge}>
            {typeConfig.icon}
            <Text style={styles.typeBadgeText}>{typeConfig.label}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {resource.title}
        </Text>

        {/* Description */}
        {resource.description ? (
          <Text style={styles.cardDesc} numberOfLines={1}>
            {resource.description}
          </Text>
        ) : null}

        {/* Bottom row */}
        <View style={styles.cardBottom}>
          <View style={styles.downloadCount}>
            <Download size={11} color={C.textMuted} strokeWidth={1.8} />
            <Text style={styles.downloadCountText}>
              {resource.downloads} download{resource.downloads !== 1 ? 's' : ''}
            </Text>
          </View>

          <ScalePressable
            style={styles.downloadBtn}
            onPress={() => onDownload(resource)}
          >
            <Download size={13} color={C.textPrimary} strokeWidth={2} />
            <Text style={styles.downloadBtnText}>Download</Text>
          </ScalePressable>
        </View>
      </View>
    </View>
  )
}

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function StudentResources() {
  const insets = useSafeAreaInsets()
  const profile = useAuthStore((s) => s.profile)

  const [resources, setResources] = useState<ResourceWithCourse[]>([])
  const [courseFilter, setCourseFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<ResourceType | 'all'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // Unique courses for filter chips
  const courseOptions = [
    { key: 'all', label: 'All Courses' },
    ...Array.from(
      new Map(resources.map((r) => [r.courseCode, { key: r.course_id, label: r.courseCode }]))
        .values()
    ),
  ]

  // ── Fetch ─────────────────────────────────────────────────────────────

  const { refresh: refreshEnrollments } = useStudentEnrollments()

  const fetchData = useCallback(async () => {
    if (!profile) return
    try {
      let { courseIds } = await refreshEnrollments(true)

      if (courseIds.length === 0 && profile?.level != null && profile?.university_id) {
        // Fallback to level-based courses so resources can still be discovered
        const { data: levelCourses } = await supabase
          .from('courses')
          .select('id')
          .eq('university_id', profile.university_id)
          .eq('level', profile.level)
          .eq('is_active', true)
        courseIds = (levelCourses || []).map((c: any) => c.id)
      }

      if (courseIds.length === 0) {
        setResources([])
        return
      }

      const { data: resourceData } = await supabase
        .from('resources')
        .select('*, courses(code, title)')
        .in('course_id', courseIds)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (!resourceData) return

      const enriched: ResourceWithCourse[] = resourceData.map((r) => ({
        ...r,
        courseCode: (r.courses as any)?.code ?? '—',
        courseTitle: (r.courses as any)?.title ?? '',
      }))

      setResources(enriched)
    } catch (e) {
      console.error('Resources fetch error:', e)
    }
  }, [profile, refreshEnrollments])

  useEffect(() => {
    fetchData().finally(() => setIsLoading(false))
  }, [fetchData])

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await fetchData()
    setIsRefreshing(false)
  }, [fetchData])

  // ── Download ──────────────────────────────────────────────────────────

  const handleDownload = useCallback(async (resource: ResourceWithCourse) => {
    setDownloadingId(resource.id)
    try {
      const supported = await Linking.canOpenURL(resource.file_url)
      if (!supported) {
        Alert.alert('Error', 'Cannot open this file URL.')
        return
      }

      await Linking.openURL(resource.file_url)

      // Increment download count
      await supabase
        .from('resources')
        .update({ downloads: resource.downloads + 1 })
        .eq('id', resource.id)

      // Optimistic local update
      setResources((prev) =>
        prev.map((r) =>
          r.id === resource.id ? { ...r, downloads: r.downloads + 1 } : r
        )
      )
    } catch {
      Alert.alert('Error', 'Could not open file. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }, [])

  // ── Filter ────────────────────────────────────────────────────────────

  const filtered = resources.filter((r) => {
    const byCourse = courseFilter === 'all' || r.course_id === courseFilter
    const byType = typeFilter === 'all' || r.resource_type === typeFilter
    return byCourse && byType
  })

  // ── Loading ───────────────────────────────────────────────────────────

  if (isLoading) return <ResourcesSkeleton />

  // ── Render ────────────────────────────────────────────────────────────

  const renderHeader = () => (
    <>
      {/* Header */}
      <ScreenPageHeader
        title="Resources"
        subtitle={`${resources.length} file${resources.length !== 1 ? 's' : ''} available`}
        role="student"
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      />

      <FadeSlideIn index={1}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Filter by course</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterStrip}
          >
            {courseOptions.map((opt) => (
              <ScalePressable
                key={opt.key}
                style={[
                  styles.filterChip,
                  courseFilter === opt.key && styles.filterChipActive,
                ]}
                onPress={() => setCourseFilter(opt.key)}
              >
                <Text style={[
                  styles.filterChipText,
                  courseFilter === opt.key && styles.filterChipTextActive,
                ]}>
                  {opt.label}
                </Text>
              </ScalePressable>
            ))}
          </ScrollView>
        </View>
      </FadeSlideIn>

      <FadeSlideIn index={2}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Filter by type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterStrip}
          >
            {RESOURCE_TYPE_FILTERS.map((opt) => (
              <ScalePressable
                key={opt.key}
                style={[
                  styles.filterChip,
                  typeFilter === opt.key && styles.filterChipActive,
                ]}
                onPress={() => setTypeFilter(opt.key)}
              >
                <Text style={[
                  styles.filterChipText,
                  typeFilter === opt.key && styles.filterChipTextActive,
                ]}>
                  {opt.label}
                </Text>
              </ScalePressable>
            ))}
          </ScrollView>
        </View>
      </FadeSlideIn>
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyCard}>
      <FolderDown size={32} color={C.textMuted} strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>
        {resources.length === 0 ? 'No resources yet' : 'No matches'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {resources.length === 0
          ? 'Lecturers will upload notes and past questions here'
          : 'Try a different filter'}
      </Text>
    </View>
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ResourceCard
            resource={item}
            onDownload={
              downloadingId === item.id
                ? () => {}
                : handleDownload
            }
          />
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
    </View>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgDeep },
  centered: { alignItems: 'center', justifyContent: 'center' },

  header: { paddingBottom: 12 },

  filterSection: {
    gap: 8,
    paddingBottom: 4,
  },
  filterLabel: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  filterStrip: {
    paddingBottom: 10,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: R.full,
    backgroundColor: C.bgTertiary,
    borderWidth: 1,
    borderColor: C.borderPrimary,
  },
  filterChipActive: {
    backgroundColor: C.brandSubtle,
    borderColor: C.borderBrand,
  },
  filterChipText: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: C.brand,
    fontWeight: '700',
  },

  list: { paddingHorizontal: 20, gap: 10 },

  emptyCard: {
    backgroundColor: C.bgCard,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    padding: 40,
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
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

  card: {
    flexDirection: 'row',
    backgroundColor: C.bgCard,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.borderPrimary,
    padding: 14,
    gap: 12,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: { flex: 1, gap: 6 },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  courseBadge: {
    backgroundColor: C.brandMuted,
    borderRadius: R.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: C.borderBrand,
  },
  courseBadgeText: {
    color: C.brand,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.bgTertiary,
    borderRadius: R.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: C.borderPrimary,
  },
  typeBadgeText: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  cardTitle: {
    color: C.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  cardDesc: {
    color: C.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  downloadCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  downloadCountText: {
    color: C.textMuted,
    fontSize: 11,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Theme.colors.brand,
    borderRadius: R.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  downloadBtnText: {
    color: Theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
})
