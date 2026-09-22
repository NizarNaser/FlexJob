"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import Avatar from "./Avatar";
import StarRating from "./StarRating";

type Tab = "users" | "jobs" | "reviews";

export default function AdminPanel() {
  const {
    currentUser,
    workers,
    employers,
    jobs,
    reviews,
    deleteJob,
    deleteReview,
    deleteUser,
    setEmployerVerified,
  } = useApp();
  const [tab, setTab] = useState<Tab>("users");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUser?.role === "admin";

  const users = useMemo(
    () => [
      ...workers.map((w) => ({ ...w, kind: "Worker" as const })),
      ...employers.map((e) => ({
        ...e,
        kind: "Employer" as const,
        avatar: e.logo,
      })),
    ],
    [workers, employers]
  );

  async function guarded(id: string, fn: () => Promise<void>) {
    setError(null);
    setBusyId(id);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-slate-900">Control Panel</h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isAdmin ? "bg-blue-600 text-white" : "bg-amber-100 text-amber-700"
          }`}
        >
          {isAdmin ? "Super Admin — full access" : "Manager — view only"}
        </span>
      </div>
      {!isAdmin && (
        <p className="mt-2 text-sm text-slate-500">
          You can view all users, jobs, and reviews, but editing and deleting is reserved for
          super admins.
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-6 flex gap-2 border-b border-blue-100">
        {(["users", "jobs", "reviews"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500"
            }`}
          >
            {t} (
            {t === "users" ? users.length : t === "jobs" ? jobs.length : reviews.length})
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-blue-100 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-blue-50 text-xs uppercase text-blue-700">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Status</th>
                {isAdmin && <th className="px-4 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-blue-50">
                  <td className="flex items-center gap-2 px-4 py-3">
                    <Avatar src={u.avatar} size={28} />
                    {u.name}
                  </td>
                  <td className="px-4 py-3">{u.kind}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <StarRating rating={u.rating} reviewCount={u.reviewCount} />
                  </td>
                  <td className="px-4 py-3">
                    {u.kind === "Employer" ? (
                      isAdmin ? (
                        <button
                          disabled={busyId === u.id}
                          onClick={() =>
                            guarded(u.id, () => setEmployerVerified(u.id, !("verified" in u && u.verified)))
                          }
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            "verified" in u && u.verified
                              ? "bg-green-50 text-green-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {"verified" in u && u.verified ? "Verified" : "Not verified"}
                        </button>
                      ) : (
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            "verified" in u && u.verified
                              ? "bg-green-50 text-green-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {"verified" in u && u.verified ? "Verified" : "Not verified"}
                        </span>
                      )
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <button
                        disabled={busyId === u.id}
                        onClick={() => {
                          if (confirm(`Delete ${u.name}'s account? This can't be undone.`)) {
                            guarded(u.id, () => deleteUser(u.id));
                          }
                        }}
                        className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "jobs" && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-blue-100 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-blue-50 text-xs uppercase text-blue-700">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Employer</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Pay</th>
                <th className="px-4 py-3">Posted</th>
                {isAdmin && <th className="px-4 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className="border-t border-blue-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{j.title}</td>
                  <td className="px-4 py-3">{j.employerName}</td>
                  <td className="px-4 py-3">{j.category}</td>
                  <td className="px-4 py-3 font-semibold text-blue-700">${j.payRate}/hr</td>
                  <td className="px-4 py-3 text-slate-500">{j.postedDate}</td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <button
                        disabled={busyId === j.id}
                        onClick={() => {
                          if (confirm(`Delete job "${j.title}"?`)) {
                            guarded(j.id, () => deleteJob(j.id));
                          }
                        }}
                        className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "reviews" && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-blue-100 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-blue-50 text-xs uppercase text-blue-700">
              <tr>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3">Date</th>
                {isAdmin && <th className="px-4 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-t border-blue-50">
                  <td className="px-4 py-3">
                    {r.authorName} <span className="text-slate-400">({r.authorRole})</span>
                  </td>
                  <td className="px-4 py-3">
                    <StarRating rating={r.rating} />
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-slate-600">{r.comment}</td>
                  <td className="px-4 py-3 text-slate-500">{r.date}</td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <button
                        disabled={busyId === r.id}
                        onClick={() => {
                          if (confirm("Delete this review?")) {
                            guarded(r.id, () => deleteReview(r.id));
                          }
                        }}
                        className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
