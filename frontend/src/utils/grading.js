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
  S:        'S  — Outstanding (10)',
  A:        'A  — Excellent   (9)',
  B:        'B  — Very Good   (8)',
  C:        'C  — Good        (7)',
  D:        'D  — Above Avg   (6)',
  E:        'E  — Average     (4)',
  F:        'F  — Fail        (0)',
  Absent:   'Absent           (0)',
  Complete: 'Complete  (Completed)',
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

/**
 * Return a performance label and colour for a given GPA value.
 * Used for the badge next to SGPA/CGPA displays.
 *
 * @param {number} gpa
 * @returns {{ label: string, color: string }}
 */
export function getPerformanceTag(gpa) {
  if (gpa >= 9.5) return { label: 'Outstanding',   color: 'var(--emerald-400)' }
  if (gpa >= 8.5) return { label: 'Excellent',     color: 'var(--emerald-500)' }
  if (gpa >= 7.5) return { label: 'Very Good',     color: 'var(--indigo-400)'  }
  if (gpa >= 6.5) return { label: 'Good',          color: 'var(--indigo-500)'  }
  if (gpa >= 5.5) return { label: 'Above Average', color: 'var(--amber-400)'   }
  if (gpa >= 5.0) return { label: 'Average',       color: 'var(--amber-400)'   }
  if (gpa >  0)   return { label: 'Below Average', color: 'var(--red-500)'     }
  return               { label: 'Not Calculated', color: 'var(--text-muted)'  }
}

export function blankSubject(id) {
  return { _id: id ?? crypto.randomUUID(), name: '', credits: '', grade: 'S' }
}