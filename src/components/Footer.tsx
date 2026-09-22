export default function Footer() {
  return (
    <footer className="mt-16 border-t border-blue-100 bg-blue-50/50">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="flex items-center gap-2 font-semibold text-blue-700">
            <span className="text-xl">💼</span> FlexJob
          </p>
          <p>Flexible part-time work, on your schedule.</p>
          <p>© {new Date().getFullYear()} FlexJob. Prototype build.</p>
        </div>
      </div>
    </footer>
  );
}
