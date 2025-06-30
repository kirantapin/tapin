//modify time func so that it is only meant to consume times in utc format

import { titleCase } from "title-case";
import { OpenHours } from "../types";
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

type Weekday = (typeof days)[number];

export function isOpenNow(
  hours: OpenHours,
  timeZone: string,
  now: Date = new Date()
): boolean | undefined {
  if (!hours) return undefined;

  const currentZonedTime = new Date(now.toLocaleString("en-US", { timeZone }));

  const currentMinutes =
    currentZonedTime.getHours() * 60 + currentZonedTime.getMinutes();
  const currentDayIndex = currentZonedTime.getDay(); // 0 = Sunday
  const currentDay = days[currentDayIndex];
  const prevDay = days[(currentDayIndex + 6) % 7];

  const checkRange = (day: Weekday, isPreviousDay = false): boolean => {
    const range = hours[day];
    if (!range) return false;

    const [open, close] = range;
    const [openH, openM] = open.split(":").map(Number);
    const [closeH, closeM] = close.split(":").map(Number);

    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    if (isNaN(openMinutes) || isNaN(closeMinutes)) return false;

    if (openMinutes < closeMinutes) {
      return (
        !isPreviousDay &&
        currentMinutes >= openMinutes &&
        currentMinutes < closeMinutes
      );
    } else {
      return isPreviousDay
        ? currentMinutes < closeMinutes
        : currentMinutes >= openMinutes;
    }
  };

  return checkRange(currentDay) || checkRange(prevDay, true);
}

export function convertUtcToLocal(
  utcTimestampz: string,
  timeZone: string
): string {
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
  timeZone: string,
  now: Date = new Date()
): boolean {
  if (!constraint || !constraint.allowed_days?.length) return false;

  // Convert current time to UTC
  const currentZonedTime = new Date(now.toLocaleString("en-US", { timeZone }));
  const dayIndex = currentZonedTime.getDay(); // 0 = Sunday
  const currentDay = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ][dayIndex];

  if (!currentDay) return false;

  // Convert times to minutes since midnight for proper comparison
  const currentMinutes =
    currentZonedTime.getHours() * 60 + currentZonedTime.getMinutes();
  const beginMinutes = timeToMinutes(constraint.begin_time);
  const endMinutes = timeToMinutes(constraint.end_time);

  if (isNaN(beginMinutes) || isNaN(endMinutes)) return false;

  // Handle time ranges that cross midnight
  if (beginMinutes > endMinutes) {
    // Time range crosses midnight
    if (currentMinutes < endMinutes) {
      // We're in the early morning hours, check if previous day is allowed
      const previousDay = getPreviousDay(currentDay);
      return constraint.allowed_days.includes(previousDay);
    } else {
      // We're in the evening hours, check if current day is allowed
      return (
        constraint.allowed_days.includes(currentDay) &&
        currentMinutes >= beginMinutes
      );
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

const WEEKDAYS_ORDER = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function format12Hour(time: string): string {
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);

  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12; // Convert 0 → 12, 13 → 1

  return `${hour12}:${minuteStr.padStart(2, "0")} ${period}`;
}

export function formatAvailabilityWindow(
  begin_time: string,
  end_time: string,
  allowed_days: string[]
): string {
  if (!begin_time || !end_time || !allowed_days.length) return "";

  const formattedStart = format12Hour(begin_time);
  const formattedEnd = format12Hour(end_time);

  const sortedDays = [...allowed_days].sort(
    (a, b) => WEEKDAYS_ORDER.indexOf(a) - WEEKDAYS_ORDER.indexOf(b)
  );

  const titledDays = sortedDays.map((day) => titleCase(day));

  const formattedDays =
    titledDays.length === 1
      ? titledDays[0]
      : titledDays.slice(0, -1).join(", ") + " and " + titledDays.at(-1);

  return `from ${formattedStart} to ${formattedEnd} on ${formattedDays}`;
}
