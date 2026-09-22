import { Review } from "@/lib/types";
import StarRating from "./StarRating";

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-slate-400">No reviews yet.</p>;
  }
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-xl border border-blue-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">{review.authorName}</span>
            <StarRating rating={review.rating} />
          </div>
          <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <span>{review.date}</span>
            {review.verified && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 font-medium text-green-600">
                Verified · completed job
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
