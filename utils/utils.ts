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
