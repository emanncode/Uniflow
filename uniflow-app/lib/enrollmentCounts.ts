/** Build per-course enrollment counts from minimal course_id rows. */
export function countByCourseId(
  rows: { course_id: string }[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.course_id] = (counts[row.course_id] ?? 0) + 1;
  }
  return counts;
}