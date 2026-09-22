"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import StarRating from "@/components/StarRating";
import ReviewList from "@/components/ReviewList";
import { jobMatchesAvailability } from "@/lib/match";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { jobs, employers, currentUser, workers, getEmployerReviews } = useApp();
  const [applied, setApplied] = useState(false);

  const job = jobs.find((j) => j.id === id);
  const employer = employers.find((e) => e.id === job?.employerId);
  const reviews = job ? getEmployerReviews(job.employerId) : [];

  const myWorker =
    currentUser?.role === "worker" ? workers.find((w) => w.id === currentUser.id) : undefined;
  const matchesMe = job && myWorker ? jobMatchesAvailability(job, myWorker.availability) : false;

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-slate-500">Job not found.</p>
        <Link href="/jobs" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Back to search
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/jobs" className="text-sm text-blue-600 hover:underline">
        ← Back to search
      </Link>

      <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            <p className="mt-1 text-slate-500">
              <Link href={`/profile/${employer?.id}`} className="font-medium text-blue-600 hover:underline">
                {job.employerName}
              </Link>{" "}
              · {job.location}
              {job.remote && job.location.toLowerCase() !== "remote" && " · Remote"}
            </p>
            {employer && <div className="mt-2"><StarRating rating={employer.rating} reviewCount={employer.reviewCount} /></div>}
          </div>
          <span className="text-2xl font-bold text-blue-700">${job.payRate}/hr</span>
        </div>

        {myWorker && (
          <div
            className={`mt-4 rounded-lg px-4 py-2 text-sm font-medium ${
              matchesMe ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
            }`}
          >
            {matchesMe
              ? "✓ This job's schedule overlaps with your saved availability."
              : "This job's required hours don't overlap with your saved availability yet."}
          </div>
        )}

        <p className="mt-5 text-slate-700">{job.description}</p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">{job.category}</span>
          <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700 capitalize">
            {job.scheduleType} schedule
          </span>
          <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700 capitalize">
            {job.contractType.replace("-", " ")}
          </span>
          {job.urgent && (
            <span className="rounded-full bg-orange-100 px-3 py-1 font-medium text-orange-600">Hiring now</span>
          )}
        </div>

        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Required schedule</h3>
          <div className="flex flex-wrap gap-2">
            {job.requiredSlots.map((slot, i) => (
              <span key={i} className="rounded-lg bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {slot.day} {slot.start}:00–{slot.end}:00
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {applied ? (
            <p className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              Application sent! {job.employerName} will reach out about scheduling.
            </p>
          ) : (
            <button
              onClick={() => setApplied(true)}
              className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Apply for this job
            </button>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Reviews of {job.employerName}</h2>
        <ReviewList reviews={reviews} />
      </div>
    </div>
  );
}
