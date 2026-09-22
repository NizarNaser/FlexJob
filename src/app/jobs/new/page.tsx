"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { CATEGORIES } from "@/lib/match";
import AvailabilityPlanner from "@/components/AvailabilityPlanner";
import { AvailabilitySlot, ContractType, ScheduleType, TimeOfDay } from "@/lib/types";
import Link from "next/link";

export default function NewJobPage() {
  const { currentUser, addJob } = useApp();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [payRate, setPayRate] = useState(18);
  const [contractType, setContractType] = useState<ContractType>("part-time");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("flexible");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay[]>([]);
  const [urgent, setUrgent] = useState(false);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [posted, setPosted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser || currentUser.role !== "employer") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Post a job</h1>
        <p className="mt-3 text-slate-500">
          You need an employer account to post a job.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Sign up as an employer
        </Link>
      </div>
    );
  }

  function toggleTime(value: TimeOfDay) {
    setTimeOfDay((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Post a job</h1>
      <p className="mt-2 text-slate-500">
        Describe the role and set the hours you need covered — we&apos;ll surface it to workers
        whose availability matches.
      </p>

      {posted ? (
        <div className="mt-8 rounded-2xl border border-green-100 bg-green-50 p-8 text-center">
          <p className="text-lg font-semibold text-green-700">Your job is live!</p>
          <button
            onClick={() => router.push("/jobs")}
            className="mt-4 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            View job listings
          </button>
        </div>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!title || !description || !location || slots.length === 0) return;
            setError(null);
            setSubmitting(true);
            try {
              await addJob({
                title,
                category,
                description,
                location,
                remote,
                payRate,
                contractType,
                scheduleType,
                requiredSlots: slots,
                timeOfDay,
                urgent,
              });
              setPosted(true);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to post job");
            } finally {
              setSubmitting(false);
            }
          }}
          className="mt-8 space-y-5"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Job title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="e.g. Part-Time Barista"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="What will the worker be doing? Any requirements?"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
              <input
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="City, state"
              />
              <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={remote}
                  onChange={(e) => setRemote(e.target.checked)}
                  className="h-4 w-4 accent-blue-600"
                />
                Remote job
              </label>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Pay rate ($/hr)</label>
              <input
                type="number"
                min={1}
                value={payRate}
                onChange={(e) => setPayRate(Number(e.target.value))}
                className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Contract type</label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as ContractType)}
                className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="one-time">One-time gig</option>
                <option value="part-time">Ongoing part-time</option>
                <option value="seasonal">Seasonal</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Schedule flexibility</label>
              <select
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
                className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="flexible">Flexible — worker sets hours</option>
                <option value="shifts">Fixed shifts</option>
                <option value="fixed">Fixed schedule</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Time of day</label>
            <div className="flex flex-wrap gap-2">
              {(["morning", "afternoon", "evening", "night"] as TimeOfDay[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => toggleTime(t)}
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                    timeOfDay.includes(t) ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            Mark as &quot;Hiring now&quot; (urgent)
          </label>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Required work hours
            </label>
            <AvailabilityPlanner initialSlots={slots} onSave={setSlots} />
            {slots.length === 0 && (
              <p className="mt-2 text-xs text-amber-600">
                Set at least one time block, then click &quot;Save availability&quot; above.
              </p>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Publishing..." : "Publish job"}
          </button>
        </form>
      )}
    </div>
  );
}
