"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { defaultFilters, filterJobs } from "@/lib/match";
import FilterPanel from "@/components/FilterPanel";
import JobCard from "@/components/JobCard";

export default function JobsPage() {
  const { jobs, employers, currentUser, workers } = useApp();
  const [filters, setFilters] = useState(defaultFilters);

  const employerRatingById = useMemo(
    () => new Map(employers.map((e) => [e.id, e.rating])),
    [employers]
  );

  const myWorker = useMemo(
    () => (currentUser?.role === "worker" ? workers.find((w) => w.id === currentUser.id) : undefined),
    [currentUser, workers]
  );
  const myAvailability = useMemo(() => myWorker?.availability ?? [], [myWorker]);

  const results = useMemo(
    () => filterJobs(jobs, filters, employerRatingById, myAvailability),
    [jobs, filters, employerRatingById, myAvailability]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Find flexible work</h1>
      <p className="mt-2 text-slate-500">
        Use the filters to find jobs that fit your schedule, pay expectations, and location.
      </p>

      <div className="mt-8 flex flex-col gap-6 sm:flex-row">
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          showAvailabilityToggle={currentUser?.role === "worker"}
          resultCount={results.length}
        />

        <div className="flex-1 space-y-4">
          {currentUser?.role === "worker" && myAvailability.length === 0 && (
            <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4 text-sm text-blue-700">
              Tip: set your availability in your{" "}
              <a href="/dashboard/worker" className="font-semibold underline">
                worker dashboard
              </a>{" "}
              to use the &quot;Match my availability&quot; filter.
            </div>
          )}
          {results.length === 0 ? (
            <p className="rounded-xl border border-blue-100 bg-white p-8 text-center text-slate-400">
              No jobs match your filters yet. Try widening your search.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {results.map((job) => (
                <JobCard key={job.id} job={job} employerRating={employerRatingById.get(job.employerId)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
