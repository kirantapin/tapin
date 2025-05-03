//modify time func so that it is only meant to consume times in utc format

interface OpenHours {
  monday: string[];
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
  saturday: string[];
  sunday: string[];
}

interface AvailabilityConstraint {
  begin_time: string;
  end_time: string;
  allowed_days: string[];
}

const days = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export function isOpenNow(
  hours: OpenHours,
  now: Date = new Date()
): boolean | undefined {
  if (!hours) return undefined;

  // Convert current time to UTC
  const utcFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    hour12: false,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const parts = utcFormatter.formatToParts(now);
  const currentDay = parts
    .find((p) => p.type === "weekday")
    ?.value.toLowerCase() as keyof OpenHours;
  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;
  const timeStr = `${hour}:${minute}`; // "HH:mm" in UTC

  const dayIndex = days.indexOf(currentDay);
  const prevDay = days[(dayIndex + 6) % 7] as keyof OpenHours;

  const checkRanges = (day: keyof OpenHours, isPreviousDay = false) => {
    const [open, close] = hours[day] || [];
    if (!open || !close) return false;

    if (open < close) {
      return !isPreviousDay && open <= timeStr && timeStr < close;
    } else {
      // Cross-midnight case
      return isPreviousDay ? timeStr < close : timeStr >= open;
    }
  };

  return checkRanges(currentDay) || checkRanges(prevDay, true);
}

function getLocalTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function convertUtcToLocal(utcTimestampz: string): string {
  const timeZone = getLocalTimeZone();
  const date = new Date(utcTimestampz);
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: undefined,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: undefined,
  }).format(date);
}

export function convertLocalToUtcTimestampz(localDateStr: string): string {
  const timeZone = getLocalTimeZone();
  const dateInLocal = new Date(
    new Date(localDateStr).toLocaleString("en-US", { timeZone })
  );
  return new Date(
    dateInLocal.getTime() - dateInLocal.getTimezoneOffset() * 60000
  ).toISOString();
}

export function isAvailableNow(
  constraint: AvailabilityConstraint,
  now: Date = new Date()
): boolean {
  if (!constraint) return false;

  // Convert current time to UTC
  const utcFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    hour12: false,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const parts = utcFormatter.formatToParts(now);
  const currentDay = parts
    .find((p) => p.type === "weekday")
    ?.value.toLowerCase();

  // If we can't determine the current day, return false
  if (!currentDay) return false;

  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;
  const timeStr = `${hour}:${minute}`; // "HH:mm" in UTC

  // Check if current day is in allowed days
  if (!constraint.allowed_days.includes(currentDay)) {
    return false;
  }

  // Check if current time is within the time range
  return constraint.begin_time <= timeStr && timeStr < constraint.end_time;
}
