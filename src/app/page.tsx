"use client";

import Link from "next/link";
import { useMemo } from "react";
import JobCard from "@/components/JobCard";
import { useApp } from "@/lib/store";

export default function Home() {
  const { jobs, employers } = useApp();
  const employerRatingById = useMemo(
    () => new Map(employers.map((e) => [e.id, e.rating])),
    [employers]
  );
  const featured = jobs.slice(0, 3);

  return (
    <div>
      <section className="bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Flexible part-time work,{" "}
            <span className="text-blue-600">on your own schedule</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Set the days and hours you want to work, and let FlexJob match you with jobs that
            actually fit your life — no more guessing which listings work with your availability.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/jobs"
              className="w-full rounded-full bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 sm:w-auto"
            >
              Find a Job
            </Link>
            <Link
              href="/jobs/new"
              className="w-full rounded-full border border-blue-200 bg-white px-8 py-3 text-base font-semibold text-blue-700 hover:bg-blue-50 sm:w-auto"
            >
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-slate-900">How it works</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: "🗓️",
              title: "Set your availability",
              text: "Workers plan exactly which days and hours they want to work using the availability planner.",
            },
            {
              icon: "🔍",
              title: "Search with smart filters",
              text: "Filter jobs by pay, category, location, time of day, and match against your own schedule.",
            },
            {
              icon: "⭐",
              title: "Work, then rate each other",
              text: "After a job, both sides leave verified reviews — building trust across the platform.",
            },
          ].map((step) => (
            <div key={step.title} className="rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-sm">
              <div className="text-4xl">{step.icon}</div>
              <h3 className="mt-3 font-semibold text-slate-800">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-blue-50/60 py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Featured jobs hiring now</h2>
            <Link href="/jobs" className="text-sm font-semibold text-blue-600 hover:underline">
              View all jobs →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((job) => (
              <JobCard key={job.id} job={job} employerRating={employerRatingById.get(job.employerId)} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-3xl border border-blue-100 bg-white p-10 shadow-sm">
          <div className="text-4xl">🤖</div>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">Need a hand? Ask the AI assistant.</h2>
          <p className="mx-auto mt-2 max-w-xl text-slate-600">
            The chat bubble in the corner can help you find matching jobs, plan your schedule,
            polish your CV, or write a job posting — any time.
          </p>
        </div>
      </section>
    </div>
  );
}
