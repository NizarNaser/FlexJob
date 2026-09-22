"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useApp } from "@/lib/store";

export default function WelcomePage() {
  const { status, update } = useSession();
  const { currentUser, needsOnboarding, saveWorkerProfile, saveEmployerProfile } = useApp();
  const router = useRouter();
  const [saving, setSaving] = useState<"worker" | "employer" | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (currentUser) {
      router.replace(
        currentUser.role === "admin" || currentUser.role === "manager"
          ? "/admin"
          : currentUser.role === "employer"
            ? "/dashboard/employer"
            : "/dashboard/worker"
      );
    }
  }, [status, currentUser, router]);

  async function choose(role: "worker" | "employer") {
    setSaving(role);
    try {
      if (role === "worker") await saveWorkerProfile({});
      else await saveEmployerProfile({});
      await update();
      router.replace(role === "worker" ? "/dashboard/worker" : "/dashboard/employer");
    } finally {
      setSaving(null);
    }
  }

  if (status === "loading" || currentUser) {
    return <div className="mx-auto max-w-md px-4 py-24 text-center text-slate-400">Loading...</div>;
  }

  if (!needsOnboarding) {
    return <div className="mx-auto max-w-md px-4 py-24 text-center text-slate-400">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Welcome to FlexJob!</h1>
      <p className="mt-2 text-slate-500">How are you planning to use the platform?</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <button
          onClick={() => choose("worker")}
          disabled={saving !== null}
          className="rounded-2xl border-2 border-blue-100 bg-white p-8 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md disabled:opacity-50"
        >
          <div className="text-4xl">🙋</div>
          <h2 className="mt-3 text-lg font-semibold text-slate-800">I&apos;m looking for work</h2>
          <p className="mt-1 text-sm text-slate-500">
            Set your availability, search flexible jobs, and get hired.
          </p>
          {saving === "worker" && <p className="mt-2 text-sm text-blue-600">Setting up...</p>}
        </button>

        <button
          onClick={() => choose("employer")}
          disabled={saving !== null}
          className="rounded-2xl border-2 border-blue-100 bg-white p-8 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md disabled:opacity-50"
        >
          <div className="text-4xl">🏢</div>
          <h2 className="mt-3 text-lg font-semibold text-slate-800">I&apos;m hiring</h2>
          <p className="mt-1 text-sm text-slate-500">
            Post flexible jobs and find workers whose availability fits.
          </p>
          {saving === "employer" && <p className="mt-2 text-sm text-blue-600">Setting up...</p>}
        </button>
      </div>
    </div>
  );
}
