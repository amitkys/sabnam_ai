// @/lib/utils/parseExamId.ts

/**
 * Parses exam IDs that might contain slashes
 * For example: cuet/scqp09 -> { mainExam: "cuet", seriesCode: "scqp09" }
 */
export function parseExamId(examId: string | null): {
  mainExam: string | null;
  seriesCode: string | null;
} {
  if (!examId) {
    return { mainExam: null, seriesCode: null };
  }

  const parts = examId.split("/");

  if (parts.length === 1) {
    return { mainExam: parts[0], seriesCode: null };
  }

  return {
    mainExam: parts[0],
    seriesCode: parts[1],
  };
}

/**
 * Gets a display-friendly name for an exam ID
 */
export function getExamDisplayName(examId: string | null): string {
  if (!examId) return "";

  const { mainExam, seriesCode } = parseExamId(examId);

  if (!seriesCode) {
    return mainExam?.toUpperCase() || "";
  }

  return `${mainExam?.toUpperCase()} (${seriesCode.toUpperCase()})`;
}
