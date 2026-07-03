export function getCurrentAcademicSession(date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  if (month >= 8) {
    return `${year}/${year + 1}`;
  }
  return `${year - 1}/${year}`;
}

export function getCurrentSemester(date = new Date()): 1 | 2 {
  const month = date.getMonth();
  if (month === 0 || month >= 7) return 1;
  return 2;
}

export function getAcademicContext(date = new Date()) {
  const ctx = {
    academic_session: getCurrentAcademicSession(date),
    semester: getCurrentSemester(date),
  };
  console.log('[getAcademicContext]', ctx);
  return ctx;
}