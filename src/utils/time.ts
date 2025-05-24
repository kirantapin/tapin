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

function getPreviousDay(day: string): string {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const currentIndex = days.indexOf(day);
  return days[(currentIndex - 1 + 7) % 7];
}

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
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

  // Convert times to minutes since midnight for proper comparison
  const currentMinutes = timeToMinutes(timeStr);
  const beginMinutes = timeToMinutes(constraint.begin_time);
  const endMinutes = timeToMinutes(constraint.end_time);

  // Handle time ranges that cross midnight
  if (beginMinutes > endMinutes) {
    // Time range crosses midnight
    if (currentMinutes < endMinutes) {
      // We're in the early morning hours, check if previous day is allowed
      const previousDay = getPreviousDay(currentDay);
      return constraint.allowed_days.includes(previousDay);
    } else {
      // We're in the evening hours, check if current day is allowed
      return constraint.allowed_days.includes(currentDay);
    }
  } else {
    // Normal time range within same day
    return (
      constraint.allowed_days.includes(currentDay) &&
      currentMinutes >= beginMinutes &&
      currentMinutes < endMinutes
    );
  }
}

const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function formatTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(date);
}

function getLocalDayName(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone,
  }).format(date);
}

export function formatAvailabilityWindow(
  begin_time: string,
  end_time: string,
  allowed_days: string[],
  timeZone: string
): string {
  const timeGroups: Record<string, string[]> = {};

  for (const day of allowed_days) {
    const dayIndex = WEEKDAYS.indexOf(day);
    if (dayIndex === -1) continue;

    // Anchor to most recent Sunday
    const now = new Date();
    const sunday = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - now.getUTCDay()
      )
    );

    const baseDate = new Date(sunday);
    baseDate.setUTCDate(baseDate.getUTCDate() + dayIndex);

    const [startHour, startMinute] = begin_time.split(":").map(Number);
    const [endHour, endMinute] = end_time.split(":").map(Number);

    const utcStart = new Date(baseDate);
    utcStart.setUTCHours(startHour, startMinute, 0, 0);

    const utcEnd = new Date(baseDate);
    utcEnd.setUTCHours(endHour, endMinute, 0, 0);
    if (utcEnd <= utcStart) {
      utcEnd.setUTCDate(utcEnd.getUTCDate() + 1);
    }

    const localStart = formatTime(utcStart, timeZone);
    const localEnd = formatTime(utcEnd, timeZone);
    const localDay = getLocalDayName(utcStart, timeZone);

    const key = `from ${localStart} to ${localEnd}`;
    if (!timeGroups[key]) timeGroups[key] = [];
    timeGroups[key].push(localDay);
  }

  // Build readable strings
  const output = Object.entries(timeGroups).map(([timeRange, days]) => {
    const formattedDays =
      days.length === 1
        ? days[0]
        : days.slice(0, -1).join(", ") + " and " + days[days.length - 1];
    return `${timeRange} on ${formattedDays}`;
  });

  return output.join(", ");
}
