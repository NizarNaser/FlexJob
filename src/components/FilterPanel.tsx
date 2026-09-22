"use client";

import { CATEGORIES, JobFilters } from "@/lib/match";
import { TimeOfDay } from "@/lib/types";

const TIME_OPTIONS: { value: TimeOfDay; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "night", label: "Night" },
];

export default function FilterPanel({
  filters,
  setFilters,
  showAvailabilityToggle,
  resultCount,
}: {
  filters: JobFilters;
  setFilters: (f: JobFilters) => void;
  showAvailabilityToggle: boolean;
  resultCount: number;
}) {
  function update<K extends keyof JobFilters>(key: K, value: JobFilters[K]) {
    setFilters({ ...filters, [key]: value });
  }

  function toggleTimeOfDay(value: TimeOfDay) {
    const set = new Set(filters.timeOfDay);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    update("timeOfDay", Array.from(set));
  }

  return (
    <aside className="w-full shrink-0 space-y-5 rounded-2xl border border-blue-100 bg-white p-5 sm:w-72">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Search</h3>
        <input
          value={filters.query}
          onChange={(e) => update("query", e.target.value)}
          placeholder="Job title, keyword, company..."
          className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
      </div>

      {showAvailabilityToggle && (
        <label className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
          Match my availability
          <input
            type="checkbox"
            checked={filters.matchMyAvailability}
            onChange={(e) => update("matchMyAvailability", e.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
        </label>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Category</h3>
        <select
          value={filters.category}
          onChange={(e) => update("category", e.target.value)}
          className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Minimum pay: ${filters.minPay}/hr</h3>
        <input
          type="range"
          min={0}
          max={35}
          step={1}
          value={filters.minPay}
          onChange={(e) => update("minPay", Number(e.target.value))}
          className="w-full accent-blue-600"
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Location</h3>
        <input
          value={filters.location}
          onChange={(e) => update("location", e.target.value)}
          placeholder="City or 'Remote'"
          className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={filters.remoteOnly}
            onChange={(e) => update("remoteOnly", e.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
          Remote only
        </label>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Contract type</h3>
        <select
          value={filters.contractType}
          onChange={(e) => update("contractType", e.target.value)}
          className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="all">Any</option>
          <option value="one-time">One-time gig</option>
          <option value="part-time">Ongoing part-time</option>
          <option value="seasonal">Seasonal</option>
        </select>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Time of day</h3>
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleTimeOfDay(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                filters.timeOfDay.includes(opt.value)
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">
          Min. employer rating: {filters.minRating > 0 ? `${filters.minRating}+` : "Any"}
        </h3>
        <input
          type="range"
          min={0}
          max={5}
          step={0.5}
          value={filters.minRating}
          onChange={(e) => update("minRating", Number(e.target.value))}
          className="w-full accent-blue-600"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={filters.urgentOnly}
          onChange={(e) => update("urgentOnly", e.target.checked)}
          className="h-4 w-4 accent-blue-600"
        />
        Hiring now only
      </label>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Sort by</h3>
        <select
          value={filters.sortBy}
          onChange={(e) => update("sortBy", e.target.value as JobFilters["sortBy"])}
          className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="relevance">Relevance</option>
          <option value="pay">Highest pay</option>
          <option value="recent">Most recent</option>
          <option value="rating">Employer rating</option>
        </select>
      </div>

      <p className="text-xs text-slate-400">{resultCount} job(s) match your filters</p>
    </aside>
  );
}
