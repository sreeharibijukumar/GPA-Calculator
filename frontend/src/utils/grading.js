export const GRADE_POINTS = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 4,
  F: 0,
  Absent: 0,
  Complete: null,
}

export const VALID_GRADES = Object.keys(GRADE_POINTS)

export const GRADE_LABELS = {
  S:        'S  — Outstanding',
  A:        'A  — Excellent',
  B:        'B  — Very Good',
  C:        'C  — Good',
  D:        'D  — Above Avg',
  E:        'E  — Average',
  F:        'F  — Fail',
  Absent:   'Absent',
  Complete: 'Completed',
}

export const GRADE_COLORS = {
  S: 'var(--emerald-400)',
  A: 'var(--emerald-500)',
  B: 'var(--indigo-400)',
  C: 'var(--indigo-500)',
  D: 'var(--amber-400)',
  E: 'var(--amber-400)',
  F: 'var(--red-500)',
  Absent: 'var(--red-500)',
  Complete: 'var(--text-muted)',
}

// Mirrors backend MARK_GRADE_BANDS
export const MARK_GRADE_BANDS = [
  [90, 'S'],
  [80, 'A'],
  [70, 'B'],
  [60, 'C'],
  [50, 'D'],
  [40, 'E'],
]

/**
 * Map a 0-100 mark to its JNTUA letter grade. Mirrors backend grade_for_marks().
 * @param {number} mark
 * @returns {string}
 */
export function gradeForMarks(mark) {
  const m = parseFloat(mark)
  if (isNaN(m)) return 'S'
  for (const [threshold, grade] of MARK_GRADE_BANDS) {
    if (m >= threshold) return grade
  }
  return 'F'
}

/**
 * Compute SGPA for a list of subjects.
 * Mirrors backend compute_sgpa() in models.py exactly.
 *
 * @param {Array<{credits: number|string, grade: string}>} subjects
 * @returns {number} SGPA rounded to 2 decimal places
 */
export function computeSgpa(subjects) {
  let numerator = 0
  let denominator = 0
  for (const subject of subjects) {
    const points = GRADE_POINTS[subject.grade]
    if (points === null || points === undefined) continue
    const credits = parseFloat(subject.credits) || 0
    denominator += credits
    numerator += credits * points
  }
  if (denominator === 0) return 0
  return Math.round((numerator / denominator) * 100) / 100
}

/**
 * Compute CGPA as the arithmetic mean of all semester SGPAs.
 * Mirrors backend compute_cgpa() in models.py exactly.
 *
 * @param {number[]} sgpaList
 * @returns {number} CGPA rounded to 2 decimal places
 */
export function computeCgpa(sgpaList) {
  const valid = sgpaList.filter((s) => typeof s === 'number' && !isNaN(s))
  if (valid.length === 0) return 0
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 100) / 100
}


export function getPerformanceTag(gpa) {
  if (gpa >= 9.5) return { label: 'Outstanding',    color: 'var(--emerald-400)' }
  if (gpa >= 8.5) return { label: 'Excellent',      color: 'var(--emerald-500)' }
  if (gpa >= 7.5) return { label: 'Very Good',      color: 'var(--indigo-400)'  }
  if (gpa >= 6.5) return { label: 'Good',           color: 'var(--indigo-500)'  }
  if (gpa >= 5.5) return { label: 'Above Average',  color: 'var(--amber-400)'   }
  if (gpa >= 5.0) return { label: 'Average',        color: 'var(--amber-400)'   }
  if (gpa > 0)    return { label: 'Below Average',  color: 'var(--red-500)'     }
  return                 { label: 'Not Calculated', color: 'var(--text-muted)'  }
}

export function blankSubject(id) {
  return { _id: id ?? crypto.randomUUID(), code: '', name: '', mark: '', credits: '', grade: 'S' }
}

/**
 * @param {Array<{scored: number|string, max: number|string}>} rows
 * @returns {{ scored: number, max: number, percentage: number }}
 */
export function computeMarksTotals(rows) {
  let scored = 0
  let max = 0
  for (const row of rows) {
    const s = parseFloat(row.scored)
    const m = parseFloat(row.max)
    if (!isNaN(s)) scored += s
    if (!isNaN(m)) max += m
  }
  const percentage = max > 0 ? Math.round((scored / max) * 10000) / 100 : 0
  return { scored: Math.round(scored * 100) / 100, max: Math.round(max * 100) / 100, percentage }
}

/** Validate one marks-row: scored can't be negative, exceed max, or exceed 100 per subject. */
export function validateMarksRow(row) {
  const errors = {}
  const s = parseFloat(row.scored)
  const m = parseFloat(row.max)
  if (row.max !== '' && (isNaN(m) || m <= 0)) errors.max = 'Must be > 0'
  if (!isNaN(m) && m > 100) errors.max = 'Max 100 per subject'
  if (row.scored !== '' && (isNaN(s) || s < 0)) errors.scored = 'Cannot be negative'
  if (!isNaN(s) && !isNaN(m) && s > m) errors.scored = 'Cannot exceed max'
  return errors
}

export function subjectMatches(subject, query) {
  const q = query.trim().toLowerCase()
  if (!q) return false
  if (subject.code?.toLowerCase().includes(q)) return true
  if (subject.name?.toLowerCase().includes(q)) return true
  const aliases = (subject.aliases ?? '').split(',').map((a) => a.trim().toLowerCase())
  return aliases.some((alias) => alias && alias.includes(q))
}