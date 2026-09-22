import Link from "next/link";
import { Job } from "@/lib/types";
import StarRating from "./StarRating";

export default function JobCard({ job, employerRating }: { job: Job; employerRating?: number }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{job.title}</h3>
          <p className="text-sm text-slate-500">
            {job.employerName} · {job.location}
            {job.remote && job.location.toLowerCase() !== "remote" && " · Remote"}
          </p>
        </div>
        {job.urgent && (
          <span className="shrink-0 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-600">
            Hiring now
          </span>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{job.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
          {job.category}
        </span>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700 capitalize">
          {job.scheduleType} schedule
        </span>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700 capitalize">
          {job.contractType.replace("-", " ")}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-bold text-blue-700">${job.payRate}/hr</span>
        {typeof employerRating === "number" && <StarRating rating={employerRating} />}
      </div>
    </Link>
  );
}
