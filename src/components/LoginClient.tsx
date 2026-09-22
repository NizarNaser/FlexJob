"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginClient({
  enableDevLogin,
  googleConfigured,
}: {
  enableDevLogin: boolean;
  googleConfigured: boolean;
}) {
  const [devEmail, setDevEmail] = useState("");
  const [devName, setDevName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Log in or sign up</h1>
      <p className="mt-2 text-slate-500">
        FlexJob accounts are created and secured through Google — no separate password to
        manage. First-time here? Signing in with Google creates your account automatically.
      </p>

      <button
        onClick={() => signIn("google", { callbackUrl: "/welcome" })}
        disabled={!googleConfigured}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-blue-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.36 0-4.36-1.59-5.07-3.73H.9v2.34A9 9 0 0 0 9 18Z"
          />
          <path fill="#FBBC05" d="M3.93 10.69A5.4 5.4 0 0 1 3.65 9c0-.59.1-1.16.28-1.69V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03l3.03-2.34Z" />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.97l3.03 2.34C4.64 5.17 6.64 3.58 9 3.58Z"
          />
        </svg>
        Continue with Google
      </button>
      {!googleConfigured && (
        <p className="mt-2 text-center text-xs text-amber-600">
          Google sign-in isn&apos;t configured yet on this deployment — use dev sign-in below, or
          add GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.
        </p>
      )}

      {enableDevLogin && (
        <div className="mt-8 rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-5">
          <p className="text-sm font-semibold text-blue-700">Dev sign-in (no password)</p>
          <p className="mt-1 text-xs text-slate-500">
            For local testing only. Enter any email to sign in as that identity — remove this
            before deploying to production.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!devEmail.trim()) return;
              setSubmitting(true);
              await signIn("dev-login", {
                email: devEmail.trim(),
                name: devName.trim() || undefined,
                callbackUrl: "/welcome",
              });
              setSubmitting(false);
            }}
            className="mt-3 space-y-2"
          >
            <input
              type="email"
              required
              value={devEmail}
              onChange={(e) => setDevEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <input
              value={devName}
              onChange={(e) => setDevName(e.target.value)}
              placeholder="Display name (optional)"
              className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Signing in..." : "Dev sign-in"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
