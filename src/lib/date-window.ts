export function todayInTimeZone(timeZone: string, now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(now);
}

export function editDeadline(entryDate: string, timeZone: string) {
  const [year, month, day] = entryDate.split("-").map(Number);
  const reference = new Date(Date.UTC(year, month - 1, day + 2));
  const offset = offsetForTimeZone(reference, timeZone);
  return new Date(reference.getTime() - offset);
}

function offsetForTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, timeZoneName: "longOffset",
  }).formatToParts(date);
  const value = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = value.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0);
  return (match[1] === "+" ? 1 : -1) * minutes * 60_000;
}

export function canEditEntry(entryDate: string, timeZone: string, now = new Date()) {
  return now < editDeadline(entryDate, timeZone);
}

export function isComplete(body: string, images: number) {
  return body.trim().length > 0 && images >= 3;
}
