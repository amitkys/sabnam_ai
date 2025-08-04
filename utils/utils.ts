export function formatTestDate(startedAt: Date): {
  display: string;
  title: string;
} {
  const date = new Date(startedAt);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return { display: "Invalid Date", title: "Invalid Date" };
  }

  // Format for display: "3 Jan"
  const display = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);

  // Format for time in title: "5:30 PM"
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  // Format for date in title: "23 Jan 25"
  const dateForTitle = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  }).format(date);

  const title = `${time} • ${dateForTitle}`;

  return { display, title };
}

export function dateWithYear(
  dateInput: string | Date | undefined | null,
): string {
  if (!dateInput) return "";

  const date = new Date(dateInput);

  if (isNaN(date.getTime())) return ""; // invalid date

  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear().toString().slice(-2);

  return `${day} ${month}, ${year}`;
}

// Utility function to format duration
export const formatDuration = (minutes: number): string => {
  if (minutes === 0) return "0 minutes";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${minutes} minutes`;
  if (remainingMinutes === 0)
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;

  return `${hours} ${hours === 1 ? "hour" : "hours"} ${remainingMinutes} ${remainingMinutes === 1 ? "minute" : "minutes"}`;
};


export const reduceHeader = (header: string, length: number): string => {
  const match = header.match(/^(#+)(\s+)(.*)$/);
  if (!match) return header; // return as-is if it's not a valid markdown header

  const [, hashes, spaces, text] = match;
  const newHashes = "#".repeat(hashes.length + length);
  return `${newHashes}${spaces}${text}`;
};

export const increaseHeader = (header: string, length: number): string => {
  const match = header.match(/^(#+)(\s+)(.*)$/);
  if (!match) return header; // return as-is if it's not a valid markdown header

  const [, hashes, spaces, text] = match;
  const newLength = Math.max(hashes.length - length, 1); // Minimum 1 # to stay valid
  const newHashes = "#".repeat(newLength);
  return `${newHashes}${spaces}${text}`;
};

export const getBadgeVariant = (level: string): "easy" | "medium" | "hard" | "outline" | "default" | "destructive" | "secondary" => {
  switch (level) {
    case "e":
      return "easy";
    case "m":
      return "medium";
    case "h":
      return "hard";
    default:
      return "outline";
  }
};

export const getBadgeLabel = (level: string): string => {
  switch (level) {
    case "e":
      return "Easy";
    case "m":
      return "Medium";
    case "h":
      return "Hard";
    default:
      return "Not Specified";
  }
};

