"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";

export default function ReviewForm({ targetId }: { targetId: string }) {
  const { currentUser, addReview } = useApp();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!currentUser) {
    return (
      <p className="rounded-xl border border-dashed border-blue-200 p-4 text-sm text-slate-500">
        Log in to leave a review after completing a job.
      </p>
    );
  }

  if (submitted) {
    return (
      <p className="rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
        Thanks! Your review has been posted.
      </p>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        setError(null);
        setSubmitting(true);
        try {
          await addReview({ targetId, rating, comment: comment.trim() });
          setSubmitted(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to post review");
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-3 rounded-xl border border-blue-100 bg-white p-4"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-600">Your rating:</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => setRating(n)}
            className={`text-xl ${n <= rating ? "text-amber-400" : "text-slate-200"}`}
            aria-label={`${n} stars`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        rows={3}
        className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
