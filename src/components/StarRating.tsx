export default function StarRating({
  rating,
  reviewCount,
  size = "sm",
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
}) {
  const rounded = Math.round(rating);
  const textSize = size === "md" ? "text-base" : "text-sm";
  return (
    <span className={`inline-flex items-center gap-1 ${textSize}`}>
      <span className="text-amber-400">
        {"★".repeat(rounded)}
        <span className="text-slate-200">{"★".repeat(5 - rounded)}</span>
      </span>
      <span className="font-medium text-slate-700">{rating > 0 ? rating.toFixed(1) : "New"}</span>
      {typeof reviewCount === "number" && (
        <span className="text-slate-400">({reviewCount})</span>
      )}
    </span>
  );
}
