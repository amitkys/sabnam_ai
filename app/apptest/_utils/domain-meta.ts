import {
  BookOpenIcon,
  BrainCircuitIcon,
  GraduationCapIcon,
  TrophyIcon,
  LanguagesIcon,
  UniversityIcon,
  BriefcaseIcon,
  AwardIcon,
  WrenchIcon,
} from 'lucide-react';
import { ExamDomain } from '@/lib/generated/prisma/enums';

// ── Types ──────────────────────────────────────────────────────

export interface DomainMeta {
  label: string;
  icon: React.ElementType;
  description: string;
}

// ── Domain display metadata ────────────────────────────────────
// Maps each ExamDomain enum value to its UI label, icon, and description.

export const DOMAIN_META: Record<ExamDomain, DomainMeta> = {
  BOARD: {
    label: 'Board Exams',
    icon: BookOpenIcon,
    description: 'BSEB, CBSE, ICSE and state boards',
  },
  ENTRANCE: {
    label: 'Entrance Exams',
    icon: GraduationCapIcon,
    description: 'JEE, NEET, CUET, CLAT, CAT, NDA',
  },
  COMPETITIVE: {
    label: 'Competitive Exams',
    icon: TrophyIcon,
    description: 'SSC, RRB, IBPS, UPSC, BPSC',
  },
  OLYMPIAD: {
    label: 'Olympiads',
    icon: BrainCircuitIcon,
    description: 'IMO, NSO, NTSE, RMO, KVPY',
  },
  LANGUAGE: {
    label: 'Language Certifications',
    icon: LanguagesIcon,
    description: 'IELTS, TOEFL, DUOLINGO, PTE',
  },
  UNIVERSITY: {
    label: 'University Exams',
    icon: UniversityIcon,
    description: 'BHU UET, DU, AMU internal exams',
  },
  RECRUITMENT: {
    label: 'Government Recruitment',
    icon: BriefcaseIcon,
    description: 'State PSC, police, army, DRDO',
  },
  SCHOLARSHIP: {
    label: 'Scholarships',
    icon: AwardIcon,
    description: 'NMMS, NSP Pre-Matric, INSPIRE',
  },
  VOCATIONAL: {
    label: 'Vocational / Skill',
    icon: WrenchIcon,
    description: 'ITI, polytechnic, NSQF skill-based',
  },
};

// ── Preferred display order of domains on the listing page ─────
export const DOMAIN_ORDER: ExamDomain[] = [
  'BOARD',
  'ENTRANCE',
  'COMPETITIVE',
  'OLYMPIAD',
  'LANGUAGE',
  'UNIVERSITY',
  'RECRUITMENT',
  'SCHOLARSHIP',
  'VOCATIONAL',
];

// ── Helper: group a flat list of root categories by domain ─────
interface RootCategory {
  id: string;
  name: string;
  slug: string;
  domain: ExamDomain | null;
}

/**
 * Groups root-level categories by their ExamDomain.
 * Falls back to 'BOARD' if domain is somehow null.
 */
export function groupByDomain<T extends RootCategory>(
  categories: T[]
): Record<string, T[]> {
  return categories.reduce<Record<string, T[]>>((acc, cat) => {
    const domain = cat.domain ?? 'BOARD';
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(cat);
    return acc;
  }, {});
}

/**
 * Filters DOMAIN_ORDER to only domains that have at least one category.
 */
export function getActiveDomains(
  grouped: Record<string, unknown[]>
): ExamDomain[] {
  return DOMAIN_ORDER.filter((d) => (grouped[d]?.length ?? 0) > 0);
}
