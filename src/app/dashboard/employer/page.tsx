"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";
import ReviewList from "@/components/ReviewList";
import StarRating from "@/components/StarRating";
import Avatar from "@/components/Avatar";

export default function EmployerDashboard() {
  const { currentUser, employers, jobs, getEmployerReviews } = useApp();
  const employer =
    currentUser?.role === "employer" ? employers.find((e) => e.id === currentUser.id) : undefined;

  if (!currentUser || !employer || currentUser.role !== "employer") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Employer dashboard</h1>
        <p className="mt-3 text-slate-500">Log in with an employer account to see your dashboard.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Sign up as an employer
        </Link>
      </div>
    );
  }

  const myJobs = jobs.filter((j) => j.employerId === employer.id);
  const reviews = getEmployerReviews(employer.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4">
        <Avatar src={employer.logo} size={64} className="text-3xl" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{employer.name}</h1>
          <StarRating rating={employer.rating} reviewCount={employer.reviewCount} />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Link
          href="/jobs/new"
          className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Post a new job
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Your job listings ({myJobs.length})</h2>
        {myJobs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4 text-sm text-blue-700">
            You haven&apos;t posted any jobs yet.
          </p>
        ) : (
          <div className="space-y-3">
            {myJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="flex items-center justify-between rounded-xl border border-blue-100 bg-white p-4 hover:shadow-sm"
              >
                <div>
                  <p className="font-medium text-slate-800">{job.title}</p>
                  <p className="text-sm text-slate-500">
                    {job.category} · Posted {job.postedDate}
                  </p>
                </div>
                <span className="font-semibold text-blue-700">${job.payRate}/hr</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Reviews from workers</h2>
        <ReviewList reviews={reviews} />
      </section>
    </div>
  );
}
