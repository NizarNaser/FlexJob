"use client";

import { use } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import StarRating from "@/components/StarRating";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";
import Avatar from "@/components/Avatar";

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { workers, employers, jobs, getWorkerReviews, getEmployerReviews, currentUser } = useApp();

  const worker = workers.find((w) => w.id === id);
  const employer = employers.find((e) => e.id === id);

  if (!worker && !employer) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-slate-500">Profile not found.</div>
    );
  }

  if (worker) {
    const reviews = getWorkerReviews(worker.id);
    const canReview = currentUser && currentUser.role === "employer" && currentUser.id !== worker.id;
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="flex items-center gap-4">
          <Avatar src={worker.avatar} size={64} className="text-3xl" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{worker.name}</h1>
            <p className="text-sm text-slate-500">{worker.location}</p>
            <StarRating rating={worker.rating} reviewCount={worker.reviewCount} />
          </div>
        </div>
        <p className="mt-5 text-slate-700">{worker.bio}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {worker.skills.map((s) => (
            <span key={s} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {s}
            </span>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-blue-100 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-700">CV summary</h3>
          <p className="mt-1 text-sm text-slate-600">{worker.cvSummary}</p>
        </div>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Reviews</h2>
          <ReviewList reviews={reviews} />
          {canReview && (
            <div className="mt-4">
              <ReviewForm targetId={worker.id} />
            </div>
          )}
        </section>
      </div>
    );
  }

  const emp = employer!;
  const reviews = getEmployerReviews(emp.id);
  const empJobs = jobs.filter((j) => j.employerId === emp.id);
  const canReview = currentUser && currentUser.role === "worker" && currentUser.id !== emp.id;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4">
        <Avatar src={emp.logo} size={64} className="text-3xl" />
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            {emp.name}
            {emp.verified && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                Verified
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500">{emp.location}</p>
          <StarRating rating={emp.rating} reviewCount={emp.reviewCount} />
        </div>
      </div>
      <p className="mt-5 text-slate-700">{emp.description}</p>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Open jobs ({empJobs.length})</h2>
        <div className="space-y-2">
          {empJobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="block rounded-lg border border-blue-100 bg-white p-3 text-sm hover:shadow-sm"
            >
              <span className="font-medium text-slate-800">{job.title}</span>
              <span className="ml-2 text-blue-700">${job.payRate}/hr</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Reviews</h2>
        <ReviewList reviews={reviews} />
        {canReview && (
          <div className="mt-4">
            <ReviewForm targetId={emp.id} />
          </div>
        )}
      </section>
    </div>
  );
}
