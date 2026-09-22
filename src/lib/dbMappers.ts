import type {
  Day as DbDay,
  ContractType as DbContractType,
  ScheduleType as DbScheduleType,
} from "@/generated/prisma/client";
import { AvailabilitySlot, ContractType, Day, ScheduleType, TimeOfDay } from "./types";

const DAY_TO_DB: Record<Day, DbDay> = {
  Mon: "MON",
  Tue: "TUE",
  Wed: "WED",
  Thu: "THU",
  Fri: "FRI",
  Sat: "SAT",
  Sun: "SUN",
};
const DAY_FROM_DB: Record<DbDay, Day> = {
  MON: "Mon",
  TUE: "Tue",
  WED: "Wed",
  THU: "Thu",
  FRI: "Fri",
  SAT: "Sat",
  SUN: "Sun",
};

export function dayToDb(day: Day): DbDay {
  return DAY_TO_DB[day];
}
export function dayFromDb(day: DbDay): Day {
  return DAY_FROM_DB[day];
}

const CONTRACT_TO_DB: Record<ContractType, DbContractType> = {
  "one-time": "ONE_TIME",
  "part-time": "PART_TIME",
  seasonal: "SEASONAL",
};
const CONTRACT_FROM_DB: Record<DbContractType, ContractType> = {
  ONE_TIME: "one-time",
  PART_TIME: "part-time",
  SEASONAL: "seasonal",
};
export function contractToDb(c: ContractType): DbContractType {
  return CONTRACT_TO_DB[c];
}
export function contractFromDb(c: DbContractType): ContractType {
  return CONTRACT_FROM_DB[c];
}

const SCHEDULE_TO_DB: Record<ScheduleType, DbScheduleType> = {
  flexible: "FLEXIBLE",
  fixed: "FIXED",
  shifts: "SHIFTS",
};
const SCHEDULE_FROM_DB: Record<DbScheduleType, ScheduleType> = {
  FLEXIBLE: "flexible",
  FIXED: "fixed",
  SHIFTS: "shifts",
};
export function scheduleToDb(s: ScheduleType): DbScheduleType {
  return SCHEDULE_TO_DB[s];
}
export function scheduleFromDb(s: DbScheduleType): ScheduleType {
  return SCHEDULE_FROM_DB[s];
}

export function timeOfDayToDb(values: TimeOfDay[]): string {
  return values.map((v) => v.toUpperCase()).join(",");
}
export function timeOfDayFromDb(value: string): TimeOfDay[] {
  return value
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean) as TimeOfDay[];
}

export function slotsFromDb(slots: { day: DbDay; start: number; end: number }[]): AvailabilitySlot[] {
  return slots.map((s) => ({ day: dayFromDb(s.day), start: s.start, end: s.end }));
}
