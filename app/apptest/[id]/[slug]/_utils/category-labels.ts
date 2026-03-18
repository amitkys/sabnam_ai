import { CategoryLevel, ExamDomain } from '@/lib/generated/prisma/enums';

// ── Human-readable label for each tree depth level ────────────
export const LEVEL_LABEL: Record<CategoryLevel, string> = {
  ROOT:     'Exam Board',
  EXAM:     'Exam',
  STANDARD: 'Class / Standard',
  SUBJECT:  'Subject',
  CHAPTER:  'Chapter',
  PYQ:      'Previous Year Questions',
};

// ── Human-readable label for each exam domain ─────────────────
export const DOMAIN_LABEL: Record<ExamDomain, string> = {
  BOARD:       'Board Exam',
  ENTRANCE:    'Entrance Exam',
  COMPETITIVE: 'Competitive Exam',
  OLYMPIAD:    'Olympiad',
  LANGUAGE:    'Language Certification',
  UNIVERSITY:  'University Exam',
  RECRUITMENT: 'Govt. Recruitment',
  SCHOLARSHIP: 'Scholarship',
  VOCATIONAL:  'Vocational / Skill',
};

// ── Dynamic heading for the children section ──────────────────
// Describes what the children of the current node represent
export const CHILDREN_HEADING: Partial<Record<CategoryLevel, string>> = {
  ROOT:     'Select Class / Standard',
  EXAM:     'Select Standard',
  STANDARD: 'Select Subject',
  SUBJECT:  'Select Chapter',
  CHAPTER:  'Available Topics',
};

// ── Helper functions ──────────────────────────────────────────

/**
 * Returns the human-readable level label for a category node.
 */
export function getLevelLabel(level: CategoryLevel): string {
  return LEVEL_LABEL[level];
}

/**
 * Returns the human-readable domain label, or null if no domain is set.
 * (Domain is only set on ROOT-level nodes.)
 */
export function getDomainLabel(domain: ExamDomain | null): string | null {
  return domain ? DOMAIN_LABEL[domain] : null;
}

/**
 * Returns the heading text for the children section based
 * on the current node's level. Falls back to a generic string.
 */
export function getChildrenHeading(level: CategoryLevel): string {
  return CHILDREN_HEADING[level] ?? 'Select an option';
}
