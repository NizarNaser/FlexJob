export default function Avatar({
  src,
  size = 40,
  className = "",
}: {
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const isUrl = src?.startsWith("http");
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 ${className}`}
    >
      {isUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src!} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <span>{src || "🙂"}</span>
      )}
    </div>
  );
}
