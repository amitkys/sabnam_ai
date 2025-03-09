/**
 * Quiz utility functions
 */

/**
 * Format seconds into HH:MM:SS string format
 * @param seconds Total seconds to format
 * @returns Formatted time string
 */
export const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

/**
 * Get CSS classes for question status indicators
 * @param status Question status
 * @returns CSS class string
 */
export const getStatusColor = (status?: "solved" | "later" | "skipped"): string => {
  switch (status) {
    case "solved":
      return "ring-2 ring-green-600 dark:ring-green-400 dark:bg-green-900/30";
    case "later":
      return "ring-2 ring-blue-600 dark:ring-blue-400 dark:bg-blue-900/30";
    case "skipped":
      return "ring-2 ring-red-600 dark:ring-red-400 dark:bg-red-900/30";
    default:
      return "";
  }
};