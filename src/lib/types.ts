export type UserRole = "worker" | "employer";
export type AppRole = "worker" | "employer" | "manager" | "admin";

export type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export const DAYS: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export interface AvailabilitySlot {
  day: Day;
  start: number; // hour 0-23
  end: number; // hour 1-24, exclusive
}

export interface Review {
  id: string;
  authorName: string;
  authorRole: UserRole;
  targetId: string;
  rating: number; // 1-5
  comment: string;
  date: string; // ISO date
  verified: boolean;
}

export interface Worker {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  skills: string[];
  location: string;
  rating: number;
  reviewCount: number;
  availability: AvailabilitySlot[];
  cvSummary: string;
}

export interface Employer {
  id: string;
  name: string;
  email: string;
  logo: string;
  description: string;
  location: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
}

export type ScheduleType = "flexible" | "fixed" | "shifts";
export type ContractType = "one-time" | "part-time" | "seasonal";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface Job {
  id: string;
  title: string;
  employerId: string;
  employerName: string;
  category: string;
  description: string;
  location: string;
  remote: boolean;
  payRate: number; // per hour, in USD
  contractType: ContractType;
  scheduleType: ScheduleType;
  requiredSlots: AvailabilitySlot[];
  timeOfDay: TimeOfDay[];
  postedDate: string; // ISO date
  urgent: boolean;
}

export interface CurrentUser {
  id: string;
  name: string;
  role: AppRole;
  image?: string | null;
}
