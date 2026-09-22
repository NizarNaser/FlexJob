"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import AvailabilityPlanner from "@/components/AvailabilityPlanner";
import ReviewList from "@/components/ReviewList";
import StarRating from "@/components/StarRating";
import JobCard from "@/components/JobCard";
import Avatar from "@/components/Avatar";
import { jobMatchesAvailability } from "@/lib/match";

export default function WorkerDashboard() {
  const { currentUser, workers, jobs, employers, getWorkerReviews, updateAvailability, updateCvSummary } =
    useApp();
  const worker = currentUser?.role === "worker" ? workers.find((w) => w.id === currentUser.id) : undefined;
  const [cvSummary, setCvSummary] = useState(worker?.cvSummary ?? "");
  const [savedCv, setSavedCv] = useState(false);

  const employerRatingById = useMemo(
    () => new Map(employers.map((e) => [e.id, e.rating])),
    [employers]
  );

  const matchingJobs = useMemo(() => {
    if (!worker) return [];
    return jobs.filter((j) => jobMatchesAvailability(j, worker.availability)).slice(0, 4);
  }, [jobs, worker]);

  if (!currentUser || !worker || currentUser.role !== "worker") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Worker dashboard</h1>
        <p className="mt-3 text-slate-500">Log in with a worker account to see your dashboard.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Sign up as a worker
        </Link>
      </div>
    );
  }

  const reviews = getWorkerReviews(worker.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4">
        <Avatar src={worker.avatar} size={64} className="text-3xl" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{worker.name}</h1>
          <StarRating rating={worker.rating} reviewCount={worker.reviewCount} />
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-blue-100 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-800">Your CV summary</h2>
        <textarea
          value={cvSummary}
          onChange={(e) => {
            setCvSummary(e.target.value);
            setSavedCv(false);
          }}
          rows={3}
          className="mt-3 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        <button
          onClick={async () => {
            await updateCvSummary(cvSummary);
            setSavedCv(true);
          }}
          className="mt-3 rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Save CV summary
        </button>
        {savedCv && <span className="ml-3 text-sm font-medium text-green-600">Saved!</span>}
      </section>

      <section className="mt-8 rounded-2xl border border-blue-100 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-800">Your availability planner</h2>
        <div className="mt-4">
          <AvailabilityPlanner
            initialSlots={worker.availability}
            onSave={(slots) => updateAvailability(slots)}
          />
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Jobs matching your availability</h2>
          <Link href="/jobs" className="text-sm font-semibold text-blue-600 hover:underline">
            See all →
          </Link>
        </div>
        {matchingJobs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4 text-sm text-blue-700">
            Set your availability above, then check back here for matching jobs.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {matchingJobs.map((job) => (
              <JobCard key={job.id} job={job} employerRating={employerRatingById.get(job.employerId)} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Reviews from employers</h2>
        <ReviewList reviews={reviews} />
      </section>
    </div>
  );
}
