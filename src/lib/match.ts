import { AvailabilitySlot, Job, TimeOfDay, Worker } from "./types";

export function slotsOverlap(a: AvailabilitySlot, b: AvailabilitySlot): boolean {
  return a.day === b.day && a.start < b.end && b.start < a.end;
}

export function jobMatchesAvailability(job: Job, availability: AvailabilitySlot[]): boolean {
  if (availability.length === 0) return false;
  return job.requiredSlots.some((slot) => availability.some((a) => slotsOverlap(slot, a)));
}

export function timeOfDayFromHour(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export interface JobFilters {
  query: string;
  category: string;
  minPay: number;
  location: string;
  remoteOnly: boolean;
  contractType: string;
  timeOfDay: TimeOfDay[];
  minRating: number;
  matchMyAvailability: boolean;
  urgentOnly: boolean;
  sortBy: "relevance" | "pay" | "recent" | "rating";
}

export const defaultFilters: JobFilters = {
  query: "",
  category: "all",
  minPay: 0,
  location: "",
  remoteOnly: false,
  contractType: "all",
  timeOfDay: [],
  minRating: 0,
  matchMyAvailability: false,
  urgentOnly: false,
  sortBy: "relevance",
};

export function filterJobs(
  jobs: Job[],
  filters: JobFilters,
  employerRatingById: Map<string, number>,
  myAvailability: AvailabilitySlot[]
): Job[] {
  let result = jobs.filter((job) => {
    if (
      filters.query &&
      !`${job.title} ${job.description} ${job.category} ${job.employerName}`
        .toLowerCase()
        .includes(filters.query.toLowerCase())
    )
      return false;
    if (filters.category !== "all" && job.category !== filters.category) return false;
    if (job.payRate < filters.minPay) return false;
    if (
      filters.location &&
      !job.location.toLowerCase().includes(filters.location.toLowerCase())
    )
      return false;
    if (filters.remoteOnly && !job.remote) return false;
    if (filters.contractType !== "all" && job.contractType !== filters.contractType) return false;
    if (
      filters.timeOfDay.length > 0 &&
      !filters.timeOfDay.some((t) => job.timeOfDay.includes(t))
    )
      return false;
    const employerRating = employerRatingById.get(job.employerId) ?? 0;
    if (employerRating < filters.minRating) return false;
    if (filters.urgentOnly && !job.urgent) return false;
    if (filters.matchMyAvailability && !jobMatchesAvailability(job, myAvailability)) return false;
    return true;
  });

  switch (filters.sortBy) {
    case "pay":
      result = result.slice().sort((a, b) => b.payRate - a.payRate);
      break;
    case "recent":
      result = result.slice().sort((a, b) => (a.postedDate < b.postedDate ? 1 : -1));
      break;
    case "rating":
      result = result
        .slice()
        .sort(
          (a, b) =>
            (employerRatingById.get(b.employerId) ?? 0) -
            (employerRatingById.get(a.employerId) ?? 0)
        );
      break;
    default:
      break;
  }

  return result;
}

export const CATEGORIES = [
  "Food & Beverage",
  "Warehouse & Logistics",
  "Education",
  "Outdoor & Manual Labor",
  "Design & Creative",
];

export function workerFromAvailability(worker: Worker) {
  return worker.availability;
}
